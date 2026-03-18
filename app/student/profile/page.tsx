"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Restrict size to 5MB to save bandwidth natively
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be strictly less than 5MB");
      return;
    }
    
    setUploading(true);
    try {
      // 1. Upload to Next.js API => Cloudinary Network
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Cloudinary upload failed on the backend!");
      const { url } = await res.json();

      // 2. Save secure URL back to MongoDB User Database
      const token = localStorage.getItem("token");
      const updateRes = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ resumeUrl: url })
      });

      if (!updateRes.ok) throw new Error("Database update tracking failed!");
      const { user: updatedUser } = await updateRes.json();
      
      setUser(updatedUser);
      alert("Resume securely uploaded to cloud and bound to your profile!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-black w-full font-sans pb-20">
      <div className="max-w-4xl mx-auto px-6 sm:px-12 py-10 w-full">
        
        {/* Navigation Back Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/student/dashboard" className="p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Student Profile</h1>
            <p className="text-slate-500 font-medium text-[15px] mt-0.5">Manage your details and upload materials</p>
          </div>
        </div>

        {/* Read-only Data Extracted From MongoDB */}
        <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
           <h3 className="text-[18px] font-bold text-slate-900 mb-6">Personal Reference Details</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <p className="text-sm font-semibold text-slate-400 mb-1">Full Name</p>
               <p className="text-[16px] font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
             </div>
             <div>
               <p className="text-sm font-semibold text-slate-400 mb-1">Email Connection</p>
               <p className="text-[16px] font-bold text-slate-900">{user?.email}</p>
             </div>
             <div>
               <p className="text-sm font-semibold text-slate-400 mb-1">Assigned Department</p>
               <p className="text-[14px] font-extrabold text-slate-900 bg-slate-100 rounded-lg py-1 px-3 inline-block mt-1">{user?.branch}</p>
             </div>
             <div>
               <p className="text-sm font-semibold text-slate-400 mb-1">Academic CGPA</p>
               <p className="text-[16px] font-bold text-slate-900">{user?.cgpa || "N/A"}</p>
             </div>
           </div>
        </div>

        {/* Dynamic Uploader Card Component */}
        <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
           <h3 className="text-[18px] font-bold text-slate-900 mb-1">Cloudinary Resume Hub</h3>
           <p className="text-[14px] text-slate-500 font-medium mb-6">Upload your latest PDF resume. This will intuitively be automatically attached to your job applications when applying.</p>
           
           {user?.resumeUrl ? (
             <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6"/>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold text-emerald-900">Resume Uploaded Successfully</h4>
                    <a href={user.resumeUrl} target="_blank" className="text-emerald-700 text-[13px] font-semibold hover:underline flex items-center mt-1">
                      <FileText className="w-3.5 h-3.5 mr-1.5" /> View Live Document directly on Cloudinary
                    </a>
                  </div>
                </div>
                
                <div className="relative">
                   <input type="file" accept=".pdf" onChange={handleUpload} disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed z-10"/>
                   <button disabled={uploading} className="px-5 py-2.5 bg-white border border-emerald-200 text-emerald-700 text-[13px] font-bold rounded-xl shadow-sm flex items-center transition-all whitespace-nowrap disabled:opacity-50">
                     {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2"/>}
                     {uploading ? "Uploading Securely..." : "Replace Resume"}
                   </button>
                </div>
             </div>
           ) : (
             <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-all relative">
                <input type="file" accept=".pdf" onChange={handleUpload} disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed z-10"/>
                
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                </div>
                <h4 className="text-[16px] font-bold text-slate-900 mb-1">{uploading ? "Uploading securely to Cloudinary network..." : "Click anywhere inside to upload resume"}</h4>
                <p className="text-[13px] font-medium text-slate-500">Only generic internal files (.pdf, max 5MB) natively accepted</p>
             </div>
           )}

        </div>
      </div>
    </div>
  );
}
