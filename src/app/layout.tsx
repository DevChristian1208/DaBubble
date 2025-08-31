import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "DABubble",
  description: "Slack-ähnlicher Chat mit Channels und Direktnachrichten",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-[#E8E9FF]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
