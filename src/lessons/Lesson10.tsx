import { useState } from 'react'
import { ArrowRight, BookOpen, Code2, Eye, Clock, BarChart2, GitBranch, Globe, Zap, Server, Monitor } from 'lucide-react'
import { CodeBlock, ConceptCard, SectionTitle, LivePreview, AssignmentCard, levelColor } from '../components/ui'

// ── Deployment Pipeline ───────────────────────────────────────────────────────
const pipelineSteps = [
  { icon: <Code2 size={16} />, label: 'Code', sub: 'src/' },
  { icon: <GitBranch size={16} />, label: 'GitHub', sub: 'git push' },
  { icon: <Zap size={16} />, label: 'CI/CD', sub: 'GitHub Actions' },
  { icon: <Globe size={16} />, label: 'Vercel', sub: 'Build & Deploy' },
  { icon: <Monitor size={16} />, label: 'Live', sub: 'airbnb.vercel.app' },
]

function DeployPipeline() {
  const [active, setActive] = useState(-1)
  const [running, setRunning] = useState(false)

  const run = async () => {
    setRunning(true)
    setActive(-1)
    for (let i = 0; i < pipelineSteps.length; i++) {
      await new Promise(r => setTimeout(r, 700))
      setActive(i)
    }
    setRunning(false)
  }

  return (
    <div>
      <button className={`filter-btn ${running ? '' : 'active'}`} onClick={run} disabled={running} style={{ marginBottom: 20 }}>
        {running ? 'Deploying...' : 'Simulate Deploy'}
      </button>
      <div className="pipeline">
        {pipelineSteps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <div className={`pipeline-step ${active >= i ? 'done' : ''} ${active === i ? 'active' : ''}`}>
              <div className="pipeline-icon">{step.icon}</div>
              <span className="pipeline-label">{step.label}</span>
              <span className="pipeline-sub">{step.sub}</span>
            </div>
            {i < pipelineSteps.length - 1 && (
              <div className={`pipeline-arrow ${active > i ? 'done' : ''}`}>→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Env vars demo ─────────────────────────────────────────────────────────────
const envConfigs = {
  dev: { API_URL: 'http://localhost:3000/api', DEBUG: 'true', ANALYTICS: 'false' },
  prod: { API_URL: 'https://api.airbnb-clone.com', DEBUG: 'false', ANALYTICS: 'true' },
}

function EnvDemo() {
  const [env, setEnv] = useState<'dev' | 'prod'>('dev')
  const config = envConfigs[env]

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={`filter-btn ${env === 'dev' ? 'active' : ''}`} onClick={() => setEnv('dev')}>Development</button>
        <button className={`filter-btn ${env === 'prod' ? 'active' : ''}`} onClick={() => setEnv('prod')}>Production</button>
      </div>
      <div className="code-block">
        <div className="code-header">
          <span className="code-filename">.env.{env === 'dev' ? 'local' : 'production'}</span>
          <span className="code-lang">env</span>
        </div>
        <pre><code>{Object.entries(config).map(([k, v]) => `VITE_${k}=${v}`).join('\n')}</code></pre>
      </div>
      <div className="code-block" style={{ marginTop: 8 }}>
        <div className="code-header">
          <span className="code-filename">config.ts</span>
          <span className="code-lang">ts</span>
        </div>
        <pre><code>{`// Access env vars via import.meta.env in Vite
const API_URL = import.meta.env.VITE_API_URL
// → "${config.API_URL}"

const isDebug = import.meta.env.VITE_DEBUG === 'true'
// → ${config.DEBUG === 'true'}`}</code></pre>
      </div>
    </div>
  )
}

// ── SSR vs CSR comparison ─────────────────────────────────────────────────────
function SSRvsCSR() {
  const [view, setView] = useState<'csr' | 'ssr'>('csr')

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={`filter-btn ${view === 'csr' ? 'active' : ''}`} onClick={() => setView('csr')}>
          <Monitor size={12} className="inline-icon" />Client Component (CSR)
        </button>
        <button className={`filter-btn ${view === 'ssr' ? 'active' : ''}`} onClick={() => setView('ssr')}>
          <Server size={12} className="inline-icon" />Server Component (SSR)
        </button>
      </div>
      {view === 'csr' && (
        <div className="code-block">
          <div className="code-header">
            <span className="code-filename">ListingsPage.tsx</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="code-label label-wrong">Runs on Client</span>
              <span className="code-lang">tsx</span>
            </div>
          </div>
          <pre><code>{`'use client'  // Next.js directive — marks as client component

import { useState, useEffect } from 'react'

// Runs in the browser — JS bundle sent to client
// Can use useState, useEffect, event handlers
export default function ListingsPage() {
  const [listings, setListings] = useState([])

  // Fetch happens in the browser after page loads
  useEffect(() => {
    fetch('/api/listings').then(r => r.json()).then(setListings)
  }, [])

  return (
    <div>
      {listings.map(l => <ListingCard key={l.id} {...l} />)}
    </div>
  )
}`}</code></pre>
        </div>
      )}
      {view === 'ssr' && (
        <div className="code-block">
          <div className="code-header">
            <span className="code-filename">ListingsPage.tsx</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="code-label label-right">Runs on Server</span>
              <span className="code-lang">tsx</span>
            </div>
          </div>
          <pre><code>{`// No 'use client' directive — this is a Server Component by default
// Runs on the server — zero JS sent to client for this component
// Can use async/await directly — no useEffect needed

export default async function ListingsPage() {
  // Fetch happens on the server at request time
  // Direct DB access, no API round-trip, no loading state needed
  const listings = await db.listings.findMany()

  return (
    <div>
      {listings.map(l => (
        // ListingCard must also be a Server Component
        // or marked 'use client' if it needs interactivity
        <ListingCard key={l.id} {...l} />
      ))}
    </div>
  )
}`}</code></pre>
        </div>
      )}
    </div>
  )
}

function Lesson10Preview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Deployment Pipeline
        </p>
        <DeployPipeline />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Environment Variables
        </p>
        <EnvDemo />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Server vs Client Components
        </p>
        <SSRvsCSR />
      </div>
    </div>
  )
}

export default function Lesson10({ onNext }: { onNext: () => void }) {
  return (
    <div className="lesson-content">
      <div className="lesson-header">
        <span className="phase-chip">Phase 6 — Production</span>
        <h1 className="lesson-heading">Build, Deploy & Next.js</h1>
        <p className="lesson-desc">
          Optimize your Vite build, manage environment variables, deploy to Vercel,
          set up CI/CD with GitHub Actions, and migrate to Next.js App Router with Server Components.
        </p>
        <div className="lesson-meta">
          <span className="meta-pill"><Clock size={11} className="inline-icon" />~50 min</span>
          <span className="meta-pill" style={{ color: levelColor.Expert }}>
            <BarChart2 size={11} className="inline-icon" />Expert
          </span>
        </div>
      </div>

      <SectionTitle><BookOpen size={13} className="inline-icon" />Core Concepts</SectionTitle>
      <div className="concepts-grid">
        <ConceptCard
          title="Vite Build"
          plain="Vite bundles your app for production: tree-shakes unused code, minifies JS/CSS, splits chunks for lazy routes, and outputs to dist/. Run npm run build then npm run preview to test locally."
          analogy="Like packing a suitcase — only take what you need, fold it tight, split into carry-on and checked bag."
        />
        <ConceptCard
          title="Next.js App Router"
          plain="Next.js extends React with file-based routing, Server Components, SSR, SSG, and ISR. The App Router (Next 13+) uses the app/ directory. Server Components run on the server — no JS sent to client."
          analogy="Like upgrading from a bicycle to a car — same roads, but now you have an engine, GPS, and air conditioning."
        />
        <ConceptCard
          title="CI/CD"
          plain="Continuous Integration/Deployment: every git push triggers automated tests and deployment. GitHub Actions runs your workflow. Vercel auto-deploys on push to main. Preview deployments for every PR."
          analogy="Like a factory assembly line — code goes in one end, tested and deployed product comes out the other automatically."
        />
      </div>

      <SectionTitle><Code2 size={13} className="inline-icon" />Vite Production Build</SectionTitle>
      <CodeBlock filename="vite.config.ts" language="ts" code={`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,          // disable sourcemaps in production
    minify: 'esbuild',         // fast minification
    rollupOptions: {
      output: {
        // Manual chunk splitting — vendor libs in separate chunk
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
})

// Build commands
// npm run build    → outputs to dist/
// npm run preview  → serve dist/ locally to test production build`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Environment Variables</SectionTitle>
      <CodeBlock filename=".env.local" language="bash" code={`# .env.local — local development (never commit this file)
VITE_API_URL=http://localhost:3000/api
VITE_DEBUG=true
VITE_ANALYTICS_KEY=dev-key-123

# .env.production — production values
VITE_API_URL=https://api.airbnb-clone.com
VITE_DEBUG=false
VITE_ANALYTICS_KEY=prod-key-abc

# Rules:
# - Must start with VITE_ to be exposed to client code
# - Access via import.meta.env.VITE_*
# - Never put secrets (DB passwords, private keys) in VITE_ vars — they're public`} />

      <CodeBlock filename="config.ts" language="ts" code={`// Centralize all env var access — easier to manage and type
export const config = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  isDebug: import.meta.env.VITE_DEBUG === 'true',
  analyticsKey: import.meta.env.VITE_ANALYTICS_KEY as string,
  isDev: import.meta.env.DEV,       // built-in Vite boolean
  isProd: import.meta.env.PROD,     // built-in Vite boolean
}

// Usage
fetch(\`\${config.apiUrl}/listings\`)
if (config.isDebug) console.log('Debug mode on')`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Deploy to Vercel</SectionTitle>
      <CodeBlock filename="deploy.sh" language="bash" code={`# Option 1: Vercel CLI
npm install -g vercel
vercel login
vercel          # deploy preview
vercel --prod   # deploy to production

# Option 2: Connect GitHub repo (recommended)
# 1. Push your code to GitHub
# 2. Go to vercel.com → New Project → Import Git Repository
# 3. Vercel auto-detects Vite — no config needed
# 4. Every push to main auto-deploys
# 5. Every PR gets a preview URL

# vercel.json — optional config
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
# ^ Required for React Router — redirects all routes to index.html`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />GitHub Actions CI/CD</SectionTitle>
      <CodeBlock filename=".github/workflows/deploy.yml" language="yaml" code={`name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest

    steps:
      # 1. Checkout code
      - uses: actions/checkout@v4

      # 2. Setup Node
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      # 3. Install dependencies
      - run: npm ci

      # 4. Run tests — fail fast if tests fail
      - run: npm test

      # 5. Build
      - run: npm run build

      # 6. Deploy to Vercel (only on main branch push)
      - if: github.ref == 'refs/heads/main'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Next.js App Router Setup</SectionTitle>
      <CodeBlock filename="terminal" language="bash" code={`# Create a new Next.js project
npx create-next-app@latest airbnb-clone --typescript --tailwind --app

# App Router file structure
app/
  layout.tsx          # root layout — wraps all pages
  page.tsx            # / route
  listings/
    page.tsx          # /listings route
    [id]/
      page.tsx        # /listings/[id] dynamic route
  dashboard/
    page.tsx          # /dashboard route
  api/
    listings/
      route.ts        # /api/listings API route`} />

      <CodeBlock filename="app/listings/page.tsx" language="tsx" code={`// Server Component — runs on server, no 'use client' needed
// Can be async, fetch data directly, access DB
import { db } from '@/lib/db'

export default async function ListingsPage() {
  // Direct DB query — no API round-trip, no loading state
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

// generateMetadata — dynamic SEO meta tags
export async function generateMetadata() {
  return {
    title: 'Listings | Airbnb Clone',
    description: 'Browse all available listings',
  }
}`} />

      <CodeBlock filename="app/listings/[id]/page.tsx" language="tsx" code={`// Dynamic route — [id] maps to params.id
interface Props {
  params: { id: string }
}

export default async function ListingDetail({ params }: Props) {
  const listing = await db.listings.findUnique({
    where: { id: Number(params.id) },
  })

  if (!listing) notFound()  // renders 404 page

  return (
    <div>
      <h1>{listing.title}</h1>
      <p>{listing.location}</p>
      {/* FavoriteButton needs interactivity — must be a Client Component */}
      <FavoriteButton listingId={listing.id} />
    </div>
  )
}

// generateStaticParams — pre-render all listing pages at build time (SSG)
export async function generateStaticParams() {
  const listings = await db.listings.findMany({ select: { id: true } })
  return listings.map(l => ({ id: String(l.id) }))
}`} />

      <CodeBlock filename="components/FavoriteButton.tsx" language="tsx" code={`'use client'  // This component needs useState — must be a Client Component

import { useState } from 'react'

export function FavoriteButton({ listingId }: { listingId: number }) {
  const [saved, setSaved] = useState(false)

  return (
    <button onClick={() => setSaved(s => !s)}>
      {saved ? 'Unsave' : 'Save'}
    </button>
  )
}`} />

      <CodeBlock filename="app/api/listings/route.ts" language="ts" code={`import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/listings
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  const listings = await db.listings.findMany({
    where: { title: { contains: query, mode: 'insensitive' } },
  })

  return NextResponse.json(listings)
}

// POST /api/listings
export async function POST(request: Request) {
  const body = await request.json()
  const listing = await db.listings.create({ data: body })
  return NextResponse.json(listing, { status: 201 })
}`} />

      <SectionTitle><Eye size={13} className="inline-icon" />Live Preview</SectionTitle>
      <LivePreview><Lesson10Preview /></LivePreview>

      <AssignmentCard
        goal="Prepare your Airbnb app for production and migrate to Next.js"
        tasks={[
          'Add .env.local with VITE_API_URL and .env.production with the production URL',
          'Create a config.ts that centralizes all import.meta.env access',
          'Run npm run build and fix any TypeScript errors that appear',
          'Create a vercel.json with the SPA rewrite rule for React Router',
          'Write a .github/workflows/deploy.yml that runs tests then deploys to Vercel',
          'Create a new Next.js project and migrate the listings page to a Server Component',
          'Mark FavoriteButton as a Client Component with "use client"',
          'Add generateStaticParams to pre-render all listing detail pages',
        ]}
        starterCode={`# .env.local
VITE_API_URL=http://localhost:3000/api

# config.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  isProd: import.meta.env.PROD,
}

# vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}

# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
      - run: npm run build
      # TODO: add Vercel deploy step

# app/listings/page.tsx (Next.js)
export default async function ListingsPage() {
  // TODO: fetch listings from DB or API
  // TODO: render listings grid
}

# components/FavoriteButton.tsx
'use client'
export function FavoriteButton({ listingId }) {
  // TODO: useState for saved, render toggle button
}`}
        expectedOutput="Production build passes. GitHub Actions runs tests and deploys on push. Next.js listings page renders on the server. FavoriteButton works as a client component. All env vars load correctly per environment."
      />

      <button className="next-btn" onClick={onNext}>
        Complete Course <ArrowRight size={14} className="inline-icon" />
      </button>
    </div>
  )
}
