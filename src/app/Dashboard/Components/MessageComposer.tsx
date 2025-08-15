"use client";

import { useState } from "react";

export default function MessageComposer({
  placeholder,
  onSend,
}: {
  placeholder: string;
  onSend: (text: string) => void | Promise<void>;
}) {
  const [text, setText] = useState("");

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t) return;
    await onSend(t);
    setText("");
  };

  return (
    <form onSubmit={submit}>
      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-[16px] md:rounded-[22px] px-3 md:px-4 py-2 md:py-2.5 shadow-sm">
        {/* Plus-Icon */}
        <button
          type="button"
          className="shrink-0 p-1 rounded-full hover:bg-gray-100"
          aria-label="Anhänge"
          title="Anhänge"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="#666"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Eingabe */}
        <input
          className="block w-full bg-transparent outline-none text-sm md:text-[15px] placeholder:text-gray-400"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Emoji-Icon */}
        <button
          type="button"
          className="hidden sm:inline-flex shrink-0 p-1 rounded-full hover:bg-gray-100"
          aria-label="Emoji"
          title="Emoji"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#666" strokeWidth="2" />
            <circle cx="9" cy="10" r="1" fill="#666" />
            <circle cx="15" cy="10" r="1" fill="#666" />
            <path
              d="M8 14c1 1.2 2.5 2 4 2s3-0.8 4-2"
              stroke="#666"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Send */}
        <button
          type="submit"
          className="shrink-0 inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#6D67FF] hover:bg-[#5952ff] text-white"
          aria-label="Senden"
          title="Senden"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12l14-7-5 14-3-5-6-2z"
              fill="currentColor"
              opacity="0.95"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
