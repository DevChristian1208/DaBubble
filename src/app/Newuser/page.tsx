"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Eye, EyeOff } from "lucide-react";
import { ref, set, get, query, orderByChild, equalTo } from "firebase/database";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function ensureNewusersEntry(
    uid: string,
    displayName?: string | null,
    mail?: string | null
  ) {
    const byUid = query(
      ref(db, "newusers"),
      orderByChild("authUid"),
      equalTo(uid)
    );
    const snap = await get(byUid);
    if (snap.exists()) return;

    await set(ref(db, `newusers/${uid}`), {
      newname: (displayName || mail?.split("@")[0] || "User").trim(),
      newemail: mail || "",
      avatar: "/avatar1.png",
      authUid: uid,
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accept || loading) return;
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      await ensureNewusersEntry(cred.user.uid, name, cred.user.email || email);

      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name);

      setName("");
      setMail("");
      setPassword("");
      setAccept(false);

      router.push("/SelectAvatar");
    } catch (err: unknown) {
      const code =
        err instanceof FirebaseError
          ? err.code
          : typeof err === "object" &&
            err !== null &&
            "code" in err &&
            typeof (err as { code?: unknown }).code === "string"
          ? (err as { code: string }).code
          : "unknown";

      if (code === "auth/email-already-in-use") {
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          await ensureNewusersEntry(
            cred.user.uid,
            cred.user.displayName,
            cred.user.email
          );

          localStorage.setItem("userEmail", cred.user.email || email);
          localStorage.setItem(
            "userName",
            cred.user.displayName ||
              name ||
              (cred.user.email?.split("@")[0] ?? "")
          );

          router.push("/SelectAvatar");
          return;
        } catch (signInErr) {
          const msg =
            signInErr instanceof Error ? signInErr.message : String(signInErr);
          console.error("Login nach email-already-in-use fehlgeschlagen:", msg);
          alert(
            "E-Mail ist bereits registriert. Bitte mit dem Passwort einloggen."
          );
        } finally {
          setLoading(false);
        }
        return;
      }

      const msg = err instanceof Error ? err.message : String(err);
      console.error("Registrierung fehlgeschlagen:", code, msg, err);

      const friendly =
        code === "auth/operation-not-allowed"
          ? "E-Mail/Passwort-Login ist im Firebase-Backend deaktiviert."
          : code === "auth/weak-password"
          ? "Passwort zu schwach (Firebase-Policy)."
          : code === "auth/invalid-email"
          ? "E-Mail ungültig."
          : code === "auth/unauthorized-domain"
          ? "Deine Domain ist in Firebase Authentication nicht freigegeben."
          : code.startsWith("auth/")
          ? `Firebase-Auth-Fehler: ${code}`
          : "Unbekannter Fehler. Details in der Konsole.";

      alert(friendly);
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E9FF] px-4 pt-6 relative overflow-x-hidden">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image src="/logo.png" alt="Logo" width={30} height={30} />
        <span className="text-lg font-bold text-gray-800">DABubble</span>
      </div>

      <div className="absolute bottom-4 w-full flex justify-center gap-6 text-sm text-gray-600 px-4">
        <Link href="/ImpressumundDatenschutz/LegalNotice">Impressum</Link>
        <Link href="/ImpressumundDatenschutz/PrivacyPolicy">Datenschutz</Link>
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
              className="bg-transparent flex-1 outline-none md:text-sm text-gray-500 placeholder:opacity-100"
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
              className="bg-transparent flex-1 outline-none md:text-sm text-gray-500 placeholder:opacity-100"
              value={email}
              onChange={(e) => setMail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full relative">
            <Image src="/lock.png" alt="Passwort" width={24} height={24} />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Passwort"
              className="bg-transparent flex-1 outline-none md:text-sm text-gray-500 placeholder:opacity-100 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
            />

            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              onMouseDown={(e) => e.preventDefault()}
              aria-label={
                showPassword ? "Passwort verbergen" : "Passwort anzeigen"
              }
              aria-pressed={showPassword}
              title={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
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
            disabled={loading || !accept}
            className={`w-full py-3 rounded-full font-semibold text-white ${
              loading || !accept
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
