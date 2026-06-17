import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="dot-grid flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ background: 'var(--os-bg)' }}>
      <div className="font-[family-name:var(--font-display)]" style={{ fontSize: 'clamp(3rem,10vw,7rem)', color: 'var(--acc)' }}>404</div>
      <div className="mb-4 text-[11px] uppercase tracking-[0.15em]" style={{ color: 'var(--os-muted)' }}>
        SEGMENTATION FAULT — PAGE NOT FOUND
      </div>
      <Link to="/" className="bvb px-5 py-2.5 text-[10px] uppercase tracking-[0.1em] text-white" style={{ background: 'var(--acc)' }}>
        ▸ RETURN TO BOOT
      </Link>
    </div>
  )
}
