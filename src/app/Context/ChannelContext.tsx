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

      // 2) Versuche genau EINMAL, channel.members zu normalisieren/auffüllen (leise ignorieren bei Permission denied)
      if (!repairDone.current) {
        repairDone.current = true;
        await safeNormalizeAndFillChannelMembers();
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) || null,
    [channels, activeChannelId]
  );

  /** Nachrichten des aktiven Channels */
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

  /**
   * Sichere Hülle: Backfill /users -> /newusers.
   * Scheitert das (z. B. Permission denied), wird es deaktiviert und die App läuft weiter.
   */
  const safeEnsureNewusersForAllUsers = async () => {
    if (!allowUsersBackfill.current) return;
    try {
      await ensureNewusersForAllUsers();
    } catch (e: any) {
      console.warn(
        "[ChannelContext] Backfill /users→/newusers übersprungen:",
        e?.message || e
      );
      // nie wieder versuchen, um weitere Permission-Fehler zu verhindern
      allowUsersBackfill.current = false;
    }
  };

  /**
   * Sichere Hülle: Members normalisieren/auffüllen.
   * Scheitert das (z. B. fehlende Rechte), wird still weitergemacht.
   */
  const safeNormalizeAndFillChannelMembers = async () => {
    try {
      await normalizeAndFillChannelMembers();
    } catch (e: any) {
      console.warn(
        "[ChannelContext] normalize members übersprungen:",
        e?.message || e
      );
    }
  };

  /** EIGENTLICHER Backfill (kann Permission denied werfen) */
  const ensureNewusersForAllUsers = async () => {
    // /users komplett lesen -> kann von Regeln verboten sein
    const usersSnap = await get(ref(db, "users")); // <-- hier knallte es vorher
    const usersVal = (usersSnap.val() ?? {}) as Record<string, UsersAuth>;

    const newSnap = await get(ref(db, "newusers"));
    const newVal = (newSnap.val() ?? {}) as Record<string, NewUser>;

    // Mapping authUid -> newusersKey (bereits vorhanden)
    const byAuthExisting: Record<string, string> = {};
    for (const [k, v] of Object.entries(newVal)) {
      if (v?.authUid) byAuthExisting[v.authUid] = k;
    }

    const writes: Array<Promise<any>> = [];
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
          } as NewUser)
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

  /**
   * Members normalisieren (authUid->/newusers-Key) und sicherstellen, dass ALLE /newusers drin sind.
   */
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
    const updates: Record<string, any> = {};

    for (const [chId, ch] of Object.entries(chVal)) {
      const current = ch.members || {};
      const normalized: Record<string, true> = {};

      // existierende Keys normalisieren
      for (const rawKey of Object.keys(current)) {
        if (allIds.includes(rawKey)) {
          normalized[rawKey] = true; // bereits /newusers-Key
        } else if (byAuth[rawKey]) {
          normalized[byAuth[rawKey]] = true; // authUid -> /newusers-Key
        }
      }

      // alle /newusers hinzufügen
      for (const id of allIds) normalized[id] = true;

      // nur schreiben, wenn sich etwas geändert hat
      const changed =
        !ch.members ||
        Object.keys(ch.members).length !== Object.keys(normalized).length ||
        Object.keys(normalized).some((k) => !ch.members?.[k]);

      if (changed) {
        updates[`channels/${chId}/members`] = normalized;
      }
    }

    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
      console.log(
        "[ChannelContext] Channel members normalisiert/aufgefüllt:",
        Object.keys(updates).length
      );
    }
  };

  /** Channel anlegen – nur mit /newusers arbeiten, Backfill nur „best effort“ */
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

      // Best effort: Backfill versuchen, aber bei Permission-Fehler still weitermachen
      await safeEnsureNewusersForAllUsers();

      // aktuelle /newusers lesen
      const newSnap = await get(ref(db, "newusers"));
      const newVal = (newSnap.val() ?? {}) as Record<string, NewUser>;
      let ids = Object.keys(newVal || {});

      // Fallback: wenn leer, min. Ersteller als /newusers anlegen
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
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Channel konnte nicht erstellt werden.";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  /** Nachricht in aktiven Channel senden */
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
