"use client";
import Image from "next/image";
import Link from "next/link";

export default function NewPassword() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E8E9FF] px-4 overflow-x-hidden">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image src="/logo.png" alt="Logo" width={30} height={30} />
        <span className="text-lg font-bold text-gray-800">DABubble</span>
      </div>

      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm relative">
        <Link href="/Login">
          <Image
            className="absolute left-6 top-8 cursor-pointer"
            src="/13. Go back.png"
            alt="goback"
            width={24}
            height={24}
          />
        </Link>

        <h1 className="text-2xl font-semibold text-[#5F52FF] text-center mb-6">
          Passwort zurücksetzen
        </h1>

        <form className="space-y-4">
          <div className="bg-gray-100 rounded-full px-4 py-3 flex items-center">
            <input
              type="password"
              required
              placeholder="Neues Passwort"
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <div className="bg-gray-100 rounded-full px-4 py-3 flex items-center">
            <input
              type="password"
              required
              placeholder="Neues Kennwort bestätigen"
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-[#4D4D4D] hover:bg-[#333] text-white text-sm py-2.5 px-4 rounded-full w-full cursor-pointer"
          >
            Passwort ändern
          </button>
        </form>
      </div>
    </div>
  );
}
