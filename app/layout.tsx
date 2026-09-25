import type { Metadata, Viewport } from "next";
import "@fontsource/pixelify-sans/400.css";
import "@fontsource/pixelify-sans/600.css";
import "@fontsource/tiny5/400.css";
import "@fontsource/old-standard-tt/400.css";
import "@fontsource/old-standard-tt/400-italic.css";
import "@fontsource/bad-script/400.css";
import "@fontsource/marck-script/400.css";
import "./globals.css";

import { content } from "@/content";
import { MusicProvider } from "@/components/music/MusicProvider";
import { MusicPlayer } from "@/components/music/MusicPlayer";

export const metadata: Metadata = {
  title: `for ${content.him.replace(/[[\]]/g, "")}`,
  description: "one month<3",
};

export const viewport: Viewport = {
  themeColor: "#0e0a08",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MusicProvider>
          {children}
          <MusicPlayer />
        </MusicProvider>
        <div className="vignette" aria-hidden />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
