# AASHA-SM TECHNOLOGIES — Custom T-Shirt Printing

Premium, SEO-optimized custom T-shirt printing website built **100% on the free stack**.
No paid services are required to ship — every paid upgrade is optional and pluggable later.

---

## Free stack used in this project

| Layer | Free choice | Where it lives |
| --- | --- | --- |
| Framework | Next.js 15 + React 19 | `src/app` |
| Styling | Tailwind CSS | `tailwind.config.ts`, `globals.css` |
| Animations | Framer Motion | components/* |
| Icons | Lucide / React Icons (free) | `lucide-react` (installed) |
| Fonts | Google Fonts (Inter + Syne) | `src/app/layout.tsx` |
| Backend | Node.js + Express | `server/index.mjs` |
| Auth | NextAuth-ready + JWT + bcrypt (free) | env vars + helpers |
| Database | MongoDB Atlas free tier | `MONGODB_URI` |
| Image storage | Cloudinary free plan | `src/lib/cloudinary.ts` |
| Frontend hosting | Vercel free | `vercel.json` compatible |
| Backend hosting | Render free / Railway free | `server/index.mjs` |
| Payments | Razorpay (no monthly fee) + COD + WhatsApp | env + checkout page |
| Email | Nodemailer + Gmail SMTP (free) | `server/index.mjs` |
| SEO | next sitemap, robots, JSON-LD | `src/app/sitemap.ts`, `robots.txt`, `src/lib/seo.ts` |
| Analytics | Google Analytics 4 (free) | `src/components/analytics/GoogleAnalytics.tsx` |
| Admin panel | Custom Next.js + Tailwind | `src/app/admin` |
| Charts | Recharts (free, install on demand) | admin |
| Tables | TanStack Table (free, install on demand) | admin |
| Customizer | Fabric.js | `src/components/editor/TeeDesigner.tsx` |
| Drag-drop upload | react-dropzone (free, optional) | editor |
| Color picker | react-color (free, optional) | editor |
| Cart / state | Zustand | `src/store/useCart.ts` |
| UI primitives | shadcn/ui + Headless UI compatible | `src/components/ui` |
| Mockups | Free PNG base in `public/mockups` | `tee-front-base.png` |
| Order tracking | Mongo statuses: confirmed → printing → shipped → delivered | `server/index.mjs` |
| AI suggestions | Static JSON + optional Gemini free tier | `src/lib/textSuggestions.ts` |
| WhatsApp | Free `wa.me` link with auto-filled order details | `src/lib/whatsapp.ts` |
| Performance | next/image, lazy load, dynamic import | throughout |
| Security | Helmet + express-rate-limit + JWT + bcrypt | `server/index.mjs` |
| Blog | Static data (Markdown/MDX-ready) | `src/data/blog.ts` |
| Domain | `*.vercel.app` (free) — bring custom domain later | — |
| GMB SEO | Google Business Profile (free) + local schema | `src/lib/seo.ts` |

---

## Run locally

```bash
npm install
cp .env.example .env
npm run dev          # frontend → http://localhost:3000
npm run server       # API      → http://127.0.0.1:8787 (optional)
```

Both can run together without setting any keys — the app falls back to offline / stub mode.

### Windows: `EPERM` on `.next/trace` or “port 3000 in use”

`npm run dev` uses a separate build folder **`.next-dev`** so a stuck old `node.exe` does not lock the same trace file as your new dev server.

1. Close every terminal that was running Next, then in **Task Manager** end any leftover **Node.js** processes (or run `taskkill /F /IM node.exe` in an elevated Command Prompt).
2. Run `npm run dev` again — open **http://localhost:3000** (not `3001` unless the log says so).
3. If Windows Defender still locks files, add the project folder to **exclusions** or pause real-time protection briefly while compiling.

---

## Free deployment flow

1. **Frontend → Vercel free**
   - Push repo to GitHub.
   - Import on Vercel, set `NEXT_PUBLIC_*` env vars.
   - Vercel gives you a free `*.vercel.app` domain instantly.
2. **Backend → Render free** (or Railway free)
   - New Web Service from the same repo, build: `npm install`, start: `node server/index.mjs`.
   - Set `MONGODB_URI`, SMTP vars, Razorpay vars.
3. **Database → MongoDB Atlas free tier** (M0 cluster).
4. **Image storage → Cloudinary free plan** — create an *unsigned* upload preset called `aasha_unsigned`.
5. **Email → Gmail SMTP** — generate an App Password and put it in `SMTP_PASS`.
6. **Analytics → Google Analytics 4** — paste the GA Measurement ID into `NEXT_PUBLIC_GA_ID`.
7. **Search Console → Google Search Console** — paste the verification token into `NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION`.
8. **Google Business Profile** — create one for free; link your `*.vercel.app` (or custom) domain to boost local SEO.

---

## Environment variables

See [`.env.example`](./.env.example). Every variable has a free provider mapped to it.
Leaving a section blank disables that integration gracefully (no crashes).

---

## Architecture notes

- The frontend works fully **offline-first** — it falls back to local seed data when the API or DB is unreachable.
- The backend is intentionally tiny and stateless except for MongoDB; deployable on any free tier.
- All paid upgrades (e.g. premium Cloudinary, Mailgun, Twilio WhatsApp Business API) are drop-in — only env vars need to change.

---

## Admin Panel (premium dashboard)

A full Shopify / Printify-grade control panel ships under `src/app/admin/(authed)`:

```
src/app/admin/
├── login/             # Glass login (NextAuth credentials)
└── (authed)/
    ├── page.tsx       # Dashboard (Recharts + recent orders + uploads)
    ├── orders/        # Search, filter, status update, invoice
    ├── products/      # CRUD + Cloudinary uploads + sizes/colors/stock
    ├── categories/    # Manage collections
    ├── uploads/       # Customer logos / images / text — approve, reject
    ├── bulk-orders/   # Company inquiries — quote, PDF export
    ├── customers/     # Buyer directory with spend & last order
    ├── reviews/       # Moderate ratings + reviews
    ├── blogs/         # Rich-text blog editor + SEO meta
    ├── seo/           # Per-page meta + JSON-LD + Search Console
    ├── coupons/       # Percent/flat codes, expiry, usage limits
    ├── analytics/     # Sales / traffic / conversion / top products
    └── settings/      # Company, payment, shipping, social links
```

**Auth & security (all free):**

- **NextAuth v5** with the **Credentials** provider — `src/lib/auth.ts`
- **bcryptjs** password hashing
- **JWT** sessions (httpOnly cookie, 7-day expiry)
- **Edge-safe middleware** route protection — `src/middleware.ts` redirects unauthenticated traffic to `/admin/login`
- The Edge config is in `src/lib/auth.config.ts` (no Mongoose/bcrypt) so the middleware ships cleanly to Vercel Edge

**Default credentials (work out of the box, no DB required):**

```
Email:    admin@gmail.com
Password: pass12345
```

When `MONGODB_URI` is set, call `POST /api/admin/seed` once to create the bcrypt-hashed admin user in MongoDB. After that you can remove the env fallback in `src/lib/auth.ts`.

**MongoDB models** — `src/models/index.ts`: User, Product, Order, Customer, BulkOrder, Upload, Coupon, Blog, Review, Setting (all with timestamps + indexes).

**API routes** — `src/app/api/admin/*`: orders, products, customers, uploads, bulk-orders, coupons, blogs, reviews, settings, seed. All are auth-gated via `await auth()`.

**UI / UX:**

- Glassmorphism + gradient accent cards (`src/components/admin/AdminUI.tsx`)
- Recharts dashboards (`src/components/admin/AdminCharts.tsx`)
- Lucide icons for sidebar
- Framer Motion micro-animations
- Fully responsive (mobile drawer sidebar)
- Dark/light theme aware
- Loading states + empty states + pagination + search

---

## Contact

- **AASHA-SM TECHNOLOGIES PRIVATE LIMITED**
- Phone: +91 9529998320
- Email: adminsmtechsolution@gmail.com
- WhatsApp: https://wa.me/919529998320
"# carpedium" 
