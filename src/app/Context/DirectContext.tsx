"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { ref, onValue, off, push, set, update, get } from "firebase/database";
import { db } from "../lib/firebase";
import { useUser } from "./UserContext";

/** Nachrichten-Typ für DMs */
export type DMMessage = {
  id: string;
  text: string;
  createdAt: number;
  from: { id: string; name: string; email?: string; avatar?: string };
  to: { id: string; name: string; email?: string; avatar?: string };
};

/** Thread-Typ für die Sidebar-Liste */
export type DMThread = {
  convId: string;
  otherUserId: string;
  otherName: string;
  otherAvatar?: string;
  lastMessageAt?: number;
  lastText?: string;
};

/** directMeta-Datenstruktur in RTDB */
type DirectMeta = {
  participants?: Record<string, true>;
  profiles?: Record<
    string,
    { name?: string; avatar?: string; email?: string | null }
  >;
  lastMessageAt?: number;
  lastText?: string;
};

type OtherUserProfile = {
  newname?: string;
  newemail?: string;
  avatar?: string;
};

type DirectContextType = {
  activeDMUserId: string | null;
  activeDMUser: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  } | null;
  dmMessages: DMMessage[];
  dmThreads: DMThread[];
  startDMWith: (otherUserId: string) => Promise<void>;
  sendDirectMessage: (text: string) => Promise<void>;
  clearDM: () => void;
};

const DirectContext = createContext<DirectContextType | undefined>(undefined);

/** Hilfsfunktion: Konversations-ID aus zwei User-IDs (keine E-Mails!) */
function convIdFor(a: string, b: string) {
  return [a, b].sort().join("__");
}

export function DirectProvider({ children }: { children: ReactNode }) {
  const { user } = useUser(); // erwarte: user.id, user.name, user.email, user.avatar
  const [activeDMUserId, setActiveDMUserId] = useState<string | null>(null);
  const [activeDMUser, setActiveDMUser] =
    useState<DirectContextType["activeDMUser"]>(null);
  const [dmMessages, setDmMessages] = useState<DMMessage[]>([]);
  const [dmThreads, setDmThreads] = useState<DMThread[]>([]);

  /** Aktiven DM-Partner-Profil laden (aus /newusers) */
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!activeDMUserId) {
        if (alive) setActiveDMUser(null);
        return;
      }
      try {
        const snap = await get(ref(db, `newusers/${activeDMUserId}`));
        const val = (snap.val() || {}) as OtherUserProfile;
        const profile = {
          id: activeDMUserId,
          name: val.newname ?? "Unbekannt",
          email: val.newemail,
          avatar: val.avatar || "/avatar1.png",
        };
        if (alive) setActiveDMUser(profile);
      } catch {
        if (alive)
          setActiveDMUser({
            id: activeDMUserId,
            name: "Unbekannt",
            avatar: "/avatar1.png",
          });
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeDMUserId]);

  /** DM-Nachrichten des aktiven Gesprächs in Echtzeit hören */
  useEffect(() => {
    if (!user?.id || !activeDMUserId) {
      setDmMessages([]);
      return;
    }
    const convId = convIdFor(user.id, activeDMUserId);
    const r = ref(db, `directMessages/${convId}`);
    const unsub = onValue(r, (snap) => {
      const val = (snap.val() || {}) as Record<string, Omit<DMMessage, "id">>;
      const list: DMMessage[] = Object.entries(val).map(([id, m]) => ({
        id,
        ...m,
      }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setDmMessages(list);
    });
    return () => {
      off(r);
    };
  }, [user?.id, activeDMUserId]);

  /** Threads (Konversationen) für die Sidebar ableiten */
  useEffect(() => {
    const meId =
      user?.id ||
      (typeof window !== "undefined"
        ? localStorage.getItem("userId") || undefined
        : undefined);

    if (!meId) {
      setDmThreads([]);
      return;
    }

    const r = ref(db, "directMeta");
    const unsub = onValue(r, (snap) => {
      const val = (snap.val() || {}) as Record<string, DirectMeta>;
      const threads: DMThread[] = [];

      Object.entries(val).forEach(([convId, meta]) => {
        const parts = meta.participants || {};
        if (!parts[meId]) return;

        const otherId = Object.keys(parts).find((id) => id !== meId);
        if (!otherId) return;

        const otherProf = meta.profiles?.[otherId] || {};
        threads.push({
          convId,
          otherUserId: otherId,
          otherName: otherProf.name || "Unbekannt",
          otherAvatar: otherProf.avatar || "/avatar1.png",
          lastMessageAt: meta.lastMessageAt || 0,
          lastText: meta.lastText || "",
        });
      });

      threads.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
      setDmThreads(threads);
    });

    return () => off(r);
  }, [user?.id]);

  /** DM mit bestimmtem User starten (setzt activeDMUserId und pflegt Meta) */
  const startDMWith = async (otherUserId: string) => {
    if (!user?.id) return;
    setActiveDMUserId(otherUserId);

    // Anderen Nutzer für Meta (Name/Avatar) laden (nur wenn nötig)
    let other: OtherUserProfile | null = null;
    try {
      const snap = await get(ref(db, `newusers/${otherUserId}`));
      other = (snap.val() || null) as OtherUserProfile | null;
    } catch {
      other = null;
    }

    const myId = user.id;
    const convId = convIdFor(myId, otherUserId);

    // Meta updaten (Teilnehmer & Profile)
    await update(ref(db, `directMeta/${convId}`), {
      participants: {
        [myId]: true,
        [otherUserId]: true,
      },
      profiles: {
        [myId]: {
          name: user.name,
          avatar: user.avatar || "/avatar1.png",
          email: user.email || null,
        },
        [otherUserId]: {
          name: other?.newname || "Unbekannt",
          avatar: other?.avatar || "/avatar1.png",
          email: other?.newemail || null,
        },
      },
      // kein lastMessageAt/lastText hier, das passiert beim Senden
    });
  };

  /** Nachricht in DM senden */
  const sendDirectMessage = async (text: string) => {
    const t = text.trim();
    if (!t) return;
    if (!user?.id || !activeDMUserId) return;

    const convId = convIdFor(user.id, activeDMUserId);
    const msgRef = push(ref(db, `directMessages/${convId}`));
    const now = Date.now();

    const payload: Omit<DMMessage, "id"> = {
      text: t,
      createdAt: now,
      from: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "/avatar1.png",
      },
      to: {
        id: activeDMUser?.id || activeDMUserId,
        name: activeDMUser?.name || "Unbekannt",
        email: activeDMUser?.email,
        avatar: activeDMUser?.avatar || "/avatar1.png",
      },
    };

    await set(msgRef, payload);

    // Meta aktualisieren (für Sortierung + Vorschau in Sidebar)
    await update(ref(db, `directMeta/${convId}`), {
      lastMessageAt: now,
      lastText: t,
    });
  };

  const clearDM = () => {
    setActiveDMUserId(null);
    setActiveDMUser(null);
    setDmMessages([]);
  };

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
    [activeDMUserId, activeDMUser, dmMessages, dmThreads]
  );

  return (
    <DirectContext.Provider value={value}>{children}</DirectContext.Provider>
  );
}

export const useDirect = () => {
  const ctx = useContext(DirectContext);
  if (!ctx) throw new Error("useDirect must be used within DirectProvider");
  return ctx;
};
