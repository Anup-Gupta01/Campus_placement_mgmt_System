"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Briefcase, MapPin, IndianRupee, Calendar,
  CheckCircle, Circle, FileText, ChevronRight, Trophy, X,
  Filter, Building2, ArrowLeft, Clock, Sparkles
} from "lucide-react";
import Link from "next/link";

type TimelineStep = {
  stage: string;
  date: string | null;
  isCurrent: boolean;
  isCompleted: boolean;
  note?: string;
};

type Application = {
  _id: string;
  status: string;
  progress: number;
  appliedOn: string;
  offerLetterUrl?: string;
  timeline: TimelineStep[];
  opportunity: {
    companyName: string;
    role: string;
    location: string;
    package: string;
    type: string;
  };
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  Applied:       { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"   },
  Shortlisted:   { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200"   },
  "OA Pending":  { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200" },
  Interview:     { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200" },
  Selected:      { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200"  },
  Rejected:      { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200"    },
};

function formatDate(d: string | null) {
  if (!d) return "TBD";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getProgressColor(status: string) {
  if (status === "Selected") return "bg-gradient-to-r from-emerald-400 to-green-500";
  if (status === "Rejected")  return "bg-gradient-to-r from-red-400 to-red-500";
  if (status === "Interview") return "bg-gradient-to-r from-purple-400 to-purple-600";
  return "bg-gradient-to-r from-blue-400 to-blue-600";
}

function ApplicationCard({ app }: { app: Application }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG["Applied"];
  const isSelected = app.status === "Selected";
  const isRejected = app.status === "Rejected";

  return (
    <div className={`bg-white rounded-[20px] border shadow-sm overflow-hidden transition-all hover:shadow-md ${
      isSelected ? "border-green-200 shadow-green-500/10"
      : isRejected ? "border-red-200"
      : "border-slate-200"
    }`}>
      {/* Top color stripe */}
      <div className={`h-1 w-full ${getProgressColor(app.status)}`} />

      <div className="p-5 sm:p-6">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-4">
            {/* Company Logo Initials */}
            <div className={`w-13 h-13 w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-xl font-extrabold flex-shrink-0 ${
              isSelected ? "bg-green-100 text-green-700"
              : isRejected ? "bg-red-100 text-red-600"
              : "bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700"
            }`}>
              {app.opportunity.companyName.charAt(0)}
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold text-slate-900 leading-tight">{app.opportunity.companyName}</h3>
              <p className="text-[13px] font-semibold text-slate-500 mt-0.5">{app.opportunity.role}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <MapPin className="h-3 w-3 text-slate-400" />{app.opportunity.location}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <IndianRupee className="h-3 w-3 text-slate-400" />{app.opportunity.package}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              {isSelected && <Trophy className="w-3 h-3" />}
              {isRejected && <X className="w-3 h-3" />}
              {app.status}
            </span>
            <p className="text-[11px] text-slate-400 font-medium">
              {formatDate(app.appliedOn)}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[12px] font-bold text-slate-600">Application Progress</span>
            <span className="text-[12px] font-bold text-slate-700">{app.progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full ${getProgressColor(app.status)} transition-all duration-700`}
              style={{ width: `${app.progress}%` }}
            />
          </div>
          <p className="text-[11px] font-medium text-slate-400 mt-1.5">
            {isRejected
              ? "Application closed"
              : `Current: ${app.timeline?.find(t => t.isCurrent)?.stage || app.status}`}
          </p>
        </div>

        {/* Toggle Timeline */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 text-[12px] font-bold text-slate-500 hover:text-blue-600 py-2 rounded-xl hover:bg-slate-50 transition-all"
        >
          <Clock className="w-3.5 h-3.5" />
          {expanded ? "Hide Timeline" : "View Application Timeline"}
          <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
        </button>
      </div>

      {/* Timeline Section */}
      {expanded && app.timeline?.length > 0 && (
        <div className="px-5 sm:px-6 pb-6 border-t border-slate-100 bg-slate-50/50">
          <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mt-5 mb-4">Application Timeline</h4>
          <div className="relative">
            {app.timeline.map((step, idx) => {
              const isLast = idx === app.timeline.length - 1;
              return (
                <div key={idx} className="flex gap-4 relative">
                  {/* Connecting line */}
                  {!isLast && (
                    <div className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${
                      step.isCompleted ? "bg-blue-300" : "bg-slate-200"
                    }`} />
                  )}
                  {/* Step dot */}
                  <div className="flex-shrink-0 z-10">
                    {step.isCompleted && !step.isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                    ) : step.isCurrent ? (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                        isRejected ? "bg-red-500" : "bg-orange-500"
                      }`}>
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 bg-white mt-0.5" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pb-5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[13px] font-bold ${
                        step.isCurrent ? (isRejected ? "text-red-600" : "text-orange-600")
                        : step.isCompleted ? "text-blue-600"
                        : "text-slate-400"
                      }`}>
                        {step.stage}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">{formatDate(step.date)}</span>
                    </div>
                    {step.note && (
                      <div className="mt-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span className="text-[11px] font-semibold text-amber-700">{step.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="px-5 sm:px-6 pb-5 flex gap-3">
        <button className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
          <FileText className="w-3.5 h-3.5" />View Details
        </button>
        {isSelected ? (
          <button
            onClick={() => app.offerLetterUrl ? window.open(app.offerLetterUrl, "_blank") : alert("Offer letter not available yet.")}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Trophy className="w-3.5 h-3.5" />View Offer Letter
          </button>
        ) : !isRejected && (
          <button className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Prepare for {app.timeline?.find(t => t.isCurrent)?.stage || "Next Round"}
          </button>
        )}
      </div>
    </div>
  );
}

const FILTERS = [
  { key: "all",      label: "All Applications" },
  { key: "active",   label: "Active"   },
  { key: "selected", label: "Selected" },
  { key: "rejected", label: "Rejected" },
];

export default function MyApplications() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("all");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    setLoading(true);
    fetch(`/api/student/applications?filter=${filter}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.applications) setApplications(d.applications); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter, router]);

  return (
    <div className="bg-[#F8FAFC] min-h-screen">

      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
          <Link href="/student/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-[13px] font-semibold mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">My Applications</h1>
          <p className="text-slate-400 font-medium mt-1.5 text-[14px]">
            Track the status of all your job applications
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                filter === f.key
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-[20px] border border-slate-200 p-6 animate-pulse">
                <div className="h-1 bg-slate-100 rounded-full mb-5" />
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/5" />
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-[20px] border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-[16px] font-bold text-slate-800 mb-2">No applications found</h3>
            <p className="text-[13px] text-slate-500 font-medium mb-6">
              {filter === "all"
                ? "You haven't applied to any opportunities yet."
                : `No ${filter} applications at this time.`}
            </p>
            <Link
              href="/student/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-[13px] font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              <Building2 className="w-4 h-4" />Browse Opportunities
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <ApplicationCard key={app._id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
