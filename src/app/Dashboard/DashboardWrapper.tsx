"use client";

import { useEffect } from "react";
import { useUser } from "@/app/Context/UserContext";
import { auth, db } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  ref,
  get,
  query,
  orderByChild,
  equalTo,
  DataSnapshot,
} from "firebase/database";

type FirebaseUser = {
  newname: string;
  newemail: string;
  avatar?: string;
  authUid?: string; // <- Wichtig, wenn du es in SelectAvatar mitschreibst
};

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser } = useUser();

  useEffect(() => {
    // Wenn User schon gesetzt ist, nichts tun
    if (user?.id) return;

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return; // AuthBootstrap sorgt dafür, dass wir hier landen

      try {
        // 1) Bevorzugt: User via authUid finden (keine LocalStorage-Abhängigkeit)
        //    -> Stelle sicher, dass du beim Anlegen des Users (SelectAvatar)
        //       `authUid: auth.currentUser?.uid` mitspeicherst.
        const usersRef = ref(db, "newusers");
        const byUid = query(usersRef, orderByChild("authUid"), equalTo(u.uid));
        const snapByUid: DataSnapshot = await get(byUid);

        if (snapByUid.exists()) {
          const obj = snapByUid.val() as Record<string, FirebaseUser>;
          const [id, data] = Object.entries(obj)[0];
          setUser({
            id,
            name: data.newname,
            email: data.newemail,
            avatar: data.avatar || "/avatar1.png",
          });
          return;
        }

        // 2) Fallback (kompatibel zu deinem jetzigen Stand):
        //    Wenn noch kein authUid in der DB existiert, auf alte LocalStorage-Werte zurückgreifen.
        if (typeof window !== "undefined") {
          const lsEmail = localStorage.getItem("userEmail");
          const lsName = localStorage.getItem("userName");

          if (lsEmail && lsName) {
            // gesamte Liste holen und matchen (wie vorher)
            const allSnap = await get(usersRef);
            const all = (allSnap.val() || {}) as Record<string, FirebaseUser>;
            const found = Object.entries(all).find(
              ([, v]) => v?.newemail === lsEmail && v?.newname === lsName
            );

            if (found) {
              const [id, v] = found;
              setUser({
                id,
                name: v.newname,
                email: v.newemail,
                avatar: v.avatar || "/avatar1.png",
              });
              return;
            }
          }
        }
      } catch (err) {
        console.error("Fehler beim Laden des Users:", err);
      }
    });

    return () => unsub();
  }, [setUser, user?.id]);

  return <>{children}</>;
}
