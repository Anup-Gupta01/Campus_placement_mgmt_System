"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Building2, Mail, Lock, User as UserIcon, Phone, School, BookOpen, KeyRound, ArrowRight, Smartphone } from "lucide-react";

type Role = "student" | "admin";
type Mode = "login" | "signup";
type SignupStep = 1 | 2 | "otp";
type VerifyMethod = "email" | "mobile";

export default function AuthForm({ defaultMode = "login", defaultRole = "student" }: { defaultMode?: Mode, defaultRole?: Role }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(defaultRole);
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [signupStep, setSignupStep] = useState<SignupStep>(1);

  // Step 1: Basic Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNo, setMobileNo] = useState("");

  // Step 2: Academic Info
  const [university, setUniversity] = useState("");
  const [universityCode, setUniversityCode] = useState("");
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  
  // Admin fields
  const [designation, setDesignation] = useState("");
  const [jobId, setJobId] = useState("");
  
  // Verification Preference
  const [verifyVia, setVerifyVia] = useState<VerifyMethod>("email");

  // OTP
  const [otp, setOtp] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignupSubmit = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          firstName, lastName, email, password, mobileNo, 
          universityCode,
          university, course, branch, year: Number(year), dob, gender,
          designation, jobId,
          verifyVia 
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Signup failed");
      
      // Move to OTP Step
      setSuccessMsg(`Account successfully tracked. Please check your ${verifyVia === 'email' ? 'email inbox' : 'messages'} for the OTP code.`);
      setSignupStep("otp");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Verification failed");
      
      // Store Token
      sessionStorage.setItem("token", data.token);

      // Route appropriately
      if (role === "student") router.push("/student/dashboard");
      else router.push("/admin/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("OTP Verification Required. You have not verified your account yet.");
        }
        throw new Error(data.error || "Login failed");
      }
      
      // Store Token
      sessionStorage.setItem("token", data.token);

      if (role === "student") router.push("/student/dashboard");
      else router.push("/admin/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#F8FAFC]">
      <div className="w-full max-w-[1200px] bg-white rounded-[32px] shadow-2xl shadow-indigo-100/50 overflow-hidden flex flex-col lg:flex-row border border-slate-100">
        
        {/* Left Panel */}
        <div className="hidden lg:flex flex-col flex-1 p-16 justify-center bg-gradient-to-br from-indigo-50/50 to-white relative">
          <h1 className="text-[48px] font-extrabold text-slate-950 tracking-tight leading-[1.1] mb-6">
            Your Gateway to <br />
            <span className="bg-clip-text text-transparent bg-[#2563EB] bg-gradient-to-r from-blue-600 to-violet-600">
              Career Success
            </span>
          </h1>
          <p className="text-[17px] text-[#475569] font-medium max-w-[420px] mb-12 leading-relaxed">
            Centralized placement management for students and training & placement departments
          </p>
          
          <div className="w-full max-w-[500px] rounded-[24px] overflow-hidden shadow-xl relative bg-slate-200">
            <img 
              src="/signup.jpeg" 
              alt="Interview Session" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-14 border-l border-slate-100/80">
          <div className="w-full max-w-[460px] mx-auto min-h-[500px] flex flex-col justify-center">
            
            {/* Context/Mode Switcher - Hidden in OTP state */}
            {mode === "login" || (mode === "signup" && signupStep !== "otp") ? (
              <>
                {/* Role Toggle */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button 
                    onClick={() => { setRole("student"); setSignupStep(1); setErrorMsg(""); setMode("login"); }}
                    className={`flex flex-col items-center justify-center p-4 rounded-[20px] border-[1.5px] transition-all ${role === "student" ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm" : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"}`}
                  >
                    <GraduationCap className={`h-8 w-8 mb-2 ${role === "student" ? "text-blue-600" : "text-slate-400"}`} strokeWidth={role === "student" ? 2.5 : 2} />
                    <span className="font-semibold text-[15px]">Student</span>
                  </button>
                  <button 
                    onClick={() => { setRole("admin"); setSignupStep(1); setErrorMsg(""); setMode("login"); }}
                    className={`flex flex-col items-center justify-center p-4 rounded-[20px] border-[1.5px] transition-all ${role === "admin" ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm" : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"}`}
                  >
                    <Building2 className={`h-8 w-8 mb-2 ${role === "admin" ? "text-blue-600" : "text-slate-400"}`} strokeWidth={role === "admin" ? 2.5 : 2}/>
                    <span className="font-semibold text-[15px]">TnP Admin</span>
                  </button>
                </div>

                {/* Mode Toggle */}
                <div className="bg-slate-100/80 rounded-[14px] p-1.5 flex mb-8">
                  <button 
                    onClick={() => { setMode("login"); setErrorMsg(""); }}
                    className={`flex-1 py-3 text-[14px] font-bold tracking-wide rounded-xl transition-all ${mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => { setMode("signup"); setSignupStep(1); setErrorMsg(""); }}
                    className={`flex-1 py-3 text-[14px] font-bold tracking-wide rounded-xl transition-all ${mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                  >
                    Sign Up
                  </button>
                </div>
              </>
            ) : null}

            {/* Subtitles for Multi-step */}
            {mode === "signup" && signupStep === 1 && (
              <h3 className="text-[18px] font-bold text-slate-900 mb-5">Step 1: Basic Information</h3>
            )}
            {mode === "signup" && signupStep === 2 && (
              <div className="mb-5 flex items-center">
                <button onClick={() => setSignupStep(1)} className="mr-3 p-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"><ArrowRight className="h-4 w-4 rotate-180"/></button>
                <h3 className="text-[18px] font-bold text-slate-900">Step 2: Academic & Security</h3>
              </div>
            )}
            {mode === "signup" && signupStep === "otp" && (
               <div className="mb-6">
                 <h3 className="text-[22px] font-extrabold text-slate-900 mb-2 flex items-center"><KeyRound className="h-6 w-6 mr-2 text-blue-600"/> Verify your Account</h3>
                 <p className="text-sm font-medium text-slate-500">We've sent a 6-digit OTP to your <span className="font-bold text-slate-700">{verifyVia === 'email' ? email : mobileNo}</span></p>
               </div>
            )}

            {/* Error & Success States */}
            {errorMsg && (
              <div className="p-3 mb-5 bg-red-50 text-red-600 text-[13px] font-bold rounded-xl border border-red-100 flex items-center">
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 mb-5 bg-green-50 text-green-700 text-[13px] font-bold rounded-xl border border-green-100 flex items-center">
                ✅ {successMsg}
              </div>
            )}

            {/* Form */}
            <form className="space-y-3.5" onSubmit={(e) => e.preventDefault()}>
              
              {/* === LOGIN VIEW === */}
              {mode === "login" && (
                <>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Mail className="h-[18px] w-[18px]" /></div>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white" placeholder="student@university.edu" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Lock className="h-[18px] w-[18px]" /></div>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white" placeholder="••••••••" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-5">
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded-[4px] border-slate-300 text-blue-600 bg-white focus:ring-blue-600" />
                      <span className="text-[14px] font-semibold text-slate-600">Remember me</span>
                    </label>
                    <a href="#" className="text-[14px] font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</a>
                  </div>
                  <button onClick={handleLoginSubmit} disabled={loading} className="w-full py-3.5 mt-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[15px] rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? "Please wait..." : `Sign In as ${role === "student" ? "Student" : "Admin"}`}
                  </button>
                </>
              )}

              {/* === SIGNUP STEP 1 === */}
              {mode === "signup" && signupStep === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">First Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><UserIcon className="h-[18px] w-[18px]" /></div>
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white" placeholder="John" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Last Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><UserIcon className="h-[18px] w-[18px]" /></div>
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white" placeholder="Doe" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Mail className="h-[18px] w-[18px]" /></div>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white" placeholder={role === "student" ? "student@university.edu" : "tnp@university.edu"} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Mobile No.</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Phone className="h-[18px] w-[18px]" /></div>
                      <input type="tel" value={mobileNo} onChange={e => setMobileNo(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white" placeholder="9876543210" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Lock className="h-[18px] w-[18px]" /></div>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white" placeholder="••••••••" />
                    </div>
                  </div>
                  
                  <button onClick={() => {
                    if(!firstName || !lastName || !email || !password || !mobileNo) setErrorMsg("Please fill all basic info fields.");
                    else { setErrorMsg(""); setSignupStep(2); }
                  }} className="w-full py-3.5 mt-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[15px] rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all active:scale-[0.98]">
                    Next: Academic Details
                  </button>
                </>
              )}

              {/* === SIGNUP STEP 2 === */}
              {mode === "signup" && signupStep === 2 && (
                <>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">University Code</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><KeyRound className="h-[18px] w-[18px]" /></div>
                      <input type="text" value={universityCode} onChange={e => setUniversityCode(e.target.value.toUpperCase())} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white uppercase tracking-widest" placeholder="e.g. IITB" maxLength={10} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Enter the code provided by your TnP office</p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">University / College</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><School className="h-[18px] w-[18px]" /></div>
                      <input type="text" value={university} onChange={e => setUniversity(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white" placeholder="Harvard University" />
                    </div>
                  </div>

                  {role === "student" ? (
                    <>
                      <div className="grid grid-cols-2 gap-3.5 mt-3.5">
                        <div>
                          <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Course</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><BookOpen className="h-[18px] w-[18px]" /></div>
                            <input type="text" value={course} onChange={e => setCourse(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white" placeholder="B.Tech" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Branch</label>
                          <select value={branch} onChange={e => setBranch(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white">
                             <option value="">Select</option>
                             <option value="CSE">CSE</option>
                             <option value="ME">ME</option>
                             <option value="EE">EE</option>
                             <option value="ECE">ECE</option>
                             <option value="CE">CE</option>
                             <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3.5 mt-3.5">
                        <div>
                          <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Passing Yr</label>
                          <input type="number" value={year} onChange={e => setYear(e.target.value)} className="w-full pl-3 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white" placeholder="2026" />
                        </div>
                        <div>
                          <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Gender</label>
                          <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-2 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white">
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[13px] font-bold text-slate-700 mb-1.5">DOB</label>
                          <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-2 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3.5 mt-3.5">
                        <div>
                          <label className="block text-[13px] font-bold text-slate-700 mb-1.5">TnP Position</label>
                          <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white" placeholder="e.g. Placement Officer" />
                        </div>
                        <div>
                          <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Job ID</label>
                          <input type="text" value={jobId} onChange={e => setJobId(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white" placeholder="e.g. EMP-12345" />
                        </div>
                      </div>
                      <div className="mt-3.5">
                        <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Gender</label>
                        <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="pt-2">
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Send OTP code via:</label>
                    <div className="flex space-x-3">
                      <button type="button" onClick={() => setVerifyVia('email')} className={`flex-1 py-2.5 rounded-lg border-2 text-[13px] font-bold flex items-center justify-center transition-all ${verifyVia === 'email' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                        <Mail className="w-4 h-4 mr-2" /> Email
                      </button>
                      <button type="button" onClick={() => setVerifyVia('mobile')} className={`flex-1 py-2.5 rounded-lg border-2 text-[13px] font-bold flex items-center justify-center transition-all ${verifyVia === 'mobile' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                        <Smartphone className="w-4 h-4 mr-2" /> Mobile SMS
                      </button>
                    </div>
                  </div>

                  <button onClick={handleSignupSubmit} disabled={loading} className="w-full py-3.5 mt-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[15px] rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? "Please wait..." : "Create Account & Send OTP"}
                  </button>
                </>
              )}

              {/* === SIGNUP STEP 3 (OTP) === */}
              {mode === "signup" && signupStep === "otp" && (
                <div className="pt-2">
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} className="w-full text-center tracking-[1em] text-[24px] pr-2 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-black mb-6" placeholder="------" />
                  
                  <button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6} className="w-full py-4 bg-[#00B859] hover:bg-[#009E4B] text-white font-bold text-[16px] rounded-xl shadow-[0_4px_14px_0_rgb(0,184,89,0.39)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? "Verifying..." : "Verify OTP & Continue"}
                  </button>
                </div>
              )}
              
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
