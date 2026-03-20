"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, Calendar, Users, MoreVertical, CheckCircle, XCircle } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[12px] font-bold px-3 py-1 rounded-lg ${
      status === "Open" ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-slate-500 bg-slate-100 border border-slate-200"
    }`}>
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    "Full-time": "text-blue-700 bg-blue-50 border border-blue-200",
    "Internship": "text-orange-700 bg-orange-50 border border-orange-200",
    "Contract":   "text-purple-700 bg-purple-50 border border-purple-200",
  };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${map[type] || "text-slate-600 bg-slate-100"}`}>
      {type}
    </span>
  );
}

export default function AllOpportunities() {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("All");
  const [search, setSearch]   = useState("");
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const fetchData = (statusFilter: string) => {
    setLoading(true);
    fetch(`/api/admin/opportunities?status=${statusFilter}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(filter); }, [filter]);

  const handleStatusToggle = async (oppId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Open" ? "Closed" : "Open";
    await fetch(`/api/admin/opportunities/${oppId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchData(filter);
    setActionMenu(null);
  };

  const summary = data?.summary || {};
  const filtered = (data?.opportunities || []).filter((o: any) =>
    !search || o.companyName.toLowerCase().includes(search.toLowerCase()) || o.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">All Opportunities</h1>
            <p className="text-slate-500 font-medium mt-1 text-[15px]">Manage all job and internship postings</p>
          </div>
          <Link href="/admin/dashboard/postopportunity"
            className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_0_rgb(139,92,246,0.39)] flex items-center transition-all active:scale-[0.98] self-start sm:self-auto">
            <Plus className="w-4 h-4 mr-2" /> Post New Opportunity
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Opportunities", value: summary.total        || 0, color: "text-slate-900" },
            { label: "Active",              value: summary.active       || 0, color: "text-emerald-600" },
            { label: "Closed",              value: summary.closed       || 0, color: "text-slate-500" },
            { label: "Total Applicants",    value: summary.totalApplicants || 0, color: "text-violet-600" },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-[20px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 text-center">
              <p className={`text-3xl font-extrabold ${card.color}`}>{card.value.toLocaleString()}</p>
              <p className="text-[13px] font-semibold text-slate-500 mt-2">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by company or role..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all shadow-sm" />
          </div>
          <div className="flex gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {["All", "Open", "Closed"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-5 py-2 text-[13px] font-bold rounded-lg transition-all ${
                  filter === f ? "bg-[#8B5CF6] text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-7 border-b border-slate-100">
            <h3 className="text-[18px] font-bold text-slate-900">
              Opportunities List ({filtered.length})
            </h3>
            <p className="text-[14px] text-slate-500 font-medium mt-1">View and manage all posted opportunities</p>
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
                    {["Company & Role", "Type", "Package", "Location", "Deadline", "Applicants", "Status", "Actions"].map(h => (
                      <th key={h} className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="px-7 py-16 text-center text-slate-400 font-medium">
                      No opportunities found. <Link href="/admin/dashboard/postopportunity" className="text-purple-600 font-bold">Post one!</Link>
                    </td></tr>
                  )}
                  {filtered.map((opp: any) => (
                    <tr key={opp._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-[14px] flex-shrink-0">
                            {opp.companyName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[14px] font-extrabold text-slate-900">{opp.companyName}</p>
                            <p className="text-[12px] font-semibold text-purple-600">{opp.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><TypeBadge type={opp.type} /></td>
                      <td className="px-6 py-4 text-[14px] font-bold text-slate-700">{opp.package}</td>
                      <td className="px-6 py-4 text-[13px] font-semibold text-slate-600">{opp.location}</td>
                      <td className="px-6 py-4 text-[13px] font-semibold text-slate-600">
                        <Calendar className="w-3.5 h-3.5 inline mr-1.5 text-slate-400 mb-0.5" />
                        {new Date(opp.applicationDeadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-[13px] font-bold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-slate-400" /> {opp.applicants}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{opp.shortlisted} shortlisted</p>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={opp.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/dashboard/opportunities/${opp._id}`}
                            className="text-[12px] font-bold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all bg-white shadow-sm">
                            Manage
                          </Link>
                          <div className="relative">
                            <button onClick={() => setActionMenu(actionMenu === opp._id ? null : opp._id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {actionMenu === opp._id && (
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20">
                                <button onClick={() => handleStatusToggle(opp._id, opp.status)}
                                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-semibold text-left transition-colors ${
                                    opp.status === "Open" ? "hover:bg-red-50 text-red-600" : "hover:bg-emerald-50 text-emerald-600"
                                  }`}>
                                  {opp.status === "Open" ? <><XCircle className="w-4 h-4" /> Mark Closed</> : <><CheckCircle className="w-4 h-4" /> Reopen</>}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
