import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { api } from '@/lib/api'
import axios from 'axios'

interface ScanResult {
  alreadyCheckedIn: boolean
  checkedInAt: string | null
  registration: { id: string; teamName?: string }
  event: { title: string; slug: string; department: string } | null
  owner: { name: string; email: string } | null
  teamMembers: { name: string; email: string }[]
}

const SCANNER_ID = 'cc-qr-scanner-region'
// Only guards against the SAME QR code re-triggering while it's still in
// frame (camera decodes ~10x/sec). It does NOT block scanning a different
// person's code — that can happen immediately, back-to-back.
const SAME_CODE_COOLDOWN_MS = 4000
const TOAST_DURATION_MS = 1800

/** Camera-based ticket check-in scanner. Decodes the ticket QR payload
 *  client-side, then POSTs it to /admin/scan to mark attendance. Designed
 *  for a queue: the camera never stops, and a toast (not a full-screen
 *  overlay) reports each result so the next person can be scanned instantly. */
export function QrScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const inFlightRef = useRef(false)
  const lastScanRef = useRef<{ payload: string; time: number } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [running, setRunning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ ok: boolean; message: string; detail?: ScanResult } | null>(null)
  const [scanCount, setScanCount] = useState(0)

  useEffect(() => {
    const showToast = (t: { ok: boolean; message: string; detail?: ScanResult }) => {
      setToast(t)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS)
    }

    const handleDecoded = async (payload: string) => {
      const now = Date.now()
      // Ignore repeat decodes of the exact same code (person still holding
      // their phone up) — but any OTHER code is processed immediately.
      if (lastScanRef.current && lastScanRef.current.payload === payload && now - lastScanRef.current.time < SAME_CODE_COOLDOWN_MS) {
        return
      }
      // Only block if a request for a DIFFERENT code is still in flight —
      // real network latency, not an artificial delay.
      if (inFlightRef.current) return

      lastScanRef.current = { payload, time: now }
      inFlightRef.current = true

      try {
        const res = await api.post<ScanResult>('/admin/scan', { payload })
        const data = res.data
        setScanCount((n) => n + 1)
        showToast({
          ok: true,
          message: data.alreadyCheckedIn ? 'Already checked in' : 'Checked in ✓',
          detail: data,
        })
      } catch (err) {
        const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined
        showToast({ ok: false, message: message || 'Invalid or unrecognized ticket' })
      } finally {
        inFlightRef.current = false
      }
    }

    const scanner = new Html5Qrcode(SCANNER_ID)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decodedText) => handleDecoded(decodedText),
        () => {
          /* per-frame "no QR found" — expected constantly, ignore */
        }
      )
      .then(() => setRunning(true))
      .catch((err) => setCameraError(err?.message || 'Could not access the camera. Check browser permissions.'))

    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {
          /* already stopped */
        })
    }
  }, [])

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>
        <span className="opacity-60">{running ? 'Camera live — keep scanning' : cameraError ? 'Camera error' : 'Starting camera…'}</span>
        <span className="opacity-60">{scanCount} checked in this session</span>
      </div>

      <div className="relative overflow-hidden rounded-lg border-2" style={{ borderColor: 'var(--news-ink)', aspectRatio: '1' }}>
        <div id={SCANNER_ID} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />

        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center text-xs text-white">
            {cameraError}
          </div>
        )}

        {/* Toast — pinned to a corner so the camera stays visible/scannable underneath */}
        {toast && (
          <div
            className="pointer-events-none absolute inset-x-2 bottom-2 flex flex-col items-center gap-0.5 rounded-md px-3 py-2 text-center backdrop-blur-sm"
            style={{ background: toast.ok ? (toast.detail?.alreadyCheckedIn ? 'rgba(184,104,0,.94)' : 'rgba(10,122,61,.94)') : 'rgba(200,0,42,.94)' }}
          >
            <div className="text-xs font-bold uppercase tracking-[0.1em] text-white">
              {toast.ok ? (toast.detail?.alreadyCheckedIn ? '⚠ ' : '✓ ') : '✕ '}{toast.message}
            </div>
            {toast.detail && (
              <div className="text-[10px] text-white/90">
                {toast.detail.registration.teamName || toast.detail.owner?.name} · {toast.detail.event?.title}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-[10px] leading-relaxed opacity-50" style={{ fontFamily: 'var(--font-os)' }}>
        Keep the camera pointed at tickets — it scans continuously, no need to wait between people.
      </p>
    </div>
  )
}
