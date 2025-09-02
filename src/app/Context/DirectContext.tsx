"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { ref, onValue, off, push, set, get, update } from "firebase/database";
import { db } from "@/app/lib/firebase";
import { useUser } from "./UserContext";

export type ChatMessage = {
  id: string;
  text: string;
  createdAt?: number;
  user: { name: string; email: string; avatar?: string };
};

type DMDbMessage = {
  text: string;
  createdAt: number;
  from: { id: string; name: string; email: string; avatar?: string };
  to: { id: string; name: string; email: string; avatar?: string };
};

export type DMThread = {
  convId: string;
  otherUserId: string;
  otherName: string;
  otherAvatar?: string;
  lastMessageAt?: number;
};

type DirectContextType = {
  activeDMUserId: string | null;
  activeDMUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  dmMessages: ChatMessage[];
  dmThreads: DMThread[];
  startDMWith: (otherUserId: string) => Promise<void>;
  sendDirectMessage: (text: string) => Promise<void>;
  clearDM: () => void;
};

const DirectContext = createContext<DirectContextType | undefined>(undefined);

function convIdFromIds(a: string, b: string) {
  return [a, b].sort().join("__");
}

export function DirectProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [activeDMUserId, setActiveDMUserId] = useState<string | null>(null);
  const [activeDMUser, setActiveDMUser] = useState<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);

  const [dmMessages, setDmMessages] = useState<ChatMessage[]>([]);
  const [dmThreads, setDmThreads] = useState<DMThread[]>([]);

  const messagesRef = useRef<ReturnType<typeof ref> | null>(null);
  const threadsRef = useRef<ReturnType<typeof ref> | null>(null);

  // Threads live lesen
  useEffect(() => {
    if (threadsRef.current) {
      off(threadsRef.current);
      threadsRef.current = null;
    }
    setDmThreads([]);

    if (!user?.id) return;

    const r = ref(db, `dmThreads/${user.id}`);
    threadsRef.current = r;

    const unsub = onValue(r, (snap) => {
      const val = (snap.val() || {}) as Record<
        string,
        { otherName: string; otherAvatar?: string; lastMessageAt?: number }
      >;

      const list: DMThread[] = Object.entries(val).map(
        ([otherUserId, meta]) => ({
          convId: convIdFromIds(user.id!, otherUserId),
          otherUserId,
          otherName: meta?.otherName || "Unbekannt",
          otherAvatar: meta?.otherAvatar,
          lastMessageAt: meta?.lastMessageAt ?? 0,
        })
      );

      list.sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
      setDmThreads(list);
    });

    return () => {
      off(r);
      threadsRef.current = null;
      unsub();
    };
  }, [user?.id]);

  // Nachrichten für aktive DM lesen
  useEffect(() => {
    if (messagesRef.current) {
      off(messagesRef.current);
      messagesRef.current = null;
    }
    setDmMessages([]);

    if (!user?.id || !activeDMUserId) return;

    const cid = convIdFromIds(user.id, activeDMUserId);
    const r = ref(db, `directMessages/${cid}`);
    messagesRef.current = r;

    const unsub = onValue(r, (snap) => {
      const val: Record<string, DMDbMessage> = snap.val() || {};
      const list: ChatMessage[] = Object.entries(val).map(([id, m]) => ({
        id,
        text: m.text,
        createdAt: m.createdAt,
        user: {
          name: m.from?.name ?? "Unbekannt",
          email: m.from?.email ?? "",
          avatar: m.from?.avatar,
        },
      }));
      list.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
      setDmMessages(list);
    });

    return () => {
      off(r);
      messagesRef.current = null;
      unsub();
    };
  }, [user?.id, activeDMUserId]);

  const startDMWith = useCallback(
    async (otherUserId: string) => {
      if (!user?.id) return;
      if (!otherUserId || otherUserId === user.id) return;

      const otherSnap = await get(ref(db, `newusers/${otherUserId}`));
      const otherVal = otherSnap.val() || {};
      const otherName = otherVal.newname || "Unbekannt";
      const otherAvatar = otherVal.avatar || "/avatar1.png";
      const otherEmail = otherVal.newemail || "";

      setActiveDMUserId(otherUserId);
      setActiveDMUser({
        id: otherUserId,
        name: otherName,
        email: otherEmail,
        avatar: otherAvatar,
      });

      const now = Date.now();
      await update(ref(db), {
        [`dmThreads/${user.id}/${otherUserId}`]: {
          otherName,
          otherAvatar,
          lastMessageAt: now,
        },
        [`dmThreads/${otherUserId}/${user.id}`]: {
          otherName: user.name,
          otherAvatar: user.avatar || "/avatar1.png",
          lastMessageAt: now,
        },
      });
    },
    [user]
  );

  const sendDirectMessage = useCallback(
    async (text: string) => {
      if (!user?.id || !activeDMUserId) throw new Error("Kein DM aktiv.");
      const msg = text.trim();
      if (!msg) return;

      const cid = convIdFromIds(user.id, activeDMUserId);
      const now = Date.now();

      const from = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "/avatar1.png",
      };

      let toMeta = activeDMUser;
      if (!toMeta) {
        const snap = await get(ref(db, `newusers/${activeDMUserId}`));
        const val = snap.val() || {};
        toMeta = {
          id: activeDMUserId,
          name: val.newname || "Unbekannt",
          email: val.newemail || "",
          avatar: val.avatar || "/avatar1.png",
        };
      }

      const message: DMDbMessage = {
        text: msg,
        createdAt: now,
        from,
        to: {
          id: toMeta!.id,
          name: toMeta!.name,
          email: toMeta!.email,
          avatar: toMeta!.avatar,
        },
      };

      const newRef = push(ref(db, `directMessages/${cid}`));
      await set(newRef, message);

      await update(ref(db), {
        [`dmThreads/${user.id}/${activeDMUserId}`]: {
          otherName: toMeta!.name,
          otherAvatar: toMeta!.avatar,
          lastMessageAt: now,
        },
        [`dmThreads/${activeDMUserId}/${user.id}`]: {
          otherName: user.name,
          otherAvatar: user.avatar || "/avatar1.png",
          lastMessageAt: now,
        },
      });
    },
    [user, activeDMUserId, activeDMUser]
  );

  const clearDM = useCallback(() => {
    setActiveDMUserId(null);
    setActiveDMUser(null);
    setDmMessages([]);
    if (messagesRef.current) {
      off(messagesRef.current);
      messagesRef.current = null;
    }
  }, []);

  const value = useMemo<DirectContextType>(
    () => ({
      activeDMUserId,
      activeDMUser,
      dmMessages,
      dmThreads,
      startDMWith,
      sendDirectMessage,
      clearDM,
    }),
    [
      activeDMUserId,
      activeDMUser,
      dmMessages,
      dmThreads,
      startDMWith,
      sendDirectMessage,
      clearDM,
    ]
  );

  return (
    <DirectContext.Provider value={value}>{children}</DirectContext.Provider>
  );
}

export function useDirect() {
  const ctx = useContext(DirectContext);
  if (!ctx) throw new Error("useDirect must be used within DirectProvider");
  return ctx;
}
