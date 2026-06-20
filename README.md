<div align="center">

# THE CODING CLUB — NMIMS MPSTME

### `Code. Collaborate. Create.`

A two-world, 3D-driven website for the Coding Club at NMIMS Mukesh Patel School of Technology Management & Engineering (MPSTME), Shirpur & Mumbai.
Events, a live code judge, CTF, leaderboards, recruitment, and an admin panel — wrapped in an interactive 3D landing and a newspaper-editorial inner experience.

</div>

---

## ✨ What makes it different

This isn't a template club site. It's built around **two distinct worlds** the visitor moves between through a cinematic black wipe:

1. **World 1 — The 3D Landing** (dark, premium, scroll-driven)
2. **World 2 — The Newspaper** (warm cream editorial broadsheet for all inner pages)

A department **accent-color system** (DSA = electric blue, Web = magenta, Cybersecurity = green) propagates through both worlds via a single live CSS variable.

---

## 🧊 The 3D & motion layer (the "wow")

| Piece | File | What it does |
|---|---|---|
| **Hero scene** | `three/LandingScene.tsx` | A glossy, beveled, **extruded `</>` glyph** (real `Text3D`) floating on a **reflective floor**, lit by accent spotlights, wrapped in a star field with **bloom** post-processing. The glyph **sweeps left → right and rotates as you scroll**, and its color **live-syncs** to whichever department card you hover. |
| **3D photo gallery** | `three/PhotoArc.tsx` | Event recap photos arranged on a **rotating 3D arc** that tilts toward the cursor — used on the archive recap pages. |
| **3D team portraits** | `three/TeamPortrait.tsx` | Co-Heads rendered as a **3D photo fan** you pan with the cursor. |
| **Scroll engine** | Lenis + GSAP | Buttery smooth scroll feeding normalized progress into the 3D camera rig, with pointer parallax. |
| **Text FX** | `components/fx.tsx` | `ScrambleText` (decode-on-reveal headlines), `Magnetic` (cursor-attracting buttons), `Marquee` (infinite ticker). |
| **Preloader** | `components/Preloader.tsx` | A boot-style intro that plays once per session. |
| **World transition** | `components/Wipe.tsx` | Full-screen black **clip-path wipe** (`cubic-bezier(.76,0,.24,1)`) with an italic serif title fading in mid-wipe. |
| **Custom cursor + CRT** | `components/Cursor.tsx`, `index.css` | Square outline cursor that grows over interactive elements, plus a subtle scanline overlay and dot-grid. |

Everything **auto-downgrades** on touch / low-core / small / reduced-motion devices (no bloom, fewer particles, lower DPR), and respects `prefers-reduced-motion`.

---

## 🗺️ Features by page

| Route | Page | Highlights |
|---|---|---|
| `/` | **Landing** | 3D hero, catchphrase, mission, real stats (500+ members, 20+ initiatives…), the 3 department cards, the flagship **Programs** (Ambiora Hackathons, NashSttrike, Web3 Bootcamps, Campus-to-Career, Web/App Intensives), social links. |
| `/events` | **Events** | Newspaper editorial header, **sticky Track/Status filter bar**, a clean event grid, and a **"From the Archive"** section. |
| `/events/:slug` | **Event detail / Recap** | Upcoming events show rules/schedule/registration; past **Ambiora 2026** events render as rich **editorial recaps** with the 3D photo gallery, a how-it-unfolded timeline, drop-caps, and a photo grid. |
| `/ide` | **Code Judge IDE** | Monaco editor wired to **Judge0** — run against samples, submit against hidden tests, verdicts + time/memory. |
| `/leaderboard` | **Leaderboard** | Global & per-department rankings with **live Socket.IO updates**. |
| `/team` | **Team** | Club Head, **3D Co-Head fan**, faculty advisors, campus network, and a contact form. |
| `/join` | **Recruitment** | A fully styled committee-application form that **posts directly into a Google Form** (responses land in the Form + linked Sheet — no backend needed). |
| `/profile` | **Profile** | XP, badges, registered events, submissions, certificates. |
| `/login` | **Auth** | Google OAuth sign-in. |
| `/admin` | **Admin** | Role-guarded dashboard for events, forms, members, and submissions. |

### Real content baked in
- Three **real past events** (Deepfake Hisence, Code-Relay, Nash Sttrike) with their official writeups and photos (`lib/archive.ts`, `public/events/*`).
- All brand copy, stats, pillars, programs, people, and socials live in **one place**: `lib/content.ts`.

---

## 🏗️ Architecture

A **pnpm/npm monorepo** with two deployable apps and a shared package:

```
coding-club/
├─ apps/
│  ├─ web/        Vite + React 19 + TS  (static SPA → Vercel)
│  └─ api/        Express + TS          (Docker → Hugging Face Space, port 7860)
└─ packages/
   └─ shared/     Zod schemas + types shared by web & api
```

### Frontend stack
React 19 · Vite · React Router 7 · **Tailwind v4** · **React Three Fiber + drei + postprocessing** · **GSAP + Lenis** · Framer Motion · Monaco · TanStack Query · Zustand · socket.io-client · axios.

### Backend stack
Express · **MongoDB Atlas + Mongoose** · **Passport (Google OAuth) + JWT** cookies · **Socket.IO** (live leaderboard/CTF) · **Judge0** (RapidAPI) · `qrcode` + `pdf-lib` (tickets & certificates) · Resend (email) · helmet · express-rate-limit.

### Data models (`apps/api/src/models`)
`User · Event · Registration · TeamMember · Problem · Submission · CTFChallenge · CTFSolve · Form · FormResponse · Badge · UserBadge · Certificate · Message`

### API surface (`apps/api/src/routes`)
`/auth · /events · /registrations · /judge · /ctf · /leaderboard · /admin · /forms · /profile`
Plus a JWT-verified **Socket.IO** layer with public `leaderboard:*` rooms and private per-user rooms.

---

## 🚀 Getting started

**Prerequisites:** Node 20+, a MongoDB Atlas connection string.

### 1. Frontend
```bash
cd apps/web
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc -b && vite build
```

### 2. Backend
```bash
cd apps/api
npm install
cp .env.example .env  # fill in the values (see below)
npm run seed          # optional: seed sample data
npm run dev           # http://localhost:7860
```

### 3. Environment (`apps/api/.env`)
```
PORT=7860
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=...                # MongoDB Atlas (db: codingclub)
JWT_SECRET=...
GOOGLE_CLIENT_ID=...           # Google OAuth
GOOGLE_CLIENT_SECRET=...
JUDGE0_API_KEY=...             # RapidAPI Judge0
JUDGE0_API_HOST=judge0-extra-ce.p.rapidapi.com
RESEND_API_KEY=...             # email (optional)
CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET   # asset uploads (optional)
```
Frontend reads `VITE_API_URL` for the backend base URL.

---

## ☁️ Deployment
- **Frontend → Vercel** (static SPA).
- **Backend → Hugging Face Docker Space** (listens on port `7860`; secrets set as Space secrets). MongoDB Atlas is external, so there's no DB sleep; Socket.IO uses a polling fallback for HF's proxy.

---

## 🎨 Design system
- **Palettes:** OS/dark landing · newspaper cream (`#F3EFE5`) / ink (`#1A1612`) / red (`#C8002A`).
- **Accents:** DSA `#0055FF` · Web `#E0006E` · Cybersecurity `#007A3D` — driven by the `--acc` CSS variable.
- **Type:** Archivo Black (display) · Playfair Display (editorial serif) · Space Mono (labels) · DM Sans (body).
- All tokens + bevel/cursor/wipe utilities live in `apps/web/src/index.css`.

---

## 📌 Status
Frontend and backend are both implemented. Recruitment runs through a **Google Form bridge** (live now). Remaining polish: production deploy, CTF flow hardening, and certificate generation wiring.

<div align="center">

**Built for the NMIMS MPSTME Coding Club.** · `codingclub.mpstme@nmims.edu.in`
[LinkedIn](https://in.linkedin.com/company/codingclubnmims) · [Instagram](https://www.instagram.com/codingclubnmims/) · [Medium](https://medium.com/@nmims.codingclub)

</div>
