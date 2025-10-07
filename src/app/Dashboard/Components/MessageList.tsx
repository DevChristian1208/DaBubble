// app/Dashboard/Components/MessageList.tsx
"use client";

import Image from "next/image";
import { useUser } from "@/app/Context/UserContext";

export type Message = {
  id: string;
  text: string;
  createdAt?: number;
  user: { name: string; email: string; avatar?: string };
};

function isOwn(targetEmail: string, meEmail?: string | null) {
  return !!meEmail && targetEmail === meEmail;
}

type ParsedAttachment =
  | { kind: "image"; url: string; name: string }
  | { kind: "file"; url: string; name: string };

function parseAttachment(text: string): ParsedAttachment | null {
  if (!text.startsWith("ATTACH::")) return null;
  const parts = text.split("::");
  if (parts.length < 3) return null;
  const kind = parts[1] === "image" ? "image" : "file";
  const url = parts[2];
  const name = parts[3]
    ? decodeURIComponent(parts[3])
    : kind === "image"
    ? "Bild"
    : "Datei";
  return { kind, url, name };
}

function formatTime(ts?: number) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageList({ messages }: { messages: Message[] }) {
  const { user: me } = useUser();

  return (
    <div className="flex flex-col gap-3">
      {messages.map((m) => {
        const mine = isOwn(m.user.email, me?.email);
        const att = parseAttachment(m.text);

        return (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              mine ? "justify-end" : "justify-start"
            }`}
          >
            {!mine && (
              <Image
                src={m.user.avatar || "/avatar1.png"}
                alt={m.user.name}
                width={32}
                height={32}
                className="rounded-full mt-1"
              />
            )}

            <div className="max-w-[75%]">
              <div
                className={`text-[12px] mb-1 ${
                  mine ? "text-right text-gray-400" : "text-gray-500"
                }`}
              >
                {!mine && (
                  <span className="font-semibold text-gray-700">
                    {m.user.name}
                  </span>
                )}{" "}
                <span className="ml-1">{formatTime(m.createdAt)}</span>
              </div>

              <div
                className={`rounded-2xl px-4 py-2 ${
                  mine
                    ? "bg-[#5D5FEF] text-white rounded-br-md"
                    : "bg-gray-100 text-gray-900 rounded-bl-md"
                }`}
              >
                {att ? (
                  att.kind === "image" ? (
                    <a href={att.url} target="_blank" rel="noreferrer">
                      <img
                        src={att.url}
                        alt={att.name}
                        className="rounded-lg max-h-[320px] max-w-full object-contain"
                      />
                    </a>
                  ) : (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`underline ${
                        mine ? "text-white" : "text-blue-600"
                      }`}
                    >
                      📎 {att.name}
                    </a>
                  )
                ) : (
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                )}
              </div>
            </div>

            {mine && (
              <Image
                src={m.user.avatar || "/avatar1.png"}
                alt={m.user.name}
                width={32}
                height={32}
                className="rounded-full mt-1"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
