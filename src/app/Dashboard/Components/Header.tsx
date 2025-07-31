"use client";

import Image from "next/image";
import { useUser } from "@/app/Context/UserContext";

export default function Header() {
  const { user } = useUser();

  return (
    <header className="w-full h-[70px] px-10 bg-[#E8E9FF] flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-[160px]">
        <Image src="/logo.png" alt="Logo" width={36} height={36} />
        <span className="text-lg font-bold text-gray-800">DABubble</span>
      </div>

      <div className="flex-1 flex justify-center">
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
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 font-medium text-sm min-w-[160px] justify-end">
        {user?.name}
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
