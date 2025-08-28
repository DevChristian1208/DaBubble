"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
      onClick={(e) => e.currentTarget === e.target && onClose()}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-[101] bg-white w-full max-w-md sm:max-w-lg rounded-2xl sm:rounded-[20px] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg sm:text-xl font-semibold">Mitglieder</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            aria-label="Schließen"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-3 space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Image
                  src={m.avatar || "/avatar1.png"}
                  alt={m.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <div className="font-medium text-sm sm:text-base">
                    {m.name}
                  </div>
                  {m.email && (
                    <div className="text-[11px] sm:text-xs text-gray-500">
                      {m.email}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => onStartDM(m.id)}
                className="text-[#5D5FEF] text-sm font-medium hover:underline"
              >
                Nachricht
              </button>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t text-xs sm:text-sm text-gray-500">
          #{channelName}
          <div className="mt-3 flex justify-end">
            <button
              onClick={onClose}
              className="bg-[#5D5FEF] text-white px-5 py-2 rounded-full font-semibold hover:bg-[#4a4cdb]"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
