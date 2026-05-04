import { useState } from 'react'
import { ArrowRight, BookOpen, Code2, Eye, Clock, BarChart2, Home, Lock, User, ChevronLeft } from 'lucide-react'
import { CodeBlock, ConceptCard, SectionTitle, LivePreview, AssignmentCard, levelColor, mockListings, ListingCard } from '../components/ui'

type Page = 'home' | 'detail' | 'login' | 'dashboard'

function SimulatedRouter() {
  const [page, setPage] = useState<Page>('home')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = (to: Page, id?: number) => {
    if (to === 'dashboard' && !isAuth) { setPage('login'); return }
    setLoading(true)
    setTimeout(() => {
      setPage(to)
      if (id) setSelectedId(id)
      setLoading(false)
    }, 600)
  }

  const selected = mockListings.find(l => l.id === selectedId)

  if (loading) return (
    <div className="spinner-wrap" style={{ minHeight: 200 }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 13 }}>Loading page...</p>
    </div>
  )

  return (
    <div>
      {/* Simulated Nav */}
      <nav className="sim-nav">
        <span className="sim-brand">Airbnb</span>
        <div className="sim-links">
          <button className={`sim-link ${page === 'home' ? 'active' : ''}`} onClick={() => navigate('home')}>
            <Home size={13} className="inline-icon" />Home
          </button>
          <button className={`sim-link ${page === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('dashboard')}>
            <Lock size={13} className="inline-icon" />Dashboard
          </button>
          {isAuth
            ? <button className="sim-link" onClick={() => setIsAuth(false)}>Logout</button>
            : <button className="sim-link" onClick={() => navigate('login')}>Login</button>
          }
        </div>
      </nav>

      {/* Pages */}
      <div style={{ padding: '16px 0' }}>
        {page === 'home' && (
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
              Route: <code style={{ color: '#FF385C' }}>/</code> — click a card to go to detail page
            </p>
            <div className="cards-grid">
              {mockListings.slice(0, 4).map(l => (
                <div key={l.id} onClick={() => navigate('detail', l.id)} style={{ cursor: 'pointer' }}>
                  <ListingCard {...l} />
                </div>
              ))}
            </div>
          </div>
        )}

        {page === 'detail' && selected && (
          <div>
            <button className="back-btn" onClick={() => navigate('home')}>
              <ChevronLeft size={14} className="inline-icon" />Back to listings
            </button>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
              Route: <code style={{ color: '#FF385C' }}>/listings/{selected.id}</code> — useParams would give id = {selected.id}
            </p>
            <div className="detail-card">
              <img src={selected.img} alt={selected.title} className="detail-img" />
              <div className="detail-body">
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, marginBottom: 8 }}>{selected.title}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>{selected.location}</p>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <span><strong style={{ color: '#FF385C' }}>${selected.price}</strong> / night</span>
                  <span>★ {selected.rating}</span>
                  {selected.superhost && <span style={{ color: '#FF385C', fontSize: 13 }}>Superhost</span>}
                </div>
                <button className="next-btn" style={{ fontSize: 13, padding: '10px 20px' }}>Reserve</button>
              </div>
            </div>
          </div>
        )}

        {page === 'login' && (
          <div className="login-page">
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>
              Route: <code style={{ color: '#FF385C' }}>/login</code> — redirected here because Dashboard is protected
            </p>
            <h3 style={{ marginBottom: 16, fontSize: 18 }}>Sign in to continue</h3>
            <input className="search-input" placeholder="Email" style={{ marginBottom: 8, display: 'block', width: '100%' }} />
            <input className="search-input" type="password" placeholder="Password" style={{ marginBottom: 16, display: 'block', width: '100%' }} />
            <button className="next-btn" style={{ fontSize: 13, padding: '10px 20px' }} onClick={() => { setIsAuth(true); navigate('dashboard') }}>
              Login & go to Dashboard
            </button>
          </div>
        )}

        {page === 'dashboard' && isAuth && (
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
              Route: <code style={{ color: '#FF385C' }}>/dashboard</code> — protected, only accessible when logged in
            </p>
            <div className="dashboard-card">
              <User size={32} style={{ color: '#FF385C', marginBottom: 12 }} />
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>Welcome back!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>You are authenticated. This is a protected route.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Lesson5({ onNext }: { onNext: () => void }) {
  return (
    <div className="lesson-content">
      <div className="lesson-header">
        <span className="phase-chip">Phase 3 — Advanced</span>
        <h1 className="lesson-heading">Routing</h1>
        <p className="lesson-desc">
          Build multi-page React apps with React Router v6 — routes, navigation, dynamic params,
          protected routes, nested routes, and lazy loading.
        </p>
        <div className="lesson-meta">
          <span className="meta-pill"><Clock size={11} className="inline-icon" />~35 min</span>
          <span className="meta-pill" style={{ color: levelColor.Advanced }}>
            <BarChart2 size={11} className="inline-icon" />Advanced
          </span>
        </div>
      </div>

      <SectionTitle><BookOpen size={13} className="inline-icon" />Core Concepts</SectionTitle>
      <div className="concepts-grid">
        <ConceptCard
          title="Client-Side Routing"
          plain="React Router intercepts URL changes and renders the matching component — no full page reload. The browser URL updates but only the relevant component swaps out."
          analogy="Like changing TV channels — the TV stays on, only the content changes."
        />
        <ConceptCard
          title="Dynamic Routes"
          plain="Routes with parameters like /listings/:id match any ID. useParams() extracts the value from the URL so you can fetch the right data."
          analogy="Like a hotel room number — /rooms/204 and /rooms/305 use the same template, just different data."
        />
        <ConceptCard
          title="Protected Routes"
          plain="A wrapper component that checks auth state. If not authenticated, it redirects to /login using useNavigate. If authenticated, it renders the children."
          analogy="Like a bouncer at a club — checks your ID, lets you in or sends you to the back of the line."
        />
      </div>

      <SectionTitle><Code2 size={13} className="inline-icon" />Setup & Basic Routes</SectionTitle>
      <CodeBlock filename="main.tsx" language="tsx" code={`import { BrowserRouter } from 'react-router-dom'

// Wrap your entire app in BrowserRouter — enables routing
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)`} />

      <CodeBlock filename="App.tsx" language="tsx" code={`import { Routes, Route, Link, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import ListingDetail from './pages/ListingDetail'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <div>
      <nav>
        {/* Link — basic navigation, no active styling */}
        <Link to="/">Home</Link>

        {/* NavLink — adds 'active' class automatically when route matches */}
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-active' : ''}>
          Dashboard
        </NavLink>
      </nav>

      <Routes>
        {/* Exact match for home */}
        <Route path="/" element={<Home />} />

        {/* Dynamic route — :id is a URL parameter */}
        <Route path="/listings/:id" element={<ListingDetail />} />

        <Route path="/login" element={<Login />} />

        {/* Protected route — wraps Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* 404 catch-all */}
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    </div>
  )
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />useParams & useNavigate</SectionTitle>
      <CodeBlock filename="ListingDetail.tsx" language="tsx" code={`import { useParams, useNavigate } from 'react-router-dom'

function ListingDetail() {
  // useParams extracts :id from the URL — /listings/3 gives { id: '3' }
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing] = useState<Listing | null>(null)

  useEffect(() => {
    // Fetch the specific listing by ID
    fetch(\`/api/listings/\${id}\`)
      .then(r => r.json())
      .then(setListing)
  }, [id])  // re-fetch when ID changes

  if (!listing) return <p>Loading...</p>

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Back</button>       {/* go back in history */}
      <button onClick={() => navigate('/')}>Home</button>         {/* go to specific route */}
      <button onClick={() => navigate('/listings', { replace: true })}>  {/* replace history entry */}
        All Listings
      </button>

      <h1>{listing.title}</h1>
      <p>{listing.location}</p>
    </div>
  )
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Protected Routes</SectionTitle>
      <CodeBlock filename="ProtectedRoute.tsx" language="tsx" code={`import { Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

// Wrapper component — checks auth, renders children or redirects
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  // Not logged in — redirect to login page
  // 'replace' replaces the history entry so back button doesn't loop
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Logged in — render the protected content
  return <>{children}</>
}

// Usage in routes
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Nested Routes</SectionTitle>
      <CodeBlock filename="nested-routes.tsx" language="tsx" code={`// Nested routes share a layout — the parent renders <Outlet />
// Child routes render inside the Outlet

function ListingsLayout() {
  return (
    <div>
      <ListingsNav />   {/* shared nav for all listing routes */}
      <Outlet />        {/* child route renders here */}
    </div>
  )
}

// In your routes config
<Route path="/listings" element={<ListingsLayout />}>
  <Route index element={<ListingsGrid />} />          {/* /listings */}
  <Route path=":id" element={<ListingDetail />} />    {/* /listings/3 */}
  <Route path=":id/book" element={<BookingForm />} /> {/* /listings/3/book */}
</Route>`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Lazy Loading Routes</SectionTitle>
      <CodeBlock filename="lazy-routes.tsx" language="tsx" code={`import { lazy, Suspense } from 'react'

// lazy() — only loads the component bundle when the route is first visited
// This splits your JS bundle — faster initial load
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ListingDetail = lazy(() => import('./pages/ListingDetail'))

function App() {
  return (
    // Suspense shows fallback while the lazy component loads
    <Suspense fallback={<div className="spinner" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  )
}`} />

      <SectionTitle><Eye size={13} className="inline-icon" />Live Preview — Simulated Router</SectionTitle>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
        Click cards to navigate to detail. Try Dashboard without logging in — it redirects to Login. Login to access the protected route.
      </p>
      <LivePreview><SimulatedRouter /></LivePreview>

      <AssignmentCard
        goal="Build a multi-page Airbnb app with React Router v6"
        tasks={[
          'Install react-router-dom and wrap your app in BrowserRouter',
          'Create a Home page (listings grid), ListingDetail page (dynamic :id), Login page, Dashboard page',
          'Add a NavLink navigation bar with active styling',
          'Implement useParams in ListingDetail to show the correct listing',
          'Build a ProtectedRoute component that redirects to /login if not authenticated',
          'Lazy load the Dashboard route with React.lazy + Suspense',
          'Add a 404 catch-all route',
        ]}
        starterCode={`// main.tsx
import { BrowserRouter } from 'react-router-dom'
createRoot(document.getElementById('root')!).render(
  <BrowserRouter><App /></BrowserRouter>
)

// App.tsx
function App() {
  return (
    <div>
      <nav>
        {/* TODO: NavLink for Home, Dashboard, Login */}
      </nav>
      <Routes>
        {/* TODO: Route for / → Home */}
        {/* TODO: Route for /listings/:id → ListingDetail */}
        {/* TODO: Route for /login → Login */}
        {/* TODO: Protected Route for /dashboard → Dashboard */}
        {/* TODO: 404 catch-all */}
      </Routes>
    </div>
  )
}

// ProtectedRoute.tsx
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  // TODO: redirect to /login if not authenticated
  return <>{children}</>
}

// ListingDetail.tsx
function ListingDetail() {
  const { id } = useParams()
  // TODO: find listing by id, render detail view
}`}
        expectedOutput="A multi-page app with working navigation. Clicking a listing goes to /listings/:id. Dashboard redirects to login if not authenticated. Login grants access. Dashboard lazy-loads with a spinner."
      />

      <button className="next-btn" onClick={onNext}>
        Next Lesson <ArrowRight size={14} className="inline-icon" />
      </button>
    </div>
  )
}
