"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);

  const URL =
    "https://testprojekt-22acd-default-rtdb.europe-west1.firebasedatabase.app";

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData = {
      newname: name,
      newemail: email,
      newpassword: password,
      createdAt: new Date().toISOString(),
    };

    try {
      setLoading(true);
      const response = await fetch(`${URL}/newusers.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Registrieren");
      }

      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name);

      setName("");
      setMail("");
      setPassword("");
      setAccept(false);

      router.push("/SelectAvatar");
    } catch (error) {
      console.error("Registrierungsfehler:", error);
      alert("Fehler bei der Registrierung.");
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
        <a href="#" className="hover:underline">
          Impressum
        </a>
        <a href="#" className="hover:underline">
          Datenschutz
        </a>
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
              className="bg-transparent flex-1 outline-none text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
            <Image src="/mail.png" alt="E-Mail" width={20} height={20} />
            <input
              type="email"
              required
              placeholder="beispiel@email.com"
              className="bg-transparent flex-1 outline-none text-sm"
              value={email}
              onChange={(e) => setMail(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
            <Image src="/lock.png" alt="Passwort" width={24} height={24} />
            <input
              type="password"
              required
              placeholder="Passwort"
              className="bg-transparent flex-1 outline-none text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              id="accept"
              required
              checked={accept}
              onChange={(e) => setAccept(e.target.checked)}
              className="accent-[#5D5FEF]"
            />
            <label htmlFor="accept">
              Ich stimme der{" "}
              <a href="#" className="text-[#5D5FEF] hover:underline">
                Datenschutzerklärung
              </a>{" "}
              zu.
            </label>
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-full font-semibold text-white ${
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
