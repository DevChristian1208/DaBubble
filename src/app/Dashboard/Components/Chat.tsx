"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatWindow from "./ChatWindow";

export default function ChatApp() {
  return (
    <div className="h-screen bg-[#E8E9FF] flex flex-col">
      <Header />
      <div className="flex flex-1 pt-[30px] gap-[20px]">
        <Sidebar />
        <div className="flex-1 pr-5">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
