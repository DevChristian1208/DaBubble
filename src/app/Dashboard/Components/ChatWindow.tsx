"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ref, get } from "firebase/database";
import { db } from "@/app/lib/firebase";
import {
  useChannel,
  type Message as ChannelMessage,
} from "@/app/Context/ChannelContext";
import { useDirect } from "@/app/Context/DirectContext";
import MembersModal from "./MembersModal";
import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";

type Member = { id: string; name: string; email?: string; avatar?: string };
type NewUser = {
  newname: string;
  newemail: string;
  newpassword?: string;
  avatar?: string;
  createdAt?: string;
};

export default function ChatWindow() {
  const {
    activeChannel,
    messages: channelMessages,
    sendMessage,
  } = useChannel();

  const {
    activeDMUser,
    activeDMUserId,
    dmMessages,
    sendDirectMessage,
    startDMWith,
  } = useDirect();

  const [members, setMembers] = useState<Member[]>([]);
  const [membersOpen, setMembersOpen] = useState(false);

  /** Mitglieder eines Channels laden */
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    if (!activeChannel?.members) {
      setMembers([]);
      return () => {
        aliveRef.current = false;
      };
    }

    (async () => {
      try {
        const snap = await get(ref(db, "newusers"));
        const all = (snap.val() ?? {}) as Record<string, NewUser>;
        const arr: Member[] = Object.entries(all)
          .filter(
            ([id]) => !!activeChannel.members && !!activeChannel.members[id]
          )
          .map(([id, u]) => ({
            id,
            name: u?.newname ?? "Unbekannt",
            email: u?.newemail,
            avatar: u?.avatar || "/avatar1.png",
          }));
        if (aliveRef.current) setMembers(arr);
      } catch (e) {
        console.error(e);
        if (aliveRef.current) setMembers([]);
      }
    })();

    return () => {
      aliveRef.current = false;
    };
  }, [activeChannel?.id, activeChannel?.members]);

  const topAvatars = useMemo(() => members.slice(0, 4), [members]);
  const moreCount = Math.max(0, members.length - topAvatars.length);

  /** DM-Nachrichten ins ChannelMessage-Format mappen (user statt from) */
  const dmMessagesNormalized: ChannelMessage[] = useMemo(
    () =>
      dmMessages.map((m) => ({
        id: m.id,
        text: m.text,
        createdAt: m.createdAt,
        user: {
          name: m.from.name,
          email: m.from.email,
          avatar: m.from.avatar,
        },
      })),
    [dmMessages]
  );

  // ========= DIRECT MESSAGE =========
  if (activeDMUserId && activeDMUser) {
    return (
      <div className="flex-1 min-h-0 h-full bg-white rounded-[20px] shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Image
              src={activeDMUser.avatar || "/avatar1.png"}
              alt={activeDMUser.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <div className="text-base sm:text-lg md:text-xl font-bold leading-tight">
                {activeDMUser.name}
              </div>
              {activeDMUser.email && (
                <div className="text-[11px] sm:text-xs text-gray-500">
                  {activeDMUser.email}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nachrichten (scrollbar) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 md:px-6 py-3 md:py-4">
          <div className="mx-auto w-full max-w-3xl">
            <MessageList messages={dmMessagesNormalized} />
          </div>
        </div>

        {/* Composer */}
        <div className="px-2 sm:px-4 md:px-6 pb-4 sm:pb-5 pt-2 border-t border-gray-200">
          <div className="mx-auto w-full max-w-3xl">
            <MessageComposer
              placeholder={`Nachricht an ${activeDMUser.name}`}
              onSend={async (text) => {
                await sendDirectMessage(text);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ========= CHANNEL =========
  if (activeChannel) {
    return (
      <>
        <div className="flex-1 min-h-0 h-full bg-white rounded-[20px] shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-lg sm:text-xl md:text-2xl font-extrabold leading-tight">
                # {activeChannel.name}
              </span>
              {activeChannel.description ? (
                <span className="hidden sm:inline text-[11px] sm:text-xs md:text-sm text-gray-500">
                  – {activeChannel.description}
                </span>
              ) : null}
            </div>

            {/* Mitglieder-Pills (Desktop) */}
            <button
              onClick={() => setMembersOpen(true)}
              className="hidden md:flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition px-3 py-2 rounded-full"
              aria-label="Mitglieder anzeigen"
            >
              <div className="flex -space-x-2">
                {topAvatars.map((m) => (
                  <Image
                    key={m.id}
                    src={m.avatar || "/avatar1.png"}
                    alt={m.name}
                    width={24}
                    height={24}
                    className="rounded-full border-2 border-white"
                  />
                ))}
              </div>
              <span className="text-xs md:text-sm text-gray-700">
                {members.length}
                {moreCount > 0 ? ` (+${moreCount})` : ""} Mitglieder
              </span>
            </button>

            {/* Mobile: Icon + Anzahl */}
            <button
              onClick={() => setMembersOpen(true)}
              className="md:hidden inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 transition px-3 py-2 rounded-full"
              aria-label="Mitglieder anzeigen (mobil)"
              title="Mitglieder"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="8" r="3" stroke="#374151" strokeWidth="2" />
                <path
                  d="M4 18c0-2.2 2.4-4 5-4s5 1.8 5 4"
                  stroke="#374151"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="17"
                  cy="10"
                  r="2"
                  stroke="#374151"
                  strokeWidth="2"
                />
                <path
                  d="M15 18c0-1.6 1.6-3 3.5-3"
                  stroke="#374151"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-xs text-gray-700">{members.length}</span>
            </button>
          </div>

          {/* Nachrichten (scrollbar) */}
          <div className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 md:px-6 py-3 md:py-4">
            <div className="mx-auto w-full max-w-3xl">
              <MessageList messages={channelMessages} />
            </div>
          </div>

          {/* Composer */}
          <div className="px-2 sm:px-4 md:px-6 pb-4 sm:pb-5 pt-2 border-t border-gray-200">
            <div className="mx-auto w-full max-w-3xl">
              <MessageComposer
                placeholder={`Nachricht an #${activeChannel.name}`}
                onSend={async (text) => {
                  await sendMessage(text);
                }}
              />
            </div>
          </div>
        </div>

        {/* Mitglieder-Modal */}
        <MembersModal
          isOpen={membersOpen}
          onClose={() => setMembersOpen(false)}
          members={members}
          channelName={activeChannel.name}
          onStartDM={(userId) => {
            startDMWith(userId);
            setMembersOpen(false);
          }}
        />
      </>
    );
  }

  // ========= Platzhalter =========
  return (
    <div className="flex-1 h-full bg-white rounded-[20px] p-8 sm:p-10 shadow-sm flex items-center justify-center text-center overflow-hidden">
      <div>
        <Image
          src="/Logo (1).png"
          alt="DABubble Logo"
          width={90}
          height={90}
          className="mx-auto mb-5 sm:mb-6"
        />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
          Willkommen bei <span className="text-[#8B5CF6]">DABubble</span>!
        </h1>
        <p className="text-gray-500 mt-2 sm:mt-3 text-sm sm:text-base">
          Wähle links einen Channel oder starte einen Direktchat.
        </p>
      </div>
    </div>
  );
}
