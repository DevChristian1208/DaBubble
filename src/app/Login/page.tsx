"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

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
        <a href="#" className="hover:underline">
          Impressum
        </a>
        <a href="#" className="hover:underline">
          Datenschutz
        </a>
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

          <form className="space-y-4">
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
              <Image src="/mail.png" alt="Mail" width={17} height={17} />
              <input
                type="email"
                placeholder="beispiel@email.com"
                className="bg-transparent flex-1 outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
              <Image src="/lock.png" alt="Passwort" width={20} height={20} />
              <input
                type="password"
                placeholder="Passwort"
                className="bg-transparent flex-1 outline-none text-sm"
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
          </form>

          <div className="flex items-center justify-center gap-2">
            <div className="h-px bg-gray-300 w-full" />
            <span className="text-sm text-gray-500">ODER</span>
            <div className="h-px bg-gray-300 w-full" />
          </div>

          <button className="cursor-pointer w-full border py-3 rounded-full flex items-center justify-center gap-2 hover:bg-gray-50">
            <Image src="/Google.png" alt="Google" width={20} height={20} />
            <span>Anmelden mit Google</span>
          </button>

          <div className="flex justify-center gap-2">
            <button
              type="submit"
              className="cursor-pointer bg-[#5D5FEF] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#4b4de0]"
            >
              Anmelden
            </button>

            <button
              onClick={redirecttoAvatar}
              type="button"
              className="cursor-pointer border border-[#5D5FEF] text-[#5D5FEF] px-6 py-3 rounded-full font-semibold hover:bg-[#f5f5ff]"
            >
              Gäste-Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
