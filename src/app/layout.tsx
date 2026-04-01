import type { Metadata } from "next";
import "./globals.css";
import { StateProvider } from "@/utils/stateContext";

export const metadata: Metadata = {
  title: "Toneify",
  description: "Turn TikTok sounds into custom iPhone and Android ringtones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <StateProvider>{children}</StateProvider>
      </body>
    </html>
  );
}
