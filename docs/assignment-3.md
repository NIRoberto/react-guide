# Assignment 3: Multi-Page App with Routing & Global State

## Description

Build a multi-page Airbnb app with React Router v6, a Context API + useReducer global store, `React.memo` optimization, and a virtualized listings list. The app must have working navigation, protected routes, lazy loading, and a global store that powers filter and saved state across all pages.

---

## Setup

```bash
cd airbnb-app
npm install react-router-dom react-window
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
│   ├── types.ts                  # State, Action types
│   ├── reducer.ts                # reducer function
│   └── StoreContext.tsx          # context, provider, useStore hook
├── context/
│   └── AuthContext.tsx           # auth state
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
2. Create `src/store/types.ts` — define `State`, `Action` union type, and `initialState`
3. Create `src/store/reducer.ts` — pure reducer function with cases: `SET_LISTINGS`, `SET_LOADING`, `SET_FILTER`, `TOGGLE_SAVED`, `RESET`
4. Create `src/store/StoreContext.tsx` — `StoreProvider` wraps the app, `useStore` hook exposes `state` and `dispatch`
5. Wrap `<App />` in `<StoreProvider>` inside `main.tsx`
6. Create `src/pages/Home.tsx` — listings grid, reads `filter` and `saved` from store via `useStore`
7. Create `src/pages/ListingDetail.tsx` — uses `useParams` to find listing by ID, shows full detail
8. Create `src/pages/Login.tsx` — email + password form, calls `login()` from `AuthContext`
9. Create `src/pages/Dashboard.tsx` — shows user info, only accessible when authenticated
10. Create `src/pages/NotFound.tsx` — 404 page
11. Create `src/components/Navbar.tsx` — `NavLink` for Home and Dashboard, active styling
12. Create `src/components/ProtectedRoute.tsx` — redirects to `/login` if not authenticated
13. Create `src/context/AuthContext.tsx` — `AuthProvider` with `login`, `logout`, `isAuthenticated`
14. Lazy load `ListingDetail` and `Dashboard` with `React.lazy` + `Suspense`
15. Wrap `ListingCard` with `React.memo`, wrap toggle handler with `useCallback`
16. Add a virtualized list of 50 listings on the Home page using `react-window`
17. Add a 404 catch-all route

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
    case 'SET_LISTINGS':
      return { ...state, listings: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_FILTER':
      return { ...state, filter: action.payload }
    case 'TOGGLE_SAVED':
      return {
        ...state,
        saved: state.saved.includes(action.payload)
          ? state.saved.filter(id => id !== action.payload)
          : [...state.saved, action.payload],
      }
    case 'RESET':
      return { ...state, filter: '', saved: [] }
    default:
      return state
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
| 2 | `StoreProvider` wraps the app in `main.tsx` | App renders without context errors |
| 3 | `reducer.ts` handles all 5 action types with no TypeScript errors | `npm run build` passes |
| 4 | Home page renders listings grid from store | Listings visible at `/` |
| 5 | Clicking a listing navigates to `/listings/:id` | URL changes, detail page shows correct listing |
| 6 | `useParams` extracts the correct ID on detail page | Detail page shows the right listing title |
| 7 | `/dashboard` redirects to `/login` when not authenticated | Visit `/dashboard` — redirected to `/login` |
| 8 | Login form calls `login()` and grants access to Dashboard | Submit login form — Dashboard accessible |
| 9 | `NavLink` shows active styling on current route | Active link visually distinct |
| 10 | `ListingDetail` and `Dashboard` lazy load with spinner | Network tab shows separate JS chunks |
| 11 | `ListingCard` wrapped with `React.memo` | React DevTools Profiler — card doesn't re-render on unrelated state changes |
| 12 | Toggle handler wrapped with `useCallback` | Stable reference — memo works correctly |
| 13 | Virtualized list of 50 items renders only visible rows | Scroll list — DOM has ~10 rows, not 50 |
| 14 | 404 page shows for unknown routes | Visit `/unknown` — NotFound page renders |
| 15 | No TypeScript errors | `npm run build` completes cleanly |

---

## Submission Checklist

- [ ] All 15 acceptance criteria pass
- [ ] `npm run build` completes with zero errors
- [ ] Navigation works across all 4 pages
- [ ] Protected route redirects correctly
- [ ] Lazy loading confirmed in Network tab
- [ ] Context store powers filter and saved state on all pages
- [ ] Virtualized list scrolls smoothly with 50 items
