import AdminClient from "@/components/AdminClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Administração do portfólio", robots: { index: false, follow: false } };

export default function DevPage() {
  return <AdminClient />;
}
