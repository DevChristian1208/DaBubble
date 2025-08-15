"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { ref, onValue, off, get, push, set } from "firebase/database";
import { db } from "../lib/firebase";
import { useUser } from "./UserContext";

export type RtdbUser = {
  newname: string;
  newemail: string;
  avatar?: string;
};

export type DirectMessage = {
  id: string;
  text: string;
  createdAt?: number;
  user: { name: string; email: string; avatar?: string };
};

type DirectContextType = {
  // Nutzer
  allUsers: Array<{ id: string; name: string; email: string; avatar?: string }>;
  currentUserId: string | null;

  // Aktiver DM (Zielnutzer)
  activeDMUserId: string | null;
  activeDMUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;

  // DM-Nachrichten des aktiven Gesprächs
  dmMessages: DirectMessage[];

  // Steuerung
  setActiveDMUserId: (userId: string | null) => void;
  startDMWith: (userId: string) => void;
  sendDirectMessage: (text: string) => Promise<void>;

  // (optional) Liste meiner DM-Kontakte (aus vorhandenen Konversationen)
  myDMContacts: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
};

const DirectContext = createContext<DirectContextType | undefined>(undefined);

function convIdFor(a: string, b: string) {
  return [a, b].sort().join("__");
}

export function DirectProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();

  const [allUsers, setAllUsers] = useState<
    Array<{ id: string; name: string; email: string; avatar?: string }>
  >([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [activeDMUserId, setActiveDMUserId] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<DirectMessage[]>([]);

  const [myDMContacts, setMyDMContacts] = useState<
    Array<{ id: string; name: string; email: string; avatar?: string }>
  >([]);

  // Alle User laden + die eigene UserId herausfinden
  useEffect(() => {
    const r = ref(db, "newusers");
    onValue(r, (snap) => {
      const val = snap.val() || {};
      const list = Object.entries(val).map(([id, u]: [string, any]) => ({
        id,
        name: u?.newname ?? "Unbekannt",
        email: u?.newemail ?? "",
        avatar: u?.avatar || "/avatar1.png",
      }));
      setAllUsers(list);

      // eigene ID via E-Mail finden
      if (user?.email) {
        const me = list.find((x) => x.email === user.email);
        setCurrentUserId(me?.id || null);
      } else {
        setCurrentUserId(null);
      }
    });

    return () => off(r);
  }, [user?.email]);

  // Aktive DM-Messages abonnieren
  useEffect(() => {
    if (!currentUserId || !activeDMUserId) {
      setDmMessages([]);
      return;
    }
    const id = convIdFor(currentUserId, activeDMUserId);
    const r = ref(db, `directMessages/${id}`);
    onValue(r, (snap) => {
      const val = snap.val() || {};
      const list: DirectMessage[] = Object.entries(val).map(
        ([mid, m]: any) => ({
          id: mid,
          ...m,
        })
      );
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setDmMessages(list);
    });
    return () => off(r);
  }, [currentUserId, activeDMUserId]);

  // Kontakte (Konversationen, an denen ich beteiligt bin)
  useEffect(() => {
    if (!currentUserId) {
      setMyDMContacts([]);
      return;
    }
    const r = ref(db, "directConversations");
    onValue(r, (snap) => {
      const val = snap.val() || {};
      const myPartnerIds = new Set<string>();
      Object.values<any>(val).forEach((conv: any) => {
        if (conv?.participants?.[currentUserId]) {
          const otherId = Object.keys(conv.participants).find(
            (pid) => pid !== currentUserId
          );
          if (otherId) myPartnerIds.add(otherId);
        }
      });
      const contacts = Array.from(myPartnerIds)
        .map((id) => allUsers.find((u) => u.id === id))
        .filter(Boolean) as Array<{
        id: string;
        name: string;
        email: string;
        avatar?: string;
      }>;
      setMyDMContacts(contacts);
    });
    return () => off(r);
  }, [currentUserId, allUsers]);

  const activeDMUser = useMemo(
    () =>
      activeDMUserId
        ? allUsers.find((u) => u.id === activeDMUserId) || null
        : null,
    [activeDMUserId, allUsers]
  );

  const startDMWith = (userId: string) => {
    if (!userId) return;
    setActiveDMUserId(userId);
  };

  const sendDirectMessage = async (text: string) => {
    const msg = text.trim();
    if (!msg || !currentUserId || !activeDMUserId || !user) return;

    const id = convIdFor(currentUserId, activeDMUserId);

    // Conversation-Meta sicherstellen
    const convRef = ref(db, `directConversations/${id}`);
    const convSnap = await get(convRef);
    if (!convSnap.exists()) {
      await set(convRef, {
        createdAt: Date.now(),
        participants: {
          [currentUserId]: true,
          [activeDMUserId]: true,
        },
      });
    }

    const msgRef = push(ref(db, `directMessages/${id}`));
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
    <DirectContext.Provider
      value={{
        allUsers,
        currentUserId,
        activeDMUserId,
        activeDMUser,
        dmMessages,
        setActiveDMUserId,
        startDMWith,
        sendDirectMessage,
        myDMContacts,
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
