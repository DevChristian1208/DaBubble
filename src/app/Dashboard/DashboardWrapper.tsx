"use client";

import { useEffect, ReactNode } from "react";
import { useUser } from "@/app/Context/UserContext";
import { db } from "@/app/lib/firebase";
import { ref, get } from "firebase/database";

type FirebaseUser = {
  newname: string;
  newemail: string;
  newpassword?: string;
  avatar?: string;
  createdAt?: string;
};

export default function DashboardWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const { setUser } = useUser();

  useEffect(() => {
    async function fetchUserData() {
      const email = localStorage.getItem("userEmail");
      const name = localStorage.getItem("userName");
      if (!email || !name) return;

      try {
        const snap = await get(ref(db, "newusers"));
        const data = (snap.val() ?? {}) as Record<string, FirebaseUser>;

        const userData = Object.values(data).find(
          (u) => u?.newemail === email && u?.newname === name
        );

        if (userData) {
          setUser({
            name: userData.newname,
            email: userData.newemail,
            avatar: userData.avatar || "/avatar1.png",
          });
        }
      } catch (error) {
        console.error("Fehler beim Laden der Benutzerdaten:", error);
      }
    }

    fetchUserData();
  }, [setUser]);

  return <>{children}</>;
}
