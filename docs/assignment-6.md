# Assignment 6: Production Build & Next.js Migration

## Description

The app is feature-complete. Now you ship it. This assignment has two parts.

**Part A** is about making the Vite app production-ready: centralising environment variables so no component ever touches `import.meta.env` directly, verifying the production build passes, configuring Vercel for deployment, and setting up a GitHub Actions CI/CD pipeline that runs tests and deploys automatically on every push to `main`.

**Part B** is a migration to **Next.js App Router**. This is where you learn the most important shift in modern React: the difference between Server Components and Client Components. In the Vite app, everything runs in the browser. In Next.js, pages can run on the server — they fetch data, render HTML, and send it to the browser before any JavaScript loads. This makes pages faster, more SEO-friendly, and simpler (no useEffect for data fetching).

You will migrate the listings pages to Server Components, build API routes, and use a Server Action for the booking form submission. By the end, you will understand when to use `'use client'` and when to leave it off.

---

## New Library to Learn — `next-auth`

Authentication in Next.js is different from the Vite app. You can't just use a React context because Server Components can't use context. `next-auth` (Auth.js) is the standard solution — it handles sessions, cookies, OAuth providers, and protected routes in a way that works with both Server and Client Components.

Read the `next-auth` v5 docs and understand `auth()` (reads the session in Server Components), `signIn()`, `signOut()`, and the `middleware.ts` file (protects routes at the edge before the page even renders).

In Part B, replace the fake auth context with `next-auth`. Protect the `/dashboard` route using Next.js middleware instead of a `ProtectedRoute` component.

```bash
# Inside the Next.js project
npm install next-auth@beta
```

---

## Libraries in This Assignment

### Part A — Vite
No new packages.

### Part B — Next.js
| Library | Purpose |
|---------|---------|
| `next-auth` | Authentication for Next.js — sessions, OAuth, middleware-based route protection |

```bash
npx create-next-app@latest airbnb-next --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd airbnb-next
npm install next-auth@beta
```

---

## Target Structure

### Part A — Vite App Additions

```
src/
├── config/
│   └── env.ts              ← centralised env var access
├── ...existing files
.env.local
.env.production
vercel.json
.github/
└── workflows/
    └── deploy.yml
```

### Part B — Next.js App

```
airbnb-next/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── listings/
│   │   ├── page.tsx              ← Server Component
│   │   └── [id]/
│   │       └── page.tsx          ← Server Component
│   ├── dashboard/
│   │   └── page.tsx              ← Server Component (reads session)
│   ├── login/
│   │   └── page.tsx              ← Client Component
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts      ← next-auth handler
│       └── listings/
│           ├── route.ts
│           └── [id]/
│               └── route.ts
├── actions/
│   └── bookings.ts               ← Server Action
├── components/
│   ├── FavoriteButton.tsx        ← 'use client'
│   ├── SearchBar.tsx             ← 'use client'
│   └── BookingForm.tsx           ← 'use client'
├── lib/
│   └── listings.ts
├── auth.ts                       ← next-auth config
├── middleware.ts                 ← protects /dashboard route
├── types/
│   └── index.ts
└── next.config.ts
```

---

## Tasks

### Part A — Vite Production

#### 1. Centralise Environment Variables
Create `src/config/env.ts`. Export a typed `config` object that wraps all `import.meta.env` values — `apiUrl`, `isDev`, `isProd`. Search the entire codebase for `import.meta.env` and replace every occurrence with the corresponding `config.*` property. Components should never access environment variables directly.

#### 2. Create Environment Files
Create `.env.local` with `VITE_API_URL=http://localhost:3000/api` for local development. Create `.env.production` with `VITE_API_URL` pointing to your production API URL. Add both files to `.gitignore` — never commit environment files.

#### 3. Verify the Production Build
Run `npm run build`. Fix any TypeScript errors or build warnings that appear. Then run `npm run preview` to serve the production build locally and verify the app works correctly in production mode.

#### 4. Create Vercel Config
Create `vercel.json` at the project root. Add a rewrite rule that sends all routes to `/index.html`. This is required because React Router handles routing client-side — without this rule, refreshing on `/listings/3` would return a 404 from Vercel.

#### 5. Create the CI/CD Pipeline
Create `.github/workflows/deploy.yml`. The pipeline should trigger on push to `main` and on pull requests to `main`. It should: check out the code, set up Node 20 with npm caching, install dependencies with `npm ci`, run the test suite, run the production build with the `VITE_API_URL` secret injected. On push to `main` only (not PRs), deploy to Vercel using the `amondnet/vercel-action` with your Vercel token, org ID, and project ID stored as GitHub secrets.

---

### Part B — Next.js Migration

#### 6. Set Up the Project and Data Layer
Create the Next.js project with the command above. Copy `types/index.ts` from the Vite app. Create `lib/listings.ts` as the data access layer — a module that exports `getListings()` and `getListing(id)` functions. These return mock data for now but will be replaced with real DB calls later. All data fetching in Server Components goes through this module.

#### 7. Configure next-auth
Create `auth.ts` at the project root. Configure `next-auth` with a credentials provider that accepts email and password (use hardcoded credentials for now). Export `auth`, `signIn`, and `signOut` from this file. Create `app/api/auth/[...nextauth]/route.ts` that exports the next-auth handlers.

#### 8. Protect Routes with Middleware
Create `middleware.ts` at the project root. Use the `auth` function from next-auth to check if the user has a session. If they visit `/dashboard` without a session, redirect them to `/login`. This runs at the edge — before the page even renders — which is more secure and faster than a client-side redirect.

#### 9. Build the Root Layout
In `app/layout.tsx`, add the Navbar and global styles. The Navbar should use Next.js `<Link>` for navigation. The layout wraps every page in the app.

#### 10. Build the Listings Page as a Server Component
Create `app/listings/page.tsx`. This is a Server Component — no `'use client'` directive, no hooks, no useEffect. Fetch listings by calling `getListings()` from `lib/listings.ts` directly — no axios, no useQuery. Render listing cards in a grid. Include `<FavoriteButton>` (a Client Component) inside each card for the interactive heart toggle.

#### 11. Build the Listing Detail Page as a Server Component
Create `app/listings/[id]/page.tsx`. Fetch the single listing on the server using `getListing(params.id)`. Call `notFound()` from `next/navigation` if the listing doesn't exist — this renders the nearest `not-found.tsx`. Implement `generateStaticParams` to pre-render all listing detail pages at build time — this makes them load instantly. Use Next.js `<Image>` for the listing photo. Include `<BookingForm>` (a Client Component).

#### 12. Build the Dashboard as a Server Component
Create `app/dashboard/page.tsx`. Use `auth()` from next-auth to read the session on the server. Display the user's name and email from the session. Show their saved listings count. Because middleware already protects this route, you don't need to check auth here — but you can use the session data directly.

#### 13. Build API Routes
Create `app/api/listings/route.ts` with a `GET` handler that returns all listings and a `POST` handler that creates a new one (returns 201). Create `app/api/listings/[id]/route.ts` with a `GET` handler that returns one listing and a `DELETE` handler that removes it. All handlers return `NextResponse.json()`.

#### 14. Build the createBooking Server Action
Create `actions/bookings.ts`. Add `'use server'` at the top of the file. Define `createBooking(formData: FormData)`. Parse the form data fields, validate them, and save the booking. Call `revalidatePath('/listings')` so the listings page refetches after a booking is made. Server Actions run on the server — no API route needed, no axios call from the client.

#### 15. Build Client Components
Create `components/FavoriteButton.tsx` with `'use client'` — manages saved state with `useState`, shows a heart icon. Create `components/SearchBar.tsx` with `'use client'` — a controlled input that updates the URL search params using `useRouter` and `useSearchParams` so search state lives in the URL. Create `components/BookingForm.tsx` with `'use client'` — calls the `createBooking` Server Action on submit using the `action` prop on a `<form>` element.

#### 16. Configure Next.js Image Domains
In `next.config.ts`, add `remotePatterns` for `images.unsplash.com`. Replace all `<img>` tags in the Next.js app with the Next.js `<Image>` component — it automatically optimises images, serves WebP, and prevents layout shift.

---

## Acceptance Criteria

| # | Criteria |
|---|----------|
| 1 | `src/config/env.ts` exports typed `config` — no `import.meta.env` elsewhere |
| 2 | Vite `npm run build` completes with zero errors |
| 3 | `vercel.json` has SPA rewrite rule |
| 4 | `deploy.yml` runs install, test, build, and deploys on push to `main` |
| 5 | `app/listings/page.tsx` is a Server Component — no `'use client'`, no hooks |
| 6 | Listings fetched on the server — no `useEffect` in listings page |
| 7 | `generateStaticParams` pre-renders all listing detail pages |
| 8 | `middleware.ts` protects `/dashboard` — redirects to `/login` without a session |
| 9 | `next-auth` session readable in `DashboardPage` via `auth()` |
| 10 | `GET /api/listings` returns listings array |
| 11 | `POST /api/listings` returns 201 with new listing |
| 12 | `createBooking` Server Action has `'use server'` directive |
| 13 | `createBooking` calls `revalidatePath('/listings')` |
| 14 | `FavoriteButton` has `'use client'` directive |
| 15 | `SearchBar` updates URL search params — search state survives refresh |
| 16 | `BookingForm` calls Server Action via form `action` prop |
| 17 | All `<img>` replaced with Next.js `<Image>` |
| 18 | `next.config.ts` has `remotePatterns` for Unsplash |
| 19 | Next.js `npm run build` completes with zero errors |

---

## Submission Checklist

- [ ] All 19 acceptance criteria pass
- [ ] Vite `npm run build` — zero errors
- [ ] Next.js `npm run build` — zero errors
- [ ] `vercel.json` and `deploy.yml` committed
- [ ] `next-auth` configured with credentials provider and middleware
- [ ] Server Components have no `'use client'` and no hooks
- [ ] Client Components marked with `'use client'`
- [ ] All images use Next.js `<Image>` component
- [ ] `createBooking` Server Action calls `revalidatePath`
- [ ] API routes return correct status codes
