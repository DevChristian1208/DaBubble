"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

/**
 * Wichtige Punkte für Hydration:
 * - Die Desktop-Sidebar ist immer im DOM (hidden/visible nur per CSS Breakpoints).
 * - Das mobile Overlay wird erst NACH dem Mount bedingt gerendert (mounted && sidebarOpen),
 *   damit SSR-HTML == erster Client-HTML bleibt.
 */
export default function ChatApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-screen bg-[#E8E9FF] flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen((s) => !s)} />

      {/* Hauptbereich: identische Struktur auf Server & Client */}
      <div className="flex flex-1 min-h-0 pt-4 md:pt-[30px] pb-5 items-stretch gap-3 md:gap-[20px]">
        {/* Desktop-Sidebar: immer im DOM, Anzeige rein über CSS-Breakpoint */}
        <aside className="hidden md:block w-[360px] max-w-[360px] min-w-[280px]">
          <div className="h-full">
            <Sidebar open onToggle={() => setSidebarOpen((s) => !s)} />
          </div>
        </aside>

        {/* Chat-Spalte */}
        <main className="flex-1 min-w-0 pr-3 md:pr-5">
          <div className="h-full flex">
            <ChatWindow />
          </div>
        </main>
      </div>

      {/* Mobile-Sidebar als Overlay: nur nach Mount bedingt rendern */}
      {mounted && sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-[86%] max-w-[360px] bg-white shadow-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar open onToggle={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
