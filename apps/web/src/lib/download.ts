import { api } from './api'

/**
 * Downloads the ticket PDF via an authenticated XHR (not a raw cross-origin
 * `<a href>` navigation). Raw links depend on the browser sending the
 * SameSite=None auth cookie on a plain top-level navigation to a different
 * site — some browsers/privacy modes (e.g. Brave Shields) block that even
 * though the cookie is valid, producing "Unauthorized: No token provided".
 * Going through our axios instance (`withCredentials: true`) uses an
 * explicit CORS-credentialed request instead, which isn't affected.
 */
export async function downloadTicketPdf(registrationId: string, eventSlug: string) {
  const res = await api.get(`/registrations/${registrationId}/ticket`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data as Blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${eventSlug}-pass.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
