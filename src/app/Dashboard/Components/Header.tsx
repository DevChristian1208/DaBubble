"use client";

import Image from "next/image";
import { useUser } from "@/app/Context/UserContext";

export default function Header({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const { user } = useUser();

  return (
    <header className="w-full h-[64px] md:h-[70px] px-3 md:px-10 bg-[#E8E9FF] flex items-center justify-between">
      {/* Links: Burger + Logo */}
      <div className="flex items-center gap-3 min-w-[120px]">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow hover:bg-gray-50 active:scale-[0.98]"
          aria-label="Menü öffnen"
        >
          {/* Burger-Icon (inline) */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
          <span className="text-base md:text-lg font-bold text-gray-800">
            DABubble
          </span>
        </div>
      </div>

      {/* Mitte: Suche (nur ab md sichtbar) */}
      <div className="hidden md:flex flex-1 justify-center">
        <div className="relative w-[480px]">
          <input
            type="text"
            placeholder="Devspace durchsuchen"
            className="w-full py-2 pl-4 pr-10 rounded-full text-sm bg-white shadow-sm outline-none"
          />
          <Image
            src="/icons (4).png"
            alt="search"
            width={16}
            height={16}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          />
        </div>
      </div>

      {/* Rechts: User */}
      <div className="flex items-center gap-2 font-medium text-sm min-w-[120px] justify-end">
        <span className="hidden sm:inline">{user?.name}</span>
        <Image
          src={user?.avatar || "/avatar1.png"}
          alt="avatar"
          width={32}
          height={32}
          className="rounded-full"
        />
      </div>
    </header>
  );
}
