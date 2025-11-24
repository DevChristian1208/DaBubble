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
import {
  ref,
  onValue,
  off,
  push,
  set,
  get,
  update,
  query,
  orderByChild,
  startAt,
} from "firebase/database";
import { db } from "@/app/lib/firebase";
import { useUser } from "./UserContext";

/* -----------------------------------------
 * TYPES
 * ---------------------------------------*/
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
  lastReadAt?: number;
};

// meta in db: dmThreads/<uid>/<otherUid>
type DMThreadMeta = {
  otherName?: string;
  otherAvatar?: string;
  lastMessageAt?: number;
  lastReadAt?: number;
};

// entire thread list for one user
type DMThreadsDb = Record<string, DMThreadMeta>;

// directMessages/<convId>
type DirectMessagesDb = Record<string, DMDbMessage>;

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
  unreadCounts: Record<string, number>;
  startDMWith: (otherUserId: string) => Promise<void>;
  sendDirectMessage: (text: string) => Promise<void>;
  clearDM: () => void;
};

const DirectContext = createContext<DirectContextType | undefined>(undefined);

function convIdFromIds(a: string, b: string) {
  return [a, b].sort().join("__");
}

type NewUserDb = {
  authUid?: string;
  newname?: string;
  newemail?: string;
  avatar?: string;
};

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
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const messagesRef = useRef<ReturnType<typeof ref> | null>(null);
  const threadsRef = useRef<ReturnType<typeof ref> | null>(null);

  const isGuest = user?.isGuest === true;
  const dmDisabled = isGuest || !user?.id;

  /* -----------------------------------------
   * THREADS LADEN
   * ---------------------------------------*/
  useEffect(() => {
    if (messagesRef.current) {
      off(messagesRef.current);
      messagesRef.current = null;
    }
    if (threadsRef.current) {
      off(threadsRef.current);
      threadsRef.current = null;
    }

    setDmThreads([]);
    setUnreadCounts({});

    if (dmDisabled) return;

    const r = ref(db, `dmThreads/${user!.id}`);
    threadsRef.current = r;

    const unsub = onValue(r, (snap) => {
      const raw = (snap.val() as DMThreadsDb | null) || {};

      const entries = Object.entries(raw).filter(
        ([otherUserId]) =>
          otherUserId && otherUserId !== user!.id && otherUserId !== "undefined"
      );

      const list: DMThread[] = entries.map(([otherUserId, meta]) => ({
        convId: convIdFromIds(user!.id, otherUserId),
        otherUserId,
        otherName: meta?.otherName || "Unbekannt",
        otherAvatar: meta?.otherAvatar || "/avatar1.png",
        lastMessageAt: meta?.lastMessageAt ?? 0,
        lastReadAt: meta?.lastReadAt ?? 0,
      }));

      list.sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
      setDmThreads(list);
    });

    return () => {
      off(r);
      threadsRef.current = null;
      unsub();
    };
  }, [user?.id, dmDisabled]);

  /* -----------------------------------------
   * UNREAD COUNTS
   * ---------------------------------------*/
  const unreadListeners = useRef<Record<string, () => void>>({});
  useEffect(() => {
    Object.values(unreadListeners.current).forEach((fn) => fn?.());
    unreadListeners.current = {};

    if (dmDisabled || dmThreads.length === 0) return;

    dmThreads.forEach((t) => {
      const since = (t.lastReadAt ?? 0) + 1;

      const qref =
        since > 1
          ? query(
              ref(db, `directMessages/${t.convId}`),
              orderByChild("createdAt"),
              startAt(since)
            )
          : ref(db, `directMessages/${t.convId}`);

      const unsub = onValue(qref, (snap) => {
        const val = (snap.val() as DirectMessagesDb | null) || {};
        let count = 0;

        Object.values(val).forEach((m) => {
          if (m.createdAt > (t.lastReadAt ?? 0) && m.from.id !== user!.id) {
            count++;
          }
        });

        setUnreadCounts((prev) =>
          prev[t.otherUserId] === count
            ? prev
            : { ...prev, [t.otherUserId]: count }
        );
      });

      unreadListeners.current[t.otherUserId] = () => off(qref, "value", unsub);
    });

    return () => {
      Object.values(unreadListeners.current).forEach((fn) => fn?.());
      unreadListeners.current = {};
    };
  }, [dmThreads, user?.id, dmDisabled]);

  /* -----------------------------------------
   * DM NACHRICHTEN LADEN
   * ---------------------------------------*/
  useEffect(() => {
    if (messagesRef.current) {
      off(messagesRef.current);
      messagesRef.current = null;
    }

    setDmMessages([]);

    if (dmDisabled || !activeDMUserId) return;

    const cid = convIdFromIds(user!.id, activeDMUserId);
    const r = ref(db, `directMessages/${cid}`);
    messagesRef.current = r;

    const unsub = onValue(r, (snap) => {
      const val = (snap.val() as DirectMessagesDb | null) || {};

      const list: ChatMessage[] = Object.entries(val).map(([id, m]) => ({
        id,
        text: m.text,
        createdAt: m.createdAt,
        user: {
          name: m.from.name ?? "Unbekannt",
          email: m.from.email ?? "",
          avatar: m.from.avatar,
        },
      }));

      list.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
      setDmMessages(list);
    });

    update(ref(db, `dmThreads/${user!.id}/${activeDMUserId}`), {
      lastReadAt: Date.now(),
    }).catch(() => {});

    setUnreadCounts((prev) =>
      prev[activeDMUserId] ? { ...prev, [activeDMUserId]: 0 } : prev
    );

    return () => {
      off(r, "value", unsub);
      messagesRef.current = null;
    };
  }, [activeDMUserId, user?.id, dmDisabled]);

  /* -----------------------------------------
   * START DM
   * ---------------------------------------*/
  const startDMWith = useCallback(
    async (otherUserId: string) => {
      if (dmDisabled) {
        alert("Direktnachrichten sind nur für registrierte Nutzer verfügbar.");
        return;
      }
      if (!user?.id || !otherUserId || user.id === otherUserId) return;

      let other = {
        id: otherUserId,
        name: "Unbekannt",
        email: "",
        avatar: "/avatar1.png",
      };

      const snap = await get(ref(db, `newusers/${otherUserId}`));
      if (snap.exists()) {
        const d = snap.val() as NewUserDb;
        other = {
          id: otherUserId,
          name: d.newname || "Unbekannt",
          email: d.newemail || "",
          avatar: d.avatar || "/avatar1.png",
        };
      }

      setActiveDMUserId(otherUserId);
      setActiveDMUser(other);

      await update(ref(db, `dmThreads/${user.id}/${otherUserId}`), {
        otherName: other.name,
        otherAvatar: other.avatar,
      });

      await update(ref(db, `dmThreads/${otherUserId}/${user.id}`), {
        otherName: user.name,
        otherAvatar: user.avatar || "/avatar1.png",
      });
    },
    [user, dmDisabled]
  );

  /* -----------------------------------------
   * SEND MESSAGE
   * ---------------------------------------*/
  const sendDirectMessage = useCallback(
    async (text: string) => {
      if (dmDisabled) {
        alert("Direktnachrichten sind nur für registrierte Nutzer verfügbar.");
        return;
      }

      if (!user?.id || !activeDMUserId) return;

      const msg = text.trim();
      if (!msg) return;

      const cid = convIdFromIds(user!.id, activeDMUserId);
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
        if (snap.exists()) {
          const d = snap.val() as NewUserDb;
          toMeta = {
            id: activeDMUserId,
            name: d.newname || "Unbekannt",
            email: d.newemail || "",
            avatar: d.avatar || "/avatar1.png",
          };
        } else {
          toMeta = {
            id: activeDMUserId,
            name: "Unbekannt",
            email: "",
            avatar: "/avatar1.png",
          };
        }
      }

      const message: DMDbMessage = {
        text: msg,
        createdAt: now,
        from,
        to: toMeta,
      };

      const newRef = push(ref(db, `directMessages/${cid}`));
      await set(newRef, message);

      await update(ref(db, `dmThreads/${user.id}/${activeDMUserId}`), {
        otherName: toMeta.name,
        otherAvatar: toMeta.avatar,
        lastMessageAt: now,
      });

      await update(ref(db, `dmThreads/${activeDMUserId}/${user.id}`), {
        otherName: user.name,
        otherAvatar: user.avatar || "/avatar1.png",
        lastMessageAt: now,
      });
    },
    [user, activeDMUserId, activeDMUser, dmDisabled]
  );

  /* -----------------------------------------
   * CLEAR DM
   * ---------------------------------------*/
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
      unreadCounts,
      startDMWith,
      sendDirectMessage,
      clearDM,
    }),
    [
      activeDMUserId,
      activeDMUser,
      dmMessages,
      dmThreads,
      unreadCounts,
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
