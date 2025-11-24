"use client";

import { useEffect, useMemo, useState, KeyboardEvent } from "react";
import Image from "next/image";
import { useUser } from "@/app/Context/UserContext";
import { useChannel } from "@/app/Context/ChannelContext";
import { useDirect } from "@/app/Context/DirectContext";
import { ref, onValue } from "firebase/database";
import { db } from "@/app/lib/firebase";
import AddChannelModal from "./AddChannelModal";
import RenameWorkspaceModal from "./RenameWorkspaceModal";

type SidebarProps = {
  open?: boolean;
  onToggleSidebar: () => void;
};

export default function Sidebar({
  open = true,
  onToggleSidebar,
}: SidebarProps) {
  const [showModal, setShowModal] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("Devspace");
  const [renameOpen, setRenameOpen] = useState(false);

  const { user } = useUser();
  const { channels, activeChannelId, setActiveChannelId } = useChannel();

  // ❗ DirectContext reagiert automatisch für Gäste → zeigt einfach leere DM-Liste
  const {
    dmThreads = [],
    startDMWith,
    activeDMUserId,
    clearDM,
    unreadCounts,
  } = useDirect();

  // Workspace Name laden
  useEffect(() => {
    const r = ref(db, "workspace/name");
    const unsub = onValue(r, (snap) => {
      const val = snap.val();
      if (typeof val === "string" && val.trim()) setWorkspaceName(val);
      else setWorkspaceName("Devspace");
    });
    return () => unsub();
  }, []);

  const closeOnMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onToggleSidebar?.();
    }
  };

  const handleSelectChannel = (id: string) => {
    setActiveChannelId(id);
    clearDM?.();
    closeOnMobile();
  };

  const handleOpenDM = (otherUserId: string) => {
    // 🚫 Gäste können keine DMs öffnen
    if (user?.isGuest) {
      alert("Dieses Feature ist nur für registrierte Nutzer verfügbar.");
      return;
    }
    startDMWith(otherUserId);
    closeOnMobile();
  };

  const onHeaderKey = (
    e: KeyboardEvent<HTMLDivElement>,
    toggle: () => void
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  const dmList = useMemo(() => dmThreads, [dmThreads]);

  return (
    <>
      <AddChannelModal isOpen={showModal} onClose={() => setShowModal(false)} />
      <RenameWorkspaceModal
        isOpen={renameOpen}
        currentName={workspaceName}
        onClose={() => setRenameOpen(false)}
      />

      <div className="relative flex items-stretch h-full">
        <button
          type="button"
          onClick={onToggleSidebar}
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
              {/* WORKSPACE HEADER */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 min-w-0">
                  <Image
                    src="/Workspace logo.png"
                    alt="Workspace"
                    width={48}
                    height={48}
                  />
                  <h2 className="text-xl font-bold truncate">
                    {workspaceName}
                  </h2>
                </div>

                {!user?.isGuest && (
                  <button
                    className="cursor-pointer rounded-full p-1 hover:bg-gray-100"
                    aria-label="Workspace umbenennen"
                    onClick={() => setRenameOpen(true)}
                  >
                    <Image
                      src="/16. edit_square (1).png"
                      alt="Bearbeiten"
                      width={24}
                      height={24}
                    />
                  </button>
                )}
              </div>

              {/* CHANNELS */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setChannelsOpen((v) => !v)}
                onKeyDown={(e) =>
                  onHeaderKey(e, () => setChannelsOpen((v) => !v))
                }
                className="w-full flex items-center justify-between mb-2 cursor-pointer select-none"
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
                  onClick={() => setShowModal(true)}
                  className="cursor-pointer rounded-full p-1 hover:bg-gray-100"
                  aria-label="Channel hinzufügen"
                >
                  <Image src="/19. add.png" alt="plus" width={20} height={20} />
                </button>
              </div>

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

              {/* DIRECT MESSAGES (nur für echte Nutzer sichtbar) */}
              {!user?.isGuest && (
                <>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setDmsOpen((v) => !v)}
                    onKeyDown={(e) =>
                      onHeaderKey(e, () => setDmsOpen((v) => !v))
                    }
                    className="w-full flex items-center gap-2 mb-2 cursor-pointer select-none"
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
                    <span className="font-bold text-[16px]">
                      Direktnachrichten
                    </span>
                  </div>

                  <ul
                    id="sidebar-dms"
                    className={`space-y-2 transition-[max-height,opacity] duration-300 ease-in-out ${
                      dmsOpen ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                      maxHeight: dmsOpen ? 500 : 0,
                      overflow: "hidden",
                    }}
                  >
                    {dmList.map((t) => {
                      const active = activeDMUserId === t.otherUserId;
                      const unread = unreadCounts[t.otherUserId] || 0;

                      return (
                        <li key={t.convId}>
                          <button
                            type="button"
                            onClick={() => handleOpenDM(t.otherUserId)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left cursor-pointer transition ${
                              active
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
                              {unread > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#5D5FEF] text-white text-[11px] leading-[18px] text-center">
                                  {unread}
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="truncate">{t.otherName}</div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </>
          )}
        </aside>
      </div>
    </>
  );
}
