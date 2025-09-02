// src/app/SelectAvatar/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/app/lib/firebase";
import { ref, get, push, remove, serverTimestamp } from "firebase/database";
import { useUser } from "@/app/Context/UserContext";

type Pending = {
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt?: unknown;
};

export default function SelectAvatar() {
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [loading, setLoading] = useState(false);

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

  const params = useSearchParams();
  const token = params.get("token") || "";
  const router = useRouter();
  const { setUser } = useUser();

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) return;
      const snap = await get(ref(db, `pendingRegs/${token}`));
      const val = snap.val() as Pending | null;
      if (alive) setPending(val);
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  const isFormComplete = selectedAvatar !== null && !!pending;

  async function handleContinue() {
    if (!pending || selectedAvatar === null || loading) return;
    setLoading(true);
    try {
      // finalen User anlegen
      const userRef = ref(db, "newusers");
      const avatar = avatars[selectedAvatar];
      const toSave = {
        newname: pending.name,
        newemail: pending.email,
        passwordHash: pending.passwordHash,
        passwordSalt: pending.passwordSalt,
        avatar,
        createdAt: serverTimestamp(),
      };
      const pushed = await push(userRef, toSave);
      const userId = pushed.key!;

      // optional: pending löschen
      await remove(ref(db, `pendingRegs/${token}`));

      // UserContext befüllen (kein LocalStorage nötig)
      setUser({
        id: userId,
        name: pending.name,
        email: pending.email,
        avatar,
      });

      router.push("/Dashboard");
    } catch (e) {
      console.error(e);
      alert("Speichern des Avatars fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
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

          {!pending ? (
            <div className="rounded-lg bg-yellow-50 text-yellow-800 text-sm px-3 py-2 border border-yellow-200">
              Registrierung nicht gefunden oder abgelaufen.
            </div>
          ) : null}

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
            placeholder="Name"
            value={pending?.name ?? ""}
            readOnly
            className="w-full max-w-md px-3 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-50 text-base text-gray-900"
          />

          <p className="text-sm text-gray-500">Aus der Liste wählen</p>

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
            onClick={handleContinue}
            type="button"
            disabled={!isFormComplete || loading}
            className={`mt-2 w-full py-3 rounded-full text-white text-sm font-semibold transition ${
              !isFormComplete || loading
                ? "bg-[#c7c8f8] cursor-not-allowed"
                : "bg-[#5D5FEF] hover:bg-[#4b4de0]"
            }`}
          >
            {loading ? "Speichern..." : "Weiter"}
          </button>
        </div>
      </div>
    </div>
  );
}
