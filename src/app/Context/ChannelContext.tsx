"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { ref, onValue, off, push, set, get } from "firebase/database";
import { db } from "../lib/firebase";
import { useUser } from "./UserContext";

export type Channel = {
  id: string;
  name: string;
  description?: string;
  createdAt?: number;
  createdByEmail?: string;
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
  setActiveChannelId: (id: string) => void;
  createChannel: (name: string, description?: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  loading: boolean;
  error: string | null;
};

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export function ChannelProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Realtime: Channels
  useEffect(() => {
    const r = ref(db, "channels");
    onValue(r, (snap) => {
      const val = snap.val() || {};
      const list: Channel[] = Object.entries(val).map(([id, c]: any) => ({
        id,
        ...c,
      }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setChannels(list);
      if (!activeChannelId && list.length > 0) {
        setActiveChannelId(list[0].id);
      }
    });
    return () => {
      off(r);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) || null,
    [channels, activeChannelId]
  );

  // Realtime: Messages für aktiven Channel
  useEffect(() => {
    if (!activeChannelId) {
      setMessages([]);
      return;
    }
    const r = ref(db, `channelMessages/${activeChannelId}`);
    onValue(r, (snap) => {
      const val = snap.val() || {};
      const list: Message[] = Object.entries(val).map(([id, m]: any) => ({
        id,
        ...m,
      }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setMessages(list);
    });
    return () => {
      off(r);
    };
  }, [activeChannelId]);

  // Channel anlegen (alle Mitglieder aus /newusers)
  const createChannel = async (name: string, description?: string) => {
    setError(null);
    setLoading(true);
    try {
      const clean = name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/#/g, "");
      if (!clean)
        throw new Error("Bitte einen gültigen Channel-Namen angeben.");

      const usersSnap = await get(ref(db, "newusers"));
      const usersVal = usersSnap.val() || {};
      const members: Record<string, true> = {};
      Object.keys(usersVal).forEach((userKey) => (members[userKey] = true));

      const chRef = push(ref(db, "channels"));
      await set(chRef, {
        name: clean,
        description: description?.trim() || "",
        createdAt: Date.now(),
        createdByEmail: user?.email || "",
        members,
      });
    } catch (e: any) {
      setError(e.message || "Channel konnte nicht erstellt werden.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Nachricht senden
  const sendMessage = async (text: string) => {
    if (!activeChannelId) throw new Error("Kein Channel aktiv.");
    if (!user) throw new Error("Nicht eingeloggt.");
    const msg = text.trim();
    if (!msg) return;

    const msgRef = push(ref(db, `channelMessages/${activeChannelId}`));
    await set(msgRef, {
      text: msg,
      createdAt: Date.now(),
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar || "/avatar1.png",
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
