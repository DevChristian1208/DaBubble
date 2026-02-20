"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "@/app/lib/firebase";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isGuest: boolean;
};

type UserContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      async (authUser: FirebaseUser | null) => {
        if (!authUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const newUserSnap = await get(ref(db, `newusers/${authUser.uid}`));

          if (newUserSnap.exists()) {
            const u = newUserSnap.val();

            const registeredUser: User = {
              id: authUser.uid,
              name: u.newname || "Unbekannt",
              email: u.newemail || authUser.email || "",
              avatar: u.avatar || "/avatar1.png",
              isGuest: false,
            };

            setUser(registeredUser);
            setLoading(false);
            return;
          }

          const guestSnap = await get(ref(db, `guestUsers/${authUser.uid}`));

          if (guestSnap.exists()) {
            const g = guestSnap.val();

            const guestUser: User = {
              id: g.id,
              name: g.newname || g.name || "Gast",
              email: g.newemail || "",
              avatar: g.avatar || "/avatar1.png",
              isGuest: true,
            };

            setUser(guestUser);
            setLoading(false);
            return;
          }

          const fallbackUser: User = {
            id: authUser.uid,
            name: authUser.email || "Nutzer",
            email: authUser.email || "",
            avatar: "/avatar1.png",
            isGuest: false,
          };

          setUser(fallbackUser);
          setLoading(false);
        } catch (err) {
          console.error("Fehler beim Laden des Nutzers:", err);
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => unsub();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
