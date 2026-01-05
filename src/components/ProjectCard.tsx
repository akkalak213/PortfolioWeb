'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Github, Layers, Image as ImageIcon, Plus } from 'lucide-react'
import { Project } from '@/types'

// เพิ่ม onClick เข้าไปใน Interface ตรงนี้ครับ
interface ProjectCardProps {
  project: Project
  onClick?: () => void 
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onClick={onClick} // ผูก Event Click ตรงนี้
      className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-black">
        {project.cover_image ? (
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-700">
            <Layers size={32} />
          </div>
        )}
        
        {/* Hover Overlay: Click to View */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]">
            <span className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-bold rounded-full text-sm">
                <Plus size={16} /> VIEW DETAILS
            </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-100 line-clamp-1 group-hover:text-cyan-400 transition-colors">{project.title}</h3>
          {project.is_featured && <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/30">HOT</span>}
        </div>
        <p className="text-gray-400 text-xs mb-4 line-clamp-2 h-8 leading-relaxed">{project.description}</p>
        
        <div className="flex flex-wrap gap-1.5">
          {project.tags?.slice(0, 3).map((tag, index) => (
            <span key={index} className="text-[10px] px-2 py-1 bg-white/5 text-gray-400 rounded border border-white/5">
              {tag}
            </span>
          ))}
          {(project.tags?.length || 0) > 3 && <span className="text-[10px] px-2 py-1 text-gray-600">+{project.tags!.length - 3}</span>}
        </div>
      </div>
    </motion.div>
  )
}