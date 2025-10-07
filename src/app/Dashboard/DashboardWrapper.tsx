"use client";

import { useEffect } from "react";
import { useUser } from "@/app/Context/UserContext";
import { auth, db } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser } = useUser();

  useEffect(() => {
    if (user?.id) return;

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;

      try {
        // 1) newusers/<uid> direkt (neuer Pfad)
        const byKey = await get(ref(db, `newusers/${u.uid}`));
        if (byKey.exists()) {
          const d = byKey.val() as {
            newname?: string;
            newemail?: string;
            avatar?: string;
          };
          setUser({
            id: u.uid,
            name: d.newname || u.displayName || "Unbekannt",
            email: d.newemail || u.email || "",
            avatar: d.avatar || "/avatar1.png",
          });
          return;
        }

        // 2) Fallback: newusers mit authUid == uid (ältere Anlegung)
        const usersRef = ref(db, "newusers");
        const byUid = query(usersRef, orderByChild("authUid"), equalTo(u.uid));
        const snapByUid = await get(byUid);
        if (snapByUid.exists()) {
          const obj = snapByUid.val() as Record<
            string,
            { newname?: string; newemail?: string; avatar?: string }
          >;
          const data = Object.values(obj)[0];
          setUser({
            id: u.uid,
            name: data.newname || u.displayName || "Unbekannt",
            email: data.newemail || u.email || "",
            avatar: data.avatar || "/avatar1.png",
          });
          return;
        }

        // 3) letzter Fallback: users/<uid>
        const uSnap = await get(ref(db, `users/${u.uid}`));
        if (uSnap.exists()) {
          const d = uSnap.val() as {
            name?: string;
            email?: string;
            avatar?: string;
          };
          setUser({
            id: u.uid,
            name: d.name || u.displayName || "Unbekannt",
            email: d.email || u.email || "",
            avatar: d.avatar || "/avatar1.png",
          });
        } else {
          setUser({
            id: u.uid,
            name: u.displayName || "Unbekannt",
            email: u.email || "",
            avatar: "/avatar1.png",
          });
        }
      } catch (err) {
        console.error("[DashboardWrapper] Fehler beim Laden des Users:", err);
      }
    });

    return () => unsub();
  }, [setUser, user?.id]);

  return <>{children}</>;
}
