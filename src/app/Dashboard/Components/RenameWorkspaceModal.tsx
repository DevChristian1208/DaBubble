"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ref, set } from "firebase/database";
import { db } from "@/app/lib/firebase";

export default function RenameWorkspaceModal({
  isOpen,
  currentName,
  onClose,
}: {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (isOpen) setName(currentName);
  }, [isOpen, currentName]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const save = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    try {
      await set(ref(db, "workspace/name"), name.trim());
      onClose();
    } catch {
      alert("Fehler beim Speichern");
    }
    setLoading(false);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.currentTarget === e.target && onClose()}
    >
      <div className="bg-white w-full max-w-[600px] rounded-[24px] p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-2xl font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
          aria-label="Modal schließen"
        >
          ×
        </button>

        <h2 className="text-xl sm:text-2xl font-semibold mb-2">
          Workspace umbenennen
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Gib einen neuen Namen für deinen Workspace ein.
        </p>

        <label className="block font-medium text-sm mb-1">Neuer Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="z. B. Devspace"
          className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm outline-none"
        />

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Abbrechen
          </button>

          <button
            onClick={save}
            disabled={loading || !name.trim()}
            className="bg-[#5D5FEF] disabled:opacity-60 text-white px-6 py-2 rounded-full font-semibold hover:bg-[#4a4cdb] transition cursor-pointer"
          >
            {loading ? "Speichert…" : "Speichern"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
