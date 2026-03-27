"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, FileText, Loader2, Star, Target, AlertCircle,
  CheckCircle, Lightbulb, Tag, Download, RotateCcw, Sparkles,
  TrendingUp, ShieldCheck, ArrowLeft, Cpu, Zap, Info,
  ChevronRight, Brain, Rocket, BarChart3
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

function getScoreColor(score: number) {
  if (score >= 80) return { text: "#10b981", glow: "shadow-emerald-500/30", bar: "from-emerald-400 to-teal-500",    label: "Excellent",  ring: "#10b981" };
  if (score >= 65) return { text: "#6366f1", glow: "shadow-indigo-500/30",  bar: "from-indigo-400 to-blue-500",    label: "Good",       ring: "#6366f1" };
  if (score >= 45) return { text: "#f59e0b", glow: "shadow-amber-500/30",   bar: "from-amber-400 to-orange-500",  label: "Fair",       ring: "#f59e0b" };
  return             { text: "#ef4444",    glow: "shadow-red-500/30",    bar: "from-red-400 to-rose-500",      label: "Needs Work", ring: "#ef4444" };
}

/* ── Animated score ring ── */
function ScoreRing({ score }: { score: number }) {
  const cfg = getScoreColor(score);
  const r = 54, stroke = 8;
  const nr = r - stroke / 2;
  const circ = 2 * Math.PI * nr;
  const offset = ((100 - score) / 100) * circ;

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow ring behind */}
      <div
        className="absolute rounded-full blur-2xl opacity-40"
        style={{ width: 150, height: 150, background: cfg.ring }}
      />
      <svg width="144" height="144" className="-rotate-90 relative z-10">
        <circle stroke="rgba(255,255,255,0.08)" fill="transparent" strokeWidth={stroke} r={nr} cx={72} cy={72} />
        <circle
          stroke="url(#scoreGrad)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          r={nr}
          cx={72}
          cy={72}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)" }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={cfg.ring} />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className="text-4xl font-black text-white">{score}</span>
        <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">/ 100</span>
        <span className="text-[11px] font-bold mt-1" style={{ color: cfg.ring }}>{cfg.label}</span>
      </div>
    </div>
  );
}

/* ── Mini bar ── */
function ProgressBar({ score }: { score: number }) {
  const cfg = getScoreColor(score);
  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${cfg.bar} transition-all duration-700`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

export default function ResumeAnalyzer() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile]         = useState<File | null>(null);
  const [isDragging, setIsDrag] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [progress, setProgress] = useState(0);
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

  const fmtBytes = (b: number) => b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;

  const handleAnalyze = async () => {
    if (!file) return;
    const token = sessionStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    setLoading(true); setError(null); setProgress(0);

    // Fake progress ticker
    const ticker = setInterval(() => setProgress(p => Math.min(p + Math.random() * 8, 88)), 600);

    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/student/analyze-resume", {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const data = await res.json();
      clearInterval(ticker);
      setProgress(100);
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setTimeout(() => { setAnalysis(data.analysis); setLoading(false); }, 400);
    } catch (err: any) {
      clearInterval(ticker);
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null); setAnalysis(null); setError(null); setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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

  const mainScore = analysis ? getScoreColor(analysis.overallScore) : null;

  return (
    <div className="min-h-screen bg-[#0a0a1a] relative overflow-hidden">

      {/* ── Background aurora ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-700/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
      </div>

      {/* ── Header ── */}
      <div className="relative z-10 border-b border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-5">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/40 hover:text-white/70 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">AI Resume Analyzer</h1>
              <p className="text-[13px] text-white/40 font-medium mt-0.5">Powered by Google Gemini 2.0 Flash</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-10">

        {/* ───────── UPLOAD STATE ───────── */}
        {!analysis && (
          <>
            {/* Drop zone */}
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
              onDragLeave={() => setIsDrag(false)}
              className={`relative rounded-3xl p-1 mb-8 transition-all duration-300 ${
                isDragging
                  ? "bg-gradient-to-br from-violet-500/40 to-indigo-500/40"
                  : "bg-gradient-to-br from-white/5 to-white/[0.02]"
              }`}
            >
              <div className={`rounded-[22px] border-2 border-dashed transition-all duration-300 p-10 sm:p-16 text-center ${
                isDragging ? "border-violet-400 bg-violet-500/10" : "border-white/10 hover:border-white/20 bg-black/20"
              }`}>
                {file ? (
                  <div className="flex flex-col items-center">
                    {/* File card */}
                    <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mb-6 shadow-inner">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-[13px] font-bold text-white">{file.name}</p>
                        <p className="text-[11px] text-white/40">{fmtBytes(file.size)}</p>
                      </div>
                      <div className="ml-2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    </div>

                    {/* Loading bar */}
                    {loading && (
                      <div className="w-full max-w-sm mb-8">
                        <div className="flex justify-between text-[11px] text-white/40 mb-2">
                          <span>Analyzing resume…</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-white/30 mt-3">
                          Uploading, extracting PDF text, and generating insights…
                        </p>
                      </div>
                    )}

                    {!loading && (
                      <>
                        <button
                          onClick={handleAnalyze}
                          className="group relative px-8 py-3.5 rounded-2xl text-[14px] font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600" />
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 rounded-2xl shadow-lg shadow-violet-500/40 group-hover:shadow-violet-500/60 transition-shadow" />
                          <span className="relative flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Analyze with AI
                          </span>
                        </button>
                        <button
                          onClick={handleReset}
                          className="mt-4 text-[12px] font-semibold text-white/30 hover:text-white/60 flex items-center gap-1 mx-auto transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" /> Choose different file
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Upload className="w-9 h-9 text-violet-400" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white mb-2">Drop your resume here</h2>
                    <p className="text-[13px] text-white/40 font-medium mb-8 max-w-sm mx-auto leading-relaxed">
                      Our AI deeply analyses every section of your resume and gives actionable feedback in seconds.
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative inline-flex items-center gap-2 px-7 py-3 rounded-2xl text-[13px] font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600" />
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="relative flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Browse File
                      </span>
                    </button>
                    <p className="text-[11px] text-white/20 font-medium mt-5">PDF · DOC · DOCX &nbsp;·&nbsp; Max 5 MB</p>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 mb-6">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-[13px] font-semibold text-red-400">{error}</p>
              </div>
            )}

            {/* Feature pills */}
            {!loading && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                {[
                  { icon: <ShieldCheck className="w-5 h-5 text-violet-400" />, title: "ATS Optimization", desc: "Pass applicant tracking systems" },
                  { icon: <Lightbulb className="w-5 h-5 text-indigo-400" />, title: "Smart Suggestions", desc: "AI-powered improvement tips" },
                  { icon: <Zap className="w-5 h-5 text-blue-400" />, title: "Role Matching", desc: "Find your best-fit job roles" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/8 rounded-2xl px-5 py-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-white">{f.title}</p>
                      <p className="text-[11px] text-white/40">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ───────── RESULTS ───────── */}
        {analysis && mainScore && (
          <div className="space-y-5">

            {/* Fallback banner */}
            {analysis._fallback && (
              <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4">
                <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-amber-400">Keyword-based Analysis Mode</p>
                  <p className="text-[12px] text-amber-400/70 mt-0.5">
                    Gemini AI quota exceeded. Your resume was scored using our built-in keyword engine.
                    Results are still actionable — try again later for full AI insights.
                  </p>
                </div>
              </div>
            )}

            {/* ── Score hero card ── */}
            <div className="relative rounded-3xl overflow-hidden p-1 bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-blue-600/10">
              <div className="rounded-[22px] bg-[#0d0d24] border border-white/5 p-7 sm:p-10">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <ScoreRing score={analysis.overallScore} />
                  <div className="flex-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">
                        {analysis._fallback ? "Keyword Analysis" : "AI Analysis Complete"}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Your Resume Score</h2>
                    <p className="text-[13px] text-white/40 mb-6 max-w-xs">
                      {analysis._fallback
                        ? "Scored against industry keyword benchmarks and ATS criteria."
                        : "Evaluated against industry standards, ATS criteria, and recruiter expectations."}
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white text-[12px] font-bold rounded-xl hover:bg-white/10 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Analyze Another
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[12px] font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-violet-500/20"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2-col grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Section scores */}
              <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h3 className="text-[15px] font-bold text-white">Section Breakdown</h3>
                </div>
                <div className="space-y-5">
                  {Object.entries(analysis.sectionScores).map(([key, score]) => {
                    const cfg = getScoreColor(score);
                    return (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[12px] font-semibold text-white/70">
                            {SECTION_LABELS[key as keyof SectionScores]}
                          </span>
                          <span className="text-[12px] font-bold" style={{ color: cfg.text }}>{score}%</span>
                        </div>
                        <ProgressBar score={score} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-5">

                {/* Strengths */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-[14px] font-bold text-white">Strengths</h3>
                  </div>
                  <ul className="space-y-3">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Star className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[12px] font-medium text-white/70 leading-snug">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-amber-500/15 rounded-xl flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                    </div>
                    <h3 className="text-[14px] font-bold text-white">Improvements</h3>
                  </div>
                  <ul className="space-y-3">
                    {analysis.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[12px] font-medium text-white/70 leading-snug">{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* ── Missing Keywords ── */}
            <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-rose-500/15 rounded-xl flex items-center justify-center">
                  <Tag className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-white">Missing Keywords</h3>
                  <p className="text-[11px] text-white/30">Add these to boost your ATS ranking</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[12px] font-semibold rounded-xl"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Best Fit Roles ── */}
            <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-500/15 rounded-xl flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-white">Best-Fit Roles</h3>
                  <p className="text-[11px] text-white/30">Top job matches based on your resume</p>
                </div>
              </div>
              <div className="space-y-4">
                {analysis.bestFitRoles.map((r, i) => {
                  const cfg = getScoreColor(r.match);
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
                        i === 0 ? "bg-yellow-400/20 text-yellow-300"
                        : i === 1 ? "bg-white/10 text-white/50"
                        : "bg-orange-400/15 text-orange-300"
                      }`}>
                        #{i + 1}
                      </div>
                      <span className="text-[13px] font-semibold text-white/80 flex-1 min-w-0 truncate">{r.role}</span>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-28 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${cfg.bar} transition-all duration-700`}
                            style={{ width: `${r.match}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-bold w-8 text-right" style={{ color: cfg.text }}>{r.match}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
