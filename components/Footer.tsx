import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 pt-20 pb-10 px-6 sm:px-12">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
        
        {/* Brand Col */}
        <div className="md:col-span-5 pr-8">
          <div className="flex items-center space-x-2 mb-6">
            <GraduationCap className="h-8 w-8 text-indigo-500" strokeWidth={2.5} />
            <span className="text-2xl font-bold tracking-tight text-white">PlacementPro</span>
          </div>
          <p className="text-slate-400 text-[15px] leading-relaxed max-w-sm mb-8">
            Empowering students and universities to streamline the campus placement journey with intelligent tools and unified tracking.
          </p>
        </div>

        <div className="md:col-span-1 border-r border-slate-800 hidden md:block"></div>
        
        {/* Links Cols */}
        <div className="md:col-span-3">
          <h4 className="text-white font-bold mb-6 text-lg tracking-wide">Portals</h4>
          <ul className="space-y-4 font-medium text-[15px]">
            <li><Link href="/login" className="text-slate-400 hover:text-white transition-colors">Student Login</Link></li>
            <li><Link href="/admin/login" className="text-slate-400 hover:text-white transition-colors">TnP Admin Login</Link></li>
            <li><Link href="/signup" className="text-slate-400 hover:text-white transition-colors">Create Account</Link></li>
          </ul>
        </div>
        
        <div className="md:col-span-3">
          <h4 className="text-white font-bold mb-6 text-lg tracking-wide">Legal & Support</h4>
          <ul className="space-y-4 font-medium text-[15px]">
            <li><Link href="/" className="text-slate-400 hover:text-white transition-colors">Home Features</Link></li>
            <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl mt-16 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between text-[14px] font-medium text-slate-500">
        <p>© {new Date().getFullYear()} PlacementPro. All rights reserved.</p>
        <div className="mt-4 md:mt-0">
          <span>Made with ✨ and Next.js</span>
        </div>
      </div>
    </footer>
  );
}
