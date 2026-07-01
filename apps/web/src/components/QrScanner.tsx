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
const RESUME_DELAY_MS = 2500

/** Camera-based ticket check-in scanner. Decodes the ticket QR payload
 *  client-side, then POSTs it to /admin/scan to mark attendance. */
export function QrScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const busyRef = useRef(false)

  const [running, setRunning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [result, setResult] = useState<{ ok: boolean; message: string; detail?: ScanResult } | null>(null)
  const [scanCount, setScanCount] = useState(0)

  useEffect(() => {
    const handleDecoded = async (payload: string) => {
      if (busyRef.current) return
      busyRef.current = true

      try {
        const res = await api.post<ScanResult>('/admin/scan', { payload })
        const data = res.data
        setScanCount((n) => n + 1)
        setResult({
          ok: true,
          message: data.alreadyCheckedIn ? 'Already checked in' : 'Checked in ✓',
          detail: data,
        })
      } catch (err) {
        const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined
        setResult({ ok: false, message: message || 'Invalid or unrecognized ticket' })
      } finally {
        setTimeout(() => {
          setResult(null)
          busyRef.current = false
        }, RESUME_DELAY_MS)
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
        <span className="opacity-60">{running ? 'Camera live' : cameraError ? 'Camera error' : 'Starting camera…'}</span>
        <span className="opacity-60">{scanCount} checked in this session</span>
      </div>

      <div className="relative overflow-hidden rounded-lg border-2" style={{ borderColor: 'var(--news-ink)', aspectRatio: '1' }}>
        <div id={SCANNER_ID} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />

        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center text-xs text-white">
            {cameraError}
          </div>
        )}

        {result && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center backdrop-blur-sm"
            style={{ background: result.ok ? (result.detail?.alreadyCheckedIn ? 'rgba(184,104,0,.92)' : 'rgba(10,122,61,.92)') : 'rgba(200,0,42,.92)' }}
          >
            <div className="text-2xl font-bold text-white">{result.ok ? (result.detail?.alreadyCheckedIn ? '⚠' : '✓') : '✕'}</div>
            <div className="text-sm font-bold uppercase tracking-[0.1em] text-white">{result.message}</div>
            {result.detail && (
              <div className="mt-1 text-xs text-white/90">
                {result.detail.registration.teamName || result.detail.owner?.name}
                <br />
                {result.detail.event?.title}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-[10px] leading-relaxed opacity-50" style={{ fontFamily: 'var(--font-os)' }}>
        Point the camera at a participant's ticket QR. Scanning pauses briefly after each check-in.
      </p>
    </div>
  )
}
