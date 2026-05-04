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
13. [Assignment](#assignment)

---

## Client-Side Routing

In a traditional website, every URL change triggers a full page reload — the browser requests a new HTML file from the server. In a React SPA (Single Page Application), there is only **one HTML file**. React Router intercepts URL changes and swaps out components without reloading the page.

```
Traditional:
  /listings     → server sends listings.html (full reload, ~500ms)
  /listings/3   → server sends detail.html   (full reload, ~500ms)

React Router:
  /listings     → React renders <ListingsPage />  (instant)
  /listings/3   → React renders <ListingDetail /> (instant, no reload)
```

**How it works under the hood:** React Router uses the browser's History API (`pushState`, `replaceState`) to change the URL without triggering a page reload. It listens for URL changes and re-renders the matching component.

**Analogy:** Like changing TV channels — the TV stays on, only the content changes.

---

## React Router v6 Setup

```bash
npm install react-router-dom
```

Wrap your entire app in `BrowserRouter` in `main.tsx`. This provides the routing context that all React Router hooks and components need.

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

`Routes` renders the first `Route` that matches the current URL. `Link` and `NavLink` render anchor tags that use the History API instead of triggering a page reload.

```tsx
// App.tsx
import { Routes, Route, Link, NavLink } from 'react-router-dom'

function App() {
  return (
    <div>
      <nav>
        {/* Link — basic navigation, no active styling */}
        <Link to="/">Home</Link>

        {/* NavLink — automatically receives an 'active' class when the route matches */}
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
        {/* Routes are matched top-to-bottom — more specific routes first */}
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        {/* 404 catch-all — matches any URL not matched above */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
```

**`Link` vs `<a href>`:** Always use `Link` for internal navigation. A plain `<a href>` causes a full page reload, losing all React state. `Link` uses the History API to update the URL and re-render without a reload.

---

## Dynamic Routes & useParams

A dynamic route uses `:paramName` in the path. The `:id` segment matches any value — `/listings/1`, `/listings/42`, `/listings/bali-villa` all match `/listings/:id`.

`useParams()` extracts the matched values from the current URL as strings.

```tsx
import { useParams } from 'react-router-dom'

// Route defined as: <Route path="/listings/:id" element={<ListingDetail />} />
// URL: /listings/3  →  params = { id: '3' }

function ListingDetail() {
  // TypeScript generic tells useParams what params to expect
  const { id } = useParams<{ id: string }>()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // id is in the dependency array — effect re-runs when the URL changes
    // e.g., navigating from /listings/1 to /listings/2
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

**Important:** `useParams` always returns strings. If your ID is a number, convert it with `Number(id)` or `parseInt(id, 10)`.

---

## useNavigate

`useNavigate` returns a function that lets you programmatically navigate to a different route — useful after form submissions, login, or any action that should redirect the user.

```tsx
import { useNavigate } from 'react-router-dom'

function ListingCard({ id }: { id: number }) {
  const navigate = useNavigate()

  return (
    <div>
      {/* Navigate to detail page */}
      <button onClick={() => navigate(`/listings/${id}`)}>View Details</button>

      {/* Go back in browser history — like clicking the back button */}
      <button onClick={() => navigate(-1)}>Back</button>

      {/* Replace current history entry — back button won't return here */}
      {/* Use after login — you don't want the user going back to the login page */}
      <button onClick={() => navigate('/login', { replace: true })}>Login</button>
    </div>
  )
}

// After form submission — redirect with state
function BookingForm() {
  const navigate = useNavigate()

  const handleSubmit = async (data: BookingData) => {
    await submitBooking(data)
    // Pass data to the next page via location state
    navigate('/booking/confirmation', { state: { booking: data } })
  }
}
```

---

## Protected Routes

A protected route checks if the user is authenticated before rendering the component. If not, it redirects to the login page. This is the React Router equivalent of server-side auth middleware.

```tsx
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    // Navigate component performs a redirect
    // 'replace' prevents the user from pressing back to get to the protected page
    return <Navigate to="/login" replace />
  }

  // If authenticated, render the protected content
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

Nested routes share a layout. The parent component renders `<Outlet />` as a placeholder — React Router replaces it with the matched child route's component.

**Use case:** A listings section where all pages share the same sub-navigation bar, but the main content area changes per route.

```tsx
import { Outlet, NavLink } from 'react-router-dom'

// Shared layout for all listing routes
function ListingsLayout() {
  return (
    <div>
      {/* This nav renders on ALL /listings/* routes */}
      <nav className="listings-nav">
        <NavLink to="/listings">All</NavLink>
        <NavLink to="/listings/map">Map View</NavLink>
        <NavLink to="/listings/saved">Saved</NavLink>
      </nav>
      {/* The matched child route renders here */}
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

`index` means "render this when the parent path matches exactly" — `/listings` renders `ListingsGrid`, not `ListingsLayout` alone.

---

## Lazy Loading with React.lazy

`React.lazy` defers loading a component's JavaScript until it's first rendered. Combined with `Suspense`, this splits your bundle — the initial page loads faster because it only downloads the code it needs right now.

**Without lazy loading:** All pages are bundled into one JS file. The user downloads code for the Dashboard even if they never visit it.

**With lazy loading:** Each page is a separate JS file. The Dashboard code is only downloaded when the user first navigates to `/dashboard`.

```tsx
import { lazy, Suspense } from 'react'

// These components are only downloaded when the route is first visited
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ListingDetail = lazy(() => import('./pages/ListingDetail'))
const BookingForm = lazy(() => import('./pages/BookingForm'))

function App() {
  return (
    // Suspense shows the fallback while the lazy component's JS is downloading
    <Suspense fallback={<div className="spinner" />}>
      <Routes>
        {/* Home is NOT lazy — it's the first thing users see */}
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

**Rule of thumb:** Lazy load any page that isn't on the critical path (not the first thing users see). Keep the home page and main listings page eager-loaded.

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

**Why not just use Context for everything?** Context re-renders every subscriber when the value changes. If you put all your state in one context, every component that reads any part of it re-renders on every state change. Zustand solves this with fine-grained subscriptions.

---

## Zustand

Zustand is a minimal global state library. You define a store with state and actions. Any component subscribes to the **exact slice** it needs — it only re-renders when that slice changes.

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
  // Actions — functions that update state
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

  // set receives the current state — use it for updates that depend on previous state
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
  // This component ONLY re-renders when filter changes
  // It does NOT re-render when listings, loading, or saved changes
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

**Key insight:** The selector function `state => state.filter` is what makes Zustand efficient. The component only subscribes to the specific value it selects — not the entire store.

---

## React.memo

By default, when a parent component re-renders, all its children re-render too — even if their props didn't change. `React.memo` wraps a component so it only re-renders when its props actually change (shallow comparison).

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
  // This breaks memo because onToggle "changes" every render (new reference)
  // const handleToggle = (id: number) => toggleSaved(id)  // BAD

  // With useCallback — stable reference, memo works correctly
  const handleToggle = useCallback((id: number) => toggleSaved(id), [toggleSaved])

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

**When to use `React.memo`:**
- The component renders often
- The component is expensive to render (complex JSX, heavy computation)
- Its props usually don't change when the parent re-renders

**Don't over-use it.** `React.memo` itself has a cost — it runs a shallow comparison on every render. For simple components, the comparison cost can exceed the re-render cost.

---

## Virtualization

Rendering 1000 list items in the DOM is slow — the browser has to lay out and paint all 1000 elements even if only 10 are visible. Virtualization only renders the items currently visible in the viewport. As the user scrolls, items are swapped in and out.

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
    // style MUST be applied — it contains the absolute positioning that places the row correctly
    <div style={style} className="list-row">
      <span>{item.title}</span>
      <span>${item.price}</span>
    </div>
  )
}

function VirtualListings() {
  return (
    // Only ~10 rows rendered in the DOM at a time, regardless of list size
    // Scrolling swaps rows in and out — DOM stays small and fast
    <FixedSizeList
      height={500}              // visible height of the list container
      itemCount={listings.length}
      itemSize={64}             // height of each row in pixels
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

**When to virtualize:** Lists with more than ~100 items where each item has non-trivial rendering. For small lists, virtualization adds complexity without benefit.

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
