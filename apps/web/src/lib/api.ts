import axios from 'axios';

// The session cookie is httpOnly, so it only reaches the API if the browser
// treats it as first-party. Safari (every browser on iOS) blocks third-party
// cookies outright, so calling the hf.space API directly from the vercel.app
// frontend meant iPhone users were never logged in. In production we therefore
// go through the same-origin '/api' path, which vercel.json proxies to the API
// — same origin, first-party cookie, works everywhere.
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:7860' : '/api');

// Socket.IO needs a real origin and can't ride the Vercel rewrite (WebSocket
// upgrades aren't proxied). The live leaderboard feed is public, so talking to
// the API host directly is fine here — no session cookie is involved.
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV ? 'http://localhost:7860' : 'https://jaynaik2526-coding-club.hf.space');

// NOTE: we send 'text/plain' (a CORS "simple" content-type) instead of
// 'application/json'. A JSON content-type makes the request "non-simple", which
// forces the browser to send a CORS preflight (OPTIONS). Hugging Face Spaces'
// edge proxy answers that preflight itself and drops Access-Control-Allow-
// Credentials, so credentialed requests get blocked. With text/plain there is
// NO preflight — the POST goes straight to our app, which sets correct CORS
// headers. Axios still JSON.stringifies the object body, and the API parses
// text/plain as JSON (see express.json type config in apps/api/src/index.ts).
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'text/plain',
  },
});

export default api;
