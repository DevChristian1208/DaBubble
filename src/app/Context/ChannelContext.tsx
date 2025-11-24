"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { ref, onValue, push, set, get, update } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/app/lib/firebase";
import { useUser } from "./UserContext";

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
  basePath: string;
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

export function ChannelProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const authReady = useAuthReady();

  const basePath = user?.isGuest ? "guestChannels/public" : "channels";

  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------
  // ✅ AUTO-MEMBER beim LOGIN:
  //   - Gäste → in alle Gastchannels
  //   - Registrierte → in alle Channels
  // -------------------------------------------------------
  const ensureUserInAllChannels = useCallback(async () => {
    if (!user?.id) return;

    const targetRoot = user.isGuest ? "guestChannels/public" : "channels";

    try {
      const chansSnap = await get(ref(db, targetRoot));
      const chans = (chansSnap.val() || {}) as Record<string, any>;

      if (!chans || Object.keys(chans).length === 0) return;

      const updates: Record<string, true> = {};
      for (const cid of Object.keys(chans)) {
        updates[`${targetRoot}/${cid}/members/${user.id}`] = true;
      }

      await update(ref(db), updates);
    } catch (e) {
      console.warn(
        "[ChannelContext] ensureUserInAllChannels fehlgeschlagen:",
        e
      );
    }
  }, [user?.id, user?.isGuest]);

  useEffect(() => {
    if (authReady && user?.id) ensureUserInAllChannels();
  }, [authReady, ensureUserInAllChannels, user?.id]);

  // --------------------------
  // CHANNELLISTE LADEN
  // --------------------------
  useEffect(() => {
    if (!authReady || !user?.id) return;

    const r = ref(db, basePath);

    const unsub = onValue(r, (snap) => {
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
    });

    return () => unsub();
  }, [authReady, user?.id, basePath, activeChannelId]);

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) || null,
    [channels, activeChannelId]
  );

  // --------------------------
  // CHANNEL-MESSAGES LADEN
  // --------------------------
  useEffect(() => {
    setMessages([]);
    if (!activeChannelId || !user?.id) return;

    const r = ref(db, `channelMessages/${basePath}/${activeChannelId}`);

    const unsub = onValue(r, (snap) => {
      const raw = (snap.val() as Record<string, ChannelMessageDb> | null) || {};

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

    return () => unsub();
  }, [activeChannelId, user?.id, basePath]);

  const resolveUid = () => {
    if (user?.isGuest) return user.id;
    return auth.currentUser?.uid || null;
  };

  // --------------------------
  // CHANNEL ERSTELLEN
  // --------------------------
  const createChannel = async (name: string, description?: string) => {
    setLoading(true);
    setError(null);

    try {
      const uid = resolveUid();
      if (!uid) throw new Error("Nicht eingeloggt.");

      const clean = name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/#/g, "");

      if (!clean) throw new Error("Ungültiger Channel-Name.");

      const chRef = push(ref(db, basePath));

      // Basisdaten schreiben
      await set(chRef, {
        name: clean,
        description: (description || "").trim(),
        createdAt: Date.now(),
        createdByEmail: user?.email || "",
        public: true,
        members: { [uid]: true },
      });

      // ✅ Mitglieder automatisch:
      if (user?.isGuest) {
        const allGuestsSnap = await get(ref(db, "guestUsers"));
        const allGuests = (allGuestsSnap.val() || {}) as Record<string, any>;

        const membersUpdate: Record<string, true> = {};
        Object.keys(allGuests).forEach((g) => (membersUpdate[g] = true));

        await update(
          ref(db, `${basePath}/${chRef.key}/members`),
          membersUpdate
        );
      } else {
        const allUsersSnap = await get(ref(db, "newusers"));
        const allUsers = (allUsersSnap.val() || {}) as Record<string, any>;

        const membersUpdate: Record<string, true> = {};
        Object.keys(allUsers).forEach((u) => (membersUpdate[u] = true));

        await update(
          ref(db, `${basePath}/${chRef.key}/members`),
          membersUpdate
        );
      }

      setActiveChannelId(chRef.key || null);
    } catch (e: any) {
      console.error("[ChannelContext] Channel erstellen fehlgeschlagen:", e);
      setError(e.message || "Fehler beim Erstellen.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // CHANNEL-MESSAGE SENDEN
  // --------------------------
  const sendMessage = async (text: string) => {
    const uid = resolveUid();
    if (!uid) throw new Error("Nicht eingeloggt.");
    if (!activeChannelId) throw new Error("Kein Channel aktiv.");

    const msg = text.trim();
    if (!msg) return;

    const msgRef = push(
      ref(db, `channelMessages/${basePath}/${activeChannelId}`)
    );

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
        basePath,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannel() {
  const ctx = useContext(ChannelContext);
  if (!ctx) throw new Error("useChannel must be used within ChannelProvider");
  return ctx;
}
