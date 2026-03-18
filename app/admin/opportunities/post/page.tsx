"use client";

import { Building2, Briefcase, MapPin, IndianRupee, Link as LinkIcon, GraduationCap, Calendar, FileText } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const branches = ["CSE", "IT", "ECE", "EEE", "ME", "Civil", "All Branches"];

export default function PostOpportunity() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    type: "Full-time",
    location: "",
    package: "",
    applyLink: "",
    description: "",
    minCGPA: "",
    requiredSkills: "",
    applicationDeadline: "",
    onlineAssessmentDate: "",
    interviewDate: ""
  });

  const toggleBranch = (branch: string) => {
    if (branch === "All Branches") {
      if (selectedBranches.includes("All Branches")) {
        setSelectedBranches([]);
      } else {
        setSelectedBranches(branches);
      }
      return;
    }
    
    if (selectedBranches.includes(branch)) {
      setSelectedBranches(selectedBranches.filter(b => b !== branch && b !== "All Branches"));
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eligibleBranches: selectedBranches
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to post");
      }
      alert("Opportunity Posted Successfully!");
      router.push("/admin/dashboard");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-black w-full m-0 p-0 font-sans pb-20">
      <div className="max-w-[1000px] mx-auto px-6 sm:px-12 py-10 w-full">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6] flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">Post New Opportunity</h1>
              <p className="text-slate-500 font-medium text-[15px]">Create a new job/internship posting</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePost} className="space-y-6">
          {/* Card 1: Basic Info */}
          <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-[18px] font-bold text-slate-900 mb-1">Company & Role Information</h3>
            <p className="text-[14px] text-slate-500 font-medium mb-8">Basic details about the opportunity</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-7">
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Company Name *</label>
                <div className="relative">
                  <Building2 className="w-[18px] h-[18px] text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input required name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g., Google, Microsoft" className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-slate-400"/>
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Role/Position *</label>
                <div className="relative">
                  <Briefcase className="w-[18px] h-[18px] text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input required name="role" value={formData.role} onChange={handleChange} placeholder="e.g., Software Engineer, Data Analyst" className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-slate-400"/>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-7">
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Opportunity Type *</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all appearance-none cursor-pointer">
                  <option>Full-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Location *</label>
                <div className="relative">
                  <MapPin className="w-[18px] h-[18px] text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input required name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Bangalore, Remote" className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-slate-400"/>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-7">
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Package/Stipend *</label>
                <div className="relative">
                  <span className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 font-bold select-none">$</span>
                  <input required name="package" value={formData.package} onChange={handleChange} placeholder="e.g., ₹12-15 LPA or ₹50k/month" className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-slate-400"/>
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Registration/Apply Link</label>
                <div className="relative">
                  <LinkIcon className="w-[18px] h-[18px] text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input name="applyLink" value={formData.applyLink} onChange={handleChange} placeholder="https://company.com/apply" className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-slate-400"/>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-bold text-slate-900 mb-2">Job Description *</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} placeholder="Enter detailed job description, responsibilities, and requirements..." rows={4} className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all resize-none placeholder:text-slate-400"></textarea>
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
                  <input required type="number" step="0.1" name="minCGPA" value={formData.minCGPA} onChange={handleChange} placeholder="e.g., 7.0" className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-slate-400"/>
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Eligible Branches *</label>
                <div className="flex flex-wrap gap-2.5">
                  {branches.map(branch => {
                    const isSelected = selectedBranches.includes(branch);
                    return (
                      <button
                        key={branch}
                        type="button"
                        onClick={() => toggleBranch(branch)}
                        className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all border ${
                          isSelected 
                            ? "bg-purple-100/50 text-purple-700 border-purple-200 shadow-sm" 
                            : "bg-[#f8fafc] text-slate-500 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {branch}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-bold text-slate-900 mb-2">Required Skills</label>
              <input name="requiredSkills" value={formData.requiredSkills} onChange={handleChange} placeholder="e.g., JavaScript, React, Node.js, Python, SQL" className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-slate-400"/>
              <p className="text-[12px] font-semibold text-slate-400 mt-2">Separate skills with commas</p>
            </div>
          </div>

          {/* Card 3: Important Dates */}
          <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-[18px] font-bold text-slate-900 mb-1">Important Dates</h3>
            <p className="text-[14px] text-slate-500 font-medium mb-8">Set key deadlines and event dates</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Application Deadline *</label>
                <div className="relative">
                  <Calendar className="w-[18px] h-[18px] text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input required type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleChange} className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"/>
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Online Assessment Date</label>
                <div className="relative">
                  <Calendar className="w-[18px] h-[18px] text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input type="date" name="onlineAssessmentDate" value={formData.onlineAssessmentDate} onChange={handleChange} className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"/>
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-slate-900 mb-2">Interview Date (Tentative)</label>
                <div className="relative">
                  <Calendar className="w-[18px] h-[18px] text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input type="date" name="interviewDate" value={formData.interviewDate} onChange={handleChange} className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"/>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-4">
            <Link href="/admin/dashboard" className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 text-[15px] font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors w-full sm:w-auto text-center">
              Cancel
            </Link>
            <button disabled={loading} type="submit" className="px-8 py-3.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[15px] font-bold rounded-xl shadow-[0_4px_20px_0_rgb(139,92,246,0.39)] transition-all active:scale-[0.98] w-full sm:w-auto flex items-center justify-center">
              {loading ? "Posting..." : "Post Opportunity"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
