"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/Context/UserContext";

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // solange Context lädt -> nichts tun (kein Redirect-Race)
    if (loading) return;

    // kein User -> Login
    if (!user) {
      router.replace("/Login");
      return;
    }

    // Gast oder registriert -> darf rein
  }, [user, loading, router]);

  // Optional: kleines Loading-UI
  if (loading || !user) return null;

  return <>{children}</>;
}
