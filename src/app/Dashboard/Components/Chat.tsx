"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

export default function ChatApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 1024px)");
    setSidebarOpen(mql.matches);
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <div className="h-screen bg-[#E8E9FF] flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen((s) => !s)} />

      <div className="flex flex-1 min-h-0 pt-4 md:pt-[30px] pb-5 items-stretch gap-3 md:gap-[20px]">
        <div className="hidden lg:block">
          <Sidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen((s) => !s)}
          />
        </div>

        <div className="flex-1 min-w-0 pr-3 md:pr-5">
          <div className="h-full flex">
            <ChatWindow />
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 bottom-0 w-[86%] max-w-[366px] transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar open={true} onToggle={() => setSidebarOpen(false)} />
        </div>
      </div>
    </div>
  );
}
