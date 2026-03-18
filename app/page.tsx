import Link from "next/link";
import { GraduationCap, Navigation, Building2, FileText, Sparkles, CheckCircle2, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-500/30">
      

      <main>
        {/* Hero Section */}
        <section className="relative px-6 pt-16 sm:px-12 lg:pt-20 pb-16 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            
            {/* Left Content */}
            <div className="flex flex-col items-start text-left z-10 lg:pr-10">
              <div className="mb-6 inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
                <span className="mr-2 flex h-2 w-2 rounded-full bg-blue-600"></span>
                Trusted by 50+ Universities
              </div>
              
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl lg:text-[72px] leading-[1.05]">
                Your Campus <br/> Placement <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Journey Starts<br/>Here
                </span>
              </h1>

              <div className="mt-12 flex flex-col w-full space-y-4 sm:flex-row sm:w-auto sm:space-y-0 sm:space-x-5">
                <Link
                  href="/student/dashboard"
                  className="group flex items-center justify-center bg-indigo-600 rounded-xl px-8 py-4 text-[17px] font-semibold text-white shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-600/40"
                >
                  Student Portal
                  <Navigation className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/admin/login"
                  className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-[17px] font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-md"
                >
                  TnP Admin Login
                </Link>
              </div>
            </div>

            {/* Right Image with absolute stats card */}
            <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[650px]">
              <div className="absolute inset-0 rounded-[32px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/first_page.jpeg" 
                  alt="Students graduating" 
                  className="object-cover w-full h-full"
                />
              </div>
              
              {/* Floating Match Card to design */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-[24px] shadow-2xl flex items-center space-x-5 border border-slate-100 z-20">
                <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#E5F7EC] text-[#00B859]">
                  <Users className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-slate-950">2,500+</p>
                  <p className="text-base text-slate-500 font-medium">Active Students</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Purple Stats Banner matching Figma exactly */}
        <section className="bg-[#5CE1E6] bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] py-16 text-white w-full mt-10">
          <div className="mx-auto max-w-7xl px-6 sm:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div className="flex flex-col items-center">
              <p className="text-4xl sm:text-[56px] font-bold mb-3 tracking-tight">500+</p>
              <p className="text-indigo-100 font-medium text-lg">Students Placed</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-4xl sm:text-[56px] font-bold mb-3 tracking-tight">150+</p>
              <p className="text-indigo-100 font-medium text-lg">Company Partners</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-4xl sm:text-[56px] font-bold mb-3 tracking-tight">95%</p>
              <p className="text-indigo-100 font-medium text-lg">Placement Rate</p>
            </div>
            <div className="flex flex-col items-center border-r-0">
              <p className="text-4xl sm:text-[56px] font-bold mb-3 tracking-tight">12L+</p>
              <p className="text-indigo-100 font-medium text-lg">Avg. Package</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-28 px-6 sm:px-12 bg-white">
          <div className="mx-auto max-w-[1200px] text-center">
            <h2 className="text-[44px] font-extrabold text-slate-950 tracking-tight mb-4">
              Everything You Need for <span className="text-indigo-600">Placement Success</span>
            </h2>
            <p className="text-xl text-slate-500 mb-20 font-medium">Powerful features designed for both students and TnP departments</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {[
                { title: "Centralized Opportunities", desc: "All campus placement opportunities in one place, no more scattered WhatsApp groups", icon: <Building2 className="text-indigo-600 h-7 w-7" /> },
                { title: "Application Tracking", desc: "Track your application status from applied to selected in a clear timeline", icon: <FileText className="text-indigo-600 h-7 w-7" /> },
                { title: "AI Resume Analyzer", desc: "Get instant feedback and improve your resume with AI-powered analysis", icon: <Sparkles className="text-indigo-600 h-7 w-7" /> },
                { title: "Smart Recommendations", desc: "Receive job recommendations based on your profile and preferences", icon: <CheckCircle2 className="text-indigo-600 h-7 w-7" /> }
              ].map((f, i) => (
                <div key={i} className="bg-white p-10 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF2FF]">
                    {f.icon}
                  </div>
                  <h3 className="text-[22px] font-bold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-500 text-[17px] leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-6 sm:px-12 bg-[#F8FAFC]">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-[44px] font-extrabold text-slate-950 mb-4 tracking-tight">How It Works</h2>
            <p className="text-xl text-slate-500 font-medium mb-24">Simple steps to your dream job</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
              {[
                { step: "1", title: "Create Your Profile", desc: "Sign up with your university email and build your comprehensive profile" },
                { step: "2", title: "Explore & Apply", desc: "Browse opportunities, get AI recommendations, and apply with one click" },
                { step: "3", title: "Track & Succeed", desc: "Monitor your application status and get notifications for every update" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center z-10">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-3xl font-bold mb-8 shadow-xl shadow-indigo-200">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-500 text-center text-[17px] leading-relaxed font-medium max-w-[280px]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
