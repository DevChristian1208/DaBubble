// app/Dashboard/Components/Header.tsx
"use client";

import Image from "next/image";
import { useUser } from "@/app/Context/UserContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Header({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const { user } = useUser();
  const [dropDown, setDropDown] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    setDropDown(false);
    router.push("/Login");
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropDown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full h-[64px] md:h-[70px] px-3 md:px-10 bg-[#E8E9FF] flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-[120px]">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow hover:bg-gray-50 active:scale-[0.98] cursor-pointer"
          aria-label="Menü öffnen"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <Image src="/Logo.png" alt="Logo" width={32} height={32} />
          <span className="text-base md:text-lg font-bold text-gray-800">
            DABubble
          </span>
        </div>
      </div>

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
            style={{ height: "auto" }}
          />
        </div>
      </div>

      <div
        className="flex items-center gap-2 font-medium text-sm min-w-[120px] justify-end relative"
        ref={menuRef}
      >
        <span className="hidden sm:inline">{user?.name}</span>
        <Image
          src={user?.avatar || "/avatar1.png"}
          alt="avatar"
          width={32}
          height={32}
          className="rounded-full"
        />
        <Image
          src={"/keyboard_arrow_down.png"}
          alt="arrow"
          width={22}
          height={22}
          className="cursor-pointer"
          onClick={() => setDropDown((prev) => !prev)}
          style={{ height: "auto" }}
        />

        {dropDown && (
          <div className="absolute right-0 top-12 w-56 rounded-2xl border bg-white p-6 shadow-2xl flex flex-col gap-6">
            <button
              onClick={handleLogout}
              className="text-2xl font-medium text-left hover:opacity-80 cursor-pointer"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
