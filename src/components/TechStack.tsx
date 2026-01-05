'use client'

import { motion } from 'framer-motion'
import { Code, Database, Cpu, Smartphone, Aperture, Layers } from 'lucide-react'

const stackGroups = [
  {
    title: 'Frontend Core',
    icon: Code,
    color: 'text-cyan-400',
    skills: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'React']
  },
  {
    title: 'Backend & Cloud',
    icon: Database,
    color: 'text-emerald-400',
    skills: ['Supabase', 'Node.js', 'Golang', 'PostgreSQL', 'Vercel', 'Firebase']
  },
  {
    title: 'IoT & Hardware',
    icon: Cpu,
    color: 'text-orange-400',
    skills: ['ESP32', 'KidBright', 'C++', 'Python', 'MQTT Protocol', 'Sensors Integration']
  },
  {
    title: 'Mobile App',
    icon: Smartphone,
    color: 'text-blue-400',
    skills: ['Flutter', 'Dart', 'Cross-Platform Dev', 'Mobile UI/UX']
  },
  {
    title: 'Creative & Media',
    icon: Aperture,
    color: 'text-purple-400',
    skills: ['DaVinci Resolve', 'Premiere Pro', 'Lightroom', 'Photography', 'Motion Graphics']
  },
  {
    title: 'Tools & DevOps',
    icon: Layers,
    color: 'text-pink-400',
    skills: ['Git / GitHub', 'VS Code', 'Docker', 'Linux Cmd', 'Agile/Scrum']
  }
]

export default function TechStack() {
  return (
    // ลบ id="stack" ออกจากตรงนี้ เพราะมีใน page.tsx แล้ว
    <section className="relative py-24 px-6 md:px-12 bg-black/40 overflow-hidden">
      
      {/* Background Circuit Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-0 w-full h-[1px] bg-cyan-500" />
        <div className="absolute bottom-10 left-0 w-full h-[1px] bg-cyan-500" />
        <div className="absolute top-0 left-10 w-[1px] h-full bg-cyan-500" />
        <div className="absolute top-0 right-10 w-[1px] h-full bg-cyan-500" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter">
            <span className="text-white">SYSTEM</span>
            <span className="text-cyan-500">_ARCHITECTURE</span>
          </h2>
          <p className="text-gray-400 font-mono text-sm md:text-base max-w-2xl mx-auto">
             // My arsenal of tools and technologies tailored for performance and scalability.
          </p>
        </motion.div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stackGroups.map((group, index) => {
            const Icon = group.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative bg-white/5 border border-white/10 rounded-xl p-6 hover:border-cyan-500/50 transition-colors overflow-hidden"
              >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Header Card */}
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className={`p-3 rounded-lg bg-black/50 border border-white/10 ${group.color}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {group.title}
                  </h3>
                </div>

                {/* Skills List */}
                <div className="flex flex-wrap gap-2 relative z-10">
                  {group.skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="px-3 py-1 text-xs font-mono text-gray-300 bg-black/40 border border-white/5 rounded-md group-hover:border-cyan-500/30 group-hover:text-cyan-100 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent -mr-8 -mt-8 rotate-45 group-hover:from-cyan-500/20 transition-all" />

              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}