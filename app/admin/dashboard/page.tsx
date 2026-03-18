"use client";

import { Users, Briefcase, TrendingUp, Building2, Plus, Download, FileText, Search, Filter, Calendar, MapPin, IndianRupee, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const placementData = [
  { month: 'Sep', count: 45 },
  { month: 'Oct', count: 80 },
  { month: 'Nov', count: 120 },
  { month: 'Dec', count: 180 },
  { month: 'Jan', count: 220 },
  { month: 'Feb', count: 280 },
  { month: 'Mar', count: 350 },
];

const branchData = [
  { name: 'CSE', count: 250 },
  { name: 'IT', count: 190 },
  { name: 'ECE', count: 150 },
  { name: 'ME', count: 80 },
  { name: 'Civil', count: 60 },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-black w-full m-0 p-0 font-sans pb-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">TnP Admin Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1 text-[15px]">Training & Placement Management Portal</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 flex items-center transition-all">
              <Download className="w-4 h-4 mr-2" /> Export Report
            </button>
            <Link href="/admin/opportunities/post" className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_0_rgb(139,92,246,0.39)] flex items-center transition-all active:scale-[0.98]">
              <Plus className="w-4 h-4 mr-2" /> Post Opportunity
            </Link>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Total Students</p>
                <h3 className="text-[32px] font-extrabold text-slate-900 leading-none">2,547</h3>
              </div>
              <div className="w-[52px] h-[52px] rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[13px] font-bold text-emerald-600">+12% from last year</p>
          </div>
          
          {/* Card 2 */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Active Opportunities</p>
                <h3 className="text-[32px] font-extrabold text-slate-900 leading-none">42</h3>
              </div>
              <div className="w-[52px] h-[52px] rounded-2xl bg-[#F3E8FF] flex items-center justify-center text-[#8B5CF6]">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[13px] font-bold text-slate-400">18 closing soon</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Placement Rate</p>
                <h3 className="text-[32px] font-extrabold text-slate-900 leading-none">94.5%</h3>
              </div>
              <div className="w-[52px] h-[52px] rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[13px] font-bold text-emerald-600">+2.3% this year</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Partner Companies</p>
                <h3 className="text-[32px] font-extrabold text-slate-900 leading-none">156</h3>
              </div>
              <div className="w-[52px] h-[52px] rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[13px] font-bold text-emerald-600">+24 this year</p>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-[17px] font-bold text-slate-900">Placement Trend</h3>
            <p className="text-[14px] text-slate-500 mb-8 font-medium">Monthly placement statistics</p>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={placementData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 13, fontWeight: 500}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 13, fontWeight: 500}} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3'}}/>
                  <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={3} dot={{r: 5, fill: "#8B5CF6", strokeWidth: 2, stroke: "#fff"}} activeDot={{r: 7, strokeWidth: 0, fill: "#7C3AED"}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-[17px] font-bold text-slate-900">Branch-wise Placements</h3>
            <p className="text-[14px] text-slate-500 mb-8 font-medium">Placement statistics by department</p>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 13, fontWeight: 500}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 13, fontWeight: 500}} dx={-10} />
                  <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}/>
                  <Bar dataKey="count" fill="#E9D5FF" radius={[6, 6, 0, 0]} activeBar={{fill: '#8B5CF6'}} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Active Opportunities Table */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 overflow-hidden">
          <div className="p-7 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-[18px] font-bold text-slate-900">Active Opportunities</h3>
              <p className="text-[14px] font-medium text-slate-500 mt-1">Currently open job postings</p>
            </div>
            <button className="text-[13px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-5 py-2.5 rounded-xl transition-colors shadow-sm">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Company & Role</th>
                  <th className="px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Package</th>
                  <th className="px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Deadline</th>
                  <th className="px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 text-center">Applicants</th>
                  <th className="px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 text-center">Shortlisted</th>
                  <th className="px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 text-center">Selected</th>
                  <th className="px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { company: "Google", role: "Software Engineer", package: "₹25-30 LPA", deadline: "Mar 25, 2026", applicants: 145, shortlisted: 12, selected: 0 },
                  { company: "Microsoft", role: "Product Manager", package: "₹20-25 LPA", deadline: "Mar 28, 2026", applicants: 98, shortlisted: 8, selected: 0 },
                  { company: "Amazon", role: "SDE Intern", package: "₹50k/month", deadline: "Mar 30, 2026", applicants: 203, shortlisted: 25, selected: 0 },
                ].map((job, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-7 py-5">
                      <p className="text-[15px] font-extrabold text-slate-900">{job.company}</p>
                      <p className="text-[13px] font-medium text-slate-500 mt-0.5">{job.role}</p>
                    </td>
                    <td className="px-7 py-5 text-[14px] font-bold text-slate-700">{job.package}</td>
                    <td className="px-7 py-5 text-[13px] font-semibold text-slate-600"><Calendar className="w-3.5 h-3.5 inline mr-1.5 text-slate-400 mb-0.5"/>{job.deadline}</td>
                    <td className="px-7 py-5 text-center"><span className="text-[13px] font-bold text-slate-700 bg-white border border-slate-200 shadow-sm px-3 py-1 rounded-lg">{job.applicants}</span></td>
                    <td className="px-7 py-5 text-center"><span className="text-[13px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{job.shortlisted}</span></td>
                    <td className="px-7 py-5 text-center"><span className="text-[13px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{job.selected}</span></td>
                    <td className="px-7 py-5 text-center">
                      <Link href={`/admin/opportunities/${i+1}`} className="text-[12px] font-bold text-slate-600 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all bg-white shadow-sm inline-block">Manage</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Applications Table */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-[18px] font-bold text-slate-900">Recent Applications</h3>
              <p className="text-[14px] font-medium text-slate-500 mt-1">Latest student applications</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"/>
                <input type="text" placeholder="Search applications..." className="pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all w-full sm:w-[280px]"/>
              </div>
              <button className="text-[13px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-5 py-2.5 rounded-xl transition-colors shadow-sm">View All</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Student</th>
                  <th className="px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Company & Role</th>
                  <th className="px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 text-center">CGPA</th>
                  <th className="px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 text-center">Branch</th>
                  <th className="px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Applied On</th>
                  <th className="px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Status</th>
                  <th className="px-7 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: "Rahul Kumar", company: "Google", role: "Software Engineer", cgpa: 8.9, branch: "CSE", date: "Mar 15, 2026", status: "Shortlisted", statusColor: "text-blue-700 bg-blue-50 border border-blue-200/60" },
                  { name: "Priya Sharma", company: "Microsoft", role: "Product Manager", cgpa: 9.2, branch: "IT", date: "Mar 14, 2026", status: "Interview", statusColor: "text-[#8B5CF6] bg-[#F3E8FF] border border-purple-200/60" },
                  { name: "Amit Patel", company: "Amazon", role: "SDE Intern", cgpa: 8.5, branch: "CSE", date: "Mar 14, 2026", status: "Applied", statusColor: "text-slate-600 bg-slate-100 border border-slate-200/60" },
                  { name: "Sneha Reddy", company: "Flipkart", role: "Data Analyst", cgpa: 8.7, branch: "ECE", date: "Mar 13, 2026", status: "Selected", statusColor: "text-emerald-700 bg-emerald-50 border border-emerald-200/60" },
                  { name: "Vikram Singh", company: "Google", role: "Software Engineer", cgpa: 9.0, branch: "CSE", date: "Mar 12, 2026", status: "Rejected", statusColor: "text-red-700 bg-red-50 border border-red-200/60" },
                ].map((app, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-7 py-5 font-bold text-[14.5px] text-slate-900">{app.name}</td>
                    <td className="px-7 py-5">
                      <p className="text-[14.5px] font-bold text-slate-900">{app.company}</p>
                      <p className="text-[12px] font-medium text-slate-500 mt-0.5">{app.role}</p>
                    </td>
                    <td className="px-7 py-5 text-center"><span className="text-[13.5px] font-bold text-slate-700">{app.cgpa}</span></td>
                    <td className="px-7 py-5 text-center"><span className="text-[11px] font-bold text-slate-500 border border-slate-200 px-2.5 py-1 rounded bg-white shadow-sm uppercase tracking-wide">{app.branch}</span></td>
                    <td className="px-7 py-5 text-[13.5px] font-semibold text-slate-600">{app.date}</td>
                    <td className="px-7 py-5">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-xl ${app.statusColor} uppercase tracking-wide`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-7 py-5 text-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors flex justify-center">
                      <FileText className="w-5 h-5"/>
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
