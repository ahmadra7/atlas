import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./admin.css";

export const metadata: Metadata = {
  title: "کنسول کاتالوگ | سرآشپز هوشمند",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-shell min-h-svh text-[15px]">{children}</div>;
}
