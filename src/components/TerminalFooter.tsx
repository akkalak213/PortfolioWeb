'use client'

import { motion } from 'framer-motion'
import { ArrowUpCircle, Terminal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getIcon } from '@/lib/iconMap'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TerminalFooter() {
  const [socialLinks, setSocialLinks] = useState<any[]>([])

  useEffect(() => {
    const fetchLinks = async () => {
        const { data } = await supabase
            .from('contacts')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
        
        if (data) setSocialLinks(data)
    }
    fetchLinks()
  }, [])

  return (
    <footer className="relative bg-[#050505] border-t border-cyan-900/30 py-8 mt-10 font-mono text-xs text-cyan-500/70 z-40 print:hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Left: System ID */}
          <div className="flex items-center gap-2 order-2 md:order-1 opacity-70">
             <Terminal size={14} className="text-cyan-400 animate-pulse" />
             <span className="tracking-wider">CONTACT_NODE :: ONLINE</span>
          </div>

          {/* Center: Social Links (Dynamic) */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 order-1 md:order-2">
              {socialLinks.length === 0 ? (
                 <span className="text-[10px] text-gray-600">WAITING FOR DATA...</span>
              ) : (
                socialLinks.map((link) => {
                    const Icon = getIcon(link.icon)
                    return (
                    <motion.a 
                        key={link.id}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.2, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        className="relative group flex flex-col items-center justify-center p-2 rounded-lg hover:bg-cyan-500/10 transition-colors"
                        title={link.platform}
                    >
                        <Icon size={20} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                        <span className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-cyan-300 tracking-wider whitespace-nowrap">
                        {link.platform.toUpperCase()}
                        </span>
                    </motion.a>
                    )
                })
              )}
          </div>

          {/* Right: Copyright */}
          <div className="flex items-center gap-4 order-3 text-[10px] opacity-50">
             <span>&copy; {new Date().getFullYear()} DEV_PROFILE</span>
             <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-cyan-400 transition-colors p-1"
             >
                <ArrowUpCircle size={16} />
             </button>
          </div>

        </div>
      </div>
    </footer>
  )
}