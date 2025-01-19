import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Jamal Lyons - Backend Software Engineer",
  description:
    "Portfolio of Jamal Lyons, a Backend Software Engineer and Computer Science student at Georgia State University.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`bg-black text-purple-300 ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
