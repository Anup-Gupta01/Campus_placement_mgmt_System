"use client";

import Link from "next/link";
import { GraduationCap, LogOut, User, ChevronDown, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []); // Run only once on mount

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <nav className="flex items-center border-b border-slate-100 bg-white px-6 py-4 sm:px-12 sticky top-0 z-[100] w-full">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center space-x-2 shrink-0">
        <GraduationCap className="h-8 w-8 text-indigo-600" strokeWidth={2.5} />
        <span className="text-2xl font-extrabold tracking-tight text-indigo-600">PlacementPro</span>
      </Link>
      
      {/* Navigation Links - Pushed to the right */}
      <div className="hidden md:flex flex-1 items-center justify-end space-x-10 pr-10 border-r border-slate-100 mr-8">
        {navLinks.map(link => (
          <Link key={link.name} href={link.href} className={`text-[15px] font-bold transition-all duration-300 ${pathname === link.href ? "text-indigo-600" : "text-slate-500 hover:text-indigo-600 hover:-translate-y-[1px]"}`}>
            {link.name}
          </Link>
        ))}
      </div>
      
      {/* Spacer for Mobile when links are visually hidden */}
      <div className="md:hidden flex-1"></div>
      
      {/* Auth Portal */}
      <div className="flex items-center space-x-6 relative shrink-0">
        {loading ? (
           <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse"></div>
        ) : user ? (
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-3 focus:outline-none group">
              <div className="hidden sm:block text-right">
                <p className="text-[14px] font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{user.firstName} {user.lastName}</p>
                <p className="text-[12px] font-semibold text-slate-500 capitalize leading-tight mt-0.5">{user.role === 'admin' ? user.designation || 'TnP Admin' : user.branch || 'Student'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold overflow-hidden shadow-sm group-hover:border-indigo-300 transition-all uppercase">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}/>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-[260px] bg-white rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.1)] border border-slate-100 py-2 z-50 overflow-hidden transform origin-top-right transition-all">
                <div className="px-5 py-4 border-b border-slate-100 mb-1 bg-slate-50/50">
                  <p className="text-[15px] font-extrabold text-slate-900 truncate shadow-sm pb-1">{user.firstName} {user.lastName}</p>
                  <p className="text-[13px] font-semibold text-slate-500 truncate">{user.email}</p>
                  <div className="mt-3 inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-[11px] font-bold uppercase rounded-md tracking-wider">
                    {user.role} Account
                  </div>
                </div>
                <Link onClick={() => setDropdownOpen(false)} href={user.role === 'admin' ? "/admin/dashboard" : "/student/dashboard"} className="w-full px-5 py-3 text-left text-[14px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center">
                  <LayoutDashboard className="w-[18px] h-[18px] mr-3 text-slate-400"/> Dashboard
                </Link>
                <Link onClick={() => setDropdownOpen(false)} href={user.role === 'admin' ? "/admin/profile" : "/student/profile"} className="w-full px-5 py-3 text-left text-[14px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center">
                  <User className="w-[18px] h-[18px] mr-3 text-slate-400"/> Profile
                </Link>
                <div className="h-[1px] w-full bg-slate-100 my-1"></div>
                <button onClick={handleLogout} className="w-full px-5 py-3 text-left text-[14px] font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center">
                  <LogOut className="w-[18px] h-[18px] mr-3 text-red-400"/> Sign Out Permanently
                </button>
              </div>
            )}
            
            {/* Click away listener overlay */}
            {dropdownOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
            )}
          </div>
        ) : (
          <>
            <Link href="/login" className="text-[15px] font-bold text-slate-600 transition-colors hover:text-indigo-600">
              Login
            </Link>
            <Link href="/signup" className="rounded-xl bg-indigo-600 px-6 py-2.5 text-[14px] font-extrabold text-white transition-all shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] hover:bg-indigo-700 active:scale-[0.98] uppercase tracking-wide">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
