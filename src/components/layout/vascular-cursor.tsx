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
  onDark: boolean
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
    let isOverDark = false
    let animId: number
    const particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Detect if cursor is over a dark area by checking the element under it
    const detectBackground = (x: number, y: number) => {
      canvas.style.display = 'none'
      const el = document.elementFromPoint(x, y)
      canvas.style.display = ''
      if (!el) return false

      let node: Element | null = el
      while (node && node !== document.body) {
        const bg = getComputedStyle(node).backgroundColor
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          const match = bg.match(/\d+/g)
          if (match) {
            const [r, g, b] = match.map(Number)
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
            return luminance < 0.45
          }
        }
        // Check if over an image or video
        if (node.tagName === 'IMG' || node.tagName === 'VIDEO') return true
        node = node.parentElement
      }
      return false
    }

    let detectThrottle = 0
    const onMouseMove = (e: MouseEvent) => {
      prevMouseX = mouseX
      prevMouseY = mouseY
      mouseX = e.clientX
      mouseY = e.clientY

      // Detect background every 6 frames to save performance
      detectThrottle++
      if (detectThrottle % 6 === 0) {
        isOverDark = detectBackground(mouseX, mouseY)
      }

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
          onDark: isOverDark,
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

        if (p.onDark) {
          // Bright blue on dark backgrounds (like original)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2)
          ctx.fillStyle = `hsla(210, 70%, 55%, ${alpha * 0.5})`
          ctx.fill()

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 0.5 * (1 - progress * 0.3), 0, Math.PI * 2)
          ctx.fillStyle = `hsla(210, 80%, 70%, ${alpha * 0.7})`
          ctx.fill()
        } else {
          // Dark gray-blue on white backgrounds
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2)
          ctx.fillStyle = `hsla(215, 30%, 30%, ${alpha * 0.4})`
          ctx.fill()

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 0.5 * (1 - progress * 0.3), 0, Math.PI * 2)
          ctx.fillStyle = `hsla(215, 40%, 20%, ${alpha * 0.55})`
          ctx.fill()
        }
      }

      // Vessel trail
      if (particles.length > 2) {
        const recent = particles.slice(-20)
        const darkTrail = recent[recent.length - 1]?.onDark
        ctx.beginPath()
        ctx.strokeStyle = darkTrail
          ? 'hsla(210, 70%, 55%, 0.1)'
          : 'hsla(215, 30%, 25%, 0.12)'
        ctx.lineWidth = 3
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
    />
  )
}
