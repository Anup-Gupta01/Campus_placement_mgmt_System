"use client";

import {
  Bell, Briefcase, Calendar, TrendingUp, Award, Search, Filter,
  ExternalLink, MapPin, IndianRupee, Clock, CheckCircle2, Loader2,
  FileText, ChevronRight, AlertCircle, Users, Sparkles, Zap,
  ArrowUpRight, Building2, Star
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Opportunity = {
  _id: string;
  companyName: string;
  role: string;
  location: string;
  package: string;
  type: string;
  minCGPA: number;
  eligibleBranches: string[];
  applicationDeadline: string;
  createdAt: string;
  description: string;
};

type RecentApp = {
  _id: string;
  company: string;
  role: string;
  status: string;
  progress: number;
  appliedOn: string;
  opportunityId: string;
};

type Stats = {
  applications: number;
  interviews: number;
  offers: number;
  profileScore: number;
};

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    Applied:      "bg-blue-100 text-blue-700",
    Shortlisted:  "bg-emerald-100 text-emerald-700",
    "OA Pending": "bg-orange-100 text-orange-700",
    Interview:    "bg-purple-100 text-purple-700",
    Selected:     "bg-green-100 text-green-700",
    Rejected:     "bg-red-100 text-red-600",
  };
  return map[status] || "bg-slate-100 text-slate-600";
}

function getProgressColor(status: string) {
  if (status === "Selected") return "bg-emerald-500";
  if (status === "Rejected") return "bg-red-400";
  return "bg-blue-600";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function getDeadlineUrgency(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days <= 3) return { label: `${days}d left`, cls: "text-red-600 bg-red-50" };
  if (days <= 7) return { label: `${days}d left`, cls: "text-orange-600 bg-orange-50" };
  return { label: `${days}d left`, cls: "text-slate-500 bg-slate-100" };
}

export default function StudentDashboard() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("Student");
  const [stats, setStats] = useState<Stats>({ applications: 0, interviews: 0, offers: 0, profileScore: 75 });
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOpps, setLoadingOpps] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.user) setFirstName(d.user.firstName || "Student"); });

    fetch("/api/student/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.stats) setStats(d.stats);
        if (d.recentApplications) {
          setRecentApps(d.recentApplications);
          setAppliedIds(new Set(d.recentApplications.map((a: RecentApp) => a.opportunityId)));
        }
        setLoadingStats(false);
      })
      .catch(() => setLoadingStats(false));

    fetch("/api/opportunities")
      .then(r => r.json())
      .then(d => { if (d.opportunities) setOpportunities(d.opportunities); setLoadingOpps(false); })
      .catch(() => setLoadingOpps(false));
  }, [router]);

  const handleApply = async (jobId: string) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    setApplying(jobId);
    try {
      const res = await fetch(`/api/student/apply/${jobId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedIds(prev => new Set([...prev, jobId]));
        setStats(prev => ({ ...prev, applications: prev.applications + 1 }));
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setApplying(null);
    }
  };

  const filteredOpps = opportunities.filter(opp => {
    const matchSearch = search === "" ||
      opp.companyName.toLowerCase().includes(search.toLowerCase()) ||
      opp.role.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" ||
      (typeFilter === "Full-time" && opp.type?.toLowerCase().includes("full")) ||
      (typeFilter === "Internship" && opp.type?.toLowerCase().includes("intern"));
    return matchSearch && matchType;
  });

  const statCards = [
    {
      label: "Applications",
      value: stats.applications,
      sub: "Total submitted",
      icon: <Briefcase className="h-5 w-5" />,
      gradient: "from-blue-500 to-blue-600",
      lightBg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Interviews",
      value: stats.interviews,
      sub: "Rounds scheduled",
      icon: <Calendar className="h-5 w-5" />,
      gradient: "from-purple-500 to-purple-600",
      lightBg: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Profile Score",
      value: `${stats.profileScore}%`,
      sub: "Completion rate",
      icon: <TrendingUp className="h-5 w-5" />,
      gradient: "from-emerald-500 to-teal-600",
      lightBg: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Offers",
      value: stats.offers,
      sub: stats.offers > 0 ? "🎉 Congratulations!" : "Keep applying!",
      icon: <Award className="h-5 w-5" />,
      gradient: "from-orange-500 to-amber-500",
      lightBg: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  // Profile progress calculation
  const profilePct = stats.profileScore;

  return (
    <div className="bg-[#F8FAFC] min-h-screen">

      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-blue-200 text-[13px] font-semibold mb-1">Welcome back 👋</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{firstName}</h1>
              <p className="text-blue-200 font-medium mt-2 text-[14px]">
                You have <span className="text-white font-bold">{filteredOpps.length}</span> new placement opportunities waiting.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/student/dashboard/resume-analyzer"
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[13px] font-semibold text-white transition-all">
                <Sparkles className="w-4 h-4" /> Analyze Resume
              </Link>
              <Link href="/student/dashboard/myapplications"
                className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-[13px] font-bold text-blue-700 hover:bg-blue-50 transition-all shadow-sm">
                <Briefcase className="w-4 h-4" /> My Applications
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-7 mb-8">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white rounded-[20px] border border-slate-100 shadow-md shadow-slate-100 p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{card.label}</p>
                {loadingStats
                  ? <div className="h-7 w-14 bg-slate-100 animate-pulse rounded mt-1" />
                  : <p className="text-[26px] font-extrabold text-slate-900 leading-tight">{card.value}</p>
                }
                <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link href="/student/dashboard/resume-analyzer"
            className="group flex items-center gap-4 bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-5 rounded-[20px] shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all">
            <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[14px] font-bold">AI Resume Analyzer</p>
              <p className="text-[12px] text-white/70 font-medium mt-0.5">Get instant feedback</p>
            </div>
            <ArrowUpRight className="w-4 h-4 ml-auto opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link href="/student/dashboard/myapplications"
            className="group flex items-center gap-4 bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-5 rounded-[20px] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
            <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[14px] font-bold">Track Applications</p>
              <p className="text-[12px] text-white/70 font-medium mt-0.5">Monitor your progress</p>
            </div>
            <ArrowUpRight className="w-4 h-4 ml-auto opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link href="/student/profile"
            className="group flex items-center gap-4 bg-white border border-slate-200 p-5 rounded-[20px] shadow-sm hover:shadow-md transition-all">
            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-900">Profile Score</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${profilePct}%` }} />
                </div>
                <span className="text-[11px] font-bold text-emerald-600">{profilePct}%</span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 ml-auto text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Opportunities */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm">

              {/* Section Header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[17px] font-bold text-slate-900">Available Opportunities</h2>
                    <p className="text-[13px] text-slate-400 font-medium mt-0.5">{filteredOpps.length} positions open for you</p>
                  </div>
                  <Link href="/student/dashboard/myapplications" className="text-[12px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    View applied <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Search + Filters */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search companies or roles..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[13px] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {["All", "Full-time", "Internship"].map(t => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`px-3.5 py-2 text-[12px] font-bold rounded-xl transition-all whitespace-nowrap ${
                          typeFilter === t
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div className="p-4 space-y-3">
                {loadingOpps ? (
                  [1,2,3].map(i => (
                    <div key={i} className="border border-slate-100 rounded-[16px] p-5 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-40 bg-slate-100 rounded" />
                          <div className="h-3 w-24 bg-slate-100 rounded" />
                          <div className="h-8 w-full bg-slate-100 rounded-xl" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : filteredOpps.length === 0 ? (
                  <div className="text-center py-16">
                    <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-bold">No opportunities found</p>
                    <p className="text-slate-400 text-sm mt-1">New drives are added regularly — check back soon!</p>
                  </div>
                ) : (
                  filteredOpps.map(opp => {
                    const alreadyApplied = appliedIds.has(opp._id);
                    const isApplying = applying === opp._id;
                    const deadline = new Date(opp.applicationDeadline);
                    const urgency = getDeadlineUrgency(opp.applicationDeadline);
                    const posted = timeAgo(opp.createdAt);

                    return (
                      <div key={opp._id}
                        className="border border-slate-200 rounded-[16px] p-5 hover:border-blue-300 hover:shadow-md hover:shadow-blue-600/5 transition-all bg-white group">
                        <div className="flex items-start gap-4">
                          {/* Logo placeholder */}
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[18px] font-extrabold flex-shrink-0 ${
                            alreadyApplied ? "bg-green-100 text-green-700" : "bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700"
                          }`}>
                            {opp.companyName.charAt(0)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                              <div>
                                <h3 className="text-[15px] font-extrabold text-slate-900">{opp.companyName}</h3>
                                <p className="text-[13px] font-semibold text-slate-500">{opp.role}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${urgency.cls}`}>
                                  {urgency.label}
                                </span>
                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${
                                  alreadyApplied ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                }`}>
                                  {alreadyApplied ? "Applied ✓" : "Open"}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="inline-flex items-center text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg gap-1">
                                <MapPin className="h-3 w-3 text-slate-400" />{opp.location}
                              </span>
                              <span className="inline-flex items-center text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg gap-1">
                                <IndianRupee className="h-3 w-3 text-slate-400" />{opp.package}
                              </span>
                              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                                opp.type?.toLowerCase().includes("intern")
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}>
                                {opp.type}
                              </span>
                              <span className="inline-flex items-center text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg gap-1 border border-slate-200">
                                <CheckCircle2 className="h-3 w-3 text-slate-400" />CGPA ≥ {opp.minCGPA}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                <Users className="w-3 h-3" /> Posted {posted}
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => !alreadyApplied && handleApply(opp._id)}
                                  disabled={alreadyApplied || isApplying}
                                  className={`px-4 py-1.5 text-[12px] font-bold rounded-xl transition-all ${
                                    alreadyApplied
                                      ? "bg-green-100 text-green-700 cursor-not-allowed"
                                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-[0.98]"
                                  }`}
                                >
                                  {isApplying
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" />
                                    : alreadyApplied ? "✓ Applied" : "Apply Now"}
                                </button>
                                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT column */}
          <div className="space-y-5">

            {/* Recent Applications */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900">Recent Applications</h2>
                  <p className="text-[12px] text-slate-400 font-medium mt-0.5">Your latest activity</p>
                </div>
                <Link href="/student/dashboard/myapplications" className="text-[11px] font-bold text-blue-600 flex items-center gap-0.5 hover:text-blue-700">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingStats ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-50 animate-pulse rounded-xl" />)}
                </div>
              ) : recentApps.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-7 h-7 text-slate-200" />
                  </div>
                  <p className="text-[12px] font-bold text-slate-500">No applications yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Apply to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApps.map(app => (
                    <div key={app._id}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-900 truncate">{app.company}</p>
                          <p className="text-[11px] text-slate-500 font-medium truncate">{app.role}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${getStatusColor(app.status)} flex-shrink-0 ml-2`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${getProgressColor(app.status)} transition-all duration-700`}
                          style={{ width: `${app.progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-semibold text-slate-400 mt-1.5">
                        {new Date(app.appliedOn).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Boost Profile Card */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[24px] p-6 text-white shadow-xl shadow-blue-600/20">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-300" />
                <h3 className="text-[14px] font-bold">Boost Your Profile</h3>
              </div>
              <p className="text-white/60 text-[12px] font-medium mb-5">Improve your placement chances</p>
              <div className="space-y-2.5">
                {[
                  { label: "Analyze Resume with AI", href: "/student/dashboard/resume-analyzer", icon: Sparkles },
                  { label: "Complete Your Profile",  href: "/student/profile",                  icon: Award },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-all group"
                  >
                    <item.icon className="w-4 h-4 text-white/70 group-hover:text-white" />
                    <span className="text-[12px] font-semibold text-white/90 group-hover:text-white flex-1">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
