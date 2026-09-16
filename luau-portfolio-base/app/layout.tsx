import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Builder & Luau Portfolio",
  description: "Roblox Studio portfolio focused on building, with a separate Luau development section.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
