"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  ref,
  onValue,
  push,
  set,
  update,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/app/lib/firebase";
import { useUser } from "./UserContext";

export type Channel = {
  id: string;
  name: string;
  description?: string;
  createdAt?: number;
  createdByEmail?: string;
  members?: Record<string, true>;
  public?: boolean;
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

async function requireAuthUid(): Promise<string> {
  if (auth.currentUser?.uid) return auth.currentUser.uid;
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        unsub();
        if (u?.uid) resolve(u.uid);
        else reject(new Error("Nicht eingeloggt."));
      },
      (err) => {
        unsub();
        reject(err);
      }
    );
  });
}

export function ChannelProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const authReady = useAuthReady();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const normalize = (id: string, c: any): Channel => ({
      id,
      name: c?.name || "ohne-namen",
      description: c?.description || "",
      createdAt: c?.createdAt || 0,
      createdByEmail: c?.createdByEmail || "",
      members: c?.members || {},
      public: c?.public === true,
    });

    const store: Record<string, Channel> = {};
    let gotPublic = false;
    let gotPrivate = false;

    const emit = () => {
      if (!gotPublic || !gotPrivate) return;
      const list = Object.values(store).sort(
        (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)
      );
      setChannels(list);
      if (!activeChannelId && list.length > 0) {
        setActiveChannelId(list[0].id);
      } else if (
        activeChannelId &&
        !list.find((c) => c.id === activeChannelId)
      ) {
        setActiveChannelId(list[0]?.id || null);
      }
    };

    const qPublic = query(
      ref(db, "channels"),
      orderByChild("public"),
      equalTo(true)
    );
    const unsubPublic = onValue(qPublic, (snap) => {
      for (const [id, ch] of Object.entries(store)) {
        if ((ch as Channel).public) delete store[id];
      }
      const v = (snap.val() || {}) as Record<string, any>;
      Object.entries(v).forEach(([id, c]) => {
        store[id] = normalize(id, c);
      });
      gotPublic = true;
      emit();
    });

    const channelUnsubs: Record<string, () => void> = {};
    const ucRef = ref(db, `userChannels/${uid}`);
    const unsubUC = onValue(ucRef, (snap) => {
      const ids = Object.keys((snap.val() || {}) as Record<string, true>);
      for (const id of Object.keys(channelUnsubs)) {
        if (!ids.includes(id)) {
          channelUnsubs[id]();
          delete channelUnsubs[id];
          if (!store[id]?.public) delete store[id];
        }
      }
      ids.forEach((id) => {
        if (channelUnsubs[id]) return;
        channelUnsubs[id] = onValue(ref(db, `channels/${id}`), (s) => {
          const c = s.val();
          if (!c) {
            if (!store[id]?.public) delete store[id];
          } else {
            store[id] = normalize(id, c);
          }
          gotPrivate = true;
          emit();
        });
      });
      if (ids.length === 0) {
        gotPrivate = true;
        emit();
      }
    });

    return () => {
      unsubPublic();
      unsubUC();
      Object.values(channelUnsubs).forEach((fn) => fn());
    };
  }, [authReady, activeChannelId]);

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) || null,
    [channels, activeChannelId]
  );

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    const newusersKey = user?.id;
    if (!uid || !newusersKey) return;
    const updates: Record<string, any> = {};
    channels.forEach((c) => {
      const m = c.members || {};
      if (m[uid] && !m[newusersKey]) {
        updates[`channels/${c.id}/members/${newusersKey}`] = true;
      }
    });
    if (Object.keys(updates).length > 0) {
      update(ref(db), updates).catch(() => {});
    }
  }, [channels, user?.id]);

  useEffect(() => {
    if (!activeChannelId) {
      setMessages([]);
      return;
    }
    const r = ref(db, `channelMessages/${activeChannelId}`);
    const unsub = onValue(r, (snap) => {
      const v = (snap.val() || {}) as Record<
        string,
        {
          text: string;
          createdAt?: number;
          user?: { name?: string; email?: string; avatar?: string };
        }
      >;
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
    return () => unsub();
  }, [activeChannelId]);

  const createChannel = async (name: string, description?: string) => {
    setLoading(true);
    setError(null);
    try {
      const uid = await requireAuthUid();
      const clean = name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/#/g, "");
      if (!clean)
        throw new Error("Bitte einen gültigen Channel-Namen angeben.");
      const newusersSnap = await get(ref(db, "newusers"));
      const newusers = (newusersSnap.val() || {}) as Record<
        string,
        {
          newname?: string;
          newemail?: string;
          avatar?: string;
          authUid?: string;
        }
      >;
      const members: Record<string, true> = {};
      members[uid] = true;
      if (user?.id && user.id !== uid) members[user.id] = true;
      for (const [newusersKey, u] of Object.entries(newusers)) {
        if (u?.authUid) members[u.authUid] = true;
        members[newusersKey] = true;
      }
      const chRef = push(ref(db, "channels"));
      const channelId = chRef.key!;
      await set(chRef, {
        name: clean,
        description: (description || "").trim(),
        createdAt: Date.now(),
        createdByEmail: user?.email || "",
        members,
        public: false,
      });
      const updates: Record<string, any> = {};
      updates[`userChannels/${uid}/${channelId}`] = true;
      for (const u of Object.values(newusers)) {
        if ((u as any)?.authUid) {
          updates[`userChannels/${(u as any).authUid}/${channelId}`] = true;
        }
      }
      await update(ref(db), updates);
      setActiveChannelId(channelId || null);
    } catch (e: any) {
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
