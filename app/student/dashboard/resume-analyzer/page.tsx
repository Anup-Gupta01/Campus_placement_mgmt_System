"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, FileText, Loader2, Star, Target, AlertCircle,
  CheckCircle, Lightbulb, Tag, Download, RotateCcw, Sparkles,
  TrendingUp, Award, ShieldCheck, ArrowLeft, Cpu, Zap, Info
} from "lucide-react";
import Link from "next/link";

type SectionScores = {
  contactInformation: number;
  summary: number;
  experience: number;
  education: number;
  skills: number;
  projects: number;
  formatting: number;
};

type BestFitRole = { role: string; match: number };

type Analysis = {
  overallScore: number;
  sectionScores: SectionScores;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  bestFitRoles: BestFitRole[];
  _fallback?: boolean;
};

const SECTION_LABELS: Record<keyof SectionScores, string> = {
  contactInformation: "Contact Information",
  summary:            "Summary / Objective",
  experience:         "Experience",
  education:          "Education",
  skills:             "Skills",
  projects:           "Projects",
  formatting:         "Formatting & ATS",
};

function getScoreConfig(score: number) {
  if (score >= 80) return { color: "#10b981", label: "Excellent", bg: "from-emerald-500/10 to-teal-500/5" };
  if (score >= 65) return { color: "#3b82f6", label: "Good",      bg: "from-blue-500/10 to-indigo-500/5" };
  if (score >= 45) return { color: "#f59e0b", label: "Fair",      bg: "from-amber-500/10 to-orange-500/5" };
  return              { color: "#ef4444",    label: "Needs Work", bg: "from-red-500/10 to-rose-500/5" };
}

function getBarColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 65) return "bg-blue-500";
  if (score >= 45) return "bg-amber-400";
  return "bg-red-400";
}

function ScoreCircle({ score }: { score: number }) {
  const cfg = getScoreConfig(score);
  const r = 56, stroke = 9;
  const nr = r - stroke / 2;
  const circ = 2 * Math.PI * nr;
  const offset = ((100 - score) / 100) * circ;

  return (
    <div className={`flex flex-col items-center justify-center w-48 h-48 rounded-full bg-gradient-to-br ${cfg.bg} border-2 border-white shadow-xl`}>
      <div className="relative w-[120px] h-[120px]">
        <svg width="120" height="120" className="-rotate-90">
          <circle stroke="#e2e8f0" fill="transparent" strokeWidth={stroke} r={nr} cx={60} cy={60} />
          <circle
            stroke={cfg.color}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={offset}
            r={nr}
            cx={60}
            cy={60}
            style={{ transition: "stroke-dashoffset 1.2s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[30px] font-extrabold" style={{ color: cfg.color }}>{score}</span>
          <span className="text-[10px] font-bold text-slate-400 tracking-wide">/ 100</span>
        </div>
      </div>
      <span className="text-[13px] font-bold mt-1" style={{ color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

export default function ResumeAnalyzer() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile]         = useState<File | null>(null);
  const [isDragging, setIsDrag] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) { setError("File too large — max 5MB."); return; }
    const ok = ["application/pdf","application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type);
    if (!ok) { setError("Only PDF, DOC, DOCX files are supported."); return; }
    setError(null); setFile(f); setAnalysis(null);
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const fmtBytes = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;

  const handleAnalyze = async () => {
    if (!file) return;
    const token = sessionStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    setLoading(true); setError(null);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/student/analyze-resume", {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const handleReset = () => { setFile(null); setAnalysis(null); setError(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const handleDownload = () => {
    if (!analysis) return;
    const lines = [
      "RESUME ANALYSIS REPORT",
      "=".repeat(40),
      `Overall Score: ${analysis.overallScore}/100`,
      "",
      "SECTION SCORES:",
      ...Object.entries(analysis.sectionScores).map(([k,v]) => `  ${SECTION_LABELS[k as keyof SectionScores]}: ${v}/100`),
      "", "STRENGTHS:",
      ...analysis.strengths.map(s => `  • ${s}`),
      "", "IMPROVEMENTS NEEDED:",
      ...analysis.improvements.map(i => `  • ${i}`),
      "", "MISSING KEYWORDS:", `  ${analysis.missingKeywords.join(", ")}`,
      "", "BEST-FIT ROLES:",
      ...analysis.bestFitRoles.map(r => `  • ${r.role} — ${r.match}% match`),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "resume_analysis_report.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">

      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-violet-800 text-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
          <Link href="/student/dashboard" className="inline-flex items-center gap-2 text-indigo-300 hover:text-white text-[13px] font-semibold mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">AI Resume Analyzer</h1>
              <p className="text-indigo-300 font-medium mt-1 text-[14px]">Powered by Google Gemini AI</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">

        {!analysis ? (
          <>
            {/* Upload Zone */}
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
              onDragLeave={() => setIsDrag(false)}
              className={`rounded-[24px] border-2 border-dashed p-12 sm:p-16 text-center mb-6 transition-all ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50 scale-[1.005]"
                  : "border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 hover:border-indigo-400 hover:bg-indigo-50/80"
              }`}
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <FileText className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mb-1">File Ready!</h2>
                  <div className="inline-flex items-center gap-3 bg-white border border-indigo-200 rounded-2xl px-5 py-3 mb-5 shadow-sm mt-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <div className="text-left">
                      <p className="text-[13px] font-bold text-slate-800">{file.name}</p>
                      <p className="text-[11px] text-slate-400">{fmtBytes(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[14px] font-bold rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center gap-2 mx-auto"
                  >
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing with AI...</> : <><Sparkles className="w-5 h-5" />Analyze Resume</>}
                  </button>
                  {!loading && (
                    <button onClick={handleReset} className="mt-3 text-[12px] font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 mx-auto">
                      <RotateCcw className="w-3 h-3" />Choose different file
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-indigo-100 flex items-center justify-center mx-auto mb-5">
                    <Upload className="w-8 h-8 text-indigo-500" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mb-2">Drop your resume here</h2>
                  <p className="text-[13px] text-slate-500 font-medium mb-6 max-w-sm mx-auto">
                    Our AI will analyze your resume and give you actionable feedback instantly
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[13px] font-bold rounded-2xl shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 transition-all inline-flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />Choose File
                  </button>
                  <p className="text-[11px] text-slate-400 font-medium mt-4">PDF, DOC, DOCX  ·  Max 5MB</p>
                </>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-[13px] font-semibold text-red-700">{error}</p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="bg-white border border-indigo-100 rounded-[20px] p-8 text-center shadow-sm mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  <span className="text-[14px] font-bold text-slate-800">AI is analyzing your resume...</span>
                </div>
                <p className="text-[12px] text-slate-400">Uploading, extracting text, and generating insights. Takes 15–30 seconds.</p>
                <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full w-3/4 animate-pulse" />
                </div>
              </div>
            )}

            {/* Feature Cards */}
            {!loading && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />, bg: "bg-indigo-50 border-indigo-100", iconBg: "bg-indigo-100", title: "ATS Optimization", desc: "Ensure your resume passes Applicant Tracking Systems" },
                  { icon: <Lightbulb className="w-6 h-6 text-purple-600" />,  bg: "bg-purple-50 border-purple-100", iconBg: "bg-purple-100", title: "Smart Suggestions",  desc: "AI-powered recommendations for quick improvement" },
                  { icon: <Zap className="w-6 h-6 text-emerald-600" />,       bg: "bg-emerald-50 border-emerald-100", iconBg: "bg-emerald-100", title: "Role Matching",     desc: "Discover which roles best match your profile" },
                ].map((f, i) => (
                  <div key={i} className={`border rounded-[18px] p-5 text-center ${f.bg}`}>
                    <div className={`w-12 h-12 ${f.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm`}>{f.icon}</div>
                    <h3 className="text-[14px] font-bold text-slate-900 mb-1">{f.title}</h3>
                    <p className="text-[12px] font-medium text-slate-500">{f.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* ════ RESULTS ════ */
          <div className="space-y-5">

            {/* Fallback banner */}
            {analysis._fallback && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-amber-800">Keyword-based Analysis Mode</p>
                  <p className="text-[12px] text-amber-700 mt-0.5">
                    The Gemini AI quota is currently exceeded. Your resume was evaluated using our built-in keyword scorer.
                    Results are still useful but may be less nuanced than full AI analysis. Try again later for AI-powered insights.
                  </p>
                </div>
              </div>
            )}

            {/* Score Header */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <ScoreCircle score={analysis.overallScore} />
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-[22px] font-extrabold text-slate-900 mb-1">Analysis Complete!</h2>
                  <p className="text-[13px] text-slate-500 font-medium mb-5">
                    {analysis._fallback
                      ? "Based on keyword analysis against industry standards and ATS criteria."
                      : "Based on AI review against industry standards and ATS criteria."}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <button onClick={handleReset}
                      className="px-4 py-2 border border-slate-200 text-slate-700 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2">
                      <RotateCcw className="w-3.5 h-3.5" />Analyze Another
                    </button>
                    <button onClick={handleDownload}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm">
                      <Download className="w-3.5 h-3.5" />Download Report
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Section Scores */}
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-900">Section Scores</h3>
                </div>
                <div className="space-y-4">
                  {Object.entries(analysis.sectionScores).map(([key, score]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[12px] font-semibold text-slate-700">{SECTION_LABELS[key as keyof SectionScores]}</span>
                        <span className="text-[12px] font-bold text-slate-600">{score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${getBarColor(score)} transition-all duration-700`} style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                {/* Strengths */}
                <div className="bg-white rounded-[24px] border border-emerald-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="text-[14px] font-bold text-slate-900">Strengths</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Star className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[12px] font-medium text-slate-700">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="bg-white rounded-[24px] border border-amber-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                    </div>
                    <h3 className="text-[14px] font-bold text-slate-900">Improvements</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {analysis.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[12px] font-medium text-slate-700">{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                  <Tag className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Missing Keywords</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Add these to boost your ATS score</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 text-[12px] font-semibold rounded-lg">{kw}</span>
                ))}
              </div>
            </div>

            {/* Best Fit Roles */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Best-Fit Roles</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Top matches based on your resume</p>
                </div>
              </div>
              <div className="space-y-4">
                {analysis.bestFitRoles.map((r, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 ${
                      i === 0 ? "bg-yellow-100 text-yellow-700"
                      : i === 1 ? "bg-slate-100 text-slate-600"
                      : "bg-orange-100 text-orange-700"
                    }`}>
                      #{i+1}
                    </div>
                    <span className="text-[13px] font-semibold text-slate-800 flex-1 min-w-0 truncate">{r.role}</span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-28 bg-slate-100 rounded-full h-2">
                        <div className="h-2 bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${r.match}%` }} />
                      </div>
                      <span className="text-[12px] font-bold text-slate-600 w-8 text-right">{r.match}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
