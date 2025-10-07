"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { ref, onValue, push, set, get, update } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/app/lib/firebase";
import { useUser } from "./UserContext";

/** ==== Typen für DB-Strukturen ==== */
type ChannelDb = {
  name?: string;
  description?: string;
  createdAt?: number;
  createdByEmail?: string;
  public?: boolean;
  members?: Record<string, true>;
};

type ChannelMessageDb = {
  text: string;
  createdAt?: number;
  user?: { name?: string; email?: string; avatar?: string };
};

type NewUserDb = {
  authUid?: string;
  newname?: string;
  newemail?: string;
  avatar?: string;
};

export type Channel = {
  id: string;
  name: string;
  description?: string;
  createdAt?: number;
  createdByEmail?: string;
  public?: boolean;
  members?: Record<string, true>;
};

export type Message = {
  id: string;
  text: string;
  createdAt?: number;
  user: { name: string; email: string; avatar?: string };
};

type ChannelContextType = {
  channels: Channel[];
  activeChannelId: string | null;
  activeChannel: Channel | null;
  messages: Message[];
  setActiveChannelId: (id: string | null) => void;
  createChannel: (name: string, description?: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  loading: boolean;
  error: string | null;
};

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

function useAuthReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => setReady(true));
    return () => unsub();
  }, []);
  return ready;
}

/** Alle bekannten Auth-UIDs aus /newusers (robust: Key ODER authUid) */
async function fetchAllAuthUids(): Promise<Record<string, true>> {
  const snap = await get(ref(db, "newusers"));
  const v = (snap.val() || {}) as Record<string, NewUserDb>;
  const out: Record<string, true> = {};
  for (const [key, u] of Object.entries(v)) {
    const uid = u?.authUid || key;
    if (uid) out[uid] = true;
  }
  return out;
}

export function ChannelProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const authReady = useAuthReady();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Channels live lesen */
  useEffect(() => {
    if (!authReady) return;

    const r = ref(db, "channels");
    const unsub = onValue(r, async (snap) => {
      const raw = (snap.val() || {}) as Record<string, ChannelDb>;
      const list: Channel[] = Object.entries(raw)
        .map(([id, c]) => ({
          id,
          name: c.name || "ohne-namen",
          description: c.description || "",
          createdAt: c.createdAt || 0,
          createdByEmail: c.createdByEmail || "",
          public: c.public ?? false,
          members: c.members || {},
        }))
        .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));

      setChannels(list);

      if (!activeChannelId && list.length > 0) {
        setActiveChannelId(list[0].id);
      } else if (
        activeChannelId &&
        !list.find((c) => c.id === activeChannelId)
      ) {
        setActiveChannelId(list[0]?.id || null);
      }

      // Best-Effort: alle bekannten User in alle Channels eintragen
      try {
        const all = await fetchAllAuthUids();
        const updates: Record<string, unknown> = {};
        for (const ch of list) {
          const mem = ch.members || {};
          for (const uid of Object.keys(all)) {
            if (!mem[uid]) updates[`channels/${ch.id}/members/${uid}`] = true;
          }
        }
        if (Object.keys(updates).length) await update(ref(db), updates);
      } catch {
        /* noop */
      }
    });

    return () => unsub();
  }, [authReady, activeChannelId]);

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) || null,
    [channels, activeChannelId]
  );

  /** Sobald User oder Channels da sind, sich selbst in allen Channels eintragen */
  useEffect(() => {
    (async () => {
      if (!user?.id || channels.length === 0) return;
      const updates: Record<string, unknown> = {};
      for (const ch of channels) {
        if (!ch.members?.[user.id]) {
          updates[`channels/${ch.id}/members/${user.id}`] = true;
        }
      }
      if (Object.keys(updates).length) {
        try {
          await update(ref(db), updates);
        } catch {
          /* noop */
        }
      }
    })();
  }, [user?.id, channels]);

  /** Nachrichten lesen – wartet auf user?.id, setzt Membership vor Listener */
  useEffect(() => {
    let offFn: (() => void) | null = null;

    (async () => {
      setMessages([]);
      if (!activeChannelId || !user?.id) return;

      try {
        await update(ref(db, `channels/${activeChannelId}/members`), {
          [user.id]: true,
        });

        const r = ref(db, `channelMessages/${activeChannelId}`);
        const unsub = onValue(r, (snap) => {
          const raw = (snap.val() || {}) as Record<string, ChannelMessageDb>;
          const list: Message[] = Object.entries(raw)
            .map(([id, m]) => ({
              id,
              text: m.text,
              createdAt: m.createdAt || 0,
              user: {
                name: m.user?.name || "Unbekannt",
                email: m.user?.email || "",
                avatar: m.user?.avatar || "/avatar1.png",
              },
            }))
            .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
          setMessages(list);
        });

        offFn = () => unsub();
      } catch (e) {
        console.error("[ChannelContext] Nachrichten lesen fehlgeschlagen:", e);
      }
    })();

    return () => {
      if (offFn) offFn();
    };
  }, [activeChannelId, user?.id]);

  /** Channel erstellen – alle bekannten User sofort Mitglied */
  const createChannel = async (name: string, description?: string) => {
    setLoading(true);
    setError(null);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Nicht eingeloggt.");

      const clean = name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/#/g, "");
      if (!clean)
        throw new Error("Bitte einen gültigen Channel-Namen angeben.");

      const members = await fetchAllAuthUids();
      members[uid] = true;

      const chRef = push(ref(db, "channels"));
      await set(chRef, {
        name: clean,
        description: (description || "").trim(),
        createdAt: Date.now(),
        createdByEmail: user?.email || "",
        public: false,
        members,
      });

      setActiveChannelId(chRef.key || null);
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "Channel konnte nicht erstellt werden.";
      console.error("[ChannelContext] Channel anlegen fehlgeschlagen:", e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Nicht eingeloggt.");
    if (!activeChannelId) throw new Error("Kein Channel aktiv.");

    const msg = text.trim();
    if (!msg) return;

    await update(ref(db, `channels/${activeChannelId}/members`), {
      [uid]: true,
    });

    const msgRef = push(ref(db, `channelMessages/${activeChannelId}`));
    await set(msgRef, {
      text: msg,
      createdAt: Date.now(),
      user: {
        name: user?.name || "Unbekannt",
        email: user?.email || "",
        avatar: user?.avatar || "/avatar1.png",
      },
    });
  };

  return (
    <ChannelContext.Provider
      value={{
        channels,
        activeChannelId,
        activeChannel,
        messages,
        setActiveChannelId,
        createChannel,
        sendMessage,
        loading,
        error,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}

export const useChannel = () => {
  const ctx = useContext(ChannelContext);
  if (!ctx) throw new Error("useChannel must be used within ChannelProvider");
  return ctx;
};
