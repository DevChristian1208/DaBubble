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

  useEffect(() => setMounted(true), []);

  const submit = async () => {
    if (!name.trim()) return;
    try {
      await createChannel(name, desc);
      setName("");
      setDesc("");
      onClose();
    } catch {}
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.currentTarget === e.target && onClose()}
    >
      <div className="bg-white w-full max-w-[872px] rounded-[24px] p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-2xl font-bold text-gray-500 hover:text-gray-700"
          aria-label="Modal schließen"
        >
          ×
        </button>

        <h2 className="text-xl sm:text-2xl font-semibold mb-2">
          Channel erstellen
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Lege einen themenbezogenen Channel an – z. B.{" "}
          <span className="font-medium text-[#5D5FEF]">#marketing</span>.
        </p>

        <label className="block font-medium text-sm mb-1">Channel-Name</label>
        <div className="flex items-center border border-gray-300 rounded-full px-4 py-2">
          <span className="text-gray-400 mr-2">#</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="z. B. kooperationsprojekte"
            className="w-full outline-none text-sm"
          />
        </div>

        <label className="block font-medium text-sm mt-5 mb-1">
          Beschreibung <span className="text-gray-400">(optional)</span>
        </label>
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          type="text"
          placeholder="Dein Text hier"
          className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm outline-none"
        />

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            onClick={submit}
            disabled={loading || !name.trim()}
            className="bg-[#5D5FEF] disabled:opacity-60 text-white px-6 py-2 rounded-full font-semibold hover:bg-[#4a4cdb] transition"
          >
            {loading ? "Erstelle…" : "Erstellen"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
