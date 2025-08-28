"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useChannel } from "@/app/Context/ChannelContext";

export default function AddChannelModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { createChannel, loading, error } = useChannel();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      await createChannel(name, desc);
      setName("");
      setDesc("");
      onClose();
    } catch {
      // Fehler bereits im Context gesetzt
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop (eigene Ebene) */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Dialog-Card */}
      <div className="relative z-[101] w-full max-w-[880px] bg-white rounded-[20px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <h2 className="text-xl sm:text-2xl font-semibold">
            Channel erstellen
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            aria-label="Schließen"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Inhalt */}
        <form onSubmit={submit} className="px-6 py-5 flex flex-col gap-5">
          <p className="text-sm text-gray-600">
            Channels dienen deinem Team zur Kommunikation. Am besten
            themenbezogen – z. B.{" "}
            <span className="font-medium text-[#5D5FEF]">#marketing</span>.
          </p>

          <div>
            <label className="block font-medium">Channel-Name</label>
            <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 mt-2">
              <span className="text-gray-400 mr-2">#</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="z. B. kooperationsprojekte"
                className="w-full outline-none text-sm"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700">
              Beschreibung{" "}
              <span className="text-gray-400 text-sm">(optional)</span>
            </label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              type="text"
              placeholder="Dein Text hier"
              className="w-full mt-2 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none"
            />
          </div>

          {error && <p className="text-red-600 text-sm -mt-2">{error}</p>}

          <div className="mt-2 flex justify-end gap-3 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="bg-[#5D5FEF] disabled:opacity-60 text-white px-6 py-2 rounded-full font-semibold hover:bg-[#4a4cdb] transition"
              disabled={loading}
            >
              {loading ? "Erstelle…" : "Erstellen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
