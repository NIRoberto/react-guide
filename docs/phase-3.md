# Phase 3: Advanced

## Table of Contents
1. [Client-Side Routing](#client-side-routing)
2. [React Router v6 Setup](#react-router-v6-setup)
3. [Routes & Navigation](#routes--navigation)
4. [Dynamic Routes & useParams](#dynamic-routes--useparams)
5. [useNavigate](#usenavigate)
6. [Protected Routes](#protected-routes)
7. [Nested Routes & Outlet](#nested-routes--outlet)
8. [Lazy Loading with React.lazy](#lazy-loading-with-reactlazy)
9. [Global State Management](#global-state-management)
10. [Zustand](#zustand)
11. [React.memo](#reactmemo)
12. [Virtualization](#virtualization)
13. [Assignment — Multi-Page Airbnb App with Global State](#assignment--multi-page-airbnb-app-with-global-state)

---

## Client-Side Routing

In a traditional website, every URL change triggers a full page reload — the browser requests a new HTML file from the server. In a React SPA (Single Page Application), there is only one HTML file. React Router intercepts URL changes and swaps out components without reloading the page.

```
Traditional:
  /listings     → server sends listings.html
  /listings/3   → server sends detail.html (full reload)

React Router:
  /listings     → React renders <ListingsPage />
  /listings/3   → React renders <ListingDetail /> (no reload, instant)
```

**Analogy:** Like changing TV channels — the TV stays on, only the content changes.

---

## React Router v6 Setup

```bash
npm install react-router-dom
```

Wrap your entire app in `BrowserRouter` in `main.tsx`:

```tsx
// main.tsx
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
```

---

## Routes & Navigation

```tsx
// App.tsx
import { Routes, Route, Link, NavLink } from 'react-router-dom'

function App() {
  return (
    <div>
      <nav>
        {/* Link — basic navigation */}
        <Link to="/">Home</Link>

        {/* NavLink — adds 'active' class automatically when route matches */}
        <NavLink
          to="/listings"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Listings
        </NavLink>

        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Dashboard
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        {/* 404 catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
```

---

## Dynamic Routes & useParams

A dynamic route uses `:paramName` in the path. `useParams()` extracts the value from the current URL.

```tsx
import { useParams } from 'react-router-dom'

// Route defined as: <Route path="/listings/:id" element={<ListingDetail />} />
// URL: /listings/3

function ListingDetail() {
  // useParams extracts :id from the URL
  const { id } = useParams<{ id: string }>()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Re-fetch when the ID in the URL changes
    fetchListing(Number(id)).then(data => {
      setListing(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <Spinner />
  if (!listing) return <p>Listing not found</p>

  return (
    <div>
      <img src={listing.img} alt={listing.title} />
      <h1>{listing.title}</h1>
      <p>{listing.location}</p>
      <strong>${listing.price} / night</strong>
    </div>
  )
}
```

---

## useNavigate

`useNavigate` returns a function that lets you programmatically navigate to a different route.

```tsx
import { useNavigate } from 'react-router-dom'

function ListingCard({ id }: { id: number }) {
  const navigate = useNavigate()

  return (
    <div>
      {/* Navigate to detail page */}
      <button onClick={() => navigate(`/listings/${id}`)}>View Details</button>

      {/* Go back in browser history */}
      <button onClick={() => navigate(-1)}>Back</button>

      {/* Replace current history entry — back button won't return here */}
      <button onClick={() => navigate('/login', { replace: true })}>Login</button>
    </div>
  )
}

// After form submission
function BookingForm() {
  const navigate = useNavigate()

  const handleSubmit = async (data: BookingData) => {
    await submitBooking(data)
    // Redirect to confirmation page after successful booking
    navigate('/booking/confirmation', { state: { booking: data } })
  }
}
```

---

## Protected Routes

A protected route checks if the user is authenticated before rendering the component. If not, it redirects to the login page.

```tsx
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    // 'replace' prevents the user from pressing back to get to the protected page
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Usage
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// useAuth hook — reads auth state from context
function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const login = () => setIsAuthenticated(true)
  const logout = () => setIsAuthenticated(false)
  return { isAuthenticated, login, logout }
}
```

---

## Nested Routes & Outlet

Nested routes share a layout. The parent component renders `<Outlet />` where child routes should appear.

```tsx
import { Outlet, NavLink } from 'react-router-dom'

// Shared layout for all listing routes
function ListingsLayout() {
  return (
    <div>
      <nav className="listings-nav">
        <NavLink to="/listings">All</NavLink>
        <NavLink to="/listings/map">Map View</NavLink>
        <NavLink to="/listings/saved">Saved</NavLink>
      </nav>
      {/* Child route renders here */}
      <Outlet />
    </div>
  )
}

// Route config
<Route path="/listings" element={<ListingsLayout />}>
  <Route index element={<ListingsGrid />} />          {/* /listings */}
  <Route path=":id" element={<ListingDetail />} />    {/* /listings/3 */}
  <Route path=":id/book" element={<BookingForm />} /> {/* /listings/3/book */}
  <Route path="saved" element={<SavedListings />} />  {/* /listings/saved */}
</Route>
```

---

## Lazy Loading with React.lazy

`React.lazy` defers loading a component's code until it's first rendered. Combined with `Suspense`, this splits your JavaScript bundle — the initial page loads faster because it only downloads the code it needs.

```tsx
import { lazy, Suspense } from 'react'

// These components are only downloaded when the route is first visited
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ListingDetail = lazy(() => import('./pages/ListingDetail'))
const BookingForm = lazy(() => import('./pages/BookingForm'))

function App() {
  return (
    // Suspense shows the fallback while the lazy component loads
    <Suspense fallback={<div className="spinner" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/listings/:id/book" element={<BookingForm />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  )
}
```

---

## Global State Management

As your app grows, passing state through props becomes unwieldy. Global state management lets any component read or update shared state without prop drilling.

### Options

| Library | Bundle Size | Learning Curve | Best For |
|---------|-------------|----------------|----------|
| Context + useReducer | 0kb (built-in) | Low | Small-medium apps |
| Zustand | ~1kb | Very low | Most apps |
| Redux Toolkit | ~15kb | Medium | Large teams, complex state |
| Jotai | ~3kb | Low | Atomic state |

---

## Zustand

Zustand is a minimal global state library. You define a store with state and actions. Any component subscribes to the slice it needs — only re-renders when that slice changes.

```bash
npm install zustand
```

```ts
// src/store/useStore.ts
import { create } from 'zustand'

interface StoreState {
  // State
  listings: Listing[]
  loading: boolean
  filter: string
  saved: number[]
  // Actions
  setListings: (listings: Listing[]) => void
  setLoading: (loading: boolean) => void
  setFilter: (filter: string) => void
  toggleSaved: (id: number) => void
  reset: () => void
}

export const useStore = create<StoreState>((set) => ({
  listings: [],
  loading: true,
  filter: '',
  saved: [],

  setListings: (listings) => set({ listings }),
  setLoading: (loading) => set({ loading }),
  setFilter: (filter) => set({ filter }),

  toggleSaved: (id) => set((state) => ({
    saved: state.saved.includes(id)
      ? state.saved.filter(x => x !== id)
      : [...state.saved, id],
  })),

  reset: () => set({ filter: '', saved: [] }),
}))
```

```tsx
// Any component — subscribe to only the slice you need
function SearchBar() {
  // Only re-renders when filter changes
  const filter = useStore(state => state.filter)
  const setFilter = useStore(state => state.setFilter)

  return (
    <input
      value={filter}
      onChange={e => setFilter(e.target.value)}
      placeholder="Search listings..."
    />
  )
}

function SavedCount() {
  // Only re-renders when saved array changes
  const count = useStore(state => state.saved.length)
  return <span>{count} saved</span>
}

function ListingCard({ id }: { id: number }) {
  const saved = useStore(state => state.saved)
  const toggleSaved = useStore(state => state.toggleSaved)

  return (
    <button onClick={() => toggleSaved(id)}>
      {saved.includes(id) ? 'Unsave' : 'Save'}
    </button>
  )
}
```

---

## React.memo

`React.memo` wraps a component so it only re-renders when its props actually change. Without it, a component re-renders every time its parent re-renders — even if its own props didn't change.

```tsx
import { memo, useCallback } from 'react'

// Without memo — re-renders every time parent re-renders
function ListingCard({ title, price, onToggle }: Props) {
  console.log('ListingCard rendered:', title)
  return <div onClick={onToggle}>{title} — ${price}</div>
}

// With memo — only re-renders when title, price, or onToggle changes
const ListingCard = memo(function ListingCard({ title, price, onToggle }: Props) {
  console.log('ListingCard rendered:', title)
  return <div onClick={onToggle}>{title} — ${price}</div>
})

function ListingsPage() {
  const [counter, setCounter] = useState(0)

  // Without useCallback — new function reference on every render
  // This breaks memo because onToggle "changes" every render
  const handleToggle = (id: number) => toggleSaved(id)  // BAD

  // With useCallback — stable reference, memo works correctly
  const handleToggle = useCallback((id: number) => toggleSaved(id), [toggleSaved])  // GOOD

  return (
    <div>
      {/* Incrementing counter re-renders ListingsPage */}
      <button onClick={() => setCounter(c => c + 1)}>Counter: {counter}</button>

      {/* ListingCard does NOT re-render — props haven't changed */}
      {listings.map(l => (
        <ListingCard key={l.id} title={l.title} price={l.price} onToggle={() => handleToggle(l.id)} />
      ))}
    </div>
  )
}
```

---

## Virtualization

Rendering 1000 list items in the DOM is slow. Virtualization only renders the items currently visible in the viewport. As the user scrolls, items are swapped in and out.

```bash
npm install react-window
```

```tsx
import { FixedSizeList } from 'react-window'

const listings = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  title: `Listing #${i + 1}`,
  price: Math.floor(Math.random() * 500) + 50,
}))

// Row component — receives index and style from react-window
function Row({ index, style }: { index: number; style: React.CSSProperties }) {
  const item = listings[index]
  return (
    // style MUST be applied — it positions the row absolutely
    <div style={style} className="list-row">
      <span>{item.title}</span>
      <span>${item.price}</span>
    </div>
  )
}

function VirtualListings() {
  return (
    // Only ~10 rows rendered at a time regardless of list size
    <FixedSizeList
      height={500}
      itemCount={listings.length}
      itemSize={64}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

---

## Assignment

> See **[assignment-3.md](./assignment-3.md)** for the full description, file structure, acceptance criteria, and submission checklist.

**Summary:** Build a multi-page Airbnb app with React Router v6, a Zustand global store, `React.memo` optimization, and a virtualized list of 50 items.

---

**Resources**
- [React Router v6 Docs](https://reactrouter.com/en/main)
- [Zustand Docs](https://zustand-demo.pmnd.rs)
- [React Docs — lazy](https://react.dev/reference/react/lazy)
- [React Docs — memo](https://react.dev/reference/react/memo)
- [react-window Docs](https://react-window.vercel.app)

<!-- original tasks below for reference -->

### Tasks (see assignment-3.md for full details)

1. Install `react-router-dom` and wrap your app in `BrowserRouter`
2. Create these pages: `Home` (listings grid), `ListingDetail` (dynamic `:id`), `Login`, `Dashboard`
3. Add a `NavLink` navigation bar with active styling
4. Use `useParams` in `ListingDetail` to fetch and display the correct listing
5. Build a `ProtectedRoute` that redirects to `/login` if not authenticated
6. Lazy load `Dashboard` and `ListingDetail` with `React.lazy` + `Suspense`
7. Add a 404 catch-all route
8. Install `zustand` and create a store with: `listings`, `filter`, `saved`, `setFilter`, `toggleSaved`, `reset`
9. Replace all `useState` for filter/saved with `useStore` selectors
10. Wrap `ListingCard` with `React.memo` and the toggle handler with `useCallback`
11. Generate 50 listings and implement a virtualized list using `react-window`

### Starter Code

```tsx
// src/store/useStore.ts
import { create } from 'zustand'

interface StoreState {
  listings: Listing[]
  filter: string
  saved: number[]
  setListings: (l: Listing[]) => void
  setFilter: (f: string) => void
  toggleSaved: (id: number) => void
}

export const useStore = create<StoreState>((set) => ({
  listings: [],
  filter: '',
  saved: [],
  setListings: (listings) => set({ listings }),
  setFilter: (filter) => set({ filter }),
  toggleSaved: (id) => set((state) => ({
    // TODO: add or remove id from saved
  })),
}))

// src/App.tsx
import { lazy, Suspense } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'

const ListingDetail = lazy(() => import('./pages/ListingDetail'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

function App() {
  return (
    <div>
      <nav>
        {/* TODO: NavLink for Home, Dashboard */}
      </nav>
      <Suspense fallback={<div className="spinner" />}>
        <Routes>
          {/* TODO: all routes */}
        </Routes>
      </Suspense>
    </div>
  )
}

// src/pages/ListingDetail.tsx
function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const listings = useStore(s => s.listings)
  const listing = listings.find(l => l.id === Number(id))

  if (!listing) return <p>Not found</p>
  // TODO: render full listing detail
}

// src/components/ListingCard.tsx
const ListingCard = memo(function ListingCard({ id, title, price, img }: Props) {
  const saved = useStore(s => s.saved)
  const toggleSaved = useStore(s => s.toggleSaved)

  const handleToggle = useCallback(() => toggleSaved(id), [id, toggleSaved])
  // TODO: render card with heart button
})
```

### Expected Output

A multi-page app with working navigation. Clicking a listing navigates to `/listings/:id` and shows full details. Dashboard redirects to login if not authenticated. Login grants access. Dashboard lazy-loads with a spinner. Global store powers filter and saved state across all pages. ListingCard only re-renders when its own props change. A virtualized list of 50 items renders only visible rows.

---

**Resources**
- [React Router v6 Docs](https://reactrouter.com/en/main)
- [Zustand Docs](https://zustand-demo.pmnd.rs)
- [React Docs — lazy](https://react.dev/reference/react/lazy)
- [React Docs — memo](https://react.dev/reference/react/memo)
- [react-window Docs](https://react-window.vercel.app)
