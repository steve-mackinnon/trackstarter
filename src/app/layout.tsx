"use strict";

import { ThemeProvider } from "components/ThemeProvider";
import { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trackstarter",
  applicationName: "Trackstarter",
  description:
    "Music creation tool that generates short melodic ideas you can download as MIDI to inspire your next song.",
  keywords: [
    "music",
    "production",
    "ai",
    "gen",
    "midi",
    "generative",
    "synthesizer",
    "webaudio",
    "audio",
    "electronic",
  ],
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${orbitron.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
