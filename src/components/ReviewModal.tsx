'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Star, User, MessageSquare, Globe, Cpu, Smartphone, Aperture, Terminal, Briefcase } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const SERVICE_TYPES = [
  { id: 'web', label: 'Web Dev', icon: Globe },
  { id: 'iot', label: 'IoT', icon: Cpu }, // ย่อชื่อให้สั้นลง
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'design', label: 'Design', icon: Aperture },
  { id: 'other', label: 'Other', icon: Terminal },
]

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ReviewModal({ isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState(5)
  const [serviceType, setServiceType] = useState('web')
  const [formData, setFormData] = useState({ name: '', role: '', content: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('reviews')
      .insert([
        {
          name: formData.name,
          role: formData.role || 'Independent Client',
          content: formData.content,
          rating: rating,
          service_type: serviceType
        }
      ])

    setLoading(false)

    if (!error) {
      setFormData({ name: '', role: '', content: '' })
      setServiceType('web')
      onSuccess()
      onClose()
    } else {
      alert('Error sending data.')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        >
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="modal-card"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            // ปรับ max-w-md (เล็กลงนิดหน่อย) และ p-5 (ลด padding)
            className="relative w-full max-w-md bg-[#0a0a0a] border border-cyan-900 rounded-xl p-5 shadow-[0_0_30px_rgba(6,182,212,0.2)] overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50" />
             
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare size={18} className="text-cyan-500" /> NEW_ENTRY
                </h3>
                <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Rating (ลดขนาดลงนิดนึง) */}
                <div className="flex flex-col items-center gap-1">
                    <label className="text-[10px] text-cyan-500 font-mono tracking-widest">RATING_LEVEL</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`transition-all hover:scale-110 ${star <= rating ? 'text-cyan-400' : 'text-gray-800'}`}
                            >
                                <Star size={24} fill={star <= rating ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Project Type (ปรับเป็นแถวเดียว Grid-cols-5 และปุ่มเล็ก) */}
                <div>
                    <label className="block text-[10px] text-cyan-500 font-mono tracking-widest mb-2 text-center">PROJECT_TYPE</label>
                    <div className="grid grid-cols-5 gap-2">
                        {SERVICE_TYPES.map((type) => {
                            const Icon = type.icon
                            const isSelected = serviceType === type.id
                            return (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setServiceType(type.id)}
                                    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all h-[60px] ${
                                        isSelected 
                                        ? 'bg-cyan-900/30 border-cyan-500 text-white shadow-[0_0_5px_rgba(6,182,212,0.3)]' 
                                        : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:border-white/30'
                                    }`}
                                >
                                    <Icon size={16} className={isSelected ? 'text-cyan-400' : ''} />
                                    <span className="text-[9px] font-mono truncate w-full text-center">{type.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* 3. Inputs (ลดความสูง Input) */}
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative group">
                            <User className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-cyan-500" size={16} />
                            <input 
                                required
                                placeholder="Name"
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="relative group">
                            <Briefcase className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-cyan-500" size={16} />
                            <input 
                                placeholder="Role (Opt)"
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <textarea 
                        required
                        placeholder="Feedback..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                    />
                </div>

                <button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 text-sm"
                >
                    {loading ? 'SENDING...' : <><Send size={16} /> CONFIRM_ENTRY</>}
                </button>
             </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}