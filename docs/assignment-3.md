# Assignment 3: Multi-Page App with Routing & Global State

## Description

Build a multi-page Airbnb app with React Router v6, a Zustand global store, `React.memo` optimization, and a virtualized listings list. The app must have working navigation, protected routes, lazy loading, and a global store that powers filter and saved state across all pages.

---

## Setup

```bash
cd airbnb-app
npm install react-router-dom zustand react-window
npm install -D @types/react-window
npm run dev
```

---

## File Structure

```
src/
├── components/
│   ├── ListingCard.tsx           # wrapped with React.memo
│   ├── ListingCard.module.css
│   ├── Navbar.tsx                # NavLink navigation
│   ├── ProtectedRoute.tsx        # redirects if not authenticated
│   └── Spinner.tsx
├── pages/
│   ├── Home.tsx                  # listings grid
│   ├── ListingDetail.tsx         # dynamic :id route
│   ├── Login.tsx                 # login form
│   ├── Dashboard.tsx             # protected page
│   └── NotFound.tsx              # 404
├── store/
│   └── useStore.ts               # Zustand store
├── context/
│   └── AuthContext.tsx           # auth state
├── hooks/
│   └── useListings.ts
├── data/
│   └── listings.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

---

## Tasks

1. Install `react-router-dom` and wrap `<App />` in `<BrowserRouter>` in `main.tsx`
2. Create `src/store/useStore.ts` — Zustand store with `listings`, `filter`, `saved`, `setListings`, `setFilter`, `toggleSaved`, `reset`
3. Create `src/pages/Home.tsx` — listings grid, reads `filter` and `saved` from store
4. Create `src/pages/ListingDetail.tsx` — uses `useParams` to find listing by ID, shows full detail
5. Create `src/pages/Login.tsx` — email + password form, calls `login()` from `AuthContext`
6. Create `src/pages/Dashboard.tsx` — shows user info, only accessible when authenticated
7. Create `src/pages/NotFound.tsx` — 404 page
8. Create `src/components/Navbar.tsx` — `NavLink` for Home and Dashboard, active styling
9. Create `src/components/ProtectedRoute.tsx` — redirects to `/login` if not authenticated
10. Create `src/context/AuthContext.tsx` — `AuthProvider` with `login`, `logout`, `isAuthenticated`
11. Lazy load `ListingDetail` and `Dashboard` with `React.lazy` + `Suspense`
12. Wrap `ListingCard` with `React.memo`, wrap toggle handler with `useCallback`
13. Add a virtualized list of 50 listings on the Home page using `react-window`
14. Add a 404 catch-all route

---

## Starter Code

### `src/store/useStore.ts`

```ts
import { create } from 'zustand'
import type { Listing } from '../types'

interface StoreState {
  listings: Listing[]
  filter: string
  saved: number[]
  setListings: (listings: Listing[]) => void
  setFilter: (filter: string) => void
  toggleSaved: (id: number) => void
  reset: () => void
}

export const useStore = create<StoreState>((set) => ({
  listings: [],
  filter: '',
  saved: [],
  setListings: (listings) => set({ listings }),
  setFilter: (filter) => set({ filter }),
  toggleSaved: (id) => set((state) => ({
    // TODO: add or remove id from saved array
  })),
  reset: () => set({ filter: '', saved: [] }),
}))
```

### `src/context/AuthContext.tsx`

```tsx
import { createContext, useContext, useState } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const login = (_email: string, _password: string): void => {
    // TODO: validate credentials (any email/password works for now)
    setIsAuthenticated(true)
  }

  const logout = (): void => setIsAuthenticated(false)

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
```

### `src/components/ProtectedRoute.tsx`

```tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
```

### `src/App.tsx`

```tsx
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Spinner } from './components/Spinner'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

// TODO: lazy load these
const ListingDetail = lazy(() => import('./pages/ListingDetail'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

export default function App() {
  return (
    <div>
      <Navbar />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* TODO: 404 catch-all */}
        </Routes>
      </Suspense>
    </div>
  )
}
```

### `src/pages/ListingDetail.tsx`

```tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const listings = useStore(s => s.listings)
  const listing = listings.find(l => l.id === Number(id))

  if (!listing) return <p>Listing not found</p>

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Back</button>
      <img src={listing.img} alt={listing.title} />
      <h1>{listing.title}</h1>
      {/* TODO: render full listing details */}
    </div>
  )
}
```

---

## Run the Assignment

```bash
cd airbnb-app
npm install
npm run dev
# open http://localhost:5173
# try navigating to /dashboard without logging in
```

---

## Acceptance Criteria

| # | Criteria | How to verify |
|---|----------|---------------|
| 1 | `BrowserRouter` wraps the app in `main.tsx` | App renders without router errors |
| 2 | Zustand store has all 6 fields and actions typed correctly | `npm run build` passes |
| 3 | Home page renders listings grid from store | Listings visible at `/` |
| 4 | Clicking a listing navigates to `/listings/:id` | URL changes, detail page shows correct listing |
| 5 | `useParams` extracts the correct ID on detail page | Detail page shows the right listing title |
| 6 | `/dashboard` redirects to `/login` when not authenticated | Visit `/dashboard` — redirected to `/login` |
| 7 | Login form calls `login()` and grants access to Dashboard | Submit login form — Dashboard accessible |
| 8 | `NavLink` shows active styling on current route | Active link visually distinct |
| 9 | `ListingDetail` and `Dashboard` lazy load with spinner | Network tab shows separate JS chunks |
| 10 | `ListingCard` wrapped with `React.memo` | React DevTools Profiler — card doesn't re-render on unrelated state changes |
| 11 | Toggle handler wrapped with `useCallback` | Stable reference — memo works correctly |
| 12 | Virtualized list of 50 items renders only visible rows | Scroll list — DOM has ~10 rows, not 50 |
| 13 | 404 page shows for unknown routes | Visit `/unknown` — NotFound page renders |
| 14 | No TypeScript errors | `npm run build` completes cleanly |

---

## Submission Checklist

- [ ] All 14 acceptance criteria pass
- [ ] `npm run build` completes with zero errors
- [ ] Navigation works across all 4 pages
- [ ] Protected route redirects correctly
- [ ] Lazy loading confirmed in Network tab
- [ ] Zustand store powers filter and saved state on all pages
- [ ] Virtualized list scrolls smoothly with 50 items
