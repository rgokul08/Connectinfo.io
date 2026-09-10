# Connectinfo.com

**Your contacts. Your connections. One simple place.**
A production-quality contact management + communication platform (contact CRM) built as a frontend-only SaaS demo.

![Stack](https://img.shields.io/badge/React%2018-Vite%205-118AB2) ![Styling](https://img.shields.io/badge/Tailwind%20CSS-3.4-06D6A0)

## Features

- 🔐 **Local demo auth** — signup / login / forgot-password, protected routes, per-user data isolation (LocalStorage)
- 👥 **Full contact management** — add, edit, delete, archive, favorite, search (debounced), filter (favorites / recent / archived / group / tag), 6 sort modes, grid & list views
- ✉️ **One-tap communication** — `mailto:` links open your mail app, `tel:` links open the dialer, plus a full **EmailJS** composer with loading/success/error states
- 🗂️ **Groups & tags** — default groups, custom groups with rename/delete, multi-tag chips with suggestions
- 📊 **Dashboard** — animated stat counters, quick actions, recent contacts, live activity feed
- 🕘 **Activity timeline + per-contact timeline** — a lightweight CRM trail of everything you do
- 🔄 **Import / Export** — JSON & CSV export, validated import with per-row error report and duplicate policies (skip / keep / replace)
- ⚠️ **Duplicate detection** — on add, edit and import (email or phone match) with Keep both / Replace / Cancel
- 📱 **Share & QR** — Web Share API with clipboard fallback, plus offline-generated **vCard QR codes** (downloadable)
- 🎨 **Design system** — Color Hunt palette (#FF7F50 · #FFD166 · #06D6A0 · #118AB2), true dark mode (light/dark/system), glass toasts, 3D tilt cards, floating hero, `prefers-reduced-motion` respected
- ⌨️ **Power UX** — command palette & global search (`Ctrl/⌘ K`), shortcuts (`N` new contact, `/` search, `Esc` close), keyboard navigable
- 📱 **Mobile-first** — bottom navigation with center FAB, drawer menu, large touch targets

## Tech stack

React 18 · Vite 5 · JavaScript (JSX, no TypeScript) · Tailwind CSS 3 · React Router 6 · React Icons · EmailJS (`@emailjs/browser`) · qrcode · LocalStorage

## Getting started

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## EmailJS setup (for the in-app "Send Email" composer)

The composer stays disabled — with a clear notice — until EmailJS is configured:

1. Create a free account at [emailjs.com](https://www.emailjs.com/)
2. Add an **Email Service** and an **Email Template** containing these variables:
   `{{to_email}}`, `{{to_name}}`, `{{subject}}`, `{{message}}`, `{{from_name}}`, `{{reply_to}}`
3. Copy `.env.example` to `.env` and fill in your real values:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

4. Restart the dev server.

> The one-tap **Email** button (`mailto:`) and **Call** button (`tel:`) always work with zero configuration.

## Data model (LocalStorage keys)

| Key              | Contents                                        |
| ---------------- | ----------------------------------------------- |
| `ci_users`       | Accounts (passwords SHA-256 demo-hashed)        |
| `ci_current`     | Active session (local or session storage)       |
| `ci_contacts`    | All contacts, scoped by `ownerId`               |
| `ci_groups`      | All groups, scoped by `ownerId`                 |
| `ci_activities`  | Activity log, scoped by `userId` (capped at 600)|
| `ci_settings`    | Per-user preferences                            |
| `ci_theme`       | light / dark / system                           |

## Privacy note

This is a **frontend-only demo**. All data (including accounts) lives in your browser's
LocalStorage and never leaves the device. Authentication is a convenience demo, not
production-grade security.

## Project structure

```
src/
├── components/     # Reusable UI (AppLayout, ContactCard, CommandPalette, …)
├── context/        # AuthContext, ContactContext, ThemeContext, ToastContext
├── pages/          # All routes (lazy-loaded)
├── services/       # emailService.js (EmailJS)
├── utils/          # storage, validation, export/import, hooks, seed data
├── App.jsx         # Route table
└── main.jsx        # Provider tree
```

## Deploy to Vercel

```bash
npm i -g vercel && vercel
# Build command: npm run build · Output dir: dist · Framework: Vite
```
Add the three `VITE_EMAILJS_*` values as environment variables in Vercel → Settings → Environment Variables.
