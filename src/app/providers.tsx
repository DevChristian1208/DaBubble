"use client";

import { ReactNode } from "react";
import { UserProvider } from "@/app/Context/UserContext";
import { ChannelProvider } from "@/app/Context/ChannelContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <ChannelProvider>{children}</ChannelProvider>
    </UserProvider>
  );
}
