import type { Metadata } from "next";
import "./globals.css";
import "./portfolio.css";

export const metadata: Metadata = {
  icons: { icon: "/brand.png", apple: "/brand.png" },
  title: "Roblox Studio — Builder & Luau Portfolio",
  description: "Mapas, ambientes e sistemas em Luau para Roblox. Explore projetos de construção e desenvolvimento e converse sobre seu próximo jogo.",
  openGraph: {
    type: "website",
    title: "Roblox Studio — Builder & Luau Portfolio",
    description: "Construção de mundos, direção visual e desenvolvimento em Luau.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}<noscript><div className="noScriptNotice">Ative o JavaScript para explorar o portfólio. Contato: <a href="mailto:Simohayha931@hotmail.com">Simohayha931@hotmail.com</a></div></noscript></body>
    </html>
  );
}
