"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/app/Context/UserContext";
import { useChannel } from "@/app/Context/ChannelContext";
import { useDirect } from "@/app/Context/DirectContext";
import AddChannelModal from "./AddChannelModal";

export default function Sidebar({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const [showModal, setShowModal] = useState(false);

  // Collapsible + Persistenz
  const [channelsOpen, setChannelsOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("dabubble_channels_open") !== "0";
  });
  const [dmsOpen, setDmsOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("dabubble_dms_open") !== "0";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dabubble_channels_open", channelsOpen ? "1" : "0");
    }
  }, [channelsOpen]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dabubble_dms_open", dmsOpen ? "1" : "0");
    }
  }, [dmsOpen]);

  const { user } = useUser();
  const { channels, activeChannelId, setActiveChannelId } = useChannel();
  const {
    myDMContacts,
    startDMWith,
    activeDMUserId,
    setActiveDMUserId,
    allUsers,
  } = useDirect();

  const meItem = useMemo(() => {
    const me = allUsers.find((u) => u.email === user?.email);
    return me
      ? [
          {
            id: me.id,
            name: `${me.name} (Du)`,
            avatar: me.avatar || "/avatar1.png",
          },
        ]
      : [];
  }, [allUsers, user?.email]);

  const dmList = useMemo(() => {
    const others = myDMContacts.filter(
      (c) => !meItem.some((m) => m.id === c.id)
    );
    return [...meItem, ...others];
  }, [meItem, myDMContacts]);

  const openChannel = (id: string) => {
    setActiveDMUserId(null);
    setActiveChannelId(id);
    if (window.innerWidth < 768) onToggle();
  };

  const openDM = (userId: string) => {
    setActiveChannelId(null as any);
    startDMWith(userId);
    if (window.innerWidth < 768) onToggle();
  };

  return (
    <>
      <AddChannelModal isOpen={showModal} onClose={() => setShowModal(false)} />

      {/* Mobile Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition ${
          open
            ? "pointer-events-auto bg-black/30"
            : "pointer-events-none bg-transparent"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) onToggle();
        }}
      />

      <div className="relative h-full flex items-stretch">
        {/* Desktop Griff */}
        <button
          type="button"
          onClick={onToggle}
          className="hidden md:flex absolute -left-[56px] top-1/2 -translate-y-1/2 items-center justify-center bg-white shadow-md w-[56px] h-[260px] rounded-tr-[30px] rounded-br-[30px] z-20 hover:bg-gray-50"
          aria-label={
            open ? "Workspace-Menü schließen" : "Workspace-Menü öffnen"
          }
        >
          <p className="-rotate-90 text-[13px] font-medium whitespace-nowrap text-center">
            {open ? "Workspace-Menü schließen" : "Workspace-Menü öffnen"}
          </p>
        </button>

        {/* Desktop Sidebar – **h-full** statt Prozenthöhe */}
        <aside
          className={[
            "hidden md:block bg-white shadow-sm rounded-[20px] h-full z-10",
            open
              ? "w-[366px] p-[30px] ml-[20px] opacity-100 translate-x-0"
              : "w-0 p-0 ml-0 opacity-0 -translate-x-2",
          ].join(" ")}
        >
          {open && (
            <SidebarContent
              channelsOpen={channelsOpen}
              setChannelsOpen={setChannelsOpen}
              dmsOpen={dmsOpen}
              setDmsOpen={setDmsOpen}
              channels={channels}
              activeChannelId={activeChannelId}
              activeDMUserId={activeDMUserId}
              openChannel={openChannel}
              openDM={openDM}
              dmList={dmList}
              onOpenModal={() => setShowModal(true)}
            />
          )}
        </aside>

        <aside
          className={`md:hidden fixed left-0 top-0 h-full w-[82vw] max-w-[360px] bg-white shadow-xl rounded-r-[20px] z-50 transition-transform duration-300 ease-in-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/Workspace logo.png"
                  alt="Workspace"
                  width={36}
                  height={36}
                />
                <h2 className="text-lg font-bold">Devspace</h2>
              </div>
              <button
                className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                onClick={onToggle}
                aria-label="Menü schließen"
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

            <div className="h-[calc(100%-48px)]">
              <SidebarContent
                compact
                channelsOpen={channelsOpen}
                setChannelsOpen={setChannelsOpen}
                dmsOpen={dmsOpen}
                setDmsOpen={setDmsOpen}
                channels={channels}
                activeChannelId={activeChannelId}
                activeDMUserId={activeDMUserId}
                openChannel={openChannel}
                openDM={openDM}
                dmList={dmList}
                onOpenModal={() => setShowModal(true)}
              />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function SidebarContent({
  compact,
  channelsOpen,
  setChannelsOpen,
  dmsOpen,
  setDmsOpen,
  channels,
  activeChannelId,
  activeDMUserId,
  openChannel,
  openDM,
  dmList,
  onOpenModal,
}: {
  compact?: boolean;
  channelsOpen: boolean;
  setChannelsOpen: (v: boolean) => void;
  dmsOpen: boolean;
  setDmsOpen: (v: boolean) => void;
  channels: { id: string; name: string }[];
  activeChannelId: string | null;
  activeDMUserId: string | null;
  openChannel: (id: string) => void;
  openDM: (id: string) => void;
  dmList: { id: string; name: string; avatar?: string }[];
  onOpenModal: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {!compact && (
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
          <div className="opacity-60">
            <Image
              src="/16. edit_square (1).png"
              alt="edit"
              width={24}
              height={24}
            />
          </div>
        </div>
      )}

      {/* Scrollbarer Inhalt */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {/* CHANNELS */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setChannelsOpen(!channelsOpen)}
            aria-expanded={channelsOpen}
            className="flex items-center gap-2 hover:opacity-80"
          >
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
          </button>
          <button
            className="cursor-pointer"
            onClick={onOpenModal}
            aria-label="Channel hinzufügen"
          >
            <Image src="/19. add.png" alt="plus" width={20} height={20} />
          </button>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            channelsOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="space-y-2 mb-6 pt-2">
            {channels.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => openChannel(c.id)}
                  className={`w-full text-left px-3 py-2 rounded-full text-sm transition ${
                    c.id === activeChannelId && !activeDMUserId
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
                className="text-gray-800 text-sm px-1 flex items-center gap-2 hover:underline"
                onClick={onOpenModal}
              >
                <Image src="/19. add.png" alt="add" width={18} height={18} />
                Channel hinzufügen
              </button>
            </li>
          </ul>
        </div>

        {/* DMs */}
        <button
          type="button"
          onClick={() => setDmsOpen(!dmsOpen)}
          aria-expanded={dmsOpen}
          className="flex items-center gap-2 mb-2 hover:opacity-80"
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
          <Image src="/account_circle.png" alt="" width={20} height={20} />
          <span className="font-bold text-[16px]">Direktnachrichten</span>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            dmsOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="space-y-2 pb-2">
            {dmList.map((u) => {
              const active = activeDMUserId === u.id;
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => openDM(u.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                      active
                        ? "bg-[#EEF0FF] text-[#5D5FEF]"
                        : "hover:bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="relative">
                      <Image
                        src={u.avatar || "/avatar1.png"}
                        alt={u.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
                    </div>
                    <span className="truncate">{u.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
