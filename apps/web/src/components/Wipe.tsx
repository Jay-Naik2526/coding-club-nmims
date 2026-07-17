import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { WipeContext } from './wipe-context'

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function WipeProvider({ children }: { children: ReactNode }) {
  const el = useRef<HTMLDivElement>(null)
  const [, force] = useState(0)
  const navigate = useNavigate()

  const wipeTo = useCallback(
    (path: string) => {
      const node = el.current
      if (!node || REDUCED) {
        navigate(path)
        return
      }
      node.classList.remove('out')
      node.classList.add('in')
      // navigate mid-wipe (cover fully ~ 650ms)
      window.setTimeout(() => {
        navigate(path)
        window.scrollTo(0, 0)
        force((n) => n + 1)
        // reveal
        window.setTimeout(() => {
          node.classList.add('out')
          window.setTimeout(() => node.classList.remove('in', 'out'), 760)
        }, 90)
      }, 650)
    },
    [navigate]
  )

  return (
    <WipeContext.Provider value={{ wipeTo }}>
      {children}
      <div id="wipe" ref={el}>
        <div className="wipe-t">THE CODING CLUB</div>
      </div>
    </WipeContext.Provider>
  )
}
