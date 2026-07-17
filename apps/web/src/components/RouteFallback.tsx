/** Minimal boot-styled loading screen shown while a lazy route chunk loads. */
export function RouteFallback() {
  return (
    <div className="dot-grid flex min-h-screen flex-col items-center justify-center gap-3" style={{ background: 'var(--os-bg)' }}>
      <div className="font-[family-name:var(--font-display)] text-2xl" style={{ color: 'var(--acc)' }}>
        CC
      </div>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--os-muted)' }}>
        <span className="inline-block h-2 w-2 animate-pulse" style={{ background: 'var(--acc)' }} />
        Loading module…
      </div>
    </div>
  )
}
