import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7860';

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
