# Assignment 3: Multi-Page App with Routing & Global State

## Description

Build a multi-page Airbnb app with React Router v6, a Context API + useReducer global store, `React.memo` optimization, and a virtualized listings list. The app must have working navigation, protected routes, lazy loading, and a global store that powers filter and saved state across all pages.

---

## What You'll Learn

- How React Router v6 handles client-side navigation
- How dynamic routes and `useParams` work
- How to build protected routes with auth context
- How nested routes and `Outlet` share layouts
- How lazy loading splits your JavaScript bundle
- How Context API + useReducer powers global state
- How `React.memo` and `useCallback` prevent unnecessary re-renders
- How virtualization handles large lists efficiently

---

## Packages to Install

```bash
cd airbnb-app
npm install react-router-dom react-window react-hot-toast nprogress dayjs
npm install -D @types/react-window @types/nprogress
```

| Package | What it does | Usage in this assignment |
|---------|-------------|--------------------------|
| `react-router-dom` | Client-side routing — `Routes`, `Route`, `Link`, `NavLink`, `useParams`, `useNavigate` | Full multi-page navigation |
| `react-window` | Virtualized lists — only renders visible rows in the DOM | Render 50 listings without performance issues |
| `react-hot-toast` | Toast notifications | Show toast when navigating to a protected route without auth |
| `nprogress` | Slim progress bar at the top of the page | Show loading bar when lazy-loaded pages are downloading |
| `dayjs` | Lightweight date library (2kb vs date-fns 13kb) | Format listing dates on the detail page |

---

## File Structure

```
src/
├── components/
│   ├── ListingCard.tsx
│   ├── ListingCard.module.css
│   ├── Navbar.tsx
│   ├── ProtectedRoute.tsx
│   └── Spinner.tsx
├── pages/
│   ├── Home.tsx
│   ├── ListingDetail.tsx
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── NotFound.tsx
├── store/
│   ├── types.ts
│   ├── reducer.ts
│   └── StoreContext.tsx
├── context/
│   └── AuthContext.tsx
├── data/
│   └── listings.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

---

## Tasks

1. Install all packages above
2. Create `src/store/types.ts` — `State`, `Action` union, `initialState`
3. Create `src/store/reducer.ts` — cases: `SET_LISTINGS`, `SET_LOADING`, `SET_FILTER`, `TOGGLE_SAVED`, `RESET`
4. Create `src/store/StoreContext.tsx` — `StoreProvider`, `useStore` hook
5. Create `src/context/AuthContext.tsx` — `AuthProvider`, `useAuth` hook
6. Wrap `<App />` in `<BrowserRouter>`, `<StoreProvider>`, `<AuthProvider>` in `main.tsx`
7. Create all 5 pages: `Home`, `ListingDetail`, `Login`, `Dashboard`, `NotFound`
8. Create `Navbar` with `NavLink` — active styling on current route
9. Create `ProtectedRoute` — redirects to `/login` and shows a toast if not authenticated
10. Use `nprogress` to show a loading bar when lazy-loaded pages are downloading — start on navigation, finish when loaded
11. Lazy load `ListingDetail` and `Dashboard` with `React.lazy` + `Suspense`
12. Use `dayjs` on `ListingDetail` to format the listing's `availableFrom` date
13. Wrap `ListingCard` with `React.memo`, wrap toggle handler with `useCallback`
14. Generate 50 listings and implement a virtualized list on `Home` using `react-window`
15. Add a 404 catch-all route

---

## Starter Code

### `src/store/types.ts`

```ts
import type { Listing } from '../types'

export type State = {
  listings: Listing[]
  loading: boolean
  filter: string
  saved: number[]
}

export type Action =
  | { type: 'SET_LISTINGS'; payload: Listing[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'TOGGLE_SAVED'; payload: number }
  | { type: 'RESET' }

export const initialState: State = {
  listings: [],
  loading: true,
  filter: '',
  saved: [],
}
```

### `src/store/reducer.ts`

```ts
import type { State, Action } from './types'

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LISTINGS':  return { ...state, listings: action.payload }
    case 'SET_LOADING':   return { ...state, loading: action.payload }
    case 'SET_FILTER':    return { ...state, filter: action.payload }
    case 'TOGGLE_SAVED':
      return {
        ...state,
        saved: state.saved.includes(action.payload)
          ? state.saved.filter(id => id !== action.payload)
          : [...state.saved, action.payload],
      }
    case 'RESET': return { ...state, filter: '', saved: [] }
    default:      return state
  }
}
```

### `src/store/StoreContext.tsx`

```tsx
import { createContext, useContext, useReducer } from 'react'
import { reducer, initialState } from './reducer'
import type { State, Action } from './types'

interface StoreContextType {
  state: State
  dispatch: React.Dispatch<Action>
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
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
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    // TODO: show a toast "Please log in to access this page"
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
```

### `src/App.tsx`

```tsx
import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Spinner } from './components/Spinner'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

const ListingDetail = lazy(() => import('./pages/ListingDetail'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

export default function App() {
  const location = useLocation()

  useEffect(() => {
    // TODO: start NProgress on location change, finish after a short delay
  }, [location])

  return (
    <div>
      <Navbar />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
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
import dayjs from 'dayjs'
import { useStore } from '../store/StoreContext'

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state } = useStore()
  const listing = state.listings.find(l => l.id === Number(id))

  if (!listing) return <p>Listing not found</p>

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Back</button>
      <img src={listing.img} alt={listing.title} />
      <h1>{listing.title}</h1>
      <p>{listing.location}</p>
      <p>${listing.price} / night</p>
      {/* TODO: use dayjs to format listing.availableFrom */}
      {/* TODO: render full listing details */}
    </div>
  )
}
```

---

## Run the Assignment

```bash
cd airbnb-app
npm run dev
# open http://localhost:5173
# try navigating to /dashboard without logging in
```

---

## Acceptance Criteria

| # | Criteria | How to verify |
|---|----------|---------------|
| 1 | `BrowserRouter`, `StoreProvider`, `AuthProvider` wrap the app | App renders without errors |
| 2 | `reducer.ts` handles all 5 action types | `npm run build` passes |
| 3 | Home page renders listings grid from store | Listings visible at `/` |
| 4 | Clicking a listing navigates to `/listings/:id` | URL changes, correct listing shown |
| 5 | `useParams` extracts the correct ID | Detail page shows right listing title |
| 6 | `/dashboard` redirects to `/login` when not authenticated | Visit `/dashboard` — redirected |
| 7 | `react-hot-toast` shows on protected route redirect | Toast appears when redirected |
| 8 | `nprogress` bar shows when lazy pages load | Progress bar visible at top on navigation |
| 9 | `dayjs` formats date on detail page | Readable date shown on listing detail |
| 10 | Login form grants access to Dashboard | Submit form — Dashboard accessible |
| 11 | `NavLink` shows active styling on current route | Active link visually distinct |
| 12 | `ListingDetail` and `Dashboard` lazy load | Network tab shows separate JS chunks |
| 13 | `ListingCard` wrapped with `React.memo` | No re-render on unrelated state changes |
| 14 | Toggle handler wrapped with `useCallback` | Stable reference — memo works |
| 15 | Virtualized list of 50 items renders only visible rows | DOM has ~10 rows, not 50 |
| 16 | 404 page shows for unknown routes | Visit `/unknown` — NotFound renders |
| 17 | No TypeScript errors | `npm run build` passes |

---

## Submission Checklist

- [ ] All 17 acceptance criteria pass
- [ ] `npm run build` — zero errors
- [ ] `react-router-dom`, `react-window`, `react-hot-toast`, `nprogress`, `dayjs` all used
- [ ] Navigation works across all pages
- [ ] Protected route redirects with toast
- [ ] NProgress bar shows on lazy page load
- [ ] Virtualized list scrolls smoothly with 50 items
