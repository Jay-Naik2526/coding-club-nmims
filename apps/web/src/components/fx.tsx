import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/* ── ScrambleText: characters "decrypt" into the target string ── */
interface ScrambleQueue {
  to: string
  start: number
  end: number
  char: string
}
export function ScrambleText({ text, className, style, delay = 0 }: { text: string; className?: string; style?: CSSProperties; delay?: number }) {
  const [out, setOut] = useState(text)
  useEffect(() => {
    const chars = '!<>-_\\/[]{}—=+*^?#________'
    let raf = 0
    const run = () => {
      const queue: ScrambleQueue[] = text.split('').map((c, i) => ({
        to: c,
        start: Math.floor(Math.random() * 18) + i,
        end: Math.floor(Math.random() * 36) + 22 + i,
        char: '',
      }))
      let f = 0
      const tick = () => {
        let s = ''
        let done = 0
        for (const q of queue) {
          if (f >= q.end) {
            s += q.to
            done++
          } else if (f >= q.start) {
            if (!q.char || Math.random() < 0.28) q.char = chars[Math.floor(Math.random() * chars.length)]
            s += `<span style="opacity:.55">${q.char === ' ' ? '&nbsp;' : q.char}</span>`
          } else {
            s += q.to === ' ' ? '&nbsp;' : '<span style="opacity:0">·</span>'
          }
        }
        setOut(s)
        if (done === queue.length) return
        f++
        raf = requestAnimationFrame(tick)
      }
      tick()
    }
    const t = window.setTimeout(run, delay)
    return () => {
      window.clearTimeout(t)
      cancelAnimationFrame(raf)
    }
  }, [text, delay])
  return <span className={className} style={style} dangerouslySetInnerHTML={{ __html: out }} />
}

/* ── Magnetic: element is pulled toward the cursor ── */
export function Magnetic({ children, strength = 0.4, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 16 })
  const sy = useSpring(y, { stiffness: 220, damping: 16 })
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      onMouseMove={(e) => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

/* ── Marquee: seamless infinite horizontal scroll ── */
export function Marquee({ items, className, style }: { items: string[]; className?: string; style?: CSSProperties }) {
  const row = [...items, ...items]
  return (
    <div className={`relative flex overflow-hidden ${className ?? ''}`} style={style}>
      <div className="flex shrink-0 animate-[marquee_28s_linear_infinite] items-center whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="mx-6 inline-flex items-center gap-6 text-[clamp(1.4rem,3vw,2.4rem)]">
            {t}
            <span style={{ color: 'var(--acc)' }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
