"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/Login");
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              placeholder="beispielname@email.com"
              className="w-full border border-gray-300 rounded-full py-3 pl-12 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F52FF]"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Image src="/mail (2).png" alt="mail" width={24} height={24} />
            </span>
          </div>

          <p className="text-center text-xs text-gray-500">
            Wir senden Ihnen eine E-Mail, über die Sie Ihr Passwort ändern
            können.
          </p>

          <button
            type="submit"
            className="mt-2 bg-[#4D4D4D] hover:bg-[#333] text-white text-sm py-2.5 px-4 rounded-full w-full cursor-pointer"
          >
            E-Mail senden
          </button>
        </form>
      </div>
    </div>
  );
}
