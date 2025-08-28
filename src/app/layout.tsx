//Wurzel-Layout der App. Markiert als Client-Komponente und wrappt alle Seiten in UserProvider, ChannelProvider und DirectProvider, damit überall User-, Channel- und DM-Zustand verfügbar sind.

import "./globals.css";
import Providers from "./providers";

export const metadata = {
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
