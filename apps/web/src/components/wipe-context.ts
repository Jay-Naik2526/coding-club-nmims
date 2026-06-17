import { createContext, useContext } from 'react'

export interface WipeCtx {
  /** Play the black clip-path wipe, navigate mid-wipe, then reveal. */
  wipeTo: (path: string) => void
}

export const WipeContext = createContext<WipeCtx>({ wipeTo: () => {} })
export const useWipe = () => useContext(WipeContext)
