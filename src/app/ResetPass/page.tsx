"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/app/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Image from "next/image";
import { FirebaseError } from "firebase/app";

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    auth.languageCode = "de";
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email.trim()) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (e: unknown) {
      const fe = e as FirebaseError | Error;
      if ("code" in (fe as FirebaseError)) {
        const code = (fe as FirebaseError).code;
        setErr(
          code === "auth/user-not-found"
            ? "Es existiert kein Konto mit dieser E-Mail."
            : code === "auth/invalid-email"
            ? "Die E-Mail-Adresse ist ungültig."
            : "E-Mail konnte nicht gesendet werden."
        );
      } else {
        setErr("E-Mail konnte nicht gesendet werden.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E8E9FF] px-4 overflow-x-hidden">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image src="/logo.png" alt="Logo" width={30} height={30} />
        <span className="text-lg font-bold text-gray-800">DABubble</span>
      </div>

      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm relative">
        <div className="absolute left-6 top-8">
          <Link href="/Login">
            <Image
              className="cursor-pointer"
              src="/13. Go back.png"
              alt="goback"
              width={28}
              height={28}
            />
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-[#5F52FF] text-center mb-2">
          Passwort zurücksetzen
        </h1>
        <p className="text-center text-sm text-gray-600 mb-6">
          Bitte geben Sie Ihre E-Mail-Adresse ein.
        </p>

        {sent ? (
          <div className="space-y-6">
            <p className="text-center text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              Wenn ein Konto zu <span className="font-medium">{email}</span>{" "}
              existiert, wurde eine E-Mail zum Zurücksetzen gesendet.
            </p>
            <button
              onClick={() => router.push("/Login")}
              className="bg-[#4D4D4D] hover:bg-[#333] text-white text-sm py-2.5 px-4 rounded-full w-full cursor-pointer"
            >
              Zur Anmeldung
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                placeholder="beispielname@email.com"
                className="w-full border border-gray-300 rounded-full py-3 pl-12 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F52FF]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Image src="/mail (2).png" alt="mail" width={24} height={24} />
              </span>
            </div>

            {err && <p className="text-center text-xs text-red-600">{err}</p>}

            <p className="text-center text-xs text-gray-500">
              Wir senden Ihnen eine E-Mail, über die Sie Ihr Passwort ändern
              können.
            </p>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="mt-2 bg-[#4D4D4D] hover:bg-[#333] disabled:opacity-60 text-white text-sm py-2.5 px-4 rounded-full w-full cursor-pointer"
            >
              {loading ? "Sende..." : "E-Mail senden"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
