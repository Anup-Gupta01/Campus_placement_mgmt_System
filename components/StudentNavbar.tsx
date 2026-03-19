"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  Bell,
  Moon,
  Sun,
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Home,
  Info,
  Phone,
} from "lucide-react";

const dropdownItems = [
  { label: "My Profile",       href: "/student/profile",                     icon: User },
  { label: "My Dashboard",     href: "/student/dashboard",                   icon: LayoutDashboard },
  { label: "My Applications",  href: "/student/dashboard/myapplications",    icon: Briefcase },
  { label: "Resume Analyzer",  href: "/student/dashboard/resume-analyzer",   icon: Sparkles },
];

const navLinks = [
  { label: "Home",       href: "/" },
  { label: "About Us",   href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export default function StudentNavbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]               = useState<any>(null);
  const [dropOpen, setDropOpen]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [darkMode, setDarkMode]       = useState(false);
  const [notifCount]                  = useState(2);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user); });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [pathname]);

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    router.push("/login");
  };

  const initials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase()
    : "S";

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link href="/student/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/25 group-hover:shadow-blue-600/40 transition-shadow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[14px] font-extrabold text-slate-900 leading-none tracking-tight">PlacementPro</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Student Portal</p>
            </div>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                  pathname === link.href
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-2">

            {/* Theme toggle */}
            <button
              onClick={() => setDarkMode(d => !d)}
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            {/* Notification Bell */}
            <button className="hidden sm:flex relative w-9 h-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all">
              <Bell className="w-[18px] h-[18px]" />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(o => !o)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-slate-100 transition-all group"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[12px] font-extrabold shadow-md shadow-blue-500/20 flex-shrink-0">
                  {initials}
                </div>
                {/* Name (desktop) */}
                {user && (
                  <div className="hidden md:block text-left">
                    <p className="text-[12px] font-bold text-slate-800 leading-tight capitalize">
                      {user.firstName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium capitalize">Student</p>
                  </div>
                )}
                <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`} />
              </button>

              {/* ─── Dropdown Menu ─── */}
              {dropOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-slate-100 mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[13px] font-extrabold flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 truncate capitalize">
                          {user ? `${user.firstName} ${user.lastName}` : "Student"}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium truncate">{user?.email || ""}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  {dropdownItems.map(item => {
                    const active = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDropOpen(false)}
                        className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all group ${
                          active
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          active ? "bg-blue-100" : "bg-slate-100 group-hover:bg-slate-200"
                        }`}>
                          <item.icon className={`w-3.5 h-3.5 ${active ? "text-blue-600" : "text-slate-500"}`} />
                        </div>
                        {item.label}
                      </Link>
                    );
                  })}

                  {/* Divider + Logout */}
                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all group"
                      style={{ width: "calc(100% - 16px)" }}
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors">
                        <LogOut className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-500 transition-colors" />
                      </div>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-100 py-3 pb-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                {link.label === "Home" && <Home className="w-4 h-4 text-slate-400" />}
                {link.label === "About Us" && <Info className="w-4 h-4 text-slate-400" />}
                {link.label === "Contact Us" && <Phone className="w-4 h-4 text-slate-400" />}
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-100 pt-3 mt-2 space-y-1">
              {dropdownItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                >
                  <item.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all group"
              >
                <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
