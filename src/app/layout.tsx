import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Portfolio of Jamal Lyons, a Backend Software Engineer at ClarityText and Computer Science student at Georgia State University.";

export const metadata: Metadata = {
  title: "Jamal Lyons - Backend Software Engineer",
  description,
  openGraph: {
    title: "Jamal Lyons - Backend Software Engineer",
    description,
    url: "https://www.jamallyons.com",
    siteName: "jamallyons.com",
    images: [
      {
        url: "https://gist.github.com/user-attachments/assets/fc8bc581-6c41-4731-9591-efb5f22f7655",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jamal Lyons - Backend Software Engineer",
    description,
    images: [
      "https://gist.github.com/user-attachments/assets/fc8bc581-6c41-4731-9591-efb5f22f7655",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`bg-[#0a0a0f] text-purple-300 ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="grid-background" />
        {children}
      </body>
      <Script
        async
        src="https://beamanalytics.b-cdn.net/beam.min.js"
        data-token="bf73f66b-6d2b-446b-88bd-d7feda0d8f94"
      />
    </html>
  );
}
