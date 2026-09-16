import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Builder & Luau Portfolio",
  description: "Portfólio Roblox Studio com foco em builder, programação separada e modo desenvolvedor privado.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
