import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luau Developer Portfolio",
  description: "Portfólio de desenvolvimento Luau para Roblox Studio.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
