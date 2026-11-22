import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Branvidia AI | Google Business Profile Optimizer",
  description:
    "Chat with Branvidia AI and get a free, AI-powered analysis of your Google Business Profile.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}