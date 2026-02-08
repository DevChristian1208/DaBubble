"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/app/Context/UserContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/app/lib/firebase";
import { ref, get, set, query, orderByChild, equalTo } from "firebase/database";
import { FirebaseError } from "firebase/app";
import { Eye, EyeOff } from "lucide-react";

type RawUser = {
  newname?: string;
  newemail?: string;
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
        "Firebase-Auth nicht richtig konfiguriert.",
    };
    return map[err.code] || `Anmeldung fehlgeschlagen: ${err.message}`;
  }
  return "Anmeldung fehlgeschlagen.";
}

export default function Login() {
  const router = useRouter();
  const { setUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswort, setShowPasswort] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      const usersRef = ref(db, "newusers");
      const byUid = query(usersRef, orderByChild("authUid"), equalTo(uid));
      const snapByUid = await get(byUid);

      let data: RawUser | null = null;

      if (snapByUid.exists()) {
        const obj = snapByUid.val() as Record<string, RawUser>;
        data = Object.values(obj)[0];
      } else {
        const byEmail = query(
          usersRef,
          orderByChild("newemail"),
          equalTo(email)
        );
        const snapByEmail = await get(byEmail);
        if (snapByEmail.exists()) {
          const obj = snapByEmail.val() as Record<string, RawUser>;
          data = Object.values(obj)[0];
        }
      }

      const finalName =
        data?.newname || cred.user.displayName || email.split("@")[0];
      const finalEmail = data?.newemail || cred.user.email || email;
      const finalAvatar = data?.avatar || "/avatar1.png";

      setUser({
        id: uid,
        name: finalName,
        email: finalEmail,
        avatar: finalAvatar,
        isGuest: false,
      });

      const nuRef = ref(db, `newusers/${uid}`);
      const nuSnap = await get(nuRef);

      if (!nuSnap.exists()) {
        await set(nuRef, {
          authUid: uid,
          newname: finalName,
          newemail: finalEmail,
          avatar: finalAvatar,
          isGuest: false,
        });
      }

      router.push("/Dashboard");
    } catch (err) {
      alert(humanizeAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestLogin() {
    const guestId = "guest_" + crypto.randomUUID();

    setUser({
      id: guestId,
      name: "Gast",
      email: "",
      avatar: "/avatar1.png",
      isGuest: true,
    });

    localStorage.setItem("guestId", guestId);

    router.push("/SelectAvatar");
  }

  return (
    <div className="min-h-screen bg-[#E8E9FF] px-4 pt-6 relative overflow-x-hidden">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image src="/Logo.png" alt="Logo" width={30} height={30} />
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
                autoComplete="email"
                className="bg-transparent flex-1 outline-none md:text-sm text-gray-500 placeholder:opacity-100"
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full relative">
              <Image src="/lock.png" alt="Passwort" width={20} height={20} />
              <input
                type={showPasswort ? "test" : "password"}
                required
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="bg-transparent flex-1 outline-none md:text-sm text-gray-500 placeholder:opacity-100 pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPasswort(!showPasswort)}
                onMouseDown={(e) => e.preventDefault()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                {showPasswort ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right">
              <Link
                href="/ResetPass"
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

            <div className="flex justify-center gap-2">
              <button
                type="submit"
                className="cursor-pointer bg-[#5D5FEF] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#4b4de0]"
                disabled={loading}
              >
                {loading ? "Anmelden..." : "Anmelden"}
              </button>
              <button
                type="button"
                onClick={handleGuestLogin}
                className="cursor-pointer text-[#5D5FEF] border border-[#5D5FEF] px-6 py-3 rounded-full font-semibold hover:bg-[#5D5FEF] hover:text-white"
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
