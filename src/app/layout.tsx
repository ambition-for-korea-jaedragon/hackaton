import type { Metadata, Viewport } from "next";
import { Bagel_Fat_One, Hanken_Grotesk } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const bagel = Bagel_Fat_One({ weight: "400", subsets: ["latin"], variable: "--font-bagel" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken" });

export const metadata: Metadata = {
  title: "muselook — copy the look, keep your tone",
  description:
    "Upload a K-pop idol makeup look and see it on your own skin tone, with the K-beauty products and step-by-step routine to recreate it.",
  applicationName: "muselook",
  appleWebApp: { capable: true, title: "muselook", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#f6f4f9",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bagel.variable} ${hanken.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
