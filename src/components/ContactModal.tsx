'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getIcon } from '@/lib/iconMap'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const fetchContacts = async () => {
        setLoading(true)
        const { data } = await supabase
          .from('contacts')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        
        if (data) setContacts(data)
        setLoading(false)
      }
      fetchContacts()
    }
  }, [isOpen])

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-black/90 border border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden"
          >
            {/* Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">CONTACT_DATA</h3>
                <p className="text-xs font-mono text-cyan-500">SECURE CONNECTION ESTABLISHED</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contact List */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"> 
              {loading ? (
                <div className="flex justify-center py-8 text-cyan-500 gap-2">
                   <Loader2 className="animate-spin" /> Fetching Nodes...
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs font-mono">
                   NO_DATA_FOUND IN TABLE 'CONTACTS'
                </div>
              ) : (
                contacts.map((item) => {
                  const Icon = getIcon(item.icon)
                  const isCopied = copied === item.id

                  return (
                    <div 
                      key={item.id}
                      className="group flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all"
                    >
                      <a 
                        href={item.href} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-3 overflow-hidden flex-1"
                      >
                        <div className="p-2 bg-black rounded-lg text-cyan-400 group-hover:text-white group-hover:bg-cyan-500 transition-colors">
                          <Icon size={18} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] text-gray-500 font-mono uppercase group-hover:text-cyan-400">{item.platform}</span>
                          <span className="text-sm text-gray-200 truncate">{item.value}</span>
                        </div>
                      </a>

                      <button
                        onClick={() => handleCopy(item.value, item.id)}
                        className="p-2 text-gray-400 hover:text-white transition-colors active:scale-90"
                        title="Copy"
                      >
                        {isCopied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-500 font-mono">
              <span>STATUS: AVAILABLE FOR WORK</span>
              <span className="animate-pulse text-green-500">● ONLINE</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}