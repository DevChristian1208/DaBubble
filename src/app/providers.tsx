// src/app/providers.tsx
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { UserProvider } from "./Context/UserContext";
import { ChannelProvider } from "./Context/ChannelContext";
import { DirectProvider } from "./Context/DirectContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => {
      // egal ob eingeloggt oder nicht: UI darf rendern
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) return null; // optional: Loader

  return (
    <UserProvider>
      <ChannelProvider>
        <DirectProvider>{children}</DirectProvider>
      </ChannelProvider>
    </UserProvider>
  );
}
