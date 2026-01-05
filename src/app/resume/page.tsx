'use client'

import { motion } from 'framer-motion'
import { Printer, Mail, Phone, MapPin, Github, Linkedin, Globe, Briefcase, GraduationCap, Cpu, PenTool, Users } from 'lucide-react'
import QRCode from "react-qr-code"
import OpticalFiberBackground from '@/components/OpticalFiberBackground'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PORTFOLIO_URL = "https://your-portfolio.vercel.app" 

export default function ResumePage() {
  const [profile, setProfile] = useState<any>({
     // Default Value ป้องกันจอขาวถ้าเน็ตช้า
     display_name: 'LOADING...',
     hard_skills: [],
     soft_skills: [],
     education: [],
     experience: [],
     resume_projects: [],
     languages: []
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('profile_config').select('*').eq('id', 1).single()
      if (data) setProfile(data)
    }
    fetchProfile()
  }, [])
  
  const handlePrint = () => window.print()

  return (
    // แก้ไข CSS: print:p-0 print:pt-0 เพื่อแก้ปัญหาหน้าล้นลงล่าง
    <div className="min-h-screen pt-28 pb-10 px-4 flex justify-center relative print:p-0 print:m-0 print:block print:bg-white">
      
      {/* Background Layer (Hide on Print) */}
      <div className="fixed inset-0 z-0 print:hidden">
        <OpticalFiberBackground />
      </div>

      <style jsx global>{`
        @media print {
          @page { margin: 0; size: auto; } /* Reset Margin ของ Browser */
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .resume-sheet {
            width: 100% !important; max-width: none !important;
            margin: 0 !important; padding: 10mm 15mm !important;
            box-shadow: none !important; border: none !important;
          }
          /* บังคับ Grid ให้สวยในหน้ากระดาษ */
          .resume-grid { display: grid !important; grid-template-columns: 30% 66% !important; gap: 4% !important; }
          .avoid-break { break-inside: avoid !important; }
        }
      `}</style>

      {/* Print Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-8 right-8 z-50 no-print">
        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-bold rounded-full shadow hover:bg-cyan-400 hover:scale-105 transition-all">
          <Printer size={20} /> PRINT PDF
        </button>
      </motion.div>

      {/* --- RESUME SHEET --- */}
      <div className="resume-sheet w-[210mm] min-h-[297mm] bg-white text-black p-[15mm] shadow-2xl relative flex flex-col z-10">
        
        {/* Header Strip */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-700 print:h-2" />

        {/* ================= HEADER ================= */}
        <header className="border-b-2 border-gray-800 pb-6 mb-8 flex gap-6 items-center avoid-break">
          <div className="flex-shrink-0">
            <img src="/avatar.jpg" alt="Profile" className="w-[130px] h-[130px] rounded-full border-4 border-gray-100 object-cover shadow-sm bg-gray-200"
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/130?text=PHOTO' }} />
          </div>

          <div className="flex-grow">
            <h1 className="text-4xl font-extrabold uppercase tracking-tight text-gray-900 leading-none mb-2">{profile.display_name}</h1>
            <h2 className="text-lg font-mono text-cyan-700 font-bold tracking-widest uppercase mb-3">{profile.role_title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed max-w-lg">{profile.about_text}</p>
          </div>
          
          <div className="flex-shrink-0 flex flex-col items-end gap-2">
              <div className="bg-white p-1 border border-gray-200"><QRCode value={PORTFOLIO_URL} size={70} style={{ height: "auto", width: "100%" }} viewBox={`0 0 256 256`}/></div>
              <div className="text-right text-[10px] font-medium space-y-1 text-gray-700 mt-1">
                <a href={`mailto:${profile.email}`} className="flex items-center justify-end gap-1.5 hover:text-cyan-600 cursor-pointer">{profile.email} <Mail size={12} className="text-cyan-600"/></a>
                <a href={`tel:${profile.phone}`} className="flex items-center justify-end gap-1.5 hover:text-cyan-600 cursor-pointer">{profile.phone} <Phone size={12} className="text-cyan-600"/></a>
                
                {/* แก้ไข Github ตามสั่ง: ใส่ akkalak213 ไว้หน้าไอคอน */}
                <a href={profile.github_url} target="_blank" className="flex items-center justify-end gap-1.5 hover:text-cyan-600 cursor-pointer font-bold">
                    akkalak213 <Github size={12} className="text-cyan-600"/>
                </a>
              </div>
          </div>
        </header>

        {/* ================= CONTENT GRID ================= */}
        <div className="resume-grid grid grid-cols-1 md:grid-cols-[30%_66%] gap-8 flex-grow items-start">
          
          {/* === LEFT COLUMN === */}
          <div className="flex flex-col gap-8">
            
            {/* HARD SKILLS (Dynamic) */}
            <section className="avoid-break">
               <h3 className="text-sm font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3 flex items-center gap-2"><Cpu size={16} /> Hard Skills</h3>
               <div className="space-y-4">
                 {(profile.hard_skills || []).map((skill: any, i: number) => (
                    <div key={i}>
                        <strong className="text-xs font-black text-cyan-800 block mb-1">{skill.category}</strong>
                        <p className="text-xs text-gray-700 leading-relaxed">{skill.items}</p>
                    </div>
                 ))}
               </div>
            </section>

             {/* SOFT SKILLS (Dynamic) */}
             <section className="avoid-break">
               <h3 className="text-sm font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3 flex items-center gap-2"><Users size={16} /> Soft Skills</h3>
               <div className="flex flex-wrap gap-2">
                  {(profile.soft_skills || []).map((skill: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-[10px] font-bold text-gray-700 rounded border border-gray-200">{skill}</span>
                  ))}
               </div>
            </section>

            {/* EDUCATION (Dynamic) */}
            <section className="avoid-break">
               <h3 className="text-sm font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3 flex items-center gap-2"><GraduationCap size={16} /> Education</h3>
               <div className="space-y-4">
                  {(profile.education || []).map((edu: any, i: number) => (
                      <div key={i}>
                        <div className="text-sm font-bold text-gray-900">{edu.degree}</div>
                        <div className="text-xs text-gray-600 font-medium">{edu.institution}</div>
                        <div className="text-xs text-gray-400 italic">{edu.year}</div>
                        {edu.detail && <p className="text-[10px] text-gray-500 mt-1">{edu.detail}</p>}
                      </div>
                  ))}
               </div>
            </section>

            {/* LANGUAGES (Dynamic) */}
            <section className="avoid-break">
               <h3 className="text-sm font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3 flex items-center gap-2"><Globe size={16} /> Languages</h3>
               <ul className="text-xs space-y-1.5 text-gray-700">
                 {(profile.languages || []).map((lang: any, i: number) => (
                    <li key={i} className="flex justify-between border-b border-gray-100 pb-1">
                        <span>{lang.lang}</span> <span className="font-bold text-gray-400">{lang.level}</span>
                    </li>
                 ))}
               </ul>
            </section>
          </div>

          {/* === RIGHT COLUMN === */}
          <div className="flex flex-col gap-6">
            
            {/* EXPERIENCE (Dynamic) */}
            <section className="avoid-break">
               <h3 className="text-sm font-bold uppercase border-b-2 border-gray-800 pb-1 mb-5 flex items-center gap-2"><Briefcase size={16} /> Professional Experience</h3>
               <div className="space-y-6">
                 {(profile.experience || []).map((exp: any, i: number) => (
                    <div key={i} className="relative pl-5 border-l-2 border-gray-200">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-gray-800 rounded-full"></div>
                        <div className="flex justify-between items-end mb-1">
                            <h4 className="font-bold text-sm text-gray-900">{exp.title}</h4>
                            <span className="text-[10px] font-mono font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{exp.year}</span>
                        </div>
                        <div className="text-xs font-bold text-cyan-700 mb-2">{exp.company}</div>
                        <ul className="list-disc ml-4 text-[11px] text-gray-700 space-y-2 leading-relaxed">
                            {Array.isArray(exp.details) ? exp.details.map((d: string, j: number) => <li key={j}>{d}</li>) : <li>{exp.details}</li>}
                        </ul>
                    </div>
                 ))}
               </div>
            </section>

            {/* PROJECTS (Dynamic) */}
            <section className="avoid-break flex-grow">
               <h3 className="text-sm font-bold uppercase border-b-2 border-gray-800 pb-1 mb-5 flex items-center gap-2"><PenTool size={16} /> Key Projects</h3>
               <div className="grid grid-cols-1 gap-4">
                  {(profile.resume_projects || []).map((proj: any, i: number) => (
                      <div key={i} className="bg-gray-50 p-4 rounded border border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                            <strong className="text-sm text-gray-900">{proj.name}</strong>
                            <span className="text-[9px] font-bold border border-cyan-500 text-cyan-700 px-1.5 rounded">{proj.tech}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-relaxed mt-1">{proj.desc}</p>
                      </div>
                  ))}
               </div>
            </section>

          </div>
        </div>

        <div className="absolute bottom-4 left-0 w-full text-center print:block">
            <span className="text-[8px] text-gray-300 font-mono tracking-[0.3em] uppercase">DIGITAL RESUME :: GENERATED BY SYSTEM</span>
        </div>
      </div>
    </div>
  )
}