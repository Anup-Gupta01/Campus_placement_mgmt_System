"use client";

import { Bell, Briefcase, Calendar, TrendingUp, Award, Search, Filter, ExternalLink, MapPin, IndianRupee, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const [firstName, setFirstName] = useState("Student");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.firstName) {
          setFirstName(data.user.firstName);
        }
      })
      .catch(err => console.error("Error fetching user data", err));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-black w-full m-0 p-0">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-10 w-full font-sans">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {firstName}! 👋</h1>
            <p className="text-slate-500 font-medium mt-1 text-[15px]">Here's your placement activity</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-[#F4F7FC]"></span>
          </button>
          <Link href="/student/profile" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-all">
            View Profile
          </Link>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Applications", value: "12", sub: "+3 this week", icon: <Briefcase className="h-5 w-5 text-blue-600" />, bg: "bg-blue-50" },
          { label: "Interviews", value: "4", sub: "2 upcoming", icon: <Calendar className="h-5 w-5 text-purple-600" />, bg: "bg-purple-50" },
          { label: "Profile Score", value: "85%", sub: "+5% this month", icon: <TrendingUp className="h-5 w-5 text-emerald-600" />, bg: "bg-emerald-50" },
          { label: "Offers", value: "2", sub: "Pending response", icon: <Award className="h-5 w-5 text-orange-600" />, bg: "bg-orange-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[20px] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">{stat.label}</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-[28px] font-extrabold text-slate-900 tracking-tight">{stat.value}</span>
              </div>
              <p className="text-[13px] font-medium text-slate-400 mt-1">{stat.sub}</p>
            </div>
            <div className={`h-[52px] w-[52px] rounded-2xl flex items-center justify-center ${stat.bg}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <button className="flex flex-col items-center justify-center py-7 rounded-[20px] border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 transition-all group">
          <TrendingUp className="h-7 w-7 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-[16px] font-bold text-slate-900 mb-1">AI Resume Analyzer</h3>
          <p className="text-[13px] font-medium text-slate-500">Get instant feedback</p>
        </button>
        <button className="flex flex-col items-center justify-center py-7 rounded-[20px] border-2 border-dashed border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 transition-all group">
          <Briefcase className="h-7 w-7 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-[16px] font-bold text-slate-900 mb-1">My Applications</h3>
          <p className="text-[13px] font-medium text-slate-500">Track all applications</p>
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Available Opportunities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <h2 className="text-[18px] font-bold text-slate-900 mb-1.5">Available Opportunities</h2>
            <p className="text-[14px] font-medium text-slate-500 mb-8">Find your next career opportunity</p>
            
            {/* Search and Filters */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400" />
                <input type="text" placeholder="Search companies, roles..." className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[14px] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900" />
              </div>
              <button className="p-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
                <Filter className="h-[18px] w-[18px]" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              <button className="px-5 py-2 bg-blue-600 text-white text-[13px] font-bold rounded-full shadow-sm shadow-blue-500/20">All</button>
              <button className="px-5 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-[13px] font-bold rounded-full transition-colors">Full time</button>
              <button className="px-5 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-[13px] font-bold rounded-full transition-colors">Internship</button>
              <button className="px-5 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-[13px] font-bold rounded-full transition-colors">Eligible</button>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              
              {/* Card 1 */}
              <div className="border border-slate-200 rounded-[20px] p-6 hover:border-blue-300 transition-colors bg-white">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-[20px] font-extrabold text-slate-900">Google</h3>
                    <p className="text-[14px] font-semibold text-slate-500 mt-1">Software Engineer</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-lg uppercase tracking-wider">Open</span>
                </div>
                
                <div className="flex flex-wrap gap-2.5 mb-6">
                  <span className="inline-flex items-center text-[12px] font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg"><MapPin className="h-[14px] w-[14px] mr-1.5 text-slate-400"/> Bangalore</span>
                  <span className="inline-flex items-center text-[12px] font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg"><IndianRupee className="h-[14px] w-[14px] mr-1.5 text-slate-400"/> ₹25-30 LPA</span>
                  <span className="inline-flex items-center text-[12px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50">Full-time</span>
                </div>

                <div className="space-y-2.5 mb-8">
                  <p className="text-[13px] font-medium text-slate-600 flex items-center"><CheckCircle2 className="h-[16px] w-[16px] mr-2.5 text-slate-400"/> Eligibility: CGPA ≥ 7.5, CS/IT</p>
                  <p className="text-[13px] font-medium text-slate-600 flex items-center"><Clock className="h-[16px] w-[16px] mr-2.5 text-slate-400"/> Deadline: Mar 25, 2026</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                  <p className="text-[12px] font-semibold text-slate-400">145 applicants • Posted 2 days ago</p>
                  <div className="flex space-x-3">
                    <button className="w-[140px] py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-bold rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all active:scale-[0.98]">Apply Now</button>
                    <button className="p-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors"><ExternalLink className="h-[18px] w-[18px]"/></button>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="border border-slate-200 rounded-[20px] p-6 hover:border-blue-300 transition-colors bg-white">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-[20px] font-extrabold text-slate-900">Microsoft</h3>
                    <p className="text-[14px] font-semibold text-slate-500 mt-1">Product Manager</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-lg uppercase tracking-wider">Open</span>
                </div>
                
                <div className="flex flex-wrap gap-2.5 mb-6">
                  <span className="inline-flex items-center text-[12px] font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg"><MapPin className="h-[14px] w-[14px] mr-1.5 text-slate-400"/> Hyderabad</span>
                  <span className="inline-flex items-center text-[12px] font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg"><IndianRupee className="h-[14px] w-[14px] mr-1.5 text-slate-400"/> ₹20-25 LPA</span>
                  <span className="inline-flex items-center text-[12px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50">Full-time</span>
                </div>

                <div className="space-y-2.5 mb-8">
                  <p className="text-[13px] font-medium text-slate-600 flex items-center"><CheckCircle2 className="h-[16px] w-[16px] mr-2.5 text-slate-400"/> Eligibility: CGPA ≥ 7.0, All branches</p>
                  <p className="text-[13px] font-medium text-slate-600 flex items-center"><Clock className="h-[16px] w-[16px] mr-2.5 text-slate-400"/> Deadline: Mar 28, 2026</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                  <p className="text-[12px] font-semibold text-slate-400">98 applicants • Posted 1 day ago</p>
                  <div className="flex space-x-3">
                    <button className="w-[140px] py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-bold rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all active:scale-[0.98]">Apply Now</button>
                    <button className="p-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors"><ExternalLink className="h-[18px] w-[18px]"/></button>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="border border-slate-200 rounded-[20px] p-6 hover:border-blue-300 transition-colors bg-white">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-[20px] font-extrabold text-slate-900">Amazon</h3>
                    <p className="text-[14px] font-semibold text-slate-500 mt-1">SDE Intern</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-lg uppercase tracking-wider">Open</span>
                </div>
                
                <div className="flex flex-wrap gap-2.5 mb-6">
                  <span className="inline-flex items-center text-[12px] font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg"><MapPin className="h-[14px] w-[14px] mr-1.5 text-slate-400"/> Remote</span>
                  <span className="inline-flex items-center text-[12px] font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg"><IndianRupee className="h-[14px] w-[14px] mr-1.5 text-slate-400"/> 150k/month</span>
                  <span className="inline-flex items-center text-[12px] font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100/50">Internship</span>
                </div>

                <div className="space-y-2.5 mb-8">
                  <p className="text-[13px] font-medium text-slate-600 flex items-center"><CheckCircle2 className="h-[16px] w-[16px] mr-2.5 text-slate-400"/> Eligibility: CGPA ≥ 8.5, CS/IT/ECE</p>
                  <p className="text-[13px] font-medium text-slate-600 flex items-center"><Clock className="h-[16px] w-[16px] mr-2.5 text-slate-400"/> Deadline: Mar 30, 2026</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                  <p className="text-[12px] font-semibold text-slate-400">203 applicants • Posted 3 days ago</p>
                  <div className="flex space-x-3">
                    <button className="w-[140px] py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-bold rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all active:scale-[0.98]">Apply Now</button>
                    <button className="p-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors"><ExternalLink className="h-[18px] w-[18px]"/></button>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          
          {/* Upcoming Events */}
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <h2 className="text-[18px] font-bold text-slate-900 mb-1.5">Upcoming Events</h2>
            <p className="text-[14px] font-medium text-slate-500 mb-8">Don't miss these important dates</p>
            
            <div className="space-y-7">
              
              <div className="flex space-x-4">
                <div className="w-[3px] bg-blue-500 rounded-full mt-1 mb-1"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-[15px] font-bold text-slate-900">Google</h4>
                    <span className="text-[10px] font-bold border border-slate-200 px-2.5 py-1 rounded-md text-slate-500 tracking-wide uppercase">Interview</span>
                  </div>
                  <p className="text-[14px] font-medium text-slate-600 mt-1">Technical Round 2</p>
                  <p className="text-[12px] font-semibold text-slate-400 mt-2 flex items-center"><Calendar className="h-[14px] w-[14px] mr-1.5"/> Mar 20, 2026 • 10:00 AM</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="w-[3px] bg-purple-500 rounded-full mt-1 mb-1"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-[15px] font-bold text-slate-900">Microsoft</h4>
                    <span className="text-[10px] font-bold border border-slate-200 px-2.5 py-1 rounded-md text-slate-500 tracking-wide uppercase">Test</span>
                  </div>
                  <p className="text-[14px] font-medium text-slate-600 mt-1">Online Assessment</p>
                  <p className="text-[12px] font-semibold text-slate-400 mt-2 flex items-center"><Calendar className="h-[14px] w-[14px] mr-1.5"/> Mar 22, 2026 • 2:00 PM</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="w-[3px] bg-orange-500 rounded-full mt-1 mb-1"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-[15px] font-bold text-slate-900">Amazon</h4>
                    <span className="text-[10px] font-bold border border-slate-200 px-2.5 py-1 rounded-md text-slate-500 tracking-wide uppercase">Interview</span>
                  </div>
                  <p className="text-[14px] font-medium text-slate-600 mt-1">HR Interview</p>
                  <p className="text-[12px] font-semibold text-slate-400 mt-2 flex items-center"><Calendar className="h-[14px] w-[14px] mr-1.5"/> Mar 28, 2026 • 11:30 AM</p>
                </div>
              </div>

            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <h2 className="text-[18px] font-bold text-slate-900 mb-1.5">Recent Applications</h2>
            <p className="text-[14px] font-medium text-slate-500 mb-8">Track your application progress</p>
            
            <div className="space-y-8">
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900">Google</h4>
                    <p className="text-[13px] font-medium text-slate-500 mt-0.5">Software Engineer</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md uppercase tracking-wide">Interview</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full w-[70%]"></div>
                </div>
                <p className="text-[11px] font-bold text-slate-400">Applied on Mar 15, 2026</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900">Microsoft</h4>
                    <p className="text-[13px] font-medium text-slate-500 mt-0.5">Product Manager</p>
                  </div>
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-md uppercase tracking-wide">QA Pending</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                  <div className="bg-orange-500 h-2 rounded-full w-[40%]"></div>
                </div>
                <p className="text-[11px] font-bold text-slate-400">Applied on Mar 12, 2026</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900">Amazon</h4>
                    <p className="text-[13px] font-medium text-slate-500 mt-0.5">SDE Intern</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md uppercase tracking-wide">Shortlisted</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-[90%]"></div>
                </div>
                <p className="text-[11px] font-bold text-slate-400">Applied on Mar 10, 2026</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
    </div>
  );
}
