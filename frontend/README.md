# CivicConnect Frontend

CivicConnect is a Progressive Web App (PWA) that lets citizens report and track civic issues (potholes, garbage, water leaks, streetlights, and more) with photo / GPS evidence, AI-assisted categorization, offline drafts, and real-time status notifications.

## Features

- **Report issues** with photo, GPS location, and description
- **AI analysis** — automatic categorization, priority and department routing
- **Duplicate detection** — finds similar issues already reported nearby
- **Real-time tracking** — status timeline from submission to resolution
- **Push-ready PWA** — installable on all devices, works offline
- **Offline drafts** — save reports offline and auto-sync when back online
- **Multi-language** — English, हिन्दी (Hindi) and मराठी (Marathi)
- **Dark mode** — light / dark theme toggle
- **Notifications** — status updates, unread indicators, mark-all-read
- **Citizen feedback** — verify resolution and rate the outcome

## Tech Stack

- **React 19** + Vite 8
- **Tailwind CSS v4**
- **React Router** (v7)
- **i18next** / **react-i18next** — internationalization
- **React Hook Form** — forms and validation
- **React Leaflet** — interactive map picker
- **vite-plugin-pwa** — service worker, manifest and offline support
- **IndexedDB (idb)** — offline draft storage

## Getting Started

```bash
npm install
npm run dev
```

The dev server proxies `/api` and `/uploads` to the backend at `http://localhost:5000` (see `vite.config.js`).

## Scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `npm run dev`    | Start the Vite dev server            |
| `npm run build`  | Production build (incl. PWA assets)  |
| `npm run preview`| Preview the production build         |
| `npm run lint`   | Run ESLint                           |

## Project Structure

```
src/
├── components/   Reusable UI components (Navbar, Logo, ComplaintCard, ...)
├── context/      Global state (auth, language, theme, complaints)
├── hooks/        Custom hooks (PWA install, online status, scroll reveal)
├── i18n/         Translation resources (en, hi, mr)
├── pages/        Route-level pages (Home, ReportIssue, Login, ...)
└── services/     API client and request/response mapping
```

## Environment

Optional: set `VITE_API_URL` to point at a backend base URL. Defaults to `/api` (dev proxy).

## License

MIT — see the [LICENSE](../LICENSE) file for details.
