"use client";

import Image from "next/image";
import { useState } from "react";
import { useUser } from "@/app/Context/UserContext";
import AddChannelModal from "./AddChannelModal";

export default function Sidebar() {
  const [showModal, setShowModal] = useState(false);
  const { user } = useUser();

  const users = user
    ? [
        {
          name: `${user.name} (Du)`,
          avatar: user.avatar || "/avatar1.png",
          active: true,
        },
      ]
    : [];

  return (
    <>
      <AddChannelModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <div className="relative flex items-start">
        <div className="cursor-pointer flex items-center justify-center bg-white shadow-md w-[56px] h-[339px] rounded-tr-[30px] rounded-br-[30px] mt-[120px] z-20">
          <p className="-rotate-90 text-[13px] font-medium whitespace-nowrap text-center">
            Workspace-Menü schließen
          </p>
        </div>

        <aside className="w-[366px] h-[97.5%] bg-white p-[30px] flex flex-col justify-start shadow-sm rounded-[20px] ml-[20px] z-10">
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
            <div className="cursor-pointer">
              <Image
                src="/16. edit_square (1).png"
                alt="edit"
                width={24}
                height={24}
              />
            </div>
          </div>

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
            <div className="cursor-pointer">
              <Image
                src="/19. add.png"
                alt="plus"
                width={20}
                height={20}
                onClick={() => setShowModal(true)}
              />
            </div>
          </div>

          <ul className="space-y-2 mb-6">
            <li className="bg-[#EEF0FF] text-[#5D5FEF] font-semibold px-3 py-2 rounded-full text-sm cursor-pointer">
              # Entwicklerteam
            </li>
            <li
              className="text-gray-800 text-sm px-1 flex items-center gap-2 cursor-pointer hover:underline"
              onClick={() => setShowModal(true)}
            >
              <Image src="/19. add.png" alt="add" width={18} height={18} />
              Channel hinzufügen
            </li>
          </ul>

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
            {users.map((user, i) => (
              <li
                key={i}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer ${
                  i === 0
                    ? "bg-[#EEF0FF] text-[#5D5FEF]"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <div className="relative">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  {user.active && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
                  )}
                </div>
                <span>{user.name}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
