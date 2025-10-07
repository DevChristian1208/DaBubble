"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ref, get } from "firebase/database";
import { db } from "@/app/lib/firebase";
import { useChannel } from "@/app/Context/ChannelContext";
import { useDirect } from "@/app/Context/DirectContext";
import { useUser } from "@/app/Context/UserContext";
import MembersModal from "./MembersModal";
import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";
import type { Message as ChannelMessage } from "@/app/Context/ChannelContext";

type Member = { id: string; name: string; email?: string; avatar?: string };
type NewUserDb = {
  authUid?: string;
  newname?: string;
  newemail?: string;
  avatar?: string;
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
  const { user: me } = useUser();

  const [members, setMembers] = useState<Member[]>([]);
  const [membersOpen, setMembersOpen] = useState(false);

  // Mitglieder laden (channels/<id>/members + newusers)
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!activeChannel?.id) {
        if (alive) setMembers([]);
        return;
      }

      try {
        const memSnap = await get(
          ref(db, `channels/${activeChannel.id}/members`)
        );
        const mem = (memSnap.val() as Record<string, true> | null) || {};
        const uids = Object.keys(mem);
        if (uids.length === 0) {
          if (alive) setMembers([]);
          return;
        }

        const newSnap = await get(ref(db, "newusers"));
        const newVal =
          (newSnap.val() as Record<string, NewUserDb> | null) || {};

        const arr: Member[] = [];

        for (const uid of uids) {
          // Sofort: eigener Datensatz
          if (me?.id === uid) {
            arr.push({
              id: uid,
              name: me.name,
              email: me.email,
              avatar: me.avatar || "/avatar1.png",
            });
            continue;
          }

          // authUid-Match
          const viaAuth = Object.values(newVal).find((v) => v?.authUid === uid);
          if (viaAuth) {
            arr.push({
              id: uid,
              name: viaAuth.newname || "Unbekannt",
              email: viaAuth.newemail || "",
              avatar: viaAuth.avatar || "/avatar1.png",
            });
            continue;
          }

          // Key==UID (älteres Schema)
          const byKey = newVal[uid];
          if (byKey) {
            arr.push({
              id: uid,
              name: byKey.newname || "Unbekannt",
              email: byKey.newemail || "",
              avatar: byKey.avatar || "/avatar1.png",
            });
            continue;
          }

          arr.push({
            id: uid,
            name: "Unbekannt",
            email: "",
            avatar: "/avatar1.png",
          });
        }

        arr.sort((a, b) => a.name.localeCompare(b.name));
        if (alive) setMembers(arr);
      } catch (e) {
        console.error("[ChatWindow] Mitglieder laden fehlgeschlagen:", e);
        if (alive) setMembers([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeChannel?.id, me?.id, me?.name, me?.email, me?.avatar]);

  const topAvatars = useMemo(() => members.slice(0, 4), [members]);
  const moreCount = Math.max(0, members.length - topAvatars.length);

  // dmMessages ist bereits stark typisiert -> saubere Transformation ohne any
  const dmMessagesNormalized: ChannelMessage[] = useMemo(() => {
    return dmMessages.map(
      (m): ChannelMessage => ({
        id: m.id,
        text: m.text,
        createdAt: m.createdAt,
        user: { ...m.user },
      })
    );
  }, [dmMessages]);

  if (activeDMUserId && activeDMUser) {
    return (
      <div className="flex-1 min-h-0 h-full bg-white rounded-[20px] shadow-sm flex flex-col overflow-hidden">
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

        <div className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 md:px-6 py-3 md:py-4">
          <div className="mx-auto w-full max-w-3xl">
            <MessageList messages={dmMessagesNormalized} />
          </div>
        </div>

        <div className="px-2 sm:px-4 md:px-6 pb-4 sm:pb-5 pt-2 border-t border-gray-200">
          <div className="mx-auto w-full max-w-3xl">
            <MessageComposer
              placeholder={`Nachricht an ${activeDMUser.name}`}
              onSend={async (text) => await sendDirectMessage(text)}
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeChannel) {
    return (
      <>
        <div className="flex-1 min-h-0 h-full bg-white rounded-[20px] shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-lg sm:text-xl md:text-2xl font-extrabold leading-tight">
                # {activeChannel.name}
              </span>
              {activeChannel.description ? (
                <span className="hidden xs:inline text-[11px] sm:text-xs md:text-sm text-gray-500">
                  – {activeChannel.description}
                </span>
              ) : null}
            </div>

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
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 md:px-6 py-3 md:py-4">
            <div className="mx-auto w-full max-w-3xl">
              <MessageList messages={channelMessages} />
            </div>
          </div>

          <div className="px-2 sm:px-4 md:px-6 pb-4 sm:pb-5 pt-2 border-t border-gray-200">
            <div className="mx-auto w-full max-w-3xl">
              <MessageComposer
                placeholder={`Nachricht an #${activeChannel.name}`}
                onSend={async (text) => await sendMessage(text)}
              />
            </div>
          </div>
        </div>

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
