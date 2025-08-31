"use client";

import { useEffect, useRef, useState } from "react";
import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

type Props = {
  placeholder?: string;
  onSend: (text: string) => Promise<void> | void;
  disabled?: boolean;
};

const COMMON_EMOJIS = [
  "😀",
  "😄",
  "😁",
  "😅",
  "🤣",
  "😂",
  "🙂",
  "😉",
  "😊",
  "😍",
  "😘",
  "😛",
  "😜",
  "🤔",
  "🙄",
  "😴",
  "🤯",
  "🥳",
  "👍",
  "🙏",
  "👏",
  "💪",
  "🔥",
  "✨",
  "🎉",
  "❤️",
  "💙",
  "💚",
  "💛",
  "💜",
];

export default function MessageComposer({
  placeholder,
  onSend,
  disabled,
}: Props) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const emojiRef = useRef<HTMLDivElement | null>(null);
  const emojiBtnRef = useRef<HTMLButtonElement | null>(null);

  const canSend = !disabled && !sending && value.trim().length > 0;

  // Emoji-Picker außerhalb-klick schließen
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!showEmoji) return;
      const t = e.target as Node;
      if (emojiRef.current?.contains(t)) return;
      if (emojiBtnRef.current?.contains(t)) return;
      setShowEmoji(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showEmoji]);

  const handleSend = async () => {
    const text = value.trim();
    if (!text || sending || disabled) return;
    setSending(true);
    try {
      await onSend(text);
      setValue("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const handleFilesSelected: React.ChangeEventHandler<
    HTMLInputElement
  > = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const storage = getStorage();
    setSending(true);
    try {
      for (const file of Array.from(files)) {
        const path = `attachments/${Date.now()}_${file.name}`;
        const storageRef = sRef(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        const kind = file.type.startsWith("image/") ? "image" : "file";
        const marker = `ATTACH::${kind}::${url}::${encodeURIComponent(
          file.name
        )}`;
        await onSend(marker);
      }
    } catch (err) {
      console.error("Upload fehlgeschlagen:", err);
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addEmoji = (emoji: string) => setValue((v) => v + emoji);

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-[18px] md:rounded-[28px] px-3 md:px-5 py-2 md:py-3">
      {/* Plus (Anhänge) */}
      <button
        type="button"
        onClick={openFileDialog}
        className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
        title="Datei/Bild anhängen"
        disabled={sending || disabled}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        className="hidden"
        onChange={handleFilesSelected}
      />

      <textarea
        className="flex-1 h-10 md:h-9 max-h-[160px] resize-none outline-none text-[14px] md:text-[15px] leading-[1.4] py-2 placeholder:text-gray-400"
        placeholder={placeholder || "Nachricht schreiben…"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={sending || disabled}
      />

      <div className="relative">
        <button
          ref={emojiBtnRef}
          type="button"
          onClick={() => setShowEmoji((s) => !s)}
          className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
          title="Emoji einfügen"
          disabled={sending || disabled}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M8 14s1.5 2 4 2 4-2 4-2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="9" cy="10" r="1.2" fill="currentColor" />
            <circle cx="15" cy="10" r="1.2" fill="currentColor" />
          </svg>
        </button>

        {showEmoji && (
          <div
            ref={emojiRef}
            className="absolute bottom-11 right-0 z-50 w-64 bg-white border border-gray-200 shadow-lg rounded-xl p-2"
          >
            <div className="grid grid-cols-8 gap-1">
              {COMMON_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="text-xl leading-[32px] h-8 w-8 hover:bg-gray-100 rounded"
                  onClick={() => addEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        className="cursor-pointer ml-1 shrink-0 inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#5D5FEF] text-white disabled:opacity-50"
        title="Senden"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="rotate-180"
        >
          <path d="M4 12l16-8-6 8 6 8-16-8Z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
