'use client'

import { motion } from 'framer-motion'
// เปลี่ยน Palette เป็น Aperture ตามรีเควส
import { Quote, Star, Terminal, Plus, BarChart3, Users, Globe, Cpu, Smartphone, Aperture } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import ReviewModal from './ReviewModal'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

type Review = {
  id: string
  name: string
  role: string
  content: string
  rating: number
  created_at: string
  service_type?: string
}

// Icon Logic
const getServiceIcon = (type?: string) => {
  switch (type) {
    case 'web': return <Globe size={24} className="text-cyan-400" />
    case 'iot': return <Cpu size={24} className="text-orange-400" />
    case 'mobile': return <Smartphone size={24} className="text-blue-400" />
    case 'design': return <Aperture size={24} className="text-purple-400" /> // ใช้ Aperture (Focus)
    default: return <Terminal size={24} className="text-gray-400" />
  }
}

// Service Label (ตัวย่อ)
const getServiceLabel = (type?: string) => {
  switch (type) {
    case 'web': return 'WEB DEV'
    case 'iot': return 'IOT SYSTEM'
    case 'mobile': return 'MOBILE APP'
    case 'design': return 'MEDIA & DESIGN'
    default: return 'CONSULT'
  }
}

const InfiniteScrollMarquee = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex overflow-hidden select-none gap-6 mask-gradient-x py-8">
      <motion.div
        className="flex flex-shrink-0 gap-6 min-w-full pl-6"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        {children}
      </motion.div>
      <motion.div
        className="flex flex-shrink-0 gap-6 min-w-full pl-6"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchReviews = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (data) setReviews(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const stats = useMemo(() => {
    const total = reviews.length
    const average = total > 0 
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1) 
        : "0.0"
    
    const distribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percent: total > 0 ? (reviews.filter(r => r.rating === star).length / total) * 100 : 0
    }))

    return { total, average, distribution }
  }, [reviews])

  const displayReviews = reviews.length > 0 
    ? (reviews.length < 5 ? [...reviews, ...reviews, ...reviews] : reviews)
    : []

  return (
    <section id="testimonials" className="relative py-24 bg-[#050505] border-y border-white/5 overflow-hidden">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

      <div className="max-w-7xl mx-auto px-6 mb-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 text-cyan-500 font-mono text-xs tracking-[0.2em] mb-3 uppercase"
                >
                    <Terminal size={14} className="animate-pulse" /> // User_Feedback
                </motion.div>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
                    CLIENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">LOGS</span>
                </h2>
            </div>

            <button 
                onClick={() => setIsModalOpen(true)}
                className="group relative px-6 py-3 bg-white/5 border border-white/10 hover:border-cyan-500/50 text-white rounded-full overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
                <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2 font-mono text-sm">
                    <Plus size={16} /> WRITE_NEW_LOG
                </span>
            </button>
        </div>

        {/* Stats Section (คงเดิมไว้ เพราะสวยแล้ว) */}
        {reviews.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
            >
                {/* Score */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                     <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     <h3 className="text-6xl font-bold text-white mb-2">{stats.average}</h3>
                     <div className="flex gap-1 text-yellow-400 mb-2">
                         {[...Array(5)].map((_, i) => (
                             <Star key={i} size={20} fill={i < Math.round(Number(stats.average)) ? "currentColor" : "none"} className={i < Math.round(Number(stats.average)) ? "" : "text-white/20"} />
                         ))}
                     </div>
                     <p className="text-gray-500 font-mono text-xs">AVERAGE RATING</p>
                </div>
                {/* Total */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                     <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="p-4 rounded-full bg-white/5 mb-4 group-hover:scale-110 transition-transform">
                        <Users size={32} className="text-purple-400" />
                     </div>
                     <h3 className="text-4xl font-bold text-white mb-1">{stats.total}</h3>
                     <p className="text-gray-500 font-mono text-xs">TOTAL LOGS RECORDED</p>
                </div>
                {/* Distribution */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center backdrop-blur-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4 text-gray-400 font-mono text-xs">
                        <BarChart3 size={14} /> RATING DISTRIBUTION
                    </div>
                    <div className="space-y-2 w-full">
                        {stats.distribution.map((item) => (
                            <div key={item.star} className="flex items-center gap-3 text-xs">
                                <span className="w-3 text-white font-bold">{item.star}</span>
                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${item.percent}%` }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                    />
                                </div>
                                <span className="w-6 text-gray-500 text-right">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        )}

      </div>

      <ReviewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchReviews()} 
      />

      {reviews.length === 0 && !loading ? (
         <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl max-w-2xl mx-auto bg-white/5">
            <p className="text-gray-400 font-mono mb-4">NO_DATA_FOUND</p>
            <button onClick={() => setIsModalOpen(true)} className="text-cyan-400 hover:underline">Initiate First Transmission</button>
         </div>
      ) : (
        <InfiniteScrollMarquee>
            {displayReviews.map((item, index) => (
            <div
                key={`${item.id}-${index}`} 
                className="w-[380px] md:w-[450px] bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-xl p-8 relative flex flex-col justify-between group hover:border-cyan-500/40 transition-all duration-500"
            >
                <div className="absolute -top-[1px] -left-[1px] w-8 h-8 border-t-2 border-l-2 border-cyan-500 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -bottom-[1px] -right-[1px] w-8 h-8 border-b-2 border-r-2 border-cyan-500 rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} fill={i < item.rating ? "#22d3ee" : "none"} className={i < item.rating ? "text-cyan-400" : "text-gray-800"} />
                        ))}
                    </div>
                    <span className="text-[10px] font-mono text-gray-600">
                        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                </div>

                <div className="relative mb-8">
                    <Quote className="absolute -top-3 -left-2 text-white/5 rotate-180" size={40} />
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed relative z-10">
                        "{item.content}"
                    </p>
                </div>

                {/* --- ส่วนที่จัด Layout ใหม่ตามสั่ง --- */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    
                    {/* 1. Icon (Service Type) */}
                    <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-cyan-500/50 group-hover:bg-cyan-900/10 transition-all">
                            {getServiceIcon(item.service_type || 'other')}
                        </div>
                    </div>
                    
                    {/* 2. Details (Name & Org) */}
                    <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors truncate">
                            {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate mb-1">
                            {item.role} {/* แสดงชื่อบริษัท/ตำแหน่ง ที่นี่ */}
                        </p>
                        
                        {/* 3. Project Type Badge (เล็กๆ) */}
                        <div className="inline-block px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-gray-400 uppercase tracking-wide">
                           TYPE: {getServiceLabel(item.service_type || 'other')}
                        </div>
                    </div>
                </div>
            </div>
            ))}
        </InfiniteScrollMarquee>
      )}

      <style jsx global>{`
        .mask-gradient-x {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>

    </section>
  )
}