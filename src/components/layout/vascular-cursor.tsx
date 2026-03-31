'use client'
import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
}

export default function VascularCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let mouseX = -100
    let mouseY = -100
    let prevMouseX = -100
    let prevMouseY = -100
    let animId: number
    const particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e: MouseEvent) => {
      prevMouseX = mouseX
      prevMouseY = mouseY
      mouseX = e.clientX
      mouseY = e.clientY

      const speed = Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY)
      const count = Math.min(Math.floor(speed * 0.3), 5)

      for (let i = 0; i < count; i++) {
        const angle = Math.atan2(mouseY - prevMouseY, mouseX - prevMouseX)
        const spread = (Math.random() - 0.5) * 1.5
        particles.push({
          x: mouseX + (Math.random() - 0.5) * 8,
          y: mouseY + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle + spread) * (speed * 0.15 + Math.random() * 0.5),
          vy: Math.sin(angle + spread) * (speed * 0.15 + Math.random() * 0.5),
          life: 0,
          maxLife: 30 + Math.random() * 40,
          size: 1 + Math.random() * 2.5,
          hue: 200 + Math.random() * 20, // blue tones
        })
      }
    }

    window.addEventListener('mousemove', onMouseMove)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.97
        p.vy *= 0.97
        p.life++

        if (p.life >= p.maxLife) {
          particles.splice(i, 1)
          continue
        }

        const progress = p.life / p.maxLife
        const alpha = progress < 0.1
          ? progress * 10
          : 1 - ((progress - 0.1) / 0.9)

        // Draw flowing particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 70%, 55%, ${alpha * 0.4})`
        ctx.fill()

        // Inner glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.5 * (1 - progress * 0.3), 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha * 0.6})`
        ctx.fill()
      }

      // Draw subtle vessel trail connecting recent particles
      if (particles.length > 2) {
        ctx.beginPath()
        ctx.strokeStyle = 'hsla(210, 70%, 55%, 0.08)'
        ctx.lineWidth = 3
        const recent = particles.slice(-20)
        ctx.moveTo(recent[0].x, recent[0].y)
        for (let i = 1; i < recent.length; i++) {
          ctx.lineTo(recent[i].x, recent[i].y)
        }
        ctx.stroke()
      }

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[45] pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
