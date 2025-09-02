// src/app/Newuser/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/lib/firebase";
import { signInAnonymously } from "firebase/auth";
import { ref, set, serverTimestamp } from "firebase/database";
import { deriveHash, randomToken } from "@/app/lib/crypto";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    if (!accept) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const rawPassword = password;

    if (!trimmedName || !trimmedEmail || !rawPassword) return;

    setLoading(true);
    try {
      // 1) Anonymous Auth versuchen (für striktere RTDB-Regeln nötig)
      try {
        await signInAnonymously(auth);
      } catch (err) {
        // Für den Testbetrieb (offene RTDB-Regeln) einfach weiter machen.
        // In Produktion: Anonymous Auth in Firebase Console aktivieren.
        console.warn(
          "Anonymous Auth nicht aktiviert – fahre für Tests ohne Login fort.",
          err
        );
      }

      // 2) Passwort clientseitig hashen (kein Klartext in DB/Netz/Storage)
      const { hashB64: passwordHash, saltB64: passwordSalt } = await deriveHash(
        rawPassword
      );

      // 3) Token erstellen & pending-Objekt in RTDB speichern
      const token = randomToken(24);
      const pendingRef = ref(db, `pendingRegs/${token}`);

      await set(pendingRef, {
        name: trimmedName,
        email: trimmedEmail,
        passwordHash,
        passwordSalt,
        createdAt: serverTimestamp(),
      });

      // 4) Weiter zur Avatar-Auswahl – Token in der URL, kein Local/SessionStorage nötig
      router.push(`/SelectAvatar?token=${encodeURIComponent(token)}`);
    } catch (err) {
      console.error(err);
      alert("Fehler beim Anlegen der Registrierung");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#E8E9FF] px-4 relative overflow-x-hidden">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image src="/logo.png" alt="Logo" width={30} height={30} />
        <span className="text-lg font-bold text-gray-800">DABubble</span>
      </div>

      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-6 text-sm text-gray-600">
        <Link
          href="/ImpressumundDatenschutz/LegalNotice"
          className="hover:underline"
        >
          Impressum
        </Link>
        <Link
          href="/ImpressumundDatenschutz/PrivacyPolicy"
          className="hover:underline"
        >
          Datenschutz
        </Link>
      </div>

      <div className="flex justify-center items-center min-h-screen">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white rounded-3xl shadow-md p-8 space-y-6 mt-12"
        >
          <h1 className="text-2xl font-bold text-center text-[#5D5FEF]">
            Konto erstellen
          </h1>
          <p className="text-center text-gray-600 text-sm">
            Mit deinem Namen und deiner E-Mail-Adresse hast du dein neues
            DABubble-Konto.
          </p>

          <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
            <Image src="/person_filled.png" alt="Name" width={24} height={24} />
            <input
              type="text"
              required
              placeholder="Name und Nachname"
              className="bg-transparent flex-1 outline-none md:text-sm text-gray-700 placeholder:opacity-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
            <Image src="/mail.png" alt="E-Mail" width={20} height={20} />
            <input
              type="email"
              required
              placeholder="beispiel@email.com"
              className="bg-transparent flex-1 outline-none md:text-sm text-gray-700 placeholder:opacity-100"
              value={email}
              onChange={(e) => setMail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
            <Image src="/lock.png" alt="Passwort" width={24} height={24} />
            <input
              type="password"
              required
              placeholder="Passwort"
              className="bg-transparent flex-1 outline-none md:text-sm text-gray-700 placeholder:opacity-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              id="accept"
              required
              checked={accept}
              onChange={(e) => setAccept(e.target.checked)}
              className="accent-[#5D5FEF]"
            />
            <label htmlFor="accept" className="leading-snug">
              Ich stimme der{" "}
              <Link
                href="/ImpressumundDatenschutz/PrivacyPolicy"
                className="text-[#5D5FEF] hover:underline"
              >
                Datenschutzerklärung
              </Link>{" "}
              zu.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className={`w-full py-3 rounded-full font-semibold text-white transition ${
              loading
                ? "bg-[#c5c8f5] cursor-not-allowed"
                : "bg-[#5D5FEF] hover:bg-[#4b4de0]"
            }`}
          >
            {loading ? "Wird gesendet..." : "Weiter"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Du hast schon ein Konto?{" "}
            <Link
              href="/Login"
              className="text-[#5D5FEF] hover:underline font-medium"
            >
              Hier einloggen
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
