# Phase 6: Production

## Table of Contents
1. [Vite Production Build](#vite-production-build)
2. [Environment Variables](#environment-variables)
3. [Bundle Analysis & Optimization](#bundle-analysis--optimization)
4. [Deploying to Vercel](#deploying-to-vercel)
5. [Deploying to Netlify](#deploying-to-netlify)
6. [AWS S3 + CloudFront](#aws-s3--cloudfront)
7. [CI/CD with GitHub Actions](#cicd-with-github-actions)
8. [Introduction to Next.js](#introduction-to-nextjs)
9. [App Router vs Pages Router](#app-router-vs-pages-router)
10. [Server Components vs Client Components](#server-components-vs-client-components)
11. [SSR, SSG, and ISR](#ssr-ssg-and-isr)
12. [Server Actions](#server-actions)
13. [Next.js Image Optimization](#nextjs-image-optimization)
14. [API Routes](#api-routes)
15. [Assignment](#assignment)

---

## Vite Production Build

Vite bundles your app for production: tree-shakes unused code, minifies JavaScript and CSS, splits chunks for lazy-loaded routes, and outputs everything to `dist/`.

```bash
npm run build    # outputs to dist/
npm run preview  # serve dist/ locally to test the production build
```

**Always run `npm run preview` before deploying.** The production build behaves differently from the dev server — it catches issues like missing env vars, broken imports, and routing problems.

### vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,           // disable in production — reduces bundle size and hides source code
    minify: 'esbuild',          // fast minification (esbuild is ~10x faster than terser)
    chunkSizeWarningLimit: 500, // warn if a chunk exceeds 500kb
    rollupOptions: {
      output: {
        // Split vendor libraries into a separate chunk
        // The browser caches vendor.js separately — users don't re-download React on every deploy
        // Only your app code changes between deploys, not React or React Router
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
})
```

### What Vite Does at Build Time

| Step | What happens |
|------|-------------|
| Tree shaking | Removes unused exports — if you import only `useState`, the rest of React isn't included |
| Minification | Removes whitespace, shortens variable names — reduces file size by 60-80% |
| Code splitting | Lazy-loaded routes become separate JS files — only downloaded when visited |
| Asset hashing | `main.abc123.js` — filename changes when content changes, forces browser cache refresh |
| CSS extraction | Extracts CSS into separate files for parallel loading |

---

## Environment Variables

Environment variables let you use different values in development vs production without changing your code. This is how you avoid hardcoding API URLs, tokens, and feature flags.

```bash
# .env.local — local development (never commit to Git — contains secrets)
VITE_API_URL=http://localhost:3000/api
VITE_MAPBOX_TOKEN=pk.dev.abc123
VITE_ENABLE_ANALYTICS=false

# .env.production — production values (safe to commit if no secrets)
VITE_API_URL=https://api.airbnb-clone.com
VITE_MAPBOX_TOKEN=pk.prod.xyz789
VITE_ENABLE_ANALYTICS=true
```

### Rules

- Must start with `VITE_` to be exposed to client-side code
- Access via `import.meta.env.VITE_*`
- **Never put secrets** (database passwords, private API keys) in `VITE_` variables — they are bundled into the JavaScript and visible to anyone who opens DevTools

```ts
// src/config/env.ts — centralize all env var access
// This gives you one place to see all env vars and add validation
export const config = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN as string,
  analyticsEnabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  isDev: import.meta.env.DEV,    // built-in Vite boolean — true in dev
  isProd: import.meta.env.PROD,  // built-in Vite boolean — true in production
}

// Usage
fetch(`${config.apiUrl}/listings`)
if (config.analyticsEnabled) trackPageView()
```

### .gitignore

```
node_modules/
dist/
.env.local
.env.*.local
*.log
```

---

## Bundle Analysis & Optimization

Before optimizing, measure. The bundle visualizer shows you exactly what's in your bundle and how large each piece is.

```bash
npm install -D rollup-plugin-visualizer
```

```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true, gzipSize: true }),  // opens a visual treemap after build
  ],
})
```

### Common Optimizations

```tsx
// 1. Lazy load heavy routes — only download when visited
const Dashboard = lazy(() => import('./pages/Dashboard'))
const BookingForm = lazy(() => import('./pages/BookingForm'))

// 2. Dynamic imports for large libraries used rarely
const { Chart } = await import('chart.js')

// 3. Avoid importing entire libraries
// WRONG — imports all of lodash (~70kb gzipped)
import _ from 'lodash'
const result = _.groupBy(listings, 'location')

// RIGHT — import only what you need (~2kb)
import groupBy from 'lodash/groupBy'
const result = groupBy(listings, 'location')

// 4. Preload critical routes — browser downloads them in the background
// Add to index.html for routes users are likely to visit
<link rel="modulepreload" href="/assets/ListingDetail.abc123.js" />
```

---

## Deploying to Vercel

Vercel is the easiest way to deploy a React app. It auto-detects Vite and configures everything.

```bash
# Option 1: Vercel CLI
npm install -g vercel
vercel login
vercel          # deploy preview
vercel --prod   # deploy to production
```

**Option 2: Connect GitHub (recommended)**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import Git Repository
3. Select your repo — Vercel auto-detects Vite, no config needed
4. Every push to `main` auto-deploys to production
5. Every pull request gets a unique preview URL for review

```json
// vercel.json — required for React Router (SPA routing)
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Why this is needed:** When a user visits `/listings/3` directly (or refreshes), Vercel looks for a file at that path. It doesn't exist — only `index.html` does. This rewrite rule tells Vercel to serve `index.html` for all paths, and React Router handles the routing client-side.

### Environment Variables on Vercel

Go to Project Settings → Environment Variables and add your `VITE_*` variables. Vercel injects them at build time — they're baked into the JavaScript bundle.

---

## Deploying to Netlify

```bash
# netlify.toml — Netlify config file (commit this to your repo)
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Same as Vercel — connect your GitHub repo and Netlify auto-deploys on every push. The `[[redirects]]` rule serves the same purpose as Vercel's `rewrites` — it handles React Router's client-side routing.

---

## AWS S3 + CloudFront

For teams already on AWS, S3 + CloudFront is a cost-effective and highly scalable option. S3 stores the static files; CloudFront is a CDN that serves them from edge locations close to users worldwide.

```bash
# Build your app
npm run build

# Upload to S3 — --delete removes files that no longer exist in dist/
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache after deploy
# Without this, users get the old cached version for up to 24 hours
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

**Setup steps:**
1. Create an S3 bucket with static website hosting enabled
2. Create a CloudFront distribution pointing to the S3 bucket
3. Set the default root object to `index.html`
4. Add a custom error response: 404 → `/index.html` with status 200 (for React Router)
5. Attach a custom domain via Route 53

---

## CI/CD with GitHub Actions

CI/CD (Continuous Integration / Continuous Deployment) automates testing and deployment. Every push to `main` automatically runs tests and deploys — no manual steps.

```yaml
# .github/workflows/deploy.yml
name: Test & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'  # cache node_modules between runs — faster CI

      - name: Install dependencies
        run: npm ci  # ci is faster and stricter than npm install — uses package-lock.json exactly

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}  # inject secrets at build time

      # Only deploy on pushes to main, not on pull requests
      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

Add your secrets in GitHub → Repository Settings → Secrets and variables → Actions. Secrets are encrypted and never exposed in logs.

---

## Introduction to Next.js

Next.js is a React framework that adds server-side capabilities on top of React. It gives you file-based routing, Server Components, SSR, SSG, ISR, API routes, and image optimization — all built in.

```bash
npx create-next-app@latest airbnb-clone --typescript --tailwind --app
```

### When to Use Next.js vs Vite + React

| Feature | Vite + React | Next.js |
|---------|-------------|---------|
| Setup | Simple | More complex |
| Routing | React Router | File-based (automatic) |
| SEO | Poor (CSR) | Excellent (SSR/SSG) |
| Performance | Good | Excellent |
| Server-side logic | Separate backend needed | Built-in |
| Image optimization | Manual | Built-in `<Image>` |
| Deployment | Any static host | Vercel (optimal) |

**When to choose Next.js:** SEO matters (public-facing pages), you need server-side data fetching, or you want a full-stack solution in one project.

**When to stick with Vite + React:** Internal tools, dashboards, apps behind auth (SEO doesn't matter), or when you want maximum simplicity.

---

## App Router vs Pages Router

Next.js has two routing systems. The **App Router** (Next.js 13+) is the modern approach and what you should use for new projects.

```
App Router (app/ directory) — modern, recommended
app/
  layout.tsx          # root layout — wraps all pages, persists across navigation
  page.tsx            # / route
  listings/
    page.tsx          # /listings
    [id]/
      page.tsx        # /listings/[id]
  dashboard/
    page.tsx          # /dashboard
  api/
    listings/
      route.ts        # /api/listings

Pages Router (pages/ directory) — legacy, still supported
pages/
  index.tsx           # /
  listings/
    index.tsx         # /listings
    [id].tsx          # /listings/[id]
```

**Key difference:** The App Router uses React Server Components by default. The Pages Router uses Client Components by default. This changes how you think about data fetching and rendering.

---

## Server Components vs Client Components

This is the most important concept in the App Router. Understanding the boundary between server and client is essential.

### Server Components (default)

- Run on the server — zero JavaScript sent to the client for these components
- Can be `async` — fetch data directly without `useEffect` or TanStack Query
- Cannot use `useState`, `useEffect`, or event handlers
- Cannot access browser APIs (`window`, `document`, `localStorage`)
- Can access server-only resources (databases, file system, environment secrets)

```tsx
// app/listings/page.tsx — Server Component (no 'use client' directive)
import { db } from '@/lib/db'

export default async function ListingsPage() {
  // This runs on the server — direct DB access, no API round-trip, no loading state needed
  // The HTML is generated on the server and sent to the browser fully rendered
  const listings = await db.listings.findMany({
    orderBy: { rating: 'desc' },
  })

  return (
    <main>
      <h1>Listings</h1>
      <div className="grid">
        {listings.map(l => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    </main>
  )
}
```

### Client Components

- Run in the browser — JavaScript is sent to the client
- Can use `useState`, `useEffect`, event handlers, browser APIs
- Must be marked with `'use client'` at the top of the file
- Still server-rendered on first load (for SEO and performance), then hydrated

```tsx
// components/FavoriteButton.tsx — Client Component
'use client'

import { useState } from 'react'

export function FavoriteButton({ listingId }: { listingId: number }) {
  const [saved, setSaved] = useState(false)

  return (
    <button onClick={() => setSaved(s => !s)}>
      {saved ? 'Unsave' : 'Save'}
    </button>
  )
}
```

### The Rule

Keep components as Server Components by default. Only add `'use client'` when you need interactivity, state, or browser APIs. Push client components as far **down** the tree as possible — this minimizes the JavaScript sent to the browser.

```
app/listings/page.tsx          → Server Component (fetches data, no JS sent)
  └── ListingCard.tsx          → Server Component (renders data, no JS sent)
        └── FavoriteButton.tsx → Client Component (needs useState — JS sent for this only)
```

---

## SSR, SSG, and ISR

Next.js gives you three rendering strategies. The right choice depends on how often the data changes and how important SEO is.

### SSR — Server-Side Rendering

HTML is generated on the server for **every request**. Always fresh data. Use for pages where data changes frequently and must be up-to-date (e.g., booking availability).

```tsx
// app/listings/[id]/page.tsx
export default async function ListingDetail({ params }: { params: { id: string } }) {
  const listing = await fetch(`https://api.example.com/listings/${params.id}`, {
    cache: 'no-store',  // opt out of caching — always fetch fresh data
  }).then(r => r.json())

  return <div>{listing.title}</div>
}
```

### SSG — Static Site Generation

HTML is generated at **build time**. Fastest possible load — served from CDN. Use for pages where data rarely changes (e.g., listing descriptions, blog posts).

```tsx
// app/listings/[id]/page.tsx
// generateStaticParams — tells Next.js which IDs to pre-render at build time
export async function generateStaticParams() {
  const listings = await fetch('https://api.example.com/listings').then(r => r.json())
  // Returns [{ id: '1' }, { id: '2' }, { id: '3' }, ...]
  return listings.map((l: Listing) => ({ id: String(l.id) }))
}

export default async function ListingDetail({ params }: { params: { id: string } }) {
  const listing = await fetch(`https://api.example.com/listings/${params.id}`).then(r => r.json())
  return <div>{listing.title}</div>
}
```

### ISR — Incremental Static Regeneration

Pages are statically generated but automatically regenerated in the background after a set time. Best of both worlds — CDN speed with reasonably fresh data.

```tsx
export default async function ListingsPage() {
  const listings = await fetch('https://api.example.com/listings', {
    next: { revalidate: 60 },  // regenerate this page at most every 60 seconds
  }).then(r => r.json())

  return <ListingsGrid listings={listings} />
}
```

**Choosing a strategy:**
- Data changes every request → SSR (`cache: 'no-store'`)
- Data changes every few minutes → ISR (`revalidate: 60`)
- Data rarely changes → SSG (`generateStaticParams`)

---

## Server Actions

Server Actions let you run server-side code directly from a Client Component — no separate API route needed. They're async functions marked with `'use server'` that can be called from the client.

**Why this matters:** Before Server Actions, you needed a full API route to handle form submissions. Now you can write the server logic inline, and Next.js handles the network request automatically.

```tsx
// app/actions/bookings.ts
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createBooking(formData: FormData) {
  const booking = {
    listingId: Number(formData.get('listingId')),
    checkIn: formData.get('checkIn') as string,
    checkOut: formData.get('checkOut') as string,
    guests: Number(formData.get('guests')),
  }

  await db.bookings.create({ data: booking })

  // Revalidate the listings page so it shows updated availability
  revalidatePath('/listings')
}

// Client Component — calls the server action directly
'use client'
import { createBooking } from '@/app/actions/bookings'

export function BookingForm({ listingId }: { listingId: number }) {
  return (
    // action prop accepts a Server Action — Next.js handles the network request
    <form action={createBooking}>
      <input type="hidden" name="listingId" value={listingId} />
      <input type="date" name="checkIn" />
      <input type="date" name="checkOut" />
      <button type="submit">Book Now</button>
    </form>
  )
}
```

---

## Next.js Image Optimization

The `<Image>` component from Next.js automatically optimizes images: resizes them to the exact dimensions needed, converts to WebP (smaller than JPEG/PNG), lazy loads by default, and reserves space to prevent layout shift (CLS).

```tsx
import Image from 'next/image'

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="card">
      <Image
        src={listing.img}
        alt={listing.title}
        width={400}
        height={260}
        className="card-img"
        priority={false}   // set true for above-the-fold images (LCP element)
        placeholder="blur" // shows a blurred placeholder while loading
      />
      <h3>{listing.title}</h3>
    </div>
  )
}
```

For external images, add the domain to `next.config.ts` — this prevents malicious image URLs from being processed:

```ts
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig
```

---

## API Routes

Next.js API routes let you build a backend API in the same project as your frontend. They run on the server — you can access databases, call external APIs with secret keys, and handle auth.

```ts
// app/api/listings/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/listings
// GET /api/listings?q=bali
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') ?? ''

  const listings = await db.listings.findMany({
    where: query ? { title: { contains: query, mode: 'insensitive' } } : undefined,
    orderBy: { rating: 'desc' },
  })

  return NextResponse.json(listings)
}

// POST /api/listings
export async function POST(request: Request) {
  const body = await request.json()
  const listing = await db.listings.create({ data: body })
  return NextResponse.json(listing, { status: 201 })
}

// app/api/listings/[id]/route.ts
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const listing = await db.listings.findUnique({ where: { id: Number(params.id) } })
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(listing)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await db.listings.delete({ where: { id: Number(params.id) } })
  return new NextResponse(null, { status: 204 })
}
```

**When to use API routes vs Server Actions:**
- **API routes** — when you need a public API consumed by mobile apps, third parties, or other services
- **Server Actions** — when the endpoint is only called from your own Next.js app (form submissions, mutations)

---

## Assignment

> See **[assignment-6.md](./assignment-6.md)** for the full description, file structure, acceptance criteria, and submission checklist.

**Summary:** Prepare your Vite app for production with env vars, `vercel.json`, and a GitHub Actions CI/CD pipeline. Then migrate the listings page to Next.js App Router with Server Components, API routes, and a Server Action.

---

**Resources**
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vite Build Docs](https://vite.dev/guide/build)
- [Next.js App Router Course](https://nextjs.org/learn)
