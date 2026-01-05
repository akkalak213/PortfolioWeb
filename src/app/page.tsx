'use client'

import { motion, Variants } from 'framer-motion'
import { ArrowRight, Code, Camera, Cpu, Video } from 'lucide-react'
import ProjectsGallery from '@/components/ProjectsGallery'
import OpticalFiberBackground from '@/components/OpticalFiberBackground'
import TechStack from '@/components/TechStack'
// 1. Import Component ใหม่
import Testimonials from '@/components/Testimonials'
// 2. Import Store
import { useUIStore } from '@/store/useUIStore'

export default function Home() {
  
  // 3. ดึง function เปิด Modal มาใช้
  const openContactModal = useUIStore((state) => state.openContactModal)

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] as const } 
    }
  }

  return (
    <main className="min-h-screen relative overflow-x-hidden text-white">
      
      <OpticalFiberBackground />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center p-8 md:p-24 relative z-10">
        
        <motion.div 
          className="max-w-4xl w-full text-center md:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Role Tags */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center md:justify-start gap-3 mb-6 text-sm font-mono text-gray-400">
            <span className="flex items-center gap-1 px-3 py-1 border border-cyan-900/50 rounded-full bg-black/40 backdrop-blur-sm hover:border-cyan-500/50 transition-colors cursor-default">
              <Code size={14} className="text-cyan-400" /> Full Stack Dev
            </span>
            <span className="flex items-center gap-1 px-3 py-1 border border-orange-900/50 rounded-full bg-black/40 backdrop-blur-sm hover:border-orange-500/50 transition-colors cursor-default">
              <Cpu size={14} className="text-orange-400" /> IoT Engineer
            </span>
            <span className="flex items-center gap-1 px-3 py-1 border border-purple-900/50 rounded-full bg-black/40 backdrop-blur-sm hover:border-purple-500/50 transition-colors cursor-default">
              <Camera size={14} className="text-purple-400" /> Photographer
            </span>
            <span className="flex items-center gap-1 px-3 py-1 border border-pink-900/50 rounded-full bg-black/40 backdrop-blur-sm hover:border-pink-500/50 transition-colors cursor-default">
              <Video size={14} className="text-pink-400" /> Editor
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
            Building Digital <br />
            <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">Experiences.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed mb-10 mx-auto md:mx-0 font-mono">
            &gt; I craft high-performance web applications, engineer IoT solutions, 
            and capture stories through visual media. Precision in code, art in motion.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button 
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative px-6 py-3 bg-cyan-500 text-black font-bold font-mono rounded-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
            >
              <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out opacity-20" />
              <span className="relative flex items-center justify-center gap-2">
                VIEW_PROJECTS <ArrowRight size={18} />
              </span>
            </button>
            
            {/* 4. เปลี่ยนจาก <a> เป็น <button> และใช้ onClick เปิด Modal */}
            <button 
              onClick={openContactModal}
              className="px-6 py-3 text-cyan-500 font-mono hover:text-white transition-colors border border-cyan-900 hover:border-cyan-500 rounded-lg backdrop-blur-sm bg-black/20 flex items-center justify-center"
            >
              CONTACT_ME
            </button>
          </motion.div>

        </motion.div>
      </section>

      {/* Projects Gallery Section */}
      <div id="projects" className="relative z-10 scroll-mt-20">
        <ProjectsGallery />
      </div>

      {/* Tech Stack Section */}
      <div id="stack" className="relative z-10 scroll-mt-20">
        <TechStack />
      </div>
      
      {/* 5. เพิ่ม Testimonials Section ตรงนี้ */}
      <Testimonials />

    </main>
  )
}