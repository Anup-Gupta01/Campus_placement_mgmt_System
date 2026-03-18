"use client";

import { useState, useEffect } from "react";
import { 
  Upload, FileText, CheckCircle, ArrowLeft, Loader2, Download, Trash2, 
  MapPin, Phone, Mail, GraduationCap, Award, GitBranch, Terminal, ExternalLink,
  Wand2, Save, X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
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

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be strictly less than 5MB");
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Cloudinary upload failed on the backend!");
      const { url } = await res.json();

      const token = sessionStorage.getItem("token");
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

  const handleAutoFill = () => {
    setIsAutoFilling(true);
    // Mock parsing delay
    setTimeout(() => {
      setIsAutoFilling(false);
      alert("Profile automatically populated based on uploaded resume PDF!");
      setIsEditing(false); // Close edit mode naturally
    }, 2000);
  };

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 w-full font-sans pb-20">
      
      {/* Top action bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
          <button 
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 w-full">
        
        {/* Gradient Banner Banner */}
        <div className="w-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] rounded-[20px] p-8 sm:p-10 text-white shadow-lg mb-8 relative overflow-hidden">
          {/* Background decorative patterns */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-[50px]"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-4xl sm:text-5xl font-bold flex-shrink-0">
              {user?.firstName?.charAt(0) || "S"}
            </div>
            
            <div className="flex-1">
              <h2 className="text-3xl sm:text-[34px] font-bold mb-1.5">{user?.firstName || "Student"} {user?.lastName || "Name"}</h2>
              <p className="text-white/80 font-medium text-base mb-5">{user?.branch || "Computer Science Engineering"} • {user?.year || "4th"} Year</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-white/90">
                <div className="flex items-center"><Mail className="w-4 h-4 mr-2.5 opacity-70"/> {user?.email || "student@university.edu"}</div>
                <div className="flex items-center"><Phone className="w-4 h-4 mr-2.5 opacity-70"/> {user?.mobileNo || "+91 9876543210"}</div>
                <div className="flex items-center"><MapPin className="w-4 h-4 mr-2.5 opacity-70"/> {user?.location || "Bangalore, India"}</div>
                <div className="flex items-center"><GraduationCap className="w-4 h-4 mr-2.5 opacity-70"/> CGPA: {user?.cgpa || "8.9"}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Basic Information */}
            <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-8">
              <h3 className="text-[17px] font-bold text-slate-900 mb-1">Basic Information</h3>
              <p className="text-[14px] text-slate-500 font-medium mb-6">Your personal and academic details</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Full Name</label>
                  <div className="px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[14px] font-medium text-slate-500 flex items-center">
                    <UserIcon className="w-4 h-4 mr-3 text-slate-400" />
                    {user?.firstName || "Rahul"} {user?.lastName || "Kumar"}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Email</label>
                  <div className="px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[14px] font-medium text-slate-500 flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-slate-400" />
                    {user?.email || "rahul.kumar@university.edu"}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Phone</label>
                  <div className="px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[14px] font-medium text-slate-500 flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-slate-400" />
                    {user?.mobileNo || "+91 9876543210"}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Location</label>
                  <div className="px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[14px] font-medium text-slate-500 flex items-center">
                    <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                    {user?.location || "Bangalore, India"}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Branch</label>
                  <div className="px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[14px] font-medium text-slate-500 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-3 text-slate-400" />
                    {user?.branch || "Computer Science Engineering"}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">CGPA</label>
                  <div className="px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[14px] font-medium text-slate-500 flex items-center">
                    8.9
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-8">
              <h3 className="text-[17px] font-bold text-slate-900 mb-1">Skills</h3>
              <p className="text-[14px] text-slate-500 font-medium mb-6">Your technical and soft skills</p>
              
              <div className="flex flex-wrap gap-2.5">
                {["JavaScript", "React", "Node.js", "Python", "Java", "SQL", "MongoDB", "Git", "AWS", "Docker"].map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-[13px] font-bold rounded-lg flex items-center">
                    <Terminal className="w-3.5 h-3.5 mr-2 text-slate-400"/> {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-8">
              <h3 className="text-[17px] font-bold text-slate-900 mb-1">Projects</h3>
              <p className="text-[14px] text-slate-500 font-medium mb-6">Showcase your work</p>
              
              <div className="space-y-6">
                <div className="border border-slate-200 rounded-[14px] p-6">
                  <h4 className="text-[18px] font-bold text-slate-900">E-commerce Platform</h4>
                  <p className="text-[15px] font-medium text-slate-600 mt-2 mb-4">Full-stack web application with React and Node.js</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["React", "Node.js", "MongoDB", "Express"].map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[12px] font-semibold rounded-md shadow-sm">{tag}</span>
                    ))}
                  </div>
                  <a href="#" className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                    <GitBranch className="w-4 h-4 mr-1.5"/> github.com/rahul/ecommerce
                  </a>
                </div>
                
                <div className="border border-slate-200 rounded-[14px] p-6">
                  <h4 className="text-[18px] font-bold text-slate-900">AI Chatbot</h4>
                  <p className="text-[15px] font-medium text-slate-600 mt-2 mb-4">Natural language processing chatbot using Python</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["Python", "TensorFlow", "Flask"].map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[12px] font-semibold rounded-md shadow-sm">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            
            {/* Resume Versions */}
            <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">Resume Versions</h3>
                  <p className="text-[13px] text-slate-500 font-medium mt-0.5">Manage your resumes</p>
                </div>
                <button className="h-9 w-9 bg-white border border-slate-200 text-slate-600 flex items-center justify-center rounded-lg hover:bg-slate-50 transition-colors shadow-sm relative">
                  <input type="file" accept=".pdf" disabled={uploading} onChange={handleResumeUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Upload className="w-4 h-4" />}
                </button>
              </div>

              {/* Main Resume from DB (if exists) */}
              {user?.resumeUrl && (
                <div className="border border-slate-200 rounded-2xl p-4 mb-4 bg-blue-50/30">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5"/>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-[14px] font-bold text-slate-900 truncate">Uploaded_Resume.pdf</h4>
                      <p className="text-[12px] font-semibold text-slate-500 mt-1">Cloudinary Sync • Recently</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 text-[12px] font-bold rounded-lg flex items-center justify-center hover:bg-slate-50">
                      View
                    </a>
                  </div>
                </div>
              )}

              {/* Dummy Resumes as in screenshot */}
              <div className="border border-slate-200 rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-[#EEF2FF] text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5"/>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-[14px] font-bold text-slate-900 truncate">Resume_SDE_2026.pdf</h4>
                    <p className="text-[12px] font-semibold text-slate-500 mt-1">245 KB • Mar 10, 2026</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase">Used for:</p>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-md">Google</span>
                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-md">Microsoft</span>
                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-md">Amazon</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 text-[12px] font-bold rounded-lg flex items-center justify-center hover:bg-slate-50">
                    Download
                  </button>
                  <button className="px-3 py-2 bg-white border border-red-200 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-50">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-[#EEF2FF] text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5"/>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-[14px] font-bold text-slate-900 truncate">Resume_Product_Manager.pdf</h4>
                    <p className="text-[12px] font-semibold text-slate-500 mt-1">198 KB • Feb 28, 2026</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase">Used for:</p>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-md">Flipkart</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 text-[12px] font-bold rounded-lg flex items-center justify-center hover:bg-slate-50">
                    Download
                  </button>
                  <button className="px-3 py-2 bg-white border border-red-200 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-50">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>

            </div>

            {/* Achievements */}
            <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6">
              <h3 className="text-[16px] font-bold text-slate-900">Achievements</h3>
              <p className="text-[13px] text-slate-500 font-medium mb-6 mt-0.5">Your accomplishments</p>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Award className="w-5 h-5 text-orange-500 mr-3 shrink-0 flex-none"/>
                  <span className="text-[14px] font-semibold text-slate-700 leading-snug">Winner - Smart India Hackathon 2025</span>
                </li>
                <li className="flex items-start">
                  <Award className="w-5 h-5 text-orange-500 mr-3 shrink-0 flex-none"/>
                  <span className="text-[14px] font-semibold text-slate-700 leading-snug">First Prize - University Coding Competition</span>
                </li>
                <li className="flex items-start">
                  <Award className="w-5 h-5 text-orange-500 mr-3 shrink-0 flex-none"/>
                  <span className="text-[14px] font-semibold text-slate-700 leading-snug">Google Code Jam Finalist 2025</span>
                </li>
                <li className="flex items-start">
                  <Award className="w-5 h-5 text-orange-500 mr-3 shrink-0 flex-none"/>
                  <span className="text-[14px] font-semibold text-slate-700 leading-snug">Published Research Paper on Machine Learning</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Edit Profile / Auto-fill Modal Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[24px] w-full max-w-[600px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-extrabold text-slate-900">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              
              {/* Intelligent Fill Option */}
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-6 -mt-6">
                  <Wand2 className="w-24 h-24 text-blue-500 opacity-10 rotate-12" />
                </div>
                <h3 className="text-[16px] font-bold text-blue-900 mb-2 flex items-center">
                  <Wand2 className="w-4 h-4 mr-2" /> Auto-fill from Resume
                </h3>
                <p className="text-[13px] text-blue-700 font-medium mb-4">
                  Save time! Upload your PDF resume, and our AI will extract your skills, projects, and achievements automatically.
                </p>
                <button 
                  onClick={handleAutoFill}
                  disabled={isAutoFilling}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-blue-600/20 transition-all flex items-center disabled:opacity-50"
                >
                  {isAutoFilling ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Upload className="w-4 h-4 mr-2"/>}
                  {isAutoFilling ? "Extracting Details..." : "Upload PDF & Auto-fill"}
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="h-[1px] flex-1 bg-slate-200"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OR EDIT MANUALLY</span>
                <div className="h-[1px] flex-1 bg-slate-200"></div>
              </div>

              {/* Manual Form fields (Simplified for demo) */}
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">First Name</label>
                    <input type="text" defaultValue={user?.firstName || "Rahul"} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Last Name</label>
                    <input type="text" defaultValue={user?.lastName || "Kumar"} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Location</label>
                  <input type="text" defaultValue={user?.location || "Bangalore, India"} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Skills (comma separated)</label>
                  <textarea rows={2} defaultValue="JavaScript, React, Node.js, Python, Java, SQL, MongoDB, Git, AWS, Docker" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"></textarea>
                </div>
              </div>

            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert("Profile successfully manually updated!");
                  setIsEditing(false);
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
