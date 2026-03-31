"use client";

import { useState, useEffect } from "react";
import { Users, Briefcase, TrendingUp, Building2, Plus, Download, FileText, Search, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// Fallback data for charts when DB has no placed students yet
const fallbackTrend = [
  { month: "Sep", count: 0 }, { month: "Oct", count: 0 }, { month: "Nov", count: 0 },
  { month: "Dec", count: 0 }, { month: "Jan", count: 0 }, { month: "Feb", count: 0 }, { month: "Mar", count: 0 },
];
const fallbackBranch = [
  { name: "CSE", count: 0 }, { name: "IT", count: 0 }, { name: "ECE", count: 0 },
  { name: "ME", count: 0 }, { name: "Civil", count: 0 },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Applied:    "text-slate-600 bg-slate-100 border border-slate-200/60",
    Shortlisted:"text-blue-700 bg-blue-50 border border-blue-200/60",
    "OA Pending":"text-yellow-700 bg-yellow-50 border border-yellow-200/60",
    Interview:  "text-violet-700 bg-violet-50 border border-violet-200/60",
    Selected:   "text-emerald-700 bg-emerald-50 border border-emerald-200/60",
    Rejected:   "text-red-700 bg-red-50 border border-red-200/60",
  };
  return (
    <span className={`text-[11px] font-bold px-3 py-1 rounded-xl uppercase tracking-wide ${map[status] || "text-slate-600 bg-slate-100"}`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token") || "";
    fetch("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    const token = sessionStorage.getItem("token") || "";
    const res = await fetch("/api/admin/export-report", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `placement_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = data?.stats  || {};
  const trend  = data?.placementTrend?.length ? data.placementTrend : fallbackTrend;
  const branch = data?.branchWise?.length      ? data.branchWise     : fallbackBranch;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-black w-full font-sans pb-20">
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-slate-600 font-semibold text-sm">Loading dashboard...</p>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">TnP Admin Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1 text-[15px]">Training &amp; Placement Management Portal</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 flex items-center transition-all"
            >
              <Download className="w-4 h-4 mr-2" /> Export Report
            </button>
            <Link
              href="/admin/dashboard/postopportunity"
              className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_0_rgb(139,92,246,0.39)] flex items-center transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 mr-2" /> Post Opportunity
            </Link>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Students",       value: stats.totalStudents?.toLocaleString()  || "—", sub: "Registered students",     icon: Users,     bg: "bg-blue-50",    iconClr: "text-blue-600" },
            { label: "Active Opportunities", value: stats.activeOpportunities              || "—", sub: "Open job postings",        icon: Briefcase, bg: "bg-[#F3E8FF]",  iconClr: "text-[#8B5CF6]" },
            { label: "Placement Rate",       value: stats.placementRate                    || "—", sub: "Students placed",          icon: TrendingUp,bg: "bg-emerald-50", iconClr: "text-emerald-600" },
            { label: "Partner Companies",    value: stats.partnerCompanies                 || "—", sub: "Companies recruited",      icon: Building2, bg: "bg-orange-50",  iconClr: "text-orange-600" },
          ].map((card, i) => (
            <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">{card.label}</p>
                  <h3 className="text-[32px] font-extrabold text-slate-900 leading-none">{card.value}</h3>
                </div>
                <div className={`w-[52px] h-[52px] rounded-2xl ${card.bg} flex items-center justify-center ${card.iconClr}`}>
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[13px] font-semibold text-slate-400">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-[17px] font-bold text-slate-900">Placement Trend</h3>
            <p className="text-[14px] text-slate-500 mb-8 font-medium">Monthly placement statistics</p>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 13, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 13, fontWeight: 500 }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "3 3" }} />
                  <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 5, fill: "#8B5CF6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7, strokeWidth: 0, fill: "#7C3AED" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-[17px] font-bold text-slate-900">Branch-wise Placements</h3>
            <p className="text-[14px] text-slate-500 mb-8 font-medium">Placement statistics by department</p>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branch} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 13, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 13, fontWeight: 500 }} dx={-10} />
                  <Tooltip cursor={{ fill: "#F8FAFC" }} contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                  <Bar dataKey="count" fill="#E9D5FF" radius={[6, 6, 0, 0]} activeBar={{ fill: "#8B5CF6" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Active Opportunities Table */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 overflow-hidden">
          <div className="p-7 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-[18px] font-bold text-slate-900">Active Opportunities</h3>
              <p className="text-[14px] font-medium text-slate-500 mt-1">Currently open job postings</p>
            </div>
            <Link href="/admin/dashboard/opportunities" className="text-[13px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-5 py-2.5 rounded-xl transition-colors shadow-sm">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  {["Company & Role", "Package", "Deadline", "Applicants", "Shortlisted", "Selected", "Actions"].map(h => (
                    <th key={h} className={`px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 ${["Applicants","Shortlisted","Selected","Actions"].includes(h) ? "text-center" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.activeOpportunities?.length === 0 && (
                  <tr><td colSpan={7} className="px-7 py-10 text-center text-slate-400 font-medium">No active opportunities yet. <Link href="/admin/dashboard/postopportunity" className="text-purple-600 font-bold">Post one!</Link></td></tr>
                )}
                {(data?.activeOpportunities || []).map((job: any) => (
                  <tr key={job._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-7 py-5">
                      <p className="text-[15px] font-extrabold text-slate-900">{job.companyName}</p>
                      <p className="text-[13px] font-medium text-purple-600 mt-0.5">{job.role}</p>
                    </td>
                    <td className="px-7 py-5 text-[14px] font-bold text-slate-700">{job.package}</td>
                    <td className="px-7 py-5 text-[13px] font-semibold text-slate-600">
                      <Calendar className="w-3.5 h-3.5 inline mr-1.5 text-slate-400 mb-0.5" />
                      {new Date(job.applicationDeadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-7 py-5 text-center">
                      <span className="text-[13px] font-bold text-slate-700 bg-white border border-slate-200 shadow-sm px-3 py-1 rounded-lg">{job.applicants}</span>
                    </td>
                    <td className="px-7 py-5 text-center">
                      <span className="text-[13px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{job.shortlisted}</span>
                    </td>
                    <td className="px-7 py-5 text-center">
                      <span className="text-[13px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{job.selected}</span>
                    </td>
                    <td className="px-7 py-5 text-center">
                      <Link href={`/admin/dashboard/opportunities/${job._id}`} className="text-[12px] font-bold text-slate-600 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all bg-white shadow-sm inline-block">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Applications Table */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-[18px] font-bold text-slate-900">Recent Applications</h3>
              <p className="text-[14px] font-medium text-slate-500 mt-1">Latest student applications</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  className="pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all w-full sm:w-[280px]"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  {["Student", "Company & Role", "CGPA", "Branch", "Applied On", "Status", "Actions"].map(h => (
                    <th key={h} className={`px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 ${["CGPA","Branch","Actions"].includes(h) ? "text-center" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recentApplications?.length === 0 && (
                  <tr><td colSpan={7} className="px-7 py-10 text-center text-slate-400 font-medium">No applications yet.</td></tr>
                )}
                {(data?.recentApplications || []).map((app: any) => (
                  <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-7 py-5 font-bold text-[14.5px] text-slate-900 capitalize">
                      {app.student?.firstName} {app.student?.lastName}
                    </td>
                    <td className="px-7 py-5">
                      <p className="text-[14.5px] font-bold text-slate-900">{app.opportunity?.companyName}</p>
                      <p className="text-[12px] font-medium text-slate-500 mt-0.5">{app.opportunity?.role}</p>
                    </td>
                    <td className="px-7 py-5 text-center">
                      <span className="text-[13.5px] font-bold text-slate-700">{app.student?.cgpa || "—"}</span>
                    </td>
                    <td className="px-7 py-5 text-center">
                      <span className="text-[11px] font-bold text-slate-500 border border-slate-200 px-2.5 py-1 rounded bg-white shadow-sm uppercase tracking-wide">
                        {app.student?.branch || "—"}
                      </span>
                    </td>
                    <td className="px-7 py-5 text-[13.5px] font-semibold text-slate-600">
                      {app.appliedOn ? new Date(app.appliedOn).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-7 py-5">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-7 py-5 text-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                      <div className="flex justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
