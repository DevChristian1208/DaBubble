"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";
import Image from "next/image";

export default function ChatApp() {
  return (
    <div className="h-screen bg-[#E8E9FF] flex flex-col">
      <Header />

      <div className="flex flex-1  pt-[30px] gap-[20px]">
        <Sidebar />
        <div className="flex-1">
          <div className="h-[97.5%] bg-white rounded-[20px] p-10 shadow-sm text-center flex flex-col items-center justify-start mr-5">
            <Image
              src="/Logo (1).png"
              alt="DABubble Logo"
              width={120}
              height={120}
              className="mb-8"
            />

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Willkommen bei <span className="text-[#8B5CF6]">DABubble</span>!
            </h1>

            <p className="text-gray-500 mt-4 text-lg">
              Deine Features im Überblick
            </p>

            <ul className="mt-6 space-y-4 text-left text-gray-800 text-base max-w-md">
              <li className="flex items-center gap-2">
                <span className="text-[#8B5CF6]">✔</span> Direkt-Nachrichten
                schreiben
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#8B5CF6]">✔</span> Channels erstellen und
                beitreten
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#8B5CF6]">✔</span> Auf
                Channel-Nachrichten in Threads antworten
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
