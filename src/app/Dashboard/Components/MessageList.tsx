"use client";

import Image from "next/image";
import { Message } from "@/app/Context/ChannelContext";
import { useEffect, useMemo, useRef } from "react";
import { useUser } from "@/app/Context/UserContext";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDayLabel(d: Date) {
  const today = new Date();
  if (isSameDay(d, today)) return "Heute";
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export default function MessageList({ messages }: { messages: Message[] }) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const groups = useMemo(() => {
    const map = new Map<string, Message[]>();
    messages.forEach((m) => {
      const ts = m.createdAt ? new Date(m.createdAt) : new Date();
      const key = new Date(
        ts.getFullYear(),
        ts.getMonth(),
        ts.getDate()
      ).toISOString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, msgs]) => ({ day: new Date(key), msgs }));
  }, [messages]);

  if (!messages.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Noch keine Nachrichten – schreibe die erste!
      </div>
    );
  }

  return (
    <div>
      {groups.map(({ day, msgs }) => (
        <div key={day.toISOString()}>
          <div className="relative my-6 flex justify-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-xs text-gray-600">
              {formatDayLabel(day)}
            </div>
          </div>

          <ul className="space-y-4">
            {msgs.map((m) => {
              const mine =
                m.user?.email && user?.email && m.user.email === user.email;
              const time = m.createdAt
                ? new Date(m.createdAt).toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              if (!mine) {
                return (
                  <li key={m.id} className="flex items-start gap-3">
                    <Image
                      src={m.user?.avatar || "/avatar1.png"}
                      alt={m.user?.name || "User"}
                      width={36}
                      height={36}
                      className="rounded-full mt-1"
                    />
                    <div className="max-w-[75%]">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold">
                          {m.user?.name || "Unbekannt"}
                        </span>
                        <span className="text-xs text-gray-400">{time}</span>
                      </div>
                      <div className="mt-1 rounded-2xl bg-[#EEF0FF] px-4 py-3 text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                        <p className="whitespace-pre-wrap break-words">
                          {m.text}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              }

              return (
                <li key={m.id} className="flex items-start gap-3 justify-end">
                  <div className="max-w-[75%] text-right">
                    <div className="flex items-baseline gap-2 justify-end">
                      <span className="text-xs text-gray-400">{time}</span>
                      <span className="font-semibold">
                        {m.user?.name || "Ich"}
                      </span>
                    </div>
                    <div className="mt-1 rounded-2xl bg-[#5D5FEF] px-4 py-3 text-white shadow-[0_2px_6px_rgba(93,95,239,0.35)] ml-auto">
                      <p className="whitespace-pre-wrap break-words">
                        {m.text}
                      </p>
                    </div>
                  </div>
                  <Image
                    src={m.user?.avatar || "/avatar1.png"}
                    alt={m.user?.name || "Ich"}
                    width={36}
                    height={36}
                    className="rounded-full mt-1"
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
