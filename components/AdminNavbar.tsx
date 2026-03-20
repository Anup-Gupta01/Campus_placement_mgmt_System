"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  Bell,
  LayoutDashboard,
  Briefcase,
  Plus,
  Users,
  FileText,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Settings,
} from "lucide-react";

const adminDropdownItems = [
  { label: "Dashboard",            href: "/admin/dashboard",                        icon: LayoutDashboard },
  { label: "All Opportunities",    href: "/admin/dashboard/opportunities",           icon: Briefcase },
  { label: "Post Opportunity",     href: "/admin/dashboard/postopportunity",         icon: Plus },
  { label: "Manage Applications",  href: "/admin/dashboard/opportunities",           icon: Users },
  { label: "Notices",              href: "/admin/dashboard/notices",                 icon: FileText },
];

export default function AdminNavbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin]           = useState<any>(null);
  const [dropOpen, setDropOpen]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount]                = useState(3);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.user) setAdmin(d.user); });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    router.push("/login");
  };

  const initials = admin
    ? `${admin.firstName?.charAt(0) || ""}${admin.lastName?.charAt(0) || ""}`.toUpperCase()
    : "A";

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200/70 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md shadow-purple-600/25 group-hover:shadow-purple-600/40 transition-shadow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[14px] font-extrabold text-slate-900 leading-none tracking-tight">PlacementPro</p>
              <p className="text-[10px] text-purple-600 font-bold mt-0.5">TnP Admin</p>
            </div>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden lg:flex items-center gap-1">
            {[
              { label: "Dashboard",      href: "/admin/dashboard" },
              { label: "Opportunities",  href: "/admin/dashboard/opportunities" },
              { label: "Notices",        href: "/admin/dashboard/notices" },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-purple-600 bg-purple-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin/dashboard/postopportunity"
              className="ml-2 px-4 py-2 text-[13px] font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Post Opportunity
            </Link>
          </div>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all">
              <Bell className="w-[18px] h-[18px]" />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(o => !o)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-slate-100 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[12px] font-extrabold shadow-md shadow-purple-500/25 flex-shrink-0">
                  {initials}
                </div>
                {admin && (
                  <div className="hidden md:block text-left">
                    <p className="text-[12px] font-bold text-slate-800 leading-tight capitalize">{admin.firstName}</p>
                    <p className="text-[10px] text-purple-600 font-bold">Admin</p>
                  </div>
                )}
                <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`} />
              </button>

              {/* ── Dropdown Menu ── */}
              {dropOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-100 py-2 z-50">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-slate-100 mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[13px] font-extrabold flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 truncate capitalize">
                          {admin ? `${admin.firstName} ${admin.lastName}` : "Admin"}
                        </p>
                        <p className="text-[11px] text-purple-600 font-semibold">TnP Administrator</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{admin?.email || ""}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  {adminDropdownItems.map(item => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setDropOpen(false)}
                        className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all group ${
                          active
                            ? "bg-purple-50 text-purple-600"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          active ? "bg-purple-100" : "bg-slate-100 group-hover:bg-slate-200"
                        }`}>
                          <item.icon className={`w-3.5 h-3.5 ${active ? "text-purple-600" : "text-slate-500"}`} />
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
            {adminDropdownItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-all group"
              >
                <item.icon className="w-4 h-4 text-slate-400 group-hover:text-purple-500" />
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
        )}
      </div>
    </nav>
  );
}
