"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useUser } from "@/app/Context/UserContext";
import { useChannel } from "@/app/Context/ChannelContext";
import { useDirect } from "@/app/Context/DirectContext";
import AddChannelModal from "./AddChannelModal";

type SidebarProps = {
  open?: boolean;
  onToggle?: () => void;
};

type SidebarUserItem = {
  id?: string;
  name: string;
  avatar: string;
  active: boolean;
  email?: string;
};

export default function Sidebar({ open = true, onToggle }: SidebarProps) {
  const [showModal, setShowModal] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);

  const { user } = useUser();
  const { channels, activeChannelId, setActiveChannelId } = useChannel();

  // Direct-Context: Threads in Sidebar anzeigen + DM starten
  const direct = useDirect();
  const { dmThreads, startDMWith, activeDMUserId } = direct;

  const users: SidebarUserItem[] = useMemo(() => {
    if (!user) return [];
    return [
      {
        id: "me",
        name: `${user.name} (Du)`,
        avatar: user.avatar || "/avatar1.png",
        active: true,
        email: user.email,
      },
    ];
  }, [user]);

  const handleWorkspaceToggle = () => onToggle?.();

  const closeOnMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onToggle?.();
    }
  };

  const handleSelectChannel = (id: string) => {
    setActiveChannelId(id);
    try {
      direct.clearDM?.();
    } catch {
      /* noop */
    }
    closeOnMobile();
  };

  const handleOpenDM = (otherUserId: string) => {
    startDMWith(otherUserId);
    closeOnMobile();
  };

  return (
    <>
      <AddChannelModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <div className="relative flex items-stretch h-full">
        <button
          type="button"
          onClick={handleWorkspaceToggle}
          aria-label="Workspace-Menü umschalten"
          aria-pressed={open}
          className="cursor-pointer mr-[15px] hidden lg:flex select-none items-center justify-center bg-white shadow-md w-[56px] h-[calc(100%-10px)] rounded-tr-[30px] rounded-br-[30px] mt-[5px] z-20 active:scale-[0.98] transition-transform"
        >
          <span className="-rotate-90 text-[13px] font-medium whitespace-nowrap">
            Workspace
          </span>
        </button>

        <aside
          className="h-full bg-white flex flex-col justify-start shadow-sm rounded-[20px] overflow-hidden z-10 transition-[width,padding] duration-300 ease-in-out"
          style={{ width: open ? 366 : 0, padding: open ? 30 : 0 }}
          aria-hidden={!open}
        >
          {open && (
            <>
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
                <button
                  className="cursor-pointer rounded-full p-1 hover:bg-gray-100"
                  aria-label="Workspace bearbeiten"
                >
                  <Image
                    src="/16. edit_square (1).png"
                    alt="Bearbeiten"
                    width={24}
                    height={24}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setChannelsOpen((v) => !v)}
                className="w-full flex items-center justify-between mb-2"
                aria-expanded={channelsOpen}
                aria-controls="sidebar-channels"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src="/arrow_drop_down.png"
                    alt=""
                    width={20}
                    height={20}
                    className={`transition-transform ${
                      channelsOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                  <Image src="/workspaces.png" alt="" width={20} height={20} />
                  <span className="font-bold text-[16px]">Channels</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                  className="cursor-pointer rounded-full p-1 hover:bg-gray-100"
                  aria-label="Channel hinzufügen"
                >
                  <Image src="/19. add.png" alt="plus" width={20} height={20} />
                </button>
              </button>

              <ul
                id="sidebar-channels"
                className={`space-y-2 mb-6 transition-[max-height,opacity] duration-300 ease-in-out ${
                  channelsOpen ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  maxHeight: channelsOpen ? 500 : 0,
                  overflow: "hidden",
                }}
              >
                {channels.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectChannel(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-full text-sm cursor-pointer outline-none ${
                        c.id === activeChannelId
                          ? "bg-[#EEF0FF] text-[#5D5FEF] font-semibold"
                          : "text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      #{c.name}
                    </button>
                  </li>
                ))}

                <li>
                  <button
                    type="button"
                    className="text-gray-800 text-sm px-1 flex items-center gap-2 cursor-pointer hover:underline"
                    onClick={() => setShowModal(true)}
                  >
                    <Image
                      src="/19. add.png"
                      alt="add"
                      width={18}
                      height={18}
                    />
                    Channel hinzufügen
                  </button>
                </li>
              </ul>

              <button
                type="button"
                onClick={() => setDmsOpen((v) => !v)}
                className="w-full flex items-center gap-2 mb-2"
                aria-expanded={dmsOpen}
                aria-controls="sidebar-dms"
              >
                <Image
                  src="/arrow_drop_down.png"
                  alt=""
                  width={20}
                  height={20}
                  className={`transition-transform ${
                    dmsOpen ? "rotate-0" : "-rotate-90"
                  }`}
                />
                <Image
                  src="/account_circle.png"
                  alt=""
                  width={20}
                  height={20}
                />
                <span className="font-bold text-[16px]">Direktnachrichten</span>
              </button>

              {/* DM-Liste */}
              <ul
                id="sidebar-dms"
                className={`space-y-2 transition-[max-height,opacity] duration-300 ease-in-out ${
                  dmsOpen ? "opacity-100" : "opacity-0"
                }`}
                style={{ maxHeight: dmsOpen ? 500 : 0, overflow: "hidden" }}
              >
                {/* Echte DM-Threads (NEU) */}
                {dmThreads.map((t) => (
                  <li key={t.convId}>
                    <button
                      type="button"
                      onClick={() => handleOpenDM(t.otherUserId)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left cursor-pointer ${
                        activeDMUserId === t.otherUserId
                          ? "bg-[#EEF0FF] text-[#5D5FEF]"
                          : "hover:bg-gray-100 text-gray-800"
                      }`}
                      title={t.otherName}
                    >
                      <div className="relative shrink-0">
                        <Image
                          src={t.otherAvatar || "/avatar1.png"}
                          alt={t.otherName}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{t.otherName}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
