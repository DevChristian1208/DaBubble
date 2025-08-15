"use client";

import { UserProvider } from "./Context/UserContext";
import { ChannelProvider } from "./Context/ChannelContext";
import { DirectProvider } from "./Context/DirectContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ChannelProvider>
        <DirectProvider>{children}</DirectProvider>
      </ChannelProvider>
    </UserProvider>
  );
}
