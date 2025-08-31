"use client";

import { useEffect } from "react";
import { useUser } from "@/app/Context/UserContext";

type FirebaseUser = {
  newname: string;
  newemail: string;
  newpassword?: string;
  avatar?: string;
};

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser } = useUser();

  useEffect(() => {
    async function fetchUserData() {
      const email = localStorage.getItem("userEmail");
      const name = localStorage.getItem("userName");
      if (!email || !name) return;

      try {
        const response = await fetch(
          "https://testprojekt-22acd-default-rtdb.europe-west1.firebasedatabase.app/newusers.json"
        );

        const data = (await response.json()) as Record<
          string,
          FirebaseUser
        > | null;
        if (!data) return;

        const found = Object.entries(data).find(
          ([, value]) => value?.newemail === email && value?.newname === name
        );
        if (!found) return;

        const [id, userData] = found;

        setUser({
          id,
          name: userData.newname,
          email: userData.newemail,
          avatar: userData.avatar || "/avatar1.png",
        });
      } catch (error) {
        console.error("Fehler beim Laden der Benutzerdaten:", error);
      }
    }

    fetchUserData();
  }, [setUser]);

  return <>{children}</>;
}
