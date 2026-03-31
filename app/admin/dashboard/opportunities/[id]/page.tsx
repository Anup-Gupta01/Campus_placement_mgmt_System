"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Search, Upload, Download, Users, CheckCircle2, Clock, XCircle, UserCheck, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const STATUS_OPTIONS = ["Applied", "Shortlisted", "OA Pending", "Interview", "Selected", "Rejected"];

const statusStyle: Record<string, string> = {
  Applied:      "text-slate-600  bg-slate-100   border-slate-200",
  Shortlisted:  "text-blue-700   bg-blue-50     border-blue-200",
  "OA Pending": "text-yellow-700 bg-yellow-50   border-yellow-200",
  Interview:    "text-violet-700 bg-violet-50   border-violet-200",
  Selected:     "text-emerald-700 bg-emerald-50 border-emerald-200",
  Rejected:     "text-red-700    bg-red-50      border-red-200",
};

function SkillTag({ skill }: { skill: string }) {
  return <span className="px-2 py-0.5 text-[11px] font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg">{skill.trim()}</span>;
}

export default function ManageApplications() {
  const params   = useParams();
  const oppId    = params.id as string;
  const [opp, setOpp]             = useState<any>(null);
  const [stats, setStats]         = useState<any>({});
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updating, setUpdating]   = useState<string | null>(null);

  const fetchOpp = useCallback(async () => {
    const token = sessionStorage.getItem("token") || "";
    const res = await fetch(`/api/admin/opportunities/${oppId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d   = await res.json();
    setOpp(d.opportunity);
    setStats(d.stats || {});
  }, [oppId]);

  const fetchApplicants = useCallback(async () => {
    const token = sessionStorage.getItem("token") || "";
    const res = await fetch(`/api/admin/opportunities/${oppId}/applicants?status=${statusFilter}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d   = await res.json();
    setApplicants(d.applicants || []);
    setLoading(false);
  }, [oppId, statusFilter]);

  useEffect(() => {
    setLoading(true);
    fetchOpp();
    fetchApplicants();
  }, [fetchOpp, fetchApplicants]);

  const updateStatus = async (appId: string, newStatus: string) => {
    setUpdating(appId);
    const token = sessionStorage.getItem("token") || "";
    await fetch(`/api/admin/applications/${appId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
    // Re-fetch stats to update header counts
    fetchOpp();
    setUpdating(null);
  };

  const handleExportCSV = async () => {
    const rows = applicants.map(a => [
      `${a.student?.firstName} ${a.student?.lastName}`,
      a.student?.email,
      a.student?.branch,
      a.student?.cgpa,
      a.status,
      new Date(a.appliedOn).toLocaleDateString(),
    ].join(","));
    const csv = ["Name,Email,Branch,CGPA,Status,Applied On", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `applicants_${opp?.companyName || "export"}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = applicants.filter(a => {
    const s = a.student || {};
    if (!search) return true;
    return `${s.firstName} ${s.lastName} ${s.email} ${s.branch}`.toLowerCase().includes(search.toLowerCase());
  });

  const statCards = [
    { label: "Total Applicants", value: stats.totalApplicants, icon: Users,      color: "text-slate-700",   bg: "bg-slate-50",   border: "border-slate-200" },
    { label: "Shortlisted",      value: stats.shortlisted,     icon: CheckCircle2,color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200"   },
    { label: "In Interview",     value: stats.inInterview,     icon: Clock,       color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200" },
    { label: "Selected",         value: stats.selected,        icon: UserCheck,   color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    { label: "Rejected",         value: stats.rejected,        icon: XCircle,     color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200"    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-10 w-full">

        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard/opportunities" className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to All Opportunities
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {opp ? `${opp.companyName} — ${opp.role}` : "Loading..."}
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-[15px]">Manage applicants and update statuses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((card, i) => (
            <div key={i} className={`bg-white rounded-[20px] border ${card.border} shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-5`}>
              <p className={`text-3xl font-extrabold ${card.color}`}>{card.value ?? 0}</p>
              <p className="text-[12px] font-semibold text-slate-500 mt-1.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applicants..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all shadow-sm" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 shadow-sm">
            <option value="All">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-[13px] font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-7 border-b border-slate-100">
            <h3 className="text-[18px] font-bold text-slate-900">All Applicants ({filtered.length})</h3>
            <p className="text-[14px] text-slate-500 font-medium mt-1">Review and update application statuses</p>
          </div>
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    {["Student Details", "Contact", "Branch", "CGPA", "Skills", "Applied On", "Status", "Actions"].map(h => (
                      <th key={h} className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="px-7 py-16 text-center text-slate-400 font-medium">No applicants found.</td></tr>
                  )}
                  {filtered.map((app: any) => {
                    const s = app.student || {};
                    const skills = (s.skills || []).slice(0, 2);
                    const extraSkills = (s.skills || []).length - 2;
                    const resumeUrl = s.resumes?.[s.resumes.length - 1]?.url || s.resumeUrl;
                    return (
                      <tr key={app._id} className={`hover:bg-slate-50/30 transition-colors ${app.status === "Selected" ? "bg-emerald-50/30" : app.status === "Rejected" ? "bg-red-50/20" : ""}`}>
                        <td className="px-5 py-4">
                          <p className="text-[14px] font-extrabold text-slate-900 capitalize">{s.firstName} {s.lastName}</p>
                          {resumeUrl && (
                            <a href={resumeUrl} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 mt-1 transition-colors">
                              <FileText className="w-3 h-3" /> View Resume
                            </a>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[12px] text-slate-600 font-medium">{s.email}</p>
                          <p className="text-[12px] text-slate-500 font-medium mt-0.5">{s.mobileNo ? `+91 ${s.mobileNo}` : "—"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[11px] font-bold text-slate-500 border border-slate-200 px-2.5 py-1 rounded bg-white shadow-sm uppercase">{s.branch || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[14px] font-extrabold text-slate-800">{s.cgpa || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {skills.map((sk: string) => <SkillTag key={sk} skill={sk} />)}
                            {extraSkills > 0 && <span className="px-2 py-0.5 text-[11px] font-bold text-slate-500 bg-slate-100 rounded-lg">+{extraSkills}</span>}
                            {!s.skills?.length && <span className="text-[12px] text-slate-400">—</span>}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[12px] font-semibold text-slate-600">
                          {app.appliedOn ? new Date(app.appliedOn).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative">
                            <select
                              value={app.status}
                              disabled={updating === app._id}
                              onChange={e => updateStatus(app._id, e.target.value)}
                              className={`text-[12px] font-bold px-3 py-1.5 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition-all pr-7 ${statusStyle[app.status] || "text-slate-600 bg-slate-100 border-slate-200"} ${updating === app._id ? "opacity-60" : ""}`}
                            >
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Link href={`/student/profile?id=${s._id}`}
                            className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all bg-white shadow-sm">
                            <ExternalLink className="w-3.5 h-3.5" /> View Profile
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
