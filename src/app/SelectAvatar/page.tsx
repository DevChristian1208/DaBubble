// src/app/SelectAvatar/page.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/app/lib/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";
import { useUser } from "../Context/UserContext"; // wie gehabt

export default function SelectAvatar() {
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { setUser } = useUser();
  const router = useRouter();

  const avatars = useMemo(
    () => [
      "/avatar1.png",
      "/avatar2.png",
      "/avatar3.png",
      "/avatar4.png",
      "/avatar5.png",
      "/avatar6.png",
    ],
    []
  );

  const isFormComplete = selectedAvatar !== null && name.trim() !== "";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/Login");
        return;
      }
      setUid(u.uid);
      setEmail(u.email || localStorage.getItem("userEmail") || "");
      const display = u.displayName || localStorage.getItem("userName") || "";
      setName(display);
    });
    return () => unsub();
  }, [router]);

  const redirectToDashboard = async () => {
    if (!isFormComplete || !uid || saving) return;
    setSaving(true);

    const avatar = avatars[selectedAvatar!];

    try {
      // DisplayName konsistent halten
      if (
        auth.currentUser &&
        name.trim() &&
        auth.currentUser.displayName !== name.trim()
      ) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
      }

      // RTDB: /users/{uid}
      await set(ref(db, `users/${uid}`), {
        name: name.trim(),
        email,
        avatar,
        createdAt: new Date().toISOString(),
      });

      setUser({ id: uid, name: name.trim(), email, avatar });
      localStorage.setItem("userId", uid);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name.trim());
      localStorage.setItem("userAvatar", avatar);

      router.push("/Dashboard");
    } catch (err) {
      console.error(err);
      alert("Speichern des Avatars fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E9FF] px-4 pt-6 relative overflow-x-hidden">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image src="/logo.png" alt="Logo" width={30} height={30} />
        <span className="text-lg font-bold text-gray-800">DABubble</span>
      </div>

      <div className="absolute bottom-11 w-full flex justify-center gap-6 text-sm text-gray-600 px-4">
        <Link href="/ImpressumundDatenschutz/LegalNotice">Impressum</Link>
        <Link href="/ImpressumundDatenschutz/PrivacyPolicy">Datenschutz</Link>
      </div>

      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-md p-8 space-y-6 mt-12 text-center">
          <h1 className="text-2xl font-semibold text-[#5D5FEF]">
            Wähle deinen Avatar
          </h1>

          <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto flex items-center justify-center">
            <Image
              src={
                selectedAvatar !== null
                  ? avatars[selectedAvatar]
                  : "/81. Profile.png"
              }
              alt="Ausgewählter Avatar"
              width={80}
              height={80}
            />
          </div>

          <input
            type="text"
            placeholder="Gib deinen Namen ein"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="cursor-pointer w-full max-w-md px-3 py-3 border border-gray-300 rounded-xl shadow-sm
           bg-white text-base text-gray-900 placeholder-gray-500 placeholder:opacity-100
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
           transition appearance-none"
          />

          <p className="text-sm text-gray-500">Aus der Liste wählen</p>

          <div className="flex justify-center gap-3">
            {avatars.map((src, index) => (
              <button
                key={index}
                onClick={() => setSelectedAvatar(index)}
                className={`cursor-pointer w-10 h-10 rounded-full border-2 ${
                  selectedAvatar === index
                    ? "border-[#5D5FEF]"
                    : "border-transparent"
                }`}
                aria-pressed={selectedAvatar === index}
                aria-label={`Avatar ${index + 1} auswählen`}
              >
                <Image
                  src={src}
                  alt={`Avatar ${index + 1}`}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </button>
            ))}
          </div>

          <button
            onClick={redirectToDashboard}
            type="button"
            disabled={!isFormComplete || saving}
            className={`cursor-pointer mt-2 w-full py-3 rounded-full text-white text-sm font-semibold ${
              !isFormComplete || saving
                ? "bg-[#c7c8f8] cursor-not-allowed"
                : "bg-[#5D5FEF] hover:bg-[#4b4de0]"
            }`}
          >
            {saving ? "Speichern..." : "Weiter"}
          </button>
        </div>
      </div>
    </div>
  );
}
