"use client";

import Image from "next/image";
import { Message } from "@/app/Context/ChannelContext";
import { useUser } from "@/app/Context/UserContext";
import { useEffect, useState } from "react";

// kleine Helper-Funktion für Klassen
function cls(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function MessageList({ messages }: { messages: Message[] }) {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ul className="space-y-4 sm:space-y-5">
      {messages.map((m) => {
        const isMe = user && m.user.email === user.email;

        const time =
          mounted && m.createdAt
            ? new Intl.DateTimeFormat("de-DE", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(m.createdAt))
            : "";

        return (
          <li
            key={m.id}
            className={cls(
              "flex w-full",
              isMe ? "justify-end" : "justify-start"
            )}
          >
            {/* Container pro Nachricht: Avatar + Inhalt */}
            <div
              className={cls(
                "flex items-start gap-2 sm:gap-3 max-w-[75%]",
                isMe ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <Image
                src={m.user.avatar || "/avatar1.png"}
                alt={m.user.name}
                width={28}
                height={28}
                className="rounded-full mt-[2px] shrink-0"
              />

              {/* Inhalt */}
              <div className={cls("min-w-0", isMe && "text-right")}>
                {/* Kopfzeile */}
                <div
                  className={cls(
                    "flex items-center gap-2",
                    isMe ? "justify-end" : ""
                  )}
                >
                  <span className="font-semibold text-[13px] sm:text-sm leading-none">
                    {m.user.name}
                  </span>
                  <span
                    className="text-[11px] sm:text-xs text-gray-500 leading-none"
                    suppressHydrationWarning
                  >
                    {time}
                  </span>
                  {isMe && (
                    <span className="text-[10px] sm:text-[11px] text-[#8B5CF6] leading-none">
                      (Du)
                    </span>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={cls(
                    "mt-1 inline-block rounded-2xl px-3 py-2 md:px-4 md:py-2.5",
                    isMe
                      ? "bg-[#7163FF] text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                >
                  <p
                    className={cls(
                      "whitespace-pre-wrap text-[13px] md:text-sm leading-5 md:leading-6",
                      isMe && "text-right"
                    )}
                  >
                    {m.text}
                  </p>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
