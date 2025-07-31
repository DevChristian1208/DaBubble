"use client";

import { UserProvider } from "./Context/UserContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserProvider>{children}</UserProvider>;
}
