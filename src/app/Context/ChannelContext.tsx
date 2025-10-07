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

async function fetchAllAuthUids(): Promise<Record<string, true>> {
  const snap = await get(ref(db, "newusers"));
  const v = (snap.val() || {}) as Record<string, { authUid?: string }>;
  const members: Record<string, true> = {};
  for (const [key, u] of Object.entries(v)) {
    const uid = u?.authUid || key;
    if (uid) members[uid] = true;
  }
  return members;
}

export function ChannelProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const authReady = useAuthReady();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Channels live
  useEffect(() => {
    if (!authReady) return;

    const r = ref(db, "channels");
    const unsub = onValue(r, async (snap) => {
      const v = (snap.val() || {}) as Record<string, any>;
      const list: Channel[] = Object.entries(v)
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

      // Hintergrund-Sync: alle bekannten User in alle Channels
      try {
        const all = await fetchAllAuthUids();
        const updates: Record<string, any> = {};
        for (const ch of list) {
          for (const uid of Object.keys(all)) {
            if (!ch.members?.[uid]) {
              updates[`channels/${ch.id}/members/${uid}`] = true;
            }
          }
        }
        if (Object.keys(updates).length) await update(ref(db), updates);
      } catch (e) {
        console.debug("[ChannelContext] Member-Sync hint:", e);
      }
    });

    return () => unsub();
  }, [authReady, activeChannelId]);

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) || null,
    [channels, activeChannelId]
  );

  // Nachrichten lesen – erst Mitgliedschaft setzen, dann Listener
  useEffect(() => {
    let offFn: (() => void) | null = null;

    (async () => {
      setMessages([]);
      if (!activeChannelId) return;
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        await update(ref(db, `channels/${activeChannelId}/members`), {
          [uid]: true,
        });

        const r = ref(db, `channelMessages/${activeChannelId}`);
        const unsub = onValue(r, (snap) => {
          const v = (snap.val() || {}) as Record<string, any>;
          const list: Message[] = Object.entries(v)
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
  }, [activeChannelId]);

  // Channel erstellen – alle bekannten User sofort Mitglied
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
    } catch (e: any) {
      console.error("[ChannelContext] Channel anlegen fehlgeschlagen:", e);
      setError(e?.message || "Channel konnte nicht erstellt werden.");
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
