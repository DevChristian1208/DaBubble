"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type User = {
  id: string; // RTDB-Key in /newusers
  name: string;
  email: string;
  avatar?: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const storedUser =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch (e) {
        console.error("Fehler beim Parsen des gespeicherten Benutzers:", e);
      }
    }
  }, []);

  const setUser = (val: User | null) => {
    if (typeof window !== "undefined") {
      if (val) localStorage.setItem("user", JSON.stringify(val));
      else localStorage.removeItem("user");
    }
    setUserState(val);
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
};
