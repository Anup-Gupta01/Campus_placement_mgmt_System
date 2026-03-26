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
  ExternalLink,
  Loader2,
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

interface Notice {
  _id: string;
  title: string;
  description?: string;
  pdfUrl: string;
  createdAt: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function StudentNavbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]                   = useState<any>(null);
  const [dropOpen, setDropOpen]           = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [darkMode, setDarkMode]           = useState(false);
  const [notifOpen, setNotifOpen]         = useState(false);
  const [notices, setNotices]             = useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [noticesError, setNoticesError]   = useState("");
  const [seenCount, setSeenCount]         = useState(0);

  const dropRef   = useRef<HTMLDivElement>(null);
  const notifRef  = useRef<HTMLDivElement>(null);

  // Fetch user
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user); });
  }, []);

  // Fetch notices on mount
  useEffect(() => {
    setNoticesLoading(true);
    fetch("/api/student/notices")
      .then(r => r.json())
      .then(d => {
        if (d.notices) {
          setNotices(d.notices.slice(0, 5));
        }
      })
      .catch(() => setNoticesError("Failed to load notices"))
      .finally(() => setNoticesLoading(false));
  }, []);

  // Restore seen count from localStorage
  useEffect(() => {
    const saved = parseInt(localStorage.getItem("noticeSeenCount") || "0", 10);
    setSeenCount(saved);
  }, []);

  const unreadCount = Math.max(0, notices.length - seenCount);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close notice panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close menus on route change
  useEffect(() => { setMobileOpen(false); setDropOpen(false); setNotifOpen(false); }, [pathname]);

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    router.push("/login");
  };

  const handleNotifOpen = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next && notices.length > 0) {
      setSeenCount(notices.length);
      localStorage.setItem("noticeSeenCount", String(notices.length));
    }
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

            {/* ── Notification Bell with Dropdown ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleNotifOpen}
                className="hidden sm:flex relative w-9 h-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
                title="Notices"
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-[3px] border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notice Dropdown Panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="text-[13px] font-bold text-slate-800">Notices</span>
                      {notices.length > 0 && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded-full">
                          {notices.length}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="max-h-72 overflow-y-auto">
                    {noticesLoading ? (
                      <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-[12px]">Loading notices…</span>
                      </div>
                    ) : noticesError ? (
                      <div className="text-center py-8 text-[12px] text-red-400">{noticesError}</div>
                    ) : notices.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
                        <Bell className="w-8 h-8 opacity-30" />
                        <p className="text-[12px] font-medium">No notices yet</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-50">
                        {notices.map((notice, idx) => (
                          <li
                            key={notice._id}
                            className="px-4 py-3 hover:bg-slate-50 transition-colors group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                {/* "Recent" badge for the first/latest notice */}
                                {idx === 0 && (
                                  <span className="inline-block text-[9px] font-bold bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full mb-1">
                                    Recent
                                  </span>
                                )}
                                <p className="text-[12px] font-semibold text-slate-800 leading-snug truncate">
                                  {notice.title}
                                </p>
                                {notice.description && (
                                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                    {notice.description}
                                  </p>
                                )}
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {formatDate(notice.createdAt)}
                                </p>
                              </div>
                              <a
                                href={notice.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View PDF"
                                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-all mt-0.5"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Footer */}
                  {notices.length > 0 && (
                    <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50">
                      <p className="text-[11px] text-slate-400 text-center">
                        Showing {notices.length} most recent notice{notices.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

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
                {link.label === "Home"       && <Home  className="w-4 h-4 text-slate-400" />}
                {link.label === "About Us"   && <Info  className="w-4 h-4 text-slate-400" />}
                {link.label === "Contact Us" && <Phone className="w-4 h-4 text-slate-400" />}
                {link.label}
              </Link>
            ))}

            {/* Mobile Notices section */}
            <div className="border-t border-slate-100 pt-3 mt-2">
              <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Notices</p>
              {noticesLoading ? (
                <div className="flex items-center gap-2 px-4 py-2 text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[12px]">Loading…</span>
                </div>
              ) : notices.length === 0 ? (
                <p className="px-4 py-2 text-[12px] text-slate-400">No notices yet.</p>
              ) : (
                notices.slice(0, 3).map((notice, idx) => (
                  <a
                    key={notice._id}
                    href={notice.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  >
                    <Bell className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{notice.title}</span>
                    {idx === 0 && (
                      <span className="ml-auto text-[9px] bg-green-100 text-green-600 font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">New</span>
                    )}
                  </a>
                ))
              )}
            </div>

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
