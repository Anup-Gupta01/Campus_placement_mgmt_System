"use client";

import { Building2, Briefcase, MapPin, Link as LinkIcon, GraduationCap, Calendar } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const branches = ["CSE", "IT", "ECE", "EEE", "ME", "Civil", "All Branches"];

export default function PostOpportunity() {
  const router = useRouter();
  const [loading, setLoading]           = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [successMsg, setSuccessMsg]     = useState("");

  const [formData, setFormData] = useState({
    companyName: "", role: "", type: "Full-time", location: "",
    package: "", applyLink: "", description: "", minCGPA: "",
    requiredSkills: "", applicationDeadline: "", onlineAssessmentDate: "", interviewDate: "",
  });

  const toggleBranch = (branch: string) => {
    if (branch === "All Branches") {
      setSelectedBranches(selectedBranches.includes("All Branches") ? [] : branches);
      return;
    }
    setSelectedBranches(prev =>
      prev.includes(branch) ? prev.filter(b => b !== branch && b !== "All Branches") : [...prev, branch]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBranches.length === 0) { alert("Please select at least one eligible branch."); return; }
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token") || "";
      const res = await fetch("/api/admin/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, eligibleBranches: selectedBranches }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to post");
      }
      setSuccessMsg("Opportunity posted successfully!");
      setTimeout(() => router.push("/admin/dashboard/opportunities"), 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-black w-full font-sans pb-20">
      <div className="max-w-[1000px] mx-auto px-6 sm:px-12 py-10 w-full">

        {successMsg && (
          <div className="mb-6 px-5 py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-2xl flex items-center gap-3">
            <span className="text-2xl">✅</span> {successMsg}
          </div>
        )}

        <div className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6] flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">Post New Opportunity</h1>
            <p className="text-slate-500 font-medium text-[15px]">Create a new job/internship posting</p>
          </div>
        </div>

        <form onSubmit={handlePost} className="space-y-6">
          {/* Card 1: Company & Role */}
          <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-[18px] font-bold text-slate-900 mb-1">Company &amp; Role Information</h3>
            <p className="text-[14px] text-slate-500 font-medium mb-8">Basic details about the opportunity</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-7">
              {[
                { label: "Company Name", name: "companyName", ph: "e.g., Google, Microsoft",         Icon: Building2 },
                { label: "Role/Position",name: "role",        ph: "e.g., Software Engineer, Data Analyst", Icon: Briefcase },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-[14px] font-bold text-slate-900 mb-2">{f.label} *</label>
                  <div className="relative">
                    <f.Icon className="w-[18px] h-[18px] text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input required name={f.name} value={(formData as any)[f.name]} onChange={handleChange} placeholder={f.ph}
                      className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-slate-400" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-7">
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Opportunity Type *</label>
                <select name="type" value={formData.type} onChange={handleChange}
                  className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all appearance-none cursor-pointer">
                  <option>Full-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Location *</label>
                <div className="relative">
                  <MapPin className="w-[18px] h-[18px] text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input required name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Bangalore, Remote"
                    className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-7">
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Package/Stipend *</label>
                <div className="relative">
                  <span className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 font-bold select-none">₹</span>
                  <input required name="package" value={formData.package} onChange={handleChange} placeholder="e.g., ₹12-15 LPA or ₹50k/month"
                    className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Registration/Apply Link</label>
                <div className="relative">
                  <LinkIcon className="w-[18px] h-[18px] text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input name="applyLink" value={formData.applyLink} onChange={handleChange} placeholder="https://company.com/apply"
                    className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-slate-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-bold text-slate-900 mb-2">Job Description *</label>
              <textarea required name="description" value={formData.description} onChange={handleChange}
                placeholder="Enter detailed job description, responsibilities, and requirements..." rows={4}
                className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all resize-none placeholder:text-slate-400" />
            </div>
          </div>

          {/* Card 2: Eligibility */}
          <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-[18px] font-bold text-slate-900 mb-1">Eligibility Criteria</h3>
            <p className="text-[14px] text-slate-500 font-medium mb-8">Set requirements for student applications</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-7 items-start">
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Minimum CGPA *</label>
                <div className="relative">
                  <GraduationCap className="w-[18px] h-[18px] text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input required type="number" step="0.1" min="0" max="10" name="minCGPA" value={formData.minCGPA} onChange={handleChange} placeholder="e.g., 7.0"
                    className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Eligible Branches *</label>
                <div className="flex flex-wrap gap-2.5">
                  {branches.map(branch => {
                    const isSelected = selectedBranches.includes(branch);
                    return (
                      <button key={branch} type="button" onClick={() => toggleBranch(branch)}
                        className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all border ${
                          isSelected ? "bg-purple-100/50 text-purple-700 border-purple-300 shadow-sm" : "bg-[#f8fafc] text-slate-500 border-slate-200 hover:bg-slate-100"
                        }`}>
                        {branch}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-bold text-slate-900 mb-2">Required Skills</label>
              <input name="requiredSkills" value={formData.requiredSkills} onChange={handleChange}
                placeholder="e.g., JavaScript, React, Node.js, Python, SQL"
                className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-slate-400" />
              <p className="text-[12px] font-semibold text-slate-400 mt-2">Separate skills with commas</p>
            </div>
          </div>

          {/* Card 3: Dates */}
          <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-[18px] font-bold text-slate-900 mb-1">Important Dates</h3>
            <p className="text-[14px] text-slate-500 font-medium mb-8">Set key deadlines and event dates</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Application Deadline *", name: "applicationDeadline", req: true },
                { label: "Online Assessment Date",  name: "onlineAssessmentDate", req: false },
                { label: "Interview Date (Tentative)", name: "interviewDate", req: false },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-[14px] font-bold text-slate-900 mb-2">{f.label}</label>
                  <div className="relative">
                    <Calendar className="w-[18px] h-[18px] text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                    <input required={f.req} type="date" name={f.name} value={(formData as any)[f.name]} onChange={handleChange}
                      className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-4">
            <Link href="/admin/dashboard" className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 text-[15px] font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-center">
              Cancel
            </Link>
            <button disabled={loading} type="submit"
              className="px-8 py-3.5 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-60 text-white text-[15px] font-bold rounded-xl shadow-[0_4px_20px_0_rgb(139,92,246,0.39)] transition-all active:scale-[0.98] flex items-center justify-center">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Posting...</>
              ) : "Post Opportunity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
