'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Github, Calendar, Tag, ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Project } from '@/types'

interface ProjectDetailModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export default function ProjectDetailModal({ project, isOpen, onClose }: ProjectDetailModalProps) {
  const [activeImage, setActiveImage] = useState<string>('')
  
  // รวมรูปปก + รูปใน Gallery เป็นลิสต์เดียว
  const allImages = project 
    ? [project.cover_image, ...(project.gallery_images || [])].filter(Boolean)
    : []

  // เมื่อเปิด Modal ให้รูปแรกเป็นรูปหลัก
  useEffect(() => {
    if (isOpen && allImages.length > 0) {
      setActiveImage(allImages[0])
    }
  }, [isOpen, project])

  if (!project) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-5xl bg-[#0a0a0a] border border-cyan-900/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors">
                <X size={20} />
            </button>

            {/* --- LEFT: IMAGE GALLERY --- */}
            <div className="w-full md:w-2/3 bg-black relative flex flex-col">
                {/* Main Image Display */}
                <div className="flex-1 relative bg-neutral-900 flex items-center justify-center overflow-hidden group">
                    {activeImage ? (
                        <motion.img 
                            key={activeImage}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            src={activeImage} 
                            className="max-h-full max-w-full object-contain"
                            alt="Project View"
                        />
                    ) : (
                        <div className="text-gray-700 flex flex-col items-center"><Layers size={48} /><span className="text-xs mt-2">NO IMAGE</span></div>
                    )}
                </div>

                {/* Thumbnails (ถ้ามีหลายรูป) */}
                {allImages.length > 1 && (
                    <div className="h-20 bg-[#050505] border-t border-white/10 flex items-center gap-2 px-4 overflow-x-auto custom-scrollbar">
                        {allImages.map((img, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setActiveImage(img)}
                                className={`relative w-16 h-12 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${activeImage === img ? 'border-cyan-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* --- RIGHT: DETAILS --- */}
            <div className="w-full md:w-1/3 bg-[#0a0a0a] border-l border-white/10 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-cyan-900/30 text-cyan-400 text-[10px] font-mono rounded border border-cyan-900/50 uppercase tracking-wider">
                            {project.category}
                        </span>
                        {project.is_featured && <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-500 text-[10px] font-mono rounded border border-yellow-900/50">FEATURED</span>}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 leading-tight">{project.title}</h2>
                    {project.created_at && (
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-mono">
                            <Calendar size={12} /> {new Date(project.created_at).toLocaleDateString()}
                        </div>
                    )}
                </div>

                {/* Description */}
                <div className="prose prose-invert prose-sm mb-8 text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {project.description || "No description provided."}
                </div>

                {/* Tags */}
                <div className="mb-8">
                    <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2"><Tag size={12}/> Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                        {project.tags?.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 mt-auto">
                    {project.demo_url && (
                        <a href={project.demo_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg transition-all">
                            <ExternalLink size={18} /> OPEN LIVE DEMO
                        </a>
                    )}
                    {project.repo_url && (
                        <a href={project.repo_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-lg transition-all">
                            <Github size={18} /> VIEW SOURCE CODE
                        </a>
                    )}
                </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}