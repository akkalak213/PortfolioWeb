'use client'

import { useEffect, useRef } from 'react'

export default function OpticalFiberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // ตั้งค่าตัวแปร
    let animationFrameId: number
    let particles: Particle[] = []
    
    // กำหนดสีของเส้นแสง (Cyan, Blue, Purple)
    const colors = ['#00f2ea', '#4facfe', '#7c3aed'] 

    // Class สำหรับจัดการเม็ดแสงแต่ละเส้น
    class Particle {
      x: number
      y: number
      length: number
      speed: number
      color: string
      width: number

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth
        this.y = Math.random() * canvasHeight
        this.length = Math.random() * 200 + 50 // ความยาวเส้น
        this.speed = Math.random() * 5 + 2 // ความเร็ว
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.width = Math.random() * 2 + 0.5 // ความหนา
      }

      update(canvasHeight: number) {
        this.y += this.speed // ขยับลงล่าง (เหมือนข้อมูลไหลเข้า)
        // ถ้าตกขอบจอ ให้กลับไปเริ่มข้างบนใหม่
        if (this.y > canvasHeight + this.length) {
          this.y = -this.length
          this.x = Math.random() * canvas!.width // สุ่มตำแหน่งแนวนอนใหม่
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        
        // สร้าง Gradient ให้หัวสว่าง หางจาง (เหมือนดาวตก/ไฟเบอร์)
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y - this.length)
        gradient.addColorStop(0, this.color) // หัวสีสด
        gradient.addColorStop(1, 'rgba(0,0,0,0)') // หางจางหายไป

        ctx.strokeStyle = gradient
        ctx.lineWidth = this.width
        ctx.lineCap = 'round'
        
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x, this.y - this.length)
        ctx.stroke()
      }
    }

    // ฟังก์ชันเริ่มระบบ
    const init = () => {
      resize()
      createParticles()
      animate()
    }

    // ปรับขนาด Canvas ให้ชัดตามหน้าจอ (Retina display support)
    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio
      canvas.height = window.innerHeight * window.devicePixelRatio
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    // สร้างเม็ดแสงจำนวนมาก
    const createParticles = () => {
      const particleCount = Math.floor(window.innerWidth / 15) // คำนวณจำนวนเส้นตามความกว้างจอ
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(window.innerWidth, window.innerHeight))
      }
    }

    // ลูปรัน Animation
    const animate = () => {
      // เคลียร์ภาพเก่าแบบจางๆ (เพื่อให้เกิด Effect หางยาวๆ หรือ Motion Blur)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)' 
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.update(window.innerHeight)
        particle.draw(ctx)
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', () => {
      resize()
      createParticles()
    })
    
    init()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[-1] bg-black">
      {/* Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 block w-full h-full opacity-80"
      />
      
      {/* Overlay: Vignette (ขอบมืด) เพื่อให้ตรงกลางเด่น */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] pointer-events-none" />
      
      {/* Overlay: Blur (ทำให้เส้นดูนวลๆ เหมือนแสงจริงๆ) */}
      <div className="absolute inset-0 backdrop-blur-[1px] pointer-events-none" />
    </div>
  )
}