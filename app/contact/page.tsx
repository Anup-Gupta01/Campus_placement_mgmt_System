export default function Contact() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 pb-32">
      <div className="w-20 h-20 bg-indigo-50 rounded-[24px] flex items-center justify-center mb-8 shadow-sm">
        <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      </div>
      <h1 className="text-[42px] font-extrabold mb-6 tracking-tight text-slate-900">Get in Touch</h1>
      <p className="text-[17px] text-slate-500 font-medium max-w-2xl text-center leading-relaxed">
        Our administrative team is actively engaged monitoring operations. Reach out directly via <span className="font-bold text-indigo-600">support@placementpro.edu</span> or visit the TnP Cell Block directly on campus between <span className="font-bold text-slate-700">9AM - 5PM</span>.
      </p>
    </div>
  );
}
