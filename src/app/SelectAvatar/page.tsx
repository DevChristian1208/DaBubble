"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/app/lib/firebase";
import { ref, set } from "firebase/database";
import { useUser } from "../Context/UserContext";

export default function SelectAvatar() {
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const { user, setUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/Login");
      return;
    }
    if (user.isGuest) {
      setEmail("");
      setName("Gast");
    } else {
      setEmail(user.email || "");
      setName(user.name || "");
    }
  }, [user, router]);

  const avatars = [
    "/avatar1.png",
    "/avatar2.png",
    "/avatar3.png",
    "/avatar4.png",
    "/avatar5.png",
    "/avatar6.png",
  ];

  const isFormComplete = selectedAvatar !== null && name.trim() !== "";

  async function saveAndGo() {
    if (!user?.id || saving || !isFormComplete) return;

    const avatar = avatars[selectedAvatar!];
    const cleanName = name.trim();

    setSaving(true);

    try {
      const path = user.isGuest
        ? `guestUsers/${user.id}`
        : `newusers/${user.id}`;

      const payload = user.isGuest
        ? {
            id: user.id,
            newname: cleanName,
            avatar,
            newemail: "",
            isGuest: true,
            createdAt: Date.now(),
          }
        : {
            authUid: user.id,
            newname: cleanName,
            newemail: user.email,
            avatar,
          };

      await set(ref(db, path), payload);

      setUser({
        id: user.id,
        name: cleanName,
        email: email,
        avatar,
        isGuest: user.isGuest,
      });

      router.push("/Dashboard");
    } catch (e) {
      console.error("[SelectAvatar] Speichern fehlgeschlagen:", e);
      alert("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

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
            className="w-full px-3 py-3 border rounded-xl"
          />

          <div className="flex justify-center gap-3">
            {avatars.map((src, index) => (
              <button
                key={index}
                onClick={() => setSelectedAvatar(index)}
                className={`w-10 h-10 rounded-full border-2 ${
                  selectedAvatar === index
                    ? "border-[#5D5FEF]"
                    : "border-transparent"
                }`}
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
            onClick={saveAndGo}
            disabled={!isFormComplete || saving}
            className="mt-2 w-full py-3 rounded-full bg-[#5D5FEF] text-white font-semibold disabled:bg-[#c7c8f8]"
          >
            {saving ? "Speichern..." : "Weiter"}
          </button>
        </div>
      </div>
    </div>
  );
}
