// app/Dashboard/Components/MembersModal.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useUser } from "@/app/Context/UserContext";

type Member = { id: string; name: string; email?: string; avatar?: string };

export default function MembersModal({
  isOpen,
  onClose,
  members,
  channelName,
  onStartDM,
}: {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  channelName: string;
  onStartDM: (userId: string) => void;
}) {
  const { user } = useUser();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!isOpen) return [];
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const name = m.name?.toLowerCase() ?? "";
      const mail = m.email?.toLowerCase() ?? "";
      return name.includes(q) || mail.includes(q);
    });
  }, [isOpen, members, query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-3 sm:p-4"
      onClick={(e) => e.currentTarget === e.target && onClose()}
      aria-modal="true"
      role="dialog"
      aria-label="Mitgliederliste"
    >
      <div className="bg-white w-full max-w-md sm:max-w-lg rounded-2xl sm:rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold truncate">
              Mitglieder
            </h3>
            <p className="text-xs text-gray-500 truncate">#{channelName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
            aria-label="Schließen"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-5 pt-3 pb-2">
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm9 17-4.35-4.35"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mitglieder suchen …"
              className="w-full pl-10 pr-3 py-2 rounded-full border border-gray-300 outline-none text-sm focus:ring-2 focus:ring-[#5D5FEF]/30"
              autoFocus
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {filtered.length} Ergebnis{filtered.length === 1 ? "" : "se"}
          </div>
        </div>

        <div className="max-h-[60vh] sm:max-h-[65vh] overflow-y-auto px-3 sm:px-5 py-3 space-y-2">
          {filtered.map((m) => {
            const isSelf = user?.email && m.email && user.email === m.email;

            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-2 sm:gap-3 px-2 py-2 rounded-xl hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Image
                    src={m.avatar || "/avatar1.png"}
                    alt={m.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {m.name}{" "}
                      {isSelf && (
                        <span className="text-xs text-gray-400">(Du)</span>
                      )}
                    </div>
                    {m.email && (
                      <div className="text-xs text-gray-500 truncate">
                        {m.email}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!isSelf) onStartDM(m.id);
                  }}
                  disabled={Boolean(isSelf)}
                  aria-disabled={isSelf ? true : false}
                  className={`shrink-0 inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    isSelf
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "text-white bg-[#5D5FEF] hover:bg-[#4a4cdb]"
                  }`}
                >
                  Nachricht
                </button>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-6">
              Keine Ergebnisse für „{query}“.
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded-full font-semibold transition"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
