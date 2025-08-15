import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "DABubble",
  description: "Teamkommunikation wie Slack – gebaut mit Next.js + Firebase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        {/* Global: UserProvider + ChannelProvider für ALLE Seiten */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
