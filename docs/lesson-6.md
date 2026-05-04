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
15. [Assignment — Production-Ready Airbnb App](#assignment--production-ready-airbnb-app)

---

## Vite Production Build

Vite bundles your app for production: tree-shakes unused code, minifies JavaScript and CSS, splits chunks for lazy-loaded routes, and outputs everything to `dist/`.

```bash
npm run build    # outputs to dist/
npm run preview  # serve dist/ locally to test the production build
```

### vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,           // disable in production — reduces bundle size
    minify: 'esbuild',          // fast minification
    chunkSizeWarningLimit: 500, // warn if a chunk exceeds 500kb
    rollupOptions: {
      output: {
        // Split vendor libraries into a separate chunk
        // Browser caches it separately — users don't re-download React on every deploy
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

Environment variables let you use different values in development vs production without changing your code.

```bash
# .env.local — local development (never commit to Git)
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
- Never put secrets (database passwords, private API keys) in `VITE_` variables — they are bundled into the JavaScript and visible to anyone

```ts
// src/config/env.ts — centralize all env var access
export const config = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN as string,
  analyticsEnabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  isDev: import.meta.env.DEV,    // built-in Vite boolean
  isProd: import.meta.env.PROD,  // built-in Vite boolean
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

```bash
# Install bundle analyzer
npm install -D rollup-plugin-visualizer
```

```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true, gzipSize: true }),  // opens a visual report after build
  ],
})
```

### Common Optimizations

```tsx
// 1. Lazy load heavy routes
const Dashboard = lazy(() => import('./pages/Dashboard'))
const BookingForm = lazy(() => import('./pages/BookingForm'))

// 2. Dynamic imports for large libraries
const { Chart } = await import('chart.js')

// 3. Avoid importing entire libraries
// WRONG — imports all of lodash (~70kb)
import _ from 'lodash'
const result = _.groupBy(listings, 'location')

// RIGHT — import only what you need (~2kb)
import groupBy from 'lodash/groupBy'
const result = groupBy(listings, 'location')

// 4. Preload critical routes
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
5. Every pull request gets a unique preview URL

```json
// vercel.json — required for React Router (SPA routing)
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Without this, refreshing on `/listings/3` returns a 404 because Vercel looks for a file at that path.

### Environment Variables on Vercel

Go to Project Settings → Environment Variables and add your `VITE_*` variables. Vercel injects them at build time.

---

## Deploying to Netlify

```bash
# netlify.toml — Netlify config file
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Same as Vercel — connect your GitHub repo and Netlify auto-deploys on every push.

---

## AWS S3 + CloudFront

For teams already on AWS, S3 + CloudFront is a cost-effective and highly scalable option.

```bash
# Build your app
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache after deploy
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

Every push to `main` automatically runs tests and deploys to Vercel.

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
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

Add your secrets in GitHub → Repository Settings → Secrets and variables → Actions.

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

---

## App Router vs Pages Router

Next.js has two routing systems. The **App Router** (Next.js 13+) is the modern approach.

```
App Router (app/ directory) — modern, recommended
app/
  layout.tsx          # root layout — wraps all pages
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

Pages Router (pages/ directory) — legacy
pages/
  index.tsx           # /
  listings/
    index.tsx         # /listings
    [id].tsx          # /listings/[id]
```

---

## Server Components vs Client Components

This is the most important concept in the App Router.

### Server Components (default)

- Run on the server — zero JavaScript sent to the client
- Can be `async` — fetch data directly without `useEffect`
- Cannot use `useState`, `useEffect`, or event handlers
- Cannot access browser APIs

```tsx
// app/listings/page.tsx — Server Component (no 'use client')
import { db } from '@/lib/db'

export default async function ListingsPage() {
  // Runs on the server — direct DB access, no API round-trip
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

Keep components as Server Components by default. Only add `'use client'` when you need interactivity, state, or browser APIs. Push client components as far down the tree as possible.

```
app/listings/page.tsx          → Server Component (fetches data)
  └── ListingCard.tsx          → Server Component (renders data)
        └── FavoriteButton.tsx → Client Component (needs useState)
```

---

## SSR, SSG, and ISR

### SSR — Server-Side Rendering

HTML is generated on the server for every request. Always fresh data.

```tsx
// app/listings/[id]/page.tsx
// This is SSR by default in the App Router — runs on every request
export default async function ListingDetail({ params }: { params: { id: string } }) {
  const listing = await fetch(`https://api.example.com/listings/${params.id}`, {
    cache: 'no-store',  // always fetch fresh data
  }).then(r => r.json())

  return <div>{listing.title}</div>
}
```

### SSG — Static Site Generation

HTML is generated at build time. Fastest possible load — served from CDN.

```tsx
// app/listings/[id]/page.tsx
// generateStaticParams — pre-render all listing pages at build time
export async function generateStaticParams() {
  const listings = await fetch('https://api.example.com/listings').then(r => r.json())
  return listings.map((l: Listing) => ({ id: String(l.id) }))
}

export default async function ListingDetail({ params }: { params: { id: string } }) {
  const listing = await fetch(`https://api.example.com/listings/${params.id}`).then(r => r.json())
  return <div>{listing.title}</div>
}
```

### ISR — Incremental Static Regeneration

Pages are statically generated but automatically regenerated in the background after a set time. Best of both worlds.

```tsx
export default async function ListingsPage() {
  const listings = await fetch('https://api.example.com/listings', {
    next: { revalidate: 60 },  // regenerate this page every 60 seconds
  }).then(r => r.json())

  return <ListingsGrid listings={listings} />
}
```

---

## Server Actions

Server Actions let you run server-side code directly from a Client Component — no separate API route needed.

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

The `<Image>` component from Next.js automatically optimizes images: resizes, converts to WebP, lazy loads, and prevents layout shift.

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
        priority={false}   // set true for above-the-fold images
        placeholder="blur" // shows a blurred placeholder while loading
      />
      <h3>{listing.title}</h3>
    </div>
  )
}
```

For external images, add the domain to `next.config.ts`:

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

Next.js API routes let you build a backend API in the same project as your frontend.

```ts
// app/api/listings/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/listings
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
