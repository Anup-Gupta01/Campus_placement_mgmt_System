"use client";

import StudentNavbar from "@/components/StudentNavbar";
import Footer from "@/components/Footer";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans">
      {/* Sticky top navbar */}
      <StudentNavbar />

      {/* Page content grows to fill remaining space */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer always at bottom */}
      <Footer />
    </div>
  );
}
