"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Upload, Download, Plus, Calendar, Trash2, Bell } from "lucide-react";

export default function NoticesPage() {
  const [notices, setNotices]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ title: "", description: "" });
  const [file, setFile] = useState<File | null>(null);

  const fetchNotices = async () => {
    const token = sessionStorage.getItem("token") || "";
    const res = await fetch("/api/admin/notices", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d   = await res.json();
    setNotices(d.notices || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { alert("Please select a PDF file."); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("pdf", file);
      const token = sessionStorage.getItem("token") || "";
      const res = await fetch("/api/admin/notices", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      setSuccessMsg("Notice posted successfully!");
      setForm({ title: "", description: "" });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setShowForm(false);
      fetchNotices();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to post notice");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      <div className="max-w-[1000px] mx-auto px-6 sm:px-12 py-10 w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notices</h1>
              <p className="text-slate-500 font-medium mt-1 text-[15px]">Post and manage placement notices for students</p>
            </div>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_0_rgb(139,92,246,0.39)] flex items-center transition-all active:scale-[0.98] self-start sm:self-auto">
            <Plus className="w-4 h-4 mr-2" /> Post Notice
          </button>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 px-5 py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-2xl flex items-center gap-3">
            ✅ {successMsg}
          </div>
        )}

        {/* Post Form */}
        {showForm && (
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 mb-8">
            <h3 className="text-[18px] font-bold text-slate-900 mb-1">Post New Notice</h3>
            <p className="text-[14px] text-slate-500 font-medium mb-6">Upload a PDF notice for students</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Notice Title *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Campus Drive — Google (Software Engineer)"
                  className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief summary of the notice content..."
                  rows={3}
                  className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all resize-none placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">PDF File *</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    file ? "border-purple-400 bg-purple-50/50" : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/20"
                  }`}>
                  <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                    onChange={e => setFile(e.target.files?.[0] || null)} />
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${file ? "bg-purple-100" : "bg-slate-100"}`}>
                      {file ? <FileText className="w-7 h-7 text-purple-600" /> : <Upload className="w-7 h-7 text-slate-400" />}
                    </div>
                    {file ? (
                      <div>
                        <p className="text-[14px] font-extrabold text-purple-700">{file.name}</p>
                        <p className="text-[12px] text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[14px] font-bold text-slate-700">Click to upload PDF</p>
                        <p className="text-[12px] text-slate-400 mt-1">Supports .pdf files only</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-700 text-[14px] font-bold rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={uploading}
                  className="flex-1 px-8 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-60 text-white text-[14px] font-bold rounded-xl shadow-[0_4px_20px_0_rgb(139,92,246,0.39)] transition-all flex items-center justify-center">
                  {uploading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Uploading...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" />Post Notice</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notices List */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-7 border-b border-slate-100">
            <h3 className="text-[18px] font-bold text-slate-900">All Notices ({notices.length})</h3>
            <p className="text-[14px] text-slate-500 font-medium mt-1">Students can view and download these notices</p>
          </div>
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : notices.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-semibold">No notices posted yet.</p>
              <button onClick={() => setShowForm(true)} className="mt-4 text-purple-600 font-bold text-sm hover:underline">
                Post your first notice
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notices.map((notice: any) => (
                <div key={notice._id} className="p-7 flex items-start justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-[15px] font-extrabold text-slate-900">{notice.title}</p>
                      {notice.description && (
                        <p className="text-[13px] text-slate-500 font-medium mt-1 max-w-[500px] line-clamp-2">{notice.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[12px] text-slate-400 font-semibold">
                          {new Date(notice.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={notice.pdfUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-[13px] font-bold text-purple-600 border border-purple-200 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors">
                      <Download className="w-4 h-4" /> View PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
