"use client";

import { useState, useEffect } from "react";
import { 
  Upload, FileText, CheckCircle, ArrowLeft, Loader2, Download, Trash2, 
  MapPin, Phone, Mail, GraduationCap, Award, GitBranch, Terminal, ExternalLink,
  Wand2, Save, X, PlusCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  // Form State
  const [editForm, setEditForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", location: "", branch: "", cgpa: "",
    skillsStr: "", achievementsStr: "",
    projects: [] as any[]
  });

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

  const openEditModal = () => {
    setEditForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.mobileNo || "",
      location: user?.location || "",
      branch: user?.branch || "",
      cgpa: user?.cgpa?.toString() || "",
      skillsStr: user?.skills?.join(", ") || "",
      achievementsStr: user?.achievements?.join("\n") || "",
      projects: user?.projects ? JSON.parse(JSON.stringify(user.projects)) : []
    });
    setIsEditing(true);
  };

  const addProjectField = () => {
    setEditForm(prev => ({
      ...prev,
      projects: [...prev.projects, { title: "", description: "", tags: [], link: "" }]
    }));
  };

  const updateProjectField = (index: number, field: string, value: string) => {
    const updatedProjects = [...editForm.projects];
    if (field === "tags") {
      updatedProjects[index][field] = value.split(",").map(t => t.trim()).filter(t => t);
    } else {
      updatedProjects[index][field] = value;
    }
    setEditForm(prev => ({ ...prev, projects: updatedProjects }));
  };

  const removeProjectField = (index: number) => {
    const updatedProjects = [...editForm.projects];
    updatedProjects.splice(index, 1);
    setEditForm(prev => ({ ...prev, projects: updatedProjects }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const skills = editForm.skillsStr.split(",").map(s => s.trim()).filter(s => s);
      const achievements = editForm.achievementsStr.split("\n").map(s => s.trim()).filter(s => s);
      
      const payload = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        location: editForm.location,
        branch: editForm.branch,
        cgpa: parseFloat(editForm.cgpa) || null,
        skills,
        achievements,
        projects: editForm.projects
      };

      const token = sessionStorage.getItem("token");
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save profile");
      const { user: updatedUser } = await res.json();
      setUser(updatedUser);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

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

      // Upload to Cloudinary via backend
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Cloudinary upload failed on the backend!");
      const { url } = await res.json();

      // Ensure resumes array exists
      const existingResumes = user?.resumes || [];
      const newResume = {
        name: file.name,
        url: url,
        size: file.size,
        date: new Date(),
        tags: [] // user can add tags later or we leave blank
      };

      const token = sessionStorage.getItem("token");
      const updateRes = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          resumeUrl: url, // Keep fallback
          resumes: [...existingResumes, newResume]
        })
      });

      if (!updateRes.ok) throw new Error("Database update tracking failed!");
      const { user: updatedUser } = await updateRes.json();
      
      setUser(updatedUser);
      alert("Resume securely uploaded to cloud and added to your profile!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = ''; // reset file input
    }
  };

  const handleDeleteResume = async (indexToDelete: number) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    
    try {
      const updatedResumes = [...(user?.resumes || [])];
      updatedResumes.splice(indexToDelete, 1);

      const token = sessionStorage.getItem("token");
      const updateRes = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ resumes: updatedResumes })
      });

      if (!updateRes.ok) throw new Error("Failed to delete resume");
      const { user: updatedUser } = await updateRes.json();
      setUser(updatedUser);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAutoFill = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be strictly less than 5MB");
      return;
    }

    setIsAutoFilling(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to extract data");

      setEditForm(prev => ({
        ...prev,
        firstName: data.firstName || prev.firstName,
        lastName: data.lastName || prev.lastName,
        email: data.email || prev.email,
        phone: data.phone || data.mobileNo || prev.phone,
        location: data.location || prev.location,
        branch: data.branch || prev.branch,
        cgpa: data.cgpa || prev.cgpa,
        skillsStr: data.skillsStr || prev.skillsStr,
        achievementsStr: data.achievementsStr || prev.achievementsStr,
        projects: data.projects?.length > 0 ? data.projects : prev.projects
      }));

      alert("Extracted data from PDF securely! Review and save changes.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAutoFilling(false);
      if (e.target) e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 w-full font-sans pb-20">
      
      {/* Top action bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
          <button 
            onClick={openEditModal}
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 w-full">
        
        {/* Gradient Banner */}
        <div className="w-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] rounded-[20px] p-8 sm:p-10 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-[50px]"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-4xl sm:text-5xl font-bold flex-shrink-0 uppercase">
              {user?.firstName?.charAt(0) || "S"}
            </div>
            
            <div className="flex-1">
              <h2 className="text-3xl sm:text-[34px] font-bold mb-1.5 capitalize">{user?.firstName || "Student"} {user?.lastName || ""}</h2>
              <p className="text-white/80 font-medium text-base mb-5 capitalize">{user?.branch || "Computer Science Engineering"} {user?.year ? `• ${user.year}th Year` : ""}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-white/90">
                <div className="flex items-center"><Mail className="w-4 h-4 mr-2.5 opacity-70"/> {user?.email || "No email"}</div>
                <div className="flex items-center"><Phone className="w-4 h-4 mr-2.5 opacity-70"/> {user?.mobileNo || "No phone"}</div>
                <div className="flex items-center capitalize"><MapPin className="w-4 h-4 mr-2.5 opacity-70"/> {user?.location || "Location not set"}</div>
                <div className="flex items-center"><GraduationCap className="w-4 h-4 mr-2.5 opacity-70"/> CGPA: {user?.cgpa || "N/A"}</div>
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
                  <div className="px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[14px] font-medium text-slate-500 flex items-center capitalize">
                    <UserIcon className="w-4 h-4 mr-3 text-slate-400" />
                    {user?.firstName} {user?.lastName}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Email</label>
                  <div className="px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[14px] font-medium text-slate-500 flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-slate-400" />
                    {user?.email}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Phone</label>
                  <div className="px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[14px] font-medium text-slate-500 flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-slate-400" />
                    {user?.mobileNo}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Location</label>
                  <div className="px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[14px] font-medium text-slate-500 flex items-center capitalize">
                    <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                    {user?.location || "Not set"}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Branch</label>
                  <div className="px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[14px] font-medium text-slate-500 flex items-center capitalize">
                    <GraduationCap className="w-4 h-4 mr-3 text-slate-400" />
                    {user?.branch || "Not set"}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">CGPA</label>
                  <div className="px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[14px] font-medium text-slate-500 flex items-center">
                    {user?.cgpa || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-8">
              <h3 className="text-[17px] font-bold text-slate-900 mb-1">Skills</h3>
              <p className="text-[14px] text-slate-500 font-medium mb-6">Your technical and soft skills</p>
              
              <div className="flex flex-wrap gap-2.5">
                {user?.skills && user.skills.length > 0 ? (
                  user.skills.map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-[13px] font-bold rounded-lg flex items-center">
                      <Terminal className="w-3.5 h-3.5 mr-2 text-slate-400"/> {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">No skills added yet. Edit profile to add some!</p>
                )}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-8">
              <h3 className="text-[17px] font-bold text-slate-900 mb-1">Projects</h3>
              <p className="text-[14px] text-slate-500 font-medium mb-6">Showcase your work</p>
              
              <div className="space-y-6">
                {user?.projects && user.projects.length > 0 ? (
                  user.projects.map((proj: any, i: number) => (
                    <div key={i} className="border border-slate-200 rounded-[14px] p-6">
                      <h4 className="text-[18px] font-bold text-slate-900">{proj.title}</h4>
                      <p className="text-[15px] font-medium text-slate-600 mt-2 mb-4">{proj.description}</p>
                      
                      {proj.tags && proj.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {proj.tags.map((tag: string, j: number) => (
                            <span key={j} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[12px] font-semibold rounded-md shadow-sm">{tag}</span>
                          ))}
                        </div>
                      )}
                      
                      {proj.link && (
                        <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                          <GitBranch className="w-4 h-4 mr-1.5"/> {proj.link}
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">No projects added yet.</p>
                )}
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
                <button className="h-9 w-9 bg-white border border-slate-200 text-slate-600 flex items-center justify-center rounded-lg hover:bg-slate-50 transition-colors shadow-sm relative shrink-0">
                  <input type="file" accept=".pdf" disabled={uploading} onChange={handleResumeUpload} title="Upload New Resume" className="absolute inset-0 opacity-0 cursor-pointer" />
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Upload className="w-4 h-4" />}
                </button>
              </div>

              {/* List of resumes from array */}
              {user?.resumes && user.resumes.length > 0 ? (
                user.resumes.map((resume: any, i: number) => (
                  <div key={i} className="border border-slate-200 rounded-2xl p-4 mb-4 bg-white hover:border-blue-200 transition-all">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 bg-[#EEF2FF] text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5"/>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-[14px] font-bold text-slate-900 truncate" title={resume.name}>{resume.name}</h4>
                        <p className="text-[12px] font-semibold text-slate-500 mt-1">{formatFileSize(resume.size)} • {formatDate(resume.date)}</p>
                      </div>
                    </div>
                    {resume.tags && resume.tags.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase">Used for:</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {resume.tags.map((tag: string, j: number) => (
                            <span key={j} className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-md">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <a
                        href={`https://docs.google.com/viewer?url=${encodeURIComponent(resume.url)}&embedded=false`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-700 text-[12px] font-bold rounded-lg flex items-center justify-center hover:bg-slate-50"
                      >
                        View
                      </a>
                      <a
                        href={resume.url.replace('/upload/', '/upload/fl_attachment/')}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex-1 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[12px] font-bold rounded-lg flex items-center justify-center hover:bg-indigo-100"
                      >
                        Download
                      </a>
                      <button onClick={() => handleDeleteResume(i)} className="px-3 py-1.5 bg-white border border-red-200 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-50">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                   <p className="text-sm text-slate-500 mb-2">No resumes found.</p>
                   <p className="text-xs text-slate-400">Upload a PDF to sync with Cloudinary</p>
                </div>
              )}

            </div>

            {/* Achievements */}
            <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6">
              <h3 className="text-[16px] font-bold text-slate-900">Achievements</h3>
              <p className="text-[13px] text-slate-500 font-medium mb-6 mt-0.5">Your accomplishments</p>
              
              {user?.achievements && user.achievements.length > 0 ? (
                <ul className="space-y-4">
                  {user.achievements.map((ach: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <Award className="w-5 h-5 text-orange-500 mr-3 shrink-0 flex-none"/>
                      <span className="text-[14px] font-semibold text-slate-700 leading-snug">{ach}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 italic">No achievements listed.</p>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Edit Profile / Auto-fill Modal Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-6">
          <div className="bg-white rounded-[24px] w-full max-w-[700px] shadow-2xl flex flex-col h-full max-h-[95vh]">
            
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-[24px] shrink-0">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Edit Profile</h2>
                <p className="text-xs font-semibold text-slate-500 mt-1">Update your personal and professional details</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              
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
                  disabled={isAutoFilling}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-blue-600/20 transition-all flex items-center disabled:opacity-50 relative overflow-hidden"
                >
                  <input type="file" accept=".pdf" onChange={handleAutoFill} disabled={isAutoFilling} title="Upload PDF to Auto-fill" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  {isAutoFilling ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Upload className="w-4 h-4 mr-2"/>}
                  {isAutoFilling ? "Extracting Details..." : "Upload PDF & Auto-fill"}
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="h-[1px] flex-1 bg-slate-200"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OR EDIT MANUALLY</span>
                <div className="h-[1px] flex-1 bg-slate-200"></div>
              </div>

              {/* Manual Form fields */}
              <div className="space-y-6">
                
                {/* Section: Basic Auth Data */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Basic Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">First Name</label>
                      <input type="text" value={editForm.firstName} onChange={e => setEditForm(p => ({...p, firstName: e.target.value}))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Last Name</label>
                      <input type="text" value={editForm.lastName} onChange={e => setEditForm(p => ({...p, lastName: e.target.value}))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div className="sm:col-span-1">
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">CGPA</label>
                      <input type="text" value={editForm.cgpa} onChange={e => setEditForm(p => ({...p, cgpa: e.target.value}))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" placeholder="e.g. 8.5" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Branch</label>
                      <input type="text" value={editForm.branch} onChange={e => setEditForm(p => ({...p, branch: e.target.value}))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" placeholder="Computer Science Engineering" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Location</label>
                    <input type="text" value={editForm.location} onChange={e => setEditForm(p => ({...p, location: e.target.value}))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" placeholder="City, Country" />
                  </div>
                </div>

                {/* Section: Text Areas */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Skills & Achievements</h4>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Skills (comma separated)</label>
                    <textarea value={editForm.skillsStr} onChange={e => setEditForm(p => ({...p, skillsStr: e.target.value}))} rows={2} placeholder="React, Node.js, Python..." className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"></textarea>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Achievements (one per line)</label>
                    <textarea value={editForm.achievementsStr} onChange={e => setEditForm(p => ({...p, achievementsStr: e.target.value}))} rows={3} placeholder="Winner of Hackathon 2025&#10;Published Paper..." className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"></textarea>
                  </div>
                </div>

                {/* Section: Projects Array */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-sm font-bold text-slate-900">Projects</h4>
                    <button type="button" onClick={addProjectField} className="text-[12px] font-bold text-blue-600 flex items-center hover:text-blue-700">
                      <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Project
                    </button>
                  </div>
                  
                  {editForm.projects.length === 0 && <p className="text-xs text-slate-400 italic">No projects added yet.</p>}

                  {editForm.projects.map((proj, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative group">
                      <button type="button" onClick={() => removeProjectField(idx)} className="absolute top-2 right-2 p-1.5 bg-white text-red-400 rounded-md shadow-sm border border-red-100 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      
                      <div className="space-y-3 mt-2">
                        <div>
                          <input type="text" placeholder="Project Title" value={proj.title} onChange={e => updateProjectField(idx, 'title', e.target.value)} className="w-[calc(100%-30px)] px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"/>
                        </div>
                        <div>
                          <input type="text" placeholder="Description" value={proj.description} onChange={e => updateProjectField(idx, 'description', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"/>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <input type="text" placeholder="Tags (comma separated)" value={proj.tags?.join(", ")} onChange={e => updateProjectField(idx, 'tags', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"/>
                           <input type="text" placeholder="Link (URL)" value={proj.link} onChange={e => updateProjectField(idx, 'link', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 rounded-b-[24px] shrink-0">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />}
                {saving ? "Saving..." : "Save Changes to Database"}
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
