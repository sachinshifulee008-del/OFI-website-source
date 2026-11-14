import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orbital Flame Intelligence — Microgravity Combustion Research",
  description:
    "An independent scientific research intelligence platform for exploring, visualizing, comparing and interpreting NASA microgravity combustion research, with FLARE AI (Fire & Laboratory Analysis Research Engine). NASA Space Apps Challenge 2026.",
  keywords: [
    "NASA",
    "Space Apps Challenge 2026",
    "microgravity combustion",
    "flame in freefall",
    "fire safety",
    "FLARE AI",
    "Orbital Flame Intelligence",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Orbital Flame Intelligence",
    description:
      "Understanding fire beyond gravity — evidence-grounded intelligence for NASA microgravity combustion research.",
    siteName: "Orbital Flame Intelligence",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050914",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
