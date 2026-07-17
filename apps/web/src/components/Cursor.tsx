import { useEffect, useRef } from 'react'

/**
 * Custom square outline cursor + trailing dot (reference parity).
 * Grows over interactive elements. Disabled on touch / coarse pointers.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine) return
    document.body.classList.add('custom-cursor')

    const move = (e: MouseEvent) => {
      if (ring.current) {
        ring.current.style.left = e.clientX + 'px'
        ring.current.style.top = e.clientY + 'px'
      }
      // dot trails slightly
      window.setTimeout(() => {
        if (dot.current) {
          dot.current.style.left = e.clientX + 'px'
          dot.current.style.top = e.clientY + 'px'
        }
      }, 50)
    }

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      const interactive = t.closest(
        'a,button,[role="button"],input,textarea,select,.cc-hover'
      )
      ring.current?.classList.toggle('h', !!interactive)
    }

    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('mouseover', over, { passive: true })
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      document.body.classList.remove('custom-cursor')
    }
  }, [])

  return (
    <>
      <div id="cur" ref={ring} />
      <div id="cur2" ref={dot} />
    </>
  )
}
