"use client";

import { ArrowLeft, Search, Upload, Download, FileText, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ManageApplicants() {
  const params = useParams();
  const id = params.id;
  
  // Mock Stats matching UI exactly
  const stats = [
    { label: "Total Applicants", count: 145, textColor: "text-slate-900", bg: "bg-white" },
    { label: "Shortlisted", count: 12, textColor: "text-blue-600", bg: "bg-blue-50/50" },
    { label: "In Interview", count: 1, textColor: "text-purple-600", bg: "bg-purple-50/50" },
    { label: "Selected", count: 0, textColor: "text-emerald-600", bg: "bg-emerald-50/50" },
    { label: "Rejected", count: 23, textColor: "text-red-600", bg: "bg-red-50/50" },
  ];

  const applicants = [
    { id: 1, name: "Rahul Kumar", email: "rahul.kumar@university.edu", phone: "+91 9876543210", branch: "CSE", cgpa: 8.9, skills: ["JavaScript", "React"], moreSkills: "+1", date: "Mar 15, 2026", status: "Shortlisted", statusColor: 'text-slate-700 bg-white border-slate-200' },
    { id: 2, name: "Priya Sharma", email: "priya.sharma@university.edu", phone: "+91 9876543211", branch: "IT", cgpa: 9.2, skills: ["Python", "Java"], moreSkills: "+1", date: "Mar 14, 2026", status: "Interview", statusColor: 'text-slate-700 bg-white border-slate-200' },
    { id: 3, name: "Amit Patel", email: "amit.patel@university.edu", phone: "+91 9876543212", branch: "CSE", cgpa: 8.5, skills: ["Java", "Spring Boot"], moreSkills: "+1", date: "Mar 14, 2026", status: "Applied", statusColor: 'text-slate-700 bg-white border-slate-200' },
    { id: 4, name: "Sneha Reddy", email: "sneha.reddy@university.edu", phone: "+91 9876543213", branch: "ECE", cgpa: 8.7, skills: ["Python", "TensorFlow"], moreSkills: "+1", date: "Mar 13, 2026", status: "Selected", statusColor: 'text-slate-700 bg-white border-slate-200' },
    { id: 5, name: "Vikram Singh", email: "vikram.singh@university.edu", phone: "+91 9876543214", branch: "CSE", cgpa: 9.0, skills: ["C++", "Python"], moreSkills: "+1", date: "Mar 12, 2026", status: "Rejected", statusColor: 'text-slate-700 bg-white border-slate-200' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-black w-full m-0 p-0 font-sans pb-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-10 w-full">
        
        {/* Header section with back button */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Google - Software Engineer</h1>
            <p className="text-slate-500 font-medium text-[15px] mt-0.5">Manage applicants and update statuses</p>
          </div>
        </div>

        {/* Dynamic Status Counter Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className={`p-5 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 ${stat.bg === "bg-white" ? "bg-white" : stat.bg}`}>
              <h3 className={`text-[32px] font-extrabold leading-none mb-1.5 ${stat.textColor}`}>{stat.count}</h3>
              <p className="text-[14px] font-semibold text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar row */}
        <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
              <input type="text" placeholder="Search applicants..." className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-[14px] font-medium rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all placeholder:text-slate-400"/>
            </div>
            
            <div className="relative w-full md:w-[150px]">
               <select className="w-full bg-[#f8fafc] border border-slate-200 text-slate-700 text-[14px] font-bold rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all cursor-pointer">
                 <option>All Status</option>
                 <option>Applied</option>
                 <option>Shortlisted</option>
                 <option>Interview</option>
                 <option>Selected</option>
                 <option>Rejected</option>
               </select>
               <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-[14px] font-bold rounded-xl shadow-sm hover:bg-slate-50 flex items-center justify-center transition-all">
              <Upload className="w-4 h-4 mr-2" /> Upload List
            </button>
            <button className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-[14px] font-bold rounded-xl shadow-sm hover:bg-slate-50 flex items-center justify-center transition-all">
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </button>
          </div>
        </div>

        {/* Massive Table UI */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-7 border-b border-slate-100">
            <h3 className="text-[18px] font-bold text-slate-900">All Applicants ({applicants.length})</h3>
            <p className="text-[14px] font-medium text-slate-500 mt-1">Review and update application statuses</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="px-7 py-5 text-[13px] font-bold text-slate-900 border-b border-slate-100">Student Details</th>
                  <th className="px-7 py-5 text-[13px] font-bold text-slate-900 border-b border-slate-100">Contact</th>
                  <th className="px-7 py-5 text-[13px] font-bold text-slate-900 border-b border-slate-100 text-center">Branch</th>
                  <th className="px-7 py-5 text-[13px] font-bold text-slate-900 border-b border-slate-100 text-center">CGPA</th>
                  <th className="px-7 py-5 text-[13px] font-bold text-slate-900 border-b border-slate-100">Skills</th>
                  <th className="px-7 py-5 text-[13px] font-bold text-slate-900 border-b border-slate-100">Applied On</th>
                  <th className="px-7 py-5 text-[13px] font-bold text-slate-900 border-b border-slate-100">Status</th>
                  <th className="px-7 py-5 text-[13px] font-bold text-slate-900 border-b border-slate-100 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-slate-50/20">
                {applicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-7 py-5">
                      <p className="text-[14.5px] font-bold text-slate-900 mb-1">{app.name}</p>
                      <a href="#" className="flex items-center text-[12px] font-semibold text-blue-600 hover:underline">
                        <FileText className="w-3.5 h-3.5 mr-1" /> View Resume
                      </a>
                    </td>
                    <td className="px-7 py-5">
                      <p className="text-[12.5px] font-medium text-slate-600 mb-1 flex items-center">{app.email}</p>
                      <p className="text-[12.5px] font-medium text-slate-500">{app.phone}</p>
                    </td>
                    <td className="px-7 py-5 text-center">
                      <span className="text-[11px] font-bold text-slate-600 border border-slate-200 px-2.5 py-1 rounded bg-white shadow-sm uppercase tracking-wide">{app.branch}</span>
                    </td>
                    <td className="px-7 py-5 text-center">
                      <span className="text-[14px] font-extrabold text-slate-900">{app.cgpa}</span>
                    </td>
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {app.skills.map(s => (
                          <span key={s} className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-1 rounded-md">{s}</span>
                        ))}
                        <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2 py-1 rounded-md">{app.moreSkills}</span>
                      </div>
                    </td>
                    <td className="px-7 py-5 text-[13.5px] font-semibold text-slate-700">{app.date}</td>
                    <td className="px-7 py-5">
                      <div className="relative w-[130px]">
                        <select defaultValue={app.status} className="w-full bg-white border border-slate-200 text-slate-700 text-[13px] font-bold rounded-xl px-4 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all cursor-pointer shadow-sm">
                          <option>Applied</option>
                          <option>Shortlisted</option>
                          <option>Interview</option>
                          <option>Selected</option>
                          <option>Rejected</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-7 py-5 text-center">
                      <button className="text-[13px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap">View Profile</button>
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
