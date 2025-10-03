"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/app/Context/UserContext";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/app/lib/firebase";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { FirebaseError } from "firebase/app";

type RawUser = {
  newname: string;
  newemail: string;
  avatar?: string;
  authUid?: string;
};

function humanizeAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    const map: Record<string, string> = {
      "auth/invalid-credential": "E-Mail oder Passwort ist falsch.",
      "auth/invalid-email": "Die E-Mail-Adresse ist ungültig.",
      "auth/user-disabled": "Dieses Konto ist deaktiviert.",
      "auth/user-not-found": "Es gibt kein Konto mit dieser E-Mail.",
      "auth/wrong-password": "E-Mail oder Passwort ist falsch.",
      "auth/too-many-requests":
        "Zu viele Versuche. Bitte kurz warten oder Passwort zurücksetzen.",
      "auth/network-request-failed":
        "Netzwerkfehler. Prüfe deine Internetverbindung.",
      "auth/configuration-not-found":
        "Firebase-Auth nicht richtig konfiguriert (API-Key/Domain/Provider).",
    };
    return map[err.code] || `Anmeldung fehlgeschlagen: ${err.message}`;
  }

  try {
    return `Anmeldung fehlgeschlagen: ${JSON.stringify(err)}`;
  } catch {
    return "Anmeldung fehlgeschlagen.";
  }
}

export default function Login() {
  const router = useRouter();
  const { setUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    console.log("[Login] using auth project:", {
      apiKey: auth.app.options.apiKey,
      authDomain: auth.app.options.authDomain,
      projectId: auth.app.options.projectId,
    });

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      let profile: {
        id: string;
        newname: string;
        newemail: string;
        avatar?: string;
      } | null = null;

      const usersRef = ref(db, "newusers");
      const byUid = query(usersRef, orderByChild("authUid"), equalTo(uid));
      const snapByUid = await get(byUid);

      if (snapByUid.exists()) {
        const obj = snapByUid.val() as Record<string, RawUser>;
        const [id, data] = Object.entries(obj)[0];
        profile = {
          id,
          newname: data.newname,
          newemail: data.newemail,
          avatar: data.avatar,
        };
      } else {
        const byEmail = query(
          usersRef,
          orderByChild("newemail"),
          equalTo(email)
        );
        const snapByEmail = await get(byEmail);
        if (snapByEmail.exists()) {
          const obj = snapByEmail.val() as Record<string, RawUser>;
          const [id, data] = Object.entries(obj)[0];
          profile = {
            id,
            newname: data.newname,
            newemail: data.newemail,
            avatar: data.avatar,
          };
        }
      }

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.newname,
          email: profile.newemail,
          avatar: profile.avatar || "/avatar1.png",
        });
      } else {
        setUser({
          id: uid,
          name: cred.user.email?.split("@")[0] || "Unbekannt",
          email: cred.user.email || email,
          avatar: "/avatar1.png",
        });
      }

      router.push("/Dashboard");
    } catch (err) {
      if (err instanceof FirebaseError) {
        console.error(
          "[Login] FirebaseError:",
          err.code,
          err.message,
          err.customData
        );
      } else {
        console.error("[Login] Unknown error:", err);
      }
      alert(humanizeAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const redirecttoAvatar = () => router.push("/SelectAvatar");

  return (
    <div className="min-h-screen bg-[#E8E9FF] px-4 pt-6 relative overflow-x-hidden">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image src="/logo.png" alt="Logo" width={30} height={30} />
        <span className="text-lg font-bold text-gray-800">DABubble</span>
      </div>

      <div className="absolute top-6 right-6 text-sm text-gray-600 flex flex-col items-end">
        <span>Neu bei DABubble?</span>
        <Link
          href="/Newuser"
          className="text-[#5D5FEF] font-medium hover:underline"
        >
          Konto erstellen
        </Link>
      </div>

      <div className="absolute bottom-11 w-full flex justify-center gap-6 text-sm text-gray-600 px-4">
        <Link href="/ImpressumundDatenschutz/LegalNotice">Impressum</Link>
        <Link href="/ImpressumundDatenschutz/PrivacyPolicy">Datenschutz</Link>
      </div>

      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-md p-8 space-y-6 mt-12">
          <h1 className="text-3xl font-bold text-center text-[#5D5FEF]">
            Anmeldung
          </h1>
          <p className="text-center text-gray-600 text-sm">
            Wir empfehlen dir, die E-Mail-Adresse zu nutzen, die du bei der
            Arbeit verwendest.
          </p>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
              <Image src="/mail.png" alt="Mail" width={17} height={17} />
              <input
                type="email"
                required
                placeholder="beispiel@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent flex-1 outline-none md:text-sm text-gray-500 placeholder:opacity-100"
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
              <Image src="/lock.png" alt="Passwort" width={20} height={20} />
              <input
                type="password"
                required
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent flex-1 outline-none md:text-sm text-gray-500 placeholder:opacity-100"
              />
            </div>

            <div className="text-right">
              <Link
                href="/ResetPass/EmailRes"
                className="flex justify-center text-sm text-[#5D5FEF] hover:underline"
              >
                Passwort vergessen?
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className="h-px bg-gray-300 w-full" />
              <span className="text-sm text-gray-500">ODER</span>
              <div className="h-px bg-gray-300 w-full" />
            </div>

            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-base font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D5FEF]/40 appearance-none cursor-pointer"
              onClick={() =>
                alert("Google-Login ist noch nicht implementiert.")
              }
            >
              <Image src="/Google.png" alt="Google" width={20} height={20} />
              <span>Anmelden mit Google</span>
            </button>

            <div className="flex justify-center gap-2">
              <button
                type="submit"
                className="cursor-pointer bg-[#5D5FEF] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#4b4de0]"
                disabled={loading}
              >
                {loading ? "Anmelden..." : "Anmelden"}
              </button>

              <button
                onClick={redirecttoAvatar}
                type="button"
                className="cursor-pointer border border-[#5D5FEF] text-[#5D5FEF] px-6 py-3 rounded-full font-semibold hover:bg-[#f5f5ff]"
              >
                Gäste-Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
