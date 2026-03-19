"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const HIDDEN_LAYOUT_ROUTES = ["/student", "/admin"];

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideLayout = HIDDEN_LAYOUT_ROUTES.some(route => pathname.startsWith(route));

  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </>
  );
}
