import Link from "next/link";
import { GraduationCap, Linkedin, Instagram } from "lucide-react";

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
          <div>
            <span className="block text-white font-bold mb-4 tracking-wide text-[14px]">Follow Us</span>
            <div className="flex items-center space-x-3">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:bg-[#0A66C2] hover:text-white transition-all shadow-sm group">
                <Linkedin className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-all shadow-sm group">
                <svg className="w-[18px] h-[18px] fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:bg-[#E1306C] hover:text-white transition-all shadow-sm group">
                <Instagram className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
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
          <span>Made by Anup Gupta</span>
        </div>
      </div>
    </footer>
  );
}
