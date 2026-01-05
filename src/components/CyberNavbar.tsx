'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Layers, Cpu, Mail, FileText } from 'lucide-react'
import Link from 'next/link'
import ContactModal from './ContactModal'
import AdminLoginModal from './AdminLoginModal'
import { useUIStore } from '@/store/useUIStore'

const navItems = [
  { name: 'HOME', icon: Home, href: '/' },
  { name: 'WORK', icon: Layers, href: '/#projects' },
  { name: 'STACK', icon: Cpu, href: '/#stack' },
  { name: 'RESUME', icon: FileText, href: '/resume' },
  { name: 'ME', icon: Mail, href: '#contact' },
]

export default function CyberNavbar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [clickCount, setClickCount] = useState(0)
  
  const { isContactModalOpen, openContactModal, closeContactModal } = useUIStore()
  const { isAdminLoginOpen, openAdminLogin, closeAdminLogin } = useUIStore()

  // Logic ประตูลับ
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (clickCount > 0) {
      timer = setTimeout(() => setClickCount(0), 1000)
    }
    if (clickCount >= 5) {
      openAdminLogin()
      setClickCount(0)
    }
    return () => clearTimeout(timer)
  }, [clickCount, openAdminLogin])

  return (
    <>
      <ContactModal isOpen={isContactModalOpen} onClose={closeContactModal} />
      <AdminLoginModal isOpen={isAdminLoginOpen} onClose={closeAdminLogin} />

      <div className="fixed top-6 w-full flex justify-center z-50 px-4 print:hidden">
        <motion.nav 
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          layout 
          initial={{ width: '170px' }}
          animate={{ width: isExpanded ? 'auto' : '170px' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-full h-12 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.2)] overflow-hidden cursor-pointer"
          style={{ minWidth: '170px', maxWidth: '650px' }}
        >
          {/* Secret Trigger Area */}
          <div 
             className="flex items-center gap-3 px-5 flex-shrink-0 h-full cursor-pointer select-none"
             onClick={(e) => {
                e.stopPropagation()
                setClickCount(prev => prev + 1)
             }}
          >
            <div className="relative flex items-center justify-center">
               <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] ${clickCount > 0 ? 'border-b-red-500' : 'border-b-cyan-500'} drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] animate-pulse transition-colors`} />
            </div>
            <span className={`font-mono text-xs font-bold tracking-widest whitespace-nowrap transition-colors ${clickCount > 0 ? 'text-red-500' : 'text-cyan-400'}`}>
              {clickCount > 0 ? `SYS.ALERT(${clickCount})` : 'SYS.ONLINE'}
            </span>
            <motion.div animate={{ opacity: isExpanded ? 0.3 : 0 }} className="w-[1px] h-4 bg-white ml-2" />
          </div>

          <div className="flex items-center pr-2">
              <AnimatePresence>
                  {isExpanded && (
                      <motion.ul 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.1 } }}
                          className="flex items-center gap-1"
                      >
                          {navItems.map((item, index) => {
                              const Icon = item.icon
                              const isContactBtn = item.name === 'ME'
                              return (
                                  <li key={item.name}>
                                      {isContactBtn ? (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); openContactModal(); }}
                                          className="relative px-3 py-1.5 flex items-center gap-2 text-[10px] sm:text-xs font-mono text-gray-400 hover:text-white transition-colors rounded-full"
                                          onMouseEnter={() => setHoveredIndex(index)}
                                          onMouseLeave={() => setHoveredIndex(null)}
                                        >
                                          <Icon size={14} className={hoveredIndex === index ? 'text-cyan-400' : ''} />
                                          <span className="hidden sm:inline">{item.name}</span>
                                          {hoveredIndex === index && <motion.div layoutId="nav-pill" className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/30 rounded-full -z-10" />}
                                        </button>
                                      ) : (
                                        <Link 
                                            href={item.href}
                                            className="relative px-3 py-1.5 flex items-center gap-2 text-[10px] sm:text-xs font-mono text-gray-400 hover:text-white transition-colors rounded-full"
                                            onMouseEnter={() => setHoveredIndex(index)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                        >
                                            <Icon size={14} className={hoveredIndex === index ? 'text-cyan-400' : ''} />
                                            <span className="hidden sm:inline">{item.name}</span>
                                            {hoveredIndex === index && <motion.div layoutId="nav-pill" className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/30 rounded-full -z-10" />}
                                        </Link>
                                      )}
                                  </li>
                              )
                          })}
                      </motion.ul>
                  )}
              </AnimatePresence>
          </div>
        </motion.nav>
      </div>
    </>
  )
}