/**
 * A Google Drive "share" link (e.g. https://drive.google.com/file/d/FILE_ID/view?usp=sharing)
 * is an HTML viewer page, not raw image bytes — an <img src> pointing at it
 * just fails to load. This detects that shape and rewrites it to Drive's
 * thumbnail endpoint, which actually serves the image and is reliable for
 * hotlinking (the file must be shared as "Anyone with the link can view").
 */
export function toDirectImageUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  const trimmed = url.trim()
  if (!trimmed) return undefined

  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/, // .../file/d/FILE_ID/view
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/, // .../open?id=FILE_ID
    /[?&]id=([a-zA-Z0-9_-]+)/, // .../uc?id=FILE_ID or similar
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600`
  }

  return trimmed
}
