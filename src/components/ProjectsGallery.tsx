'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Project } from '@/types'
import ProjectCard from './ProjectCard'
import ProjectDetailModal from './ProjectDetailModal' // Import Modal ใหม่

const CATEGORIES = [
  { id: 'all', label: 'All Work' },
  { id: 'dev', label: 'Development' },
  { id: 'iot', label: 'IoT / Embedded' },
  { id: 'photo', label: 'Photography' },
  { id: 'video', label: 'Video Edit' },
]

export default function ProjectsGallery() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  
  // State สำหรับ Modal
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('id', { ascending: false })

        if (error) throw error
        if (data) setProjects(data as any)
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const filteredProjects = projects.filter(p => filter === 'all' ? true : p.category === filter)

  // ฟังก์ชันเปิด Modal
  const handleOpenProject = (project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  return (
    <section className="py-20 px-8 md:px-24 w-full bg-black/50">
      
      {/* ใส่ Modal ไว้ตรงนี้ */}
      <ProjectDetailModal 
        project={selectedProject} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <div className="max-w-7xl mx-auto">
        {/* ... (Header เหมือนเดิม) ... */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 md:mb-0">Selected Works</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === cat.id ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
            <div className="flex justify-center py-20 text-cyan-500 animate-pulse">Loading Projects...</div>
        ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredProjects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onClick={() => handleOpenProject(project)} // ส่ง onClick ไป
                  />
                ))}
              </AnimatePresence>
            </motion.div>
        )}

        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-20 text-gray-500">No projects found.</div>
        )}
      </div>
    </section>
  )
}