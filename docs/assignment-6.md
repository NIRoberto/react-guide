# Assignment 6: Production Build & Next.js Migration

## Description

Prepare your Airbnb app for production deployment and migrate the listings page to Next.js App Router with Server Components, API routes, and a Server Action for bookings.

---

## Setup

### Part A — Production-ready Vite app

```bash
cd airbnb-app
npm install
```

### Part B — New Next.js project

```bash
npx create-next-app@latest airbnb-app-next \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd airbnb-app-next
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## File Structure

### Part A — Vite app

```
airbnb-app/
├── src/
│   ├── config/
│   │   └── env.ts              # centralised env var access
│   └── ...                     # all files from Phase 5
├── .env.local                  # development env vars
├── .env.production             # production env vars
├── vercel.json                 # SPA rewrite rule
└── .github/
    └── workflows/
        └── deploy.yml          # CI/CD pipeline
```

### Part B — Next.js app

```
airbnb-app-next/
├── app/
│   ├── layout.tsx              # root layout
│   ├── page.tsx                # / — home (Server Component)
│   ├── listings/
│   │   ├── page.tsx            # /listings (Server Component)
│   │   └── [id]/
│   │       └── page.tsx        # /listings/[id] (Server Component)
│   ├── dashboard/
│   │   └── page.tsx            # /dashboard (Client Component)
│   ├── login/
│   │   └── page.tsx            # /login (Client Component)
│   └── api/
│       ├── listings/
│       │   └── route.ts        # GET /api/listings, POST /api/listings
│       └── listings/
│           └── [id]/
│               └── route.ts    # GET /api/listings/:id
├── actions/
│   └── bookings.ts             # Server Action — createBooking
├── components/
│   ├── FavoriteButton.tsx      # 'use client'
│   ├── SearchBar.tsx           # 'use client'
│   └── BookingForm.tsx         # 'use client'
├── lib/
│   └── listings.ts             # mock data / DB access
├── types/
│   └── index.ts
└── next.config.ts
```

---

## Tasks

### Part A — Vite Production

1. Create `.env.local` with `VITE_API_URL=http://localhost:3000/api`
2. Create `.env.production` with `VITE_API_URL=https://api.your-airbnb-app.com`
3. Create `src/config/env.ts` — export a typed `config` object using `import.meta.env`
4. Replace all direct `import.meta.env` usage in the codebase with `config.*`
5. Run `npm run build` — fix any TypeScript errors that appear
6. Create `vercel.json` with the SPA rewrite rule for React Router
7. Write `.github/workflows/deploy.yml` — installs, tests, builds, then deploys to Vercel on push to `main`

### Part B — Next.js Migration

8. Create `app/listings/page.tsx` as a **Server Component** — fetch listings with `cache: 'no-store'`
9. Create `app/listings/[id]/page.tsx` — `generateStaticParams` pre-renders all listing pages at build time
10. Create `app/api/listings/route.ts` — `GET` returns all listings, `POST` creates a new one
11. Create `app/api/listings/[id]/route.ts` — `GET` returns one listing, `DELETE` removes it
12. Create `actions/bookings.ts` with `'use server'` — `createBooking(formData)` saves booking and calls `revalidatePath('/listings')`
13. Create `components/FavoriteButton.tsx` with `'use client'` — `useState` for saved state
14. Create `components/BookingForm.tsx` with `'use client'` — calls the `createBooking` Server Action
15. Configure `next.config.ts` with `remotePatterns` for `images.unsplash.com`
16. Replace all `<img>` tags with Next.js `<Image>` component

---

## Starter Code

### `src/config/env.ts` (Vite)

```ts
interface AppConfig {
  apiUrl: string
  isDev: boolean
  isProd: boolean
}

export const config: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
```

### `.env.local`

```
VITE_API_URL=http://localhost:3000/api
```

### `.env.production`

```
VITE_API_URL=https://api.your-airbnb-app.com
```

### `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### `.github/workflows/deploy.yml`

```yaml
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

      - name: Install
        run: npm ci

      - name: Test
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

### `app/listings/page.tsx` (Next.js — Server Component)

```tsx
import type { Listing } from '@/types'

async function getListings(): Promise<Listing[]> {
  const res = await fetch(`${process.env.API_URL}/listings`, {
    cache: 'no-store',  // always fetch fresh data
  })
  if (!res.ok) throw new Error('Failed to fetch listings')
  return res.json()
}

export default async function ListingsPage() {
  const listings = await getListings()

  return (
    <main>
      <h1>Listings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map(listing => (
          // TODO: render Card with Image, Title, Price, Badge
          // TODO: include FavoriteButton (Client Component)
          <div key={listing.id}>{listing.title}</div>
        ))}
      </div>
    </main>
  )
}
```

### `app/listings/[id]/page.tsx` (Next.js — Server Component)

```tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { BookingForm } from '@/components/BookingForm'
import type { Listing } from '@/types'

interface Props {
  params: { id: string }
}

async function getListing(id: string): Promise<Listing> {
  const res = await fetch(`${process.env.API_URL}/listings/${id}`)
  if (!res.ok) notFound()
  return res.json()
}

// Pre-render all listing pages at build time
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const res = await fetch(`${process.env.API_URL}/listings`)
  const listings: Listing[] = await res.json()
  return listings.map(l => ({ id: String(l.id) }))
}

export default async function ListingDetail({ params }: Props) {
  const listing = await getListing(params.id)

  return (
    <div>
      <Image
        src={listing.img}
        alt={listing.title}
        width={800}
        height={500}
        className="w-full h-80 object-cover rounded-xl"
        priority
      />
      <h1>{listing.title}</h1>
      <p>{listing.location}</p>
      <p>${listing.price} / night · ★ {listing.rating}</p>
      {/* BookingForm is a Client Component */}
      <BookingForm listingId={listing.id} pricePerNight={listing.price} />
    </div>
  )
}
```

### `app/api/listings/route.ts`

```ts
import { NextResponse } from 'next/server'
import { getListings, createListing } from '@/lib/listings'

export async function GET(): Promise<NextResponse> {
  const listings = await getListings()
  return NextResponse.json(listings)
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json()
  const listing = await createListing(body)
  return NextResponse.json(listing, { status: 201 })
}
```

### `actions/bookings.ts`

```ts
'use server'

import { revalidatePath } from 'next/cache'

export interface BookingInput {
  listingId: number
  checkIn: string
  checkOut: string
  guests: number
}

export async function createBooking(formData: FormData): Promise<void> {
  const input: BookingInput = {
    listingId: Number(formData.get('listingId')),
    checkIn: formData.get('checkIn') as string,
    checkOut: formData.get('checkOut') as string,
    guests: Number(formData.get('guests')),
  }

  // TODO: validate input
  // TODO: save to database or call API

  // revalidate the listings page so availability updates
  revalidatePath('/listings')
}
```

### `components/FavoriteButton.tsx`

```tsx
'use client'

import { useState } from 'react'

interface FavoriteButtonProps {
  listingId: number
}

export function FavoriteButton({ listingId }: FavoriteButtonProps) {
  const [saved, setSaved] = useState<boolean>(false)

  const handleToggle = (): void => setSaved(prev => !prev)

  return (
    <button
      onClick={handleToggle}
      aria-label={saved ? 'Unsave listing' : 'Save listing'}
      className={`heart-btn ${saved ? 'saved' : ''}`}
    >
      {saved ? '♥' : '♡'}
    </button>
  )
}
```

### `next.config.ts`

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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

## Run the Assignment

### Part A

```bash
cd airbnb-app
npm run build          # verify production build
npm run preview        # test production build locally
```

### Part B

```bash
cd airbnb-app-next
npm run dev            # http://localhost:3000
npm run build          # verify Next.js build
```

---

## Acceptance Criteria

| # | Criteria | How to verify |
|---|----------|---------------|
| 1 | `.env.local` and `.env.production` created with `VITE_API_URL` | Files exist with correct values |
| 2 | `src/config/env.ts` exports typed `config` object | No direct `import.meta.env` in other files |
| 3 | Vite `npm run build` completes with zero errors | Build output shows no errors |
| 4 | `vercel.json` has SPA rewrite rule | File exists with correct JSON |
| 5 | `deploy.yml` runs install, test, build, deploy on push to `main` | File exists with all 4 steps |
| 6 | Next.js `app/listings/page.tsx` is a Server Component — no `'use client'` | File has no `'use client'` directive |
| 7 | Listings fetched on the server — no `useEffect` in listings page | No `useEffect` in `app/listings/page.tsx` |
| 8 | `generateStaticParams` pre-renders all listing detail pages | `npm run build` shows static pages generated |
| 9 | `GET /api/listings` returns listings array | `curl http://localhost:3000/api/listings` returns JSON |
| 10 | `POST /api/listings` creates a new listing | `curl -X POST` with JSON body — 201 response |
| 11 | `createBooking` Server Action has `'use server'` directive | File starts with `'use server'` |
| 12 | `FavoriteButton` has `'use client'` directive | File starts with `'use client'` |
| 13 | All `<img>` replaced with Next.js `<Image>` | No raw `<img>` tags in Next.js app |
| 14 | `next.config.ts` has `remotePatterns` for Unsplash | Images load without Next.js domain error |
| 15 | Next.js `npm run build` completes with zero errors | Build output shows no errors |

---

## Submission Checklist

- [ ] All 15 acceptance criteria pass
- [ ] Vite `npm run build` — zero errors
- [ ] Next.js `npm run build` — zero errors
- [ ] `vercel.json` and `deploy.yml` committed
- [ ] Server Components have no `'use client'` and no hooks
- [ ] Client Components marked with `'use client'`
- [ ] All images use Next.js `<Image>` component
- [ ] `createBooking` Server Action calls `revalidatePath`
