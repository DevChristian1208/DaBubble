"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useChannel } from "@/app/Context/ChannelContext";
import MembersModal from "./MembersModal";
import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";
import { db } from "@/app/lib/firebase";
import { ref, get } from "firebase/database";

type Member = { id: string; name: string; email?: string; avatar?: string };

export default function ChatWindow() {
  const { activeChannel, messages, sendMessage } = useChannel();
  const [members, setMembers] = useState<Member[]>([]);
  const [membersOpen, setMembersOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!activeChannel?.members) {
        if (alive) setMembers([]);
        return;
      }
      try {
        const snap = await get(ref(db, "newusers"));
        const all = snap.val() || {};
        const arr: Member[] = Object.entries(all)
          .filter(([id]) => activeChannel.members && activeChannel.members[id])
          .map(([id, u]: any) => ({
            id,
            name: u?.newname ?? "Unbekannt",
            email: u?.newemail,
            avatar: u?.avatar || "/avatar1.png",
          }));
        if (alive) setMembers(arr);
      } catch (e) {
        console.error("Mitglieder konnten nicht geladen werden:", e);
        if (alive) setMembers([]);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [activeChannel?.id, activeChannel?.members]);

  const topAvatars = useMemo(() => members.slice(0, 4), [members]);
  const moreCount = Math.max(0, members.length - topAvatars.length);

  if (!activeChannel) {
    return (
      <div className="h-[97.5%] bg-white rounded-[20px] p-10 shadow-sm flex items-center justify-center text-center">
        <div>
          <Image
            src="/Logo (1).png"
            alt="DABubble Logo"
            width={120}
            height={120}
            className="mx-auto mb-6"
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Willkommen bei <span className="text-[#8B5CF6]">DABubble</span>!
          </h1>
          <p className="text-gray-500 mt-4 text-lg">
            Wähle links einen Channel aus oder erstelle einen neuen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-[97.5%] bg-white rounded-[20px] shadow-sm flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold"># {activeChannel.name}</span>
            {activeChannel.description ? (
              <span className="text-sm text-gray-500">
                – {activeChannel.description}
              </span>
            ) : null}
          </div>

          <button
            onClick={() => setMembersOpen(true)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition px-3 py-2 rounded-full"
            aria-label="Mitglieder anzeigen"
          >
            <div className="flex -space-x-2">
              {topAvatars.map((m) => (
                <Image
                  key={m.id}
                  src={m.avatar || "/avatar1.png"}
                  alt={m.name}
                  width={28}
                  height={28}
                  className="rounded-full border-2 border-white"
                />
              ))}
            </div>
            <span className="text-sm text-gray-700 cursor-pointer">
              {members.length}
              {moreCount > 0 ? ` (+${moreCount})` : ""} Mitglieder
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="mx-auto w-full max-w-3xl">
            <MessageList messages={messages} />
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-gray-200">
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

      <MembersModal
        isOpen={membersOpen}
        onClose={() => setMembersOpen(false)}
        members={members}
        channelName={activeChannel.name}
        onAddMembers={() => {
          alert("Mitglieder hinzufügen – noch nicht implementiert 🙂");
        }}
      />
    </>
  );
}
