"use client";

import Image from "next/image";
import { useUser } from "@/app/Context/UserContext";

type Member = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
};

export default function MembersModal({
  isOpen,
  onClose,
  members,
  channelName,
  onAddMembers,
}: {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  channelName: string;
  onAddMembers?: () => void;
}) {
  const { user } = useUser();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[560px] rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-200">
          <h3 className="text-[22px] font-semibold leading-none">Mitglieder</h3>
          <button
            onClick={onClose}
            className="text-xl font-bold text-gray-500 hover:text-gray-700 leading-none cursor-pointer"
            aria-label="Modal schließen"
          >
            ×
          </button>
        </div>

        <div className="px-2 py-3 max-h-[60vh] overflow-y-auto">
          <ul className="space-y-1">
            {members.map((m) => {
              const isYou =
                (!!user?.email && user.email === m.email) ||
                (!!user?.name && user.name === m.name);

              return (
                <li
                  key={m.id}
                  className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="relative">
                    <Image
                      src={m.avatar || "/avatar1.png"}
                      alt={m.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    {/* grüner Status-Dot */}
                    <span className="absolute bottom-0 right-0 w-[11px] h-[11px] rounded-full bg-green-500 ring-2 ring-white" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[16px] font-medium leading-5 truncate">
                      {m.name}{" "}
                      {isYou ? (
                        <span className="text-gray-500">(Du)</span>
                      ) : null}
                    </p>
                  </div>
                </li>
              );
            })}

            {members.length === 0 && (
              <li className="px-6 py-10 text-center text-gray-500">
                Keine Mitglieder gefunden.
              </li>
            )}

            {/* feine Trennlinie wie im Mockup */}
            <li className="px-4">
              <div className="h-px bg-gray-200 my-2" />
            </li>

            <li className="px-1">
              <button
                type="button"
                onClick={onAddMembers}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-[#5D5FEF] hover:bg-[#EEF0FF] transition"
              >
                {/* person-plus Icon (SVG) */}
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M15 14c-2.761 0-5 2.239-5 5h10c0-2.761-2.239-5-5-5Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 8v-2M5 6h-2M5 6h2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-medium cursor-pointer">
                  Mitglieder hinzufügen
                </span>
              </button>
            </li>
          </ul>
        </div>

        {/* dezente Fußzeile mit Channel-Name (klein) */}
        <div className="px-6 py-3 border-t border-gray-200">
          <span className="text-sm text-gray-500">#{channelName}</span>
        </div>
      </div>
    </div>
  );
}
