import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "RLS Mismatch Detector",
  description: "Find where your app code and database RLS policies disagree.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas">
        <Header />
        {children}
      </body>
    </html>
  );
}