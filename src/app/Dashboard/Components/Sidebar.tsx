"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { useUser } from "@/app/Context/UserContext";
import AddChannelModal from "./AddChannelModal";
import { useChannel } from "@/app/Context/ChannelContext";

type SidebarProps = {
  open?: boolean;
  onToggle?: () => void;
};

type SidebarUserItem = {
  name: string;
  avatar: string;
  active: boolean;
};

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useUser();
  const { channels, activeChannelId, setActiveChannelId } = useChannel();

  const users: SidebarUserItem[] = useMemo(() => {
    if (!user) return [];
    return [
      {
        name: `${user.name} (Du)`,
        avatar: user.avatar || "/avatar1.png",
        active: true,
      },
    ];
  }, [user]);

  return (
    <>
      <AddChannelModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <div className="relative flex items-start h-full">
        {/* Griffleiste/Placeholder links (optional) */}
        <div className="hidden lg:flex cursor-pointer items-center justify-center bg-white shadow-md w-[56px] h-[calc(100%-10px)] rounded-tr-[30px] rounded-br-[30px] mt-[5px] z-20">
          <p className="-rotate-90 text-[13px] font-medium whitespace-nowrap text-center">
            Workspace
          </p>
        </div>

        <aside className="w-[366px] h-full bg-white p-[30px] flex flex-col justify-start shadow-sm rounded-[20px] ml-[0px] z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Image
                src="/Workspace logo.png"
                alt="Workspace"
                width={48}
                height={48}
              />
              <h2 className="text-xl font-bold">Devspace</h2>
            </div>
            <button className="cursor-pointer" aria-label="Sidebar umbenennen">
              <Image
                src="/16. edit_square (1).png"
                alt="edit"
                width={24}
                height={24}
              />
            </button>
          </div>

          {/* Channels */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Image
                src="/arrow_drop_down.png"
                alt="arrow"
                width={20}
                height={20}
              />
              <Image
                src="/workspaces.png"
                alt="workspace icon"
                width={20}
                height={20}
              />
              <span className="font-bold text-[16px]">Channels</span>
            </div>
            <button
              className="cursor-pointer"
              onClick={() => setShowModal(true)}
              aria-label="Channel hinzufügen"
            >
              <Image src="/19. add.png" alt="plus" width={20} height={20} />
            </button>
          </div>

          <ul className="space-y-2 mb-6">
            {channels.map((c) => (
              <li
                key={c.id}
                className={`px-3 py-2 rounded-full text-sm cursor-pointer ${
                  c.id === activeChannelId
                    ? "bg-[#EEF0FF] text-[#5D5FEF] font-semibold"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
                onClick={() => setActiveChannelId(c.id)}
              >
                #{c.name}
              </li>
            ))}
            <li
              className="text-gray-800 text-sm px-1 flex items-center gap-2 cursor-pointer hover:underline"
              onClick={() => setShowModal(true)}
            >
              <Image src="/19. add.png" alt="add" width={18} height={18} />
              Channel hinzufügen
            </li>
          </ul>

          {/* Direktnachrichten (Platzhalter) */}
          <div className="flex items-center gap-2 mb-2">
            <Image
              src="/arrow_drop_down.png"
              alt="arrow"
              width={20}
              height={20}
            />
            <Image
              src="/account_circle.png"
              alt="account"
              width={20}
              height={20}
            />
            <span className="font-bold text-[16px]">Direktnachrichten</span>
          </div>

          <ul className="space-y-2">
            {users.map((u, i) => (
              <li
                key={`${u.name}-${i}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer ${
                  i === 0
                    ? "bg-[#EEF0FF] text-[#5D5FEF]"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <div className="relative">
                  <Image
                    src={u.avatar}
                    alt={u.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  {u.active && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
                  )}
                </div>
                <span>{u.name}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
