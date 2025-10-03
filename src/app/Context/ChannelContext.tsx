"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useRef,
} from "react";
import { ref, onValue, push, set, get, update } from "firebase/database";
import { db } from "@/app/lib/firebase";
import { useUser } from "./UserContext";

export type Channel = {
  id: string;
  name: string;
  description?: string;
  createdAt?: number;
  createdByEmail?: string;
  members?: Record<string, true>;
};
type ChannelDB = Omit<Channel, "id">;

export type Message = {
  id: string;
  text: string;
  createdAt?: number;
  user: { name: string; email: string; avatar?: string };
};
type MessageDB = Omit<Message, "id">;

type NewUser = {
  newname?: string;
  newemail?: string;
  avatar?: string;
  authUid?: string;
  createdAt?: string;
};

type UsersAuth = {
  name?: string;
  email?: string;
  avatar?: string;
  createdAt?: string;
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

  const initialSyncDone = useRef(false);
  const repairDone = useRef(false);
  const allowUsersBackfill = useRef(true);

  useEffect(() => {
    const r = ref(db, "newusers");
    const unsub = onValue(r, () => {});
    return () => unsub();
  }, []);

  useEffect(() => {
    const r = ref(db, "channels");
    const unsub = onValue(r, async (snap) => {
      const val = (snap.val() ?? {}) as Record<string, ChannelDB>;
      const list: Channel[] = Object.entries(val).map(([id, c]) => ({
        id,
        ...c,
      }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setChannels(list);

      if (!activeChannelId && list.length > 0) {
        setActiveChannelId(list[0].id);
      }

      if (!initialSyncDone.current) {
        initialSyncDone.current = true;
        await safeEnsureNewusersForAllUsers();
      }

      if (!repairDone.current) {
        repairDone.current = true;
        await safeNormalizeAndFillChannelMembers();
      }
    });

    return () => unsub();
  }, [activeChannelId]);

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) || null,
    [channels, activeChannelId]
  );

  useEffect(() => {
    if (!activeChannelId) {
      setMessages([]);
      return;
    }
    const r = ref(db, `channelMessages/${activeChannelId}`);
    const unsub = onValue(r, (snap) => {
      const val = (snap.val() ?? {}) as Record<string, MessageDB>;
      const list: Message[] = Object.entries(val).map(([id, m]) => ({
        id,
        ...m,
      }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setMessages(list);
    });
    return () => unsub();
  }, [activeChannelId]);

  const safeEnsureNewusersForAllUsers = async () => {
    if (!allowUsersBackfill.current) return;
    try {
      await ensureNewusersForAllUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(
        "[ChannelContext] Backfill /users→/newusers übersprungen:",
        msg
      );
      allowUsersBackfill.current = false;
    }
  };

  const safeNormalizeAndFillChannelMembers = async () => {
    try {
      await normalizeAndFillChannelMembers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[ChannelContext] normalize members übersprungen:", msg);
    }
  };

  const ensureNewusersForAllUsers = async () => {
    const usersSnap = await get(ref(db, "users"));
    const usersVal = (usersSnap.val() ?? {}) as Record<string, UsersAuth>;

    const newSnap = await get(ref(db, "newusers"));
    const newVal = (newSnap.val() ?? {}) as Record<string, NewUser>;

    const byAuthExisting: Record<string, string> = {};
    for (const [k, v] of Object.entries(newVal)) {
      if (v?.authUid) byAuthExisting[v.authUid] = k;
    }

    const writes: Array<Promise<void>> = [];
    for (const [authUid, u] of Object.entries(usersVal)) {
      if (!byAuthExisting[authUid]) {
        const nuRef = push(ref(db, "newusers"));
        writes.push(
          set(nuRef, {
            newname: u.name || "Unbekannt",
            newemail: u.email || "",
            avatar: u.avatar || "/avatar1.png",
            authUid,
            createdAt: u.createdAt || new Date().toISOString(),
          } as NewUser) as unknown as Promise<void>
        );
      }
    }

    if (writes.length) {
      await Promise.all(writes);
      console.log(
        "[ChannelContext] /users → /newusers synchronisiert:",
        writes.length
      );
    }
  };

  const normalizeAndFillChannelMembers = async () => {
    const newSnap = await get(ref(db, "newusers"));
    const newVal = (newSnap.val() ?? {}) as Record<string, NewUser>;
    const allIds = Object.keys(newVal || {});
    const byAuth: Record<string, string> = {};
    for (const [k, v] of Object.entries(newVal)) {
      if (v?.authUid) byAuth[v.authUid] = k;
    }

    const chSnap = await get(ref(db, "channels"));
    const chVal = (chSnap.val() ?? {}) as Record<string, ChannelDB>;

    // Map von Pfad → neue Members-Menge
    const updates: Record<string, Record<string, true>> = {};

    for (const [chId, ch] of Object.entries(chVal)) {
      const current = ch.members || {};
      const normalized: Record<string, true> = {};

      for (const rawKey of Object.keys(current)) {
        if (allIds.includes(rawKey)) {
          normalized[rawKey] = true;
        } else if (byAuth[rawKey]) {
          normalized[byAuth[rawKey]] = true;
        }
      }

      // alle bekannten Nutzer in jeden Channel aufnehmen
      for (const id of allIds) normalized[id] = true;

      const changed =
        !ch.members ||
        Object.keys(ch.members).length !== Object.keys(normalized).length ||
        Object.keys(normalized).some((k) => !ch.members?.[k]);

      if (changed) {
        updates[`channels/${chId}/members`] = normalized;
      }
    }

    if (Object.keys(updates).length > 0) {
      // update erwartet Record<string, unknown>; unsere Struktur ist kompatibel
      await update(ref(db), updates as Record<string, unknown>);
      console.log(
        "[ChannelContext] Channel members normalisiert/aufgefüllt:",
        Object.keys(updates).length
      );
    }
  };

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
      await safeEnsureNewusersForAllUsers();

      const newSnap = await get(ref(db, "newusers"));
      const newVal = (newSnap.val() ?? {}) as Record<string, NewUser>;
      let ids = Object.keys(newVal || {});

      if (ids.length === 0 && user?.id) {
        const nuRef = push(ref(db, "newusers"));
        const newId = nuRef.key!;
        await set(nuRef, {
          newname: user.name || "Unbekannt",
          newemail: user.email || "",
          avatar: user.avatar || "/avatar1.png",
          authUid: user.id,
          createdAt: new Date().toISOString(),
        } as NewUser);
        ids = [newId];
      }

      const members: Record<string, true> = {};
      ids.forEach((id) => (members[id] = true));

      const chRef = push(ref(db, "channels"));
      await set(chRef, {
        name: clean,
        description: description?.trim() || "",
        createdAt: Date.now(),
        createdByEmail: user?.email || "",
        members,
      } as ChannelDB);

      console.log(
        "[ChannelContext] Channel erstellt:",
        clean,
        "Mitglieder:",
        Object.keys(members).length
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Channel konnte nicht erstellt werden.";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

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
    } as MessageDB);
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
