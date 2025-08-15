"use client";

import { useState } from "react";
import Image from "next/image";

export default function MessageComposer({
  onSend,
  placeholder,
}: {
  onSend: (text: string) => Promise<void> | void;
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    try {
      setSending(true);
      await onSend(trimmed);
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative rounded-[24px] border-2 border-[#E8E9FF] bg-white px-3 sm:px-5 py-3 flex items-center gap-2 sm:gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        className="p-2 rounded-full hover:bg-gray-100"
        aria-label="Anhängen"
      >
        <Image src="/19. add.png" alt="Add" width={18} height={18} />
      </button>
      <button
        type="button"
        className="p-2 rounded-full hover:bg-gray-100"
        aria-label="Emoji"
      >
        <Image src="/icons (4).png" alt="Emoji" width={16} height={16} />
      </button>
      <button
        type="button"
        className="p-2 rounded-full hover:bg-gray-100"
        aria-label="Erwähnen"
      >
        <span className="text-gray-500 text-lg">@</span>
      </button>

      <input
        className="flex-1 outline-none bg-transparent text-sm sm:text-base placeholder:text-gray-400"
        placeholder={placeholder || "Nachricht schreiben…"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />

      <button
        type="button"
        onClick={submit}
        disabled={sending || text.trim().length === 0}
        className="ml-2 h-10 w-10 rounded-full bg-[#5D5FEF] text-white grid place-items-center disabled:opacity-60 hover:bg-[#4a4cdb]"
        aria-label="Senden"
      >
        <span className="inline-block translate-x-[1px] -translate-y-[1px]">
          ➤
        </span>
      </button>
    </div>
  );
}
