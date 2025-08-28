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
import { db } from "@/app/lib/firebase";
import { useUser } from "./UserContext";

/** Typen */
type NewUser = {
  newname: string;
  newemail: string;
  newpassword?: string;
  avatar?: string;
  createdAt?: string;
};

export type DMUser = {
  id: string; // key aus /newusers
  name: string;
  email?: string;
  avatar?: string;
};

export type DMMessage = {
  id: string;
  text: string;
  createdAt?: number;
  from: { name: string; email: string; avatar?: string };
};
type DMMessageDB = Omit<DMMessage, "id">;

type DirectContextType = {
  activeDMUserId: string | null;
  activeDMUser: DMUser | null;
  dmMessages: DMMessage[];
  startDMWith: (userId: string) => Promise<void>;
  sendDirectMessage: (text: string) => Promise<void>;
};

const DirectContext = createContext<DirectContextType | undefined>(undefined);

/** Hilfsfunktionen */
function threadIdFor(a: string, b: string) {
  return [a, b].sort().join("__");
}

export function DirectProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [myUserKey, setMyUserKey] = useState<string | null>(null);

  const [activeDMUserId, setActiveDMUserId] = useState<string | null>(null);
  const [activeDMUser, setActiveDMUser] = useState<DMUser | null>(null);
  const [dmMessages, setDmMessages] = useState<DMMessage[]>([]);

  /** Hole meinen User-Key aus /newusers (per Email) */
  useEffect(() => {
    if (!user?.email) {
      setMyUserKey(null);
      return;
    }
    const run = async () => {
      const snap = await get(ref(db, "newusers"));
      const all = (snap.val() ?? {}) as Record<string, NewUser>;
      const hit = Object.entries(all).find(
        ([, u]) => u?.newemail === user.email
      );
      setMyUserKey(hit ? hit[0] : null);
    };
    void run();
  }, [user?.email]);

  /** DM-Nachrichten des aktuellen Threads abonnieren */
  useEffect(() => {
    if (!myUserKey || !activeDMUserId) {
      setDmMessages([]);
      return;
    }
    const tid = threadIdFor(myUserKey, activeDMUserId);
    const r = ref(db, `directMessages/${tid}`);
    const unsub = onValue(r, (snap) => {
      const val = (snap.val() ?? {}) as Record<string, DMMessageDB>;
      const list: DMMessage[] = Object.entries(val).map(([id, m]) => ({
        id,
        ...m,
      }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setDmMessages(list);
    });
    return () => {
      off(r);
      // @ts-ignore
      unsub?.();
    };
  }, [myUserKey, activeDMUserId]);

  /** Aktiven DM-Partner laden (für Header/Avatar) */
  useEffect(() => {
    const run = async () => {
      if (!activeDMUserId) {
        setActiveDMUser(null);
        return;
      }
      const snap = await get(ref(db, `newusers/${activeDMUserId}`));
      const doc = (snap.val() ?? null) as NewUser | null;
      if (!doc) {
        setActiveDMUser(null);
        return;
      }
      setActiveDMUser({
        id: activeDMUserId,
        name: doc.newname ?? "Unbekannt",
        email: doc.newemail,
        avatar: doc.avatar || "/avatar1.png",
      });
    };
    void run();
  }, [activeDMUserId]);

  /** Öffne/erstelle Thread mit userId */
  const startDMWith = async (userId: string) => {
    setActiveDMUserId(userId);
  };

  /** Nachricht in aktuellen DM-Thread senden */
  const sendDirectMessage = async (text: string) => {
    if (!user) throw new Error("Nicht eingeloggt.");
    if (!myUserKey || !activeDMUserId)
      throw new Error("Kein DM-Partner aktiv.");
    const body = text.trim();
    if (!body) return;

    const tid = threadIdFor(myUserKey, activeDMUserId);
    const msgRef = push(ref(db, `directMessages/${tid}`));
    const payload: DMMessageDB = {
      text: body,
      createdAt: Date.now(),
      from: {
        name: user.name,
        email: user.email,
        avatar: user.avatar || "/avatar1.png",
      },
    };
    await set(msgRef, payload);
  };

  return (
    <DirectContext.Provider
      value={{
        activeDMUserId,
        activeDMUser,
        dmMessages,
        startDMWith,
        sendDirectMessage,
      }}
    >
      {children}
    </DirectContext.Provider>
  );
}

export const useDirect = () => {
  const ctx = useContext(DirectContext);
  if (!ctx) throw new Error("useDirect must be used within DirectProvider");
  return ctx;
};
