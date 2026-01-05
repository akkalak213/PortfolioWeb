'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldAlert, Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AdminLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle')
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setStatus('idle')
    }
  }, [isOpen])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('checking')

    try {
      // 1. ยิง Password ไปที่ API ของเราเอง (ไม่ยิงไป Supabase โดยตรง)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }), // ส่งแค่รหัสผ่าน
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      // 2. ถ้า API บอกว่าผ่าน เราจะเอา Session ที่ได้มา Set ลง Browser
      if (data.session) {
        await supabase.auth.setSession(data.session)
        
        setStatus('success')
        
        // (Optional) Cookie กันเหนียวสำหรับ Middleware ตัวเก่า
        document.cookie = "admin_access=GRANTED; path=/; max-age=86400; Secure; SameSite=Strict";

        setTimeout(() => {
          router.push('/admin')
          onClose()
        }, 1000)
      } else {
        throw new Error('No session returned')
      }

    } catch (error) {
      console.error("Login Failed")
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="admin-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-sm bg-black border border-red-900/50 rounded-lg p-8 shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden z-10"
          >
             {/* ... (UI ส่วน Graphic เหมือนเดิมทุกอย่าง) ... */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-pulse" />

             <div className="flex flex-col items-center text-center mb-6">
                <div className="mb-4 p-4 rounded-full bg-red-900/10 border border-red-900/30 text-red-500">
                    {status === 'success' ? <CheckCircle size={32} className="text-green-500" /> : <ShieldAlert size={32} />}
                </div>
                <h3 className="text-xl font-bold text-white tracking-widest uppercase">Security Gate</h3>
                <p className="text-[10px] text-red-500 font-mono mt-1">BIOMETRIC SCAN REQUIRED</p>
             </div>

             <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative group">
                    <Lock className="absolute left-3 top-3 text-gray-600 group-focus-within:text-red-500 transition-colors" size={16} />
                    <input 
                        type="password"
                        autoFocus
                        placeholder="ACCESS CODE"
                        className="w-full bg-black border border-gray-800 text-center text-white font-mono tracking-[0.5em] py-3 rounded focus:outline-none focus:border-red-600 transition-colors uppercase placeholder:tracking-normal placeholder:text-gray-700"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={status === 'checking' || status === 'success'}
                    />
                </div>

                <button 
                    disabled={status !== 'idle' || !password}
                    className={`w-full py-3 font-bold text-xs tracking-widest rounded transition-all flex items-center justify-center gap-2
                        ${status === 'success' ? 'bg-green-600 text-black' : status === 'error' ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-red-600 hover:text-white text-gray-400'}
                    `}
                >
                    {status === 'checking' && <Loader2 size={16} className="animate-spin" />}
                    {status === 'success' && 'ACCESS GRANTED'}
                    {status === 'error' && 'ACCESS DENIED'}
                    {status === 'idle' && <>AUTHENTICATE <ArrowRight size={14} /></>}
                </button>
             </form>

             <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-white"><X size={18} /></button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}