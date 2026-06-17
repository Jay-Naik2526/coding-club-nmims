import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LINES = [
  'initializing coding_club.exe',
  'mounting departments [dsa · web · sec]',
  'compiling shaders · spinning up webgl',
  'establishing uplink → NMIMS MPSTME',
  'ready.',
]

/** Full-screen boot loader that plays on every page load, then reveals the app.
 *  (Mounted once at the app root, so it does NOT replay on in-app navigation.) */
export function Preloader() {
  const [done, setDone] = useState(false)
  const [pct, setPct] = useState(0)
  const [line, setLine] = useState(0)

  useEffect(() => {
    let p = 0
    const iv = setInterval(() => {
      p = Math.min(100, p + Math.random() * 7 + 2)
      setPct(Math.floor(p))
      setLine(Math.min(LINES.length - 1, Math.floor((p / 100) * LINES.length)))
      if (p >= 100) {
        clearInterval(iv)
        window.setTimeout(() => setDone(true), 480)
      }
    }, 90)
    return () => clearInterval(iv)
  }, [])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[9500] flex flex-col justify-between p-6 sm:p-12"
          style={{ background: '#0b0a09', color: '#f3efe5' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em]" style={{ color: 'rgba(243,239,229,.5)' }}>
            <span>CODING_CLUB</span>
            <span>NMIMS · MPSTME</span>
          </div>

          <div className="font-[family-name:var(--font-os)] text-[11px] leading-[2]" style={{ color: 'rgba(243,239,229,.5)' }}>
            {LINES.slice(0, line + 1).map((l, i) => (
              <div key={l}>
                <span style={{ color: 'var(--acc)' }}>{i === LINES.length - 1 ? '[ok]' : '›'}</span> {l}
              </div>
            ))}
          </div>

          <div className="flex items-end justify-between">
            <div className="font-[family-name:var(--font-display)] leading-none" style={{ fontSize: 'clamp(4rem,18vw,12rem)' }}>
              {String(pct).padStart(3, '0')}
              <span style={{ color: 'var(--acc)' }}>%</span>
            </div>
            <div className="mb-3 hidden text-right text-[10px] uppercase tracking-[0.2em] sm:block" style={{ color: 'rgba(243,239,229,.4)' }}>
              Code. Collaborate. Create.
            </div>
          </div>

          {/* progress bar */}
          <div className="absolute bottom-0 left-0 h-[3px]" style={{ width: `${pct}%`, background: 'var(--acc)' }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
