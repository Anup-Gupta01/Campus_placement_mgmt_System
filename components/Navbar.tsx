import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5 sm:px-12 sticky top-0 z-50">
      <Link href="/" className="flex items-center space-x-2">
        <GraduationCap className="h-8 w-8 text-indigo-600" strokeWidth={2.5} />
        <span className="text-2xl font-bold tracking-tight text-indigo-600">PlacementPro</span>
      </Link>
      <div className="flex items-center space-x-6">
        <Link href="/login" className="text-[15px] font-semibold text-slate-600 transition-colors hover:text-indigo-600">
          Login
        </Link>
        <Link href="/signup" className="rounded-xl bg-indigo-600 px-6 py-3 text-[15px] font-bold text-white transition-all shadow-md shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-indigo-500/40">
          Get Started
        </Link>
      </div>
    </nav>
  );
}
