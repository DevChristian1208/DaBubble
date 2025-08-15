"use client";

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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.currentTarget === e.target && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-[18px] font-semibold">Mitglieder</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Schließen"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Liste */}
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="px-2">
            <div className="bg-white rounded-xl overflow-hidden divide-y divide-gray-100">
              {members.map((m) => {
                const isYou =
                  !!user &&
                  (user.email?.toLowerCase() === m.email?.toLowerCase() ||
                    user.name?.toLowerCase() === m.name?.toLowerCase());

                return (
                  <button
                    key={m.id}
                    onClick={() => onStartDM(m.id)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center gap-3"
                  >
                    <div className="relative shrink-0">
                      <Image
                        src={m.avatar || "/avatar1.png"}
                        alt={m.name}
                        width={44}
                        height={44}
                        className="rounded-full"
                      />
                      {/* Status (grün) */}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                    </div>

                    <div className="min-w-0">
                      <div className="font-medium leading-5 truncate">
                        {m.name}{" "}
                        {isYou && (
                          <span className="text-gray-500 font-normal">
                            (Du)
                          </span>
                        )}
                      </div>
                      {/* E-Mail dezent (falls vorhanden) – Figma zeigt meist nur Namen */}
                      {m.email && (
                        <div className="text-xs text-gray-500 truncate">
                          {m.email}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Mitglieder hinzufügen (Figma-Zeile) */}
              <div className="px-4 py-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                  onClick={onClose} // TODO: später Invite-Flow öffnen
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15 7a4 4 0 11-8 0 4 4 0 018 0z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M3 19a6 6 0 0112 0"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M19 8v6M16 11h6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  Mitglieder hinzufügen
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dezenter Footer mit Channel-Name (wie im Figma) */}
        <div className="px-5 py-3 text-xs text-gray-500">#{channelName}</div>
      </div>
    </div>
  );
}
