"use client";

import { useState } from "react";
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

  if (!isOpen) return null;

  const submit = async () => {
    try {
      await createChannel(name, desc);
      setName("");
      setDesc("");
      onClose();
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={(e) => e.currentTarget === e.target && onClose()}
    >
      <div className="bg-white w-full max-w-[872px] rounded-2xl sm:rounded-[30px] p-5 sm:p-[24px] md:p-[40px] flex flex-col gap-[16px] sm:gap-[20px] shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-2xl font-bold text-gray-500"
          aria-label="Modal schließen"
        >
          ×
        </button>

        <h2 className="text-xl sm:text-2xl font-semibold">Channel erstellen</h2>
        <p className="text-sm text-gray-600">
          Channels dienen deinem Team zur Kommunikation. Am besten themenbezogen
          – z. B. <span className="font-medium text-[#5D5FEF]">#marketing</span>
          .
        </p>

        <div>
          <label className="block font-medium mt-2">Channel-Name</label>
          <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 mt-2">
            <span className="text-gray-400 mr-2">#</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="z. B. kooperationsprojekte"
              className="w-full outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mt-4 text-gray-700">
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

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="mt-2 sm:mt-4 flex justify-end">
          <button
            className="bg-[#5D5FEF] disabled:opacity-60 text-white px-6 py-2 rounded-full font-semibold hover:bg-[#4a4cdb] transition"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Erstelle…" : "Erstellen"}
          </button>
        </div>
      </div>
    </div>
  );
}
