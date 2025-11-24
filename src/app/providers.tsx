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
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) return null;

  return (
    <UserProvider>
      <ChannelProvider>
        <DirectProvider>{children}</DirectProvider>
      </ChannelProvider>
    </UserProvider>
  );
}
