"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/app/Context/UserContext";

export default function Login() {
  const router = useRouter();
  const { setUser } = useUser();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://testprojekt-22acd-default-rtdb.europe-west1.firebasedatabase.app/newusers.json"
      );
      const data = await res.json();

      if (!data) {
        setLoading(false);
        return;
      }

      const userEntry = Object.entries(data).find(
        ([, value]: any) =>
          value?.newemail === email && value?.newpassword === password
      );

      if (!userEntry) {
        alert("Benutzer nicht gefunden oder Passwort falsch.");
        setLoading(false);
        return;
      }

      const [, rawUser] = userEntry;
      const userData = rawUser as {
        newname: string;
        newemail: string;
        avatar?: string;
      };

      setUser({
        name: userData.newname,
        email: userData.newemail,
        avatar: userData.avatar || "/avatar1.png",
      });

      localStorage.setItem("userEmail", userData.newemail);
      localStorage.setItem("userName", userData.newname);

      router.push("/Dashboard");
    } catch (err) {
      console.error("Fehler beim Login:", err);
      alert("Fehler beim Login. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  const redirecttoAvatar = () => {
    router.push("/SelectAvatar");
  };

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
              className="w-full inline-flex items-center justify-center gap-2
            rounded-full border border-gray-300 bg-white
            px-5 py-3 text-base font-medium text-gray-700
            transition hover:bg-gray-50 active:scale-[0.99]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D5FEF]/40
            appearance-none cursor-pointer"
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
