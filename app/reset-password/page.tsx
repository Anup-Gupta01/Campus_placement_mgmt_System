"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, KeyRound } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleResetSubmit = async () => {
    if (!email || !otp || !newPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    if (otp.length !== 6) {
      setErrorMsg("OTP must be exactly 6 digits.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setSuccessMsg("Password successfully reset! Redirecting to login...");
      
      // Delay so user can read message
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#F8FAFC] min-h-screen">
      <div className="w-full max-w-[500px] bg-white rounded-[32px] shadow-2xl shadow-indigo-100/50 overflow-hidden border border-slate-100 p-8 sm:p-12">
        <div className="mb-8 text-center">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="h-8 w-8" />
          </div>
          <h2 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Reset Password</h2>
          <p className="text-[15px] font-medium text-slate-500 mt-2">
            Enter the 6-digit code sent to your email to verify it's you.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-5 bg-red-50 text-red-600 text-[13px] font-bold rounded-xl border border-red-100 text-center">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 mb-5 bg-green-50 text-green-700 text-[13px] font-bold rounded-xl border border-green-100 text-center">
            ✅ {successMsg}
          </div>
        )}

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-[18px] w-[18px]" />
              </div>
              <input type="email" value={email} readOnly={!!emailParam} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white disabled:bg-slate-50 disabled:text-slate-500" />
            </div>
          </div>
          
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">6-Digit OTP Code</label>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} placeholder="------" className="w-full text-center tracking-[1em] text-[20px] py-3 bg-white border-2 border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-black" />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-[18px] w-[18px]" />
              </div>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-black bg-white" />
            </div>
          </div>

          <button onClick={handleResetSubmit} disabled={loading || otp.length !== 6 || !newPassword} className="w-full py-3.5 mt-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[15px] rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? "Resetting..." : "Confirm Password Reset"}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <button type="button" onClick={() => router.push("/login")} className="text-[14px] font-bold text-slate-500 hover:text-slate-700 transition-colors">
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
