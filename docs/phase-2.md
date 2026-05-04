# Phase 2: Hooks & Styling

## Table of Contents
1. [useEffect](#useeffect)
2. [useRef](#useref)
3. [useContext](#usecontext)
4. [useReducer](#usereducer)
5. [useMemo & useCallback](#usememo--usecallback)
6. [Custom Hooks](#custom-hooks)
7. [CSS Modules](#css-modules)
8. [Tailwind CSS](#tailwind-css)
9. [className Conditionals](#classname-conditionals)
10. [Assignment](#assignment)

---

## useEffect

`useEffect` runs side effects after a component renders — data fetching, subscriptions, DOM manipulation, timers.

### Setup

```bash
# continuing from Phase 1 project
cd airbnb-app
npm run dev
```

### Dependency array patterns

```tsx
// src/App.tsx
import { useState, useEffect } from 'react'
import type { Listing } from './types'

export default function App() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [query, setQuery] = useState<string>('')

  // Runs ONCE on mount — empty dependency array []
  useEffect(() => {
    // simulate a 1.5s API fetch
    const timer = setTimeout(() => {
      setListings(mockListings)
      setLoading(false)
    }, 1500)

    // cleanup — runs when component unmounts
    return () => clearTimeout(timer)
  }, [])

  // Runs every time 'query' changes
  useEffect(() => {
    document.title = query ? `Search: ${query} | Airbnb` : 'Airbnb'
  }, [query])

  if (loading) return <p>Loading...</p>

  return <div>{/* listings */}</div>
}
```

### Cleanup function

```tsx
useEffect(() => {
  let cancelled = false

  async function load() {
    const data = await fetchListings()
    // guard against setting state on an unmounted component
    if (!cancelled) setListings(data)
  }

  load()

  return () => { cancelled = true }  // runs on unmount
}, [])

// timer cleanup
useEffect(() => {
  const timer = setInterval(() => setTime(Date.now()), 1000)
  return () => clearInterval(timer)
}, [])
```

**Run it:**
```bash
npm run dev
# watch the loading state appear for 1.5s then listings render
```

---

## useRef

`useRef` holds a mutable value that persists across renders without causing re-renders. Two uses: DOM access and storing values that shouldn't trigger re-renders.

### DOM access — auto-focus

```tsx
// src/components/SearchBar.tsx
import { useRef, useEffect } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search listings..."
    />
  )
}
```

### Storing values without re-renders

```tsx
// src/components/Timer.tsx
import { useState, useRef } from 'react'

export function Timer() {
  const [elapsed, setElapsed] = useState<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = (): void => {
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
  }

  const stop = (): void => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  return (
    <div>
      <p>{elapsed}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  )
}
```

---

## useContext

`useContext` reads a value from the nearest Context Provider above it in the tree. Solves **prop drilling** — passing props through many layers just to reach a deeply nested component.

### Full example

```tsx
// src/context/FavoritesContext.tsx
import { createContext, useContext, useState } from 'react'

interface FavoritesContextType {
  saved: number[]
  toggle: (id: number) => void
  count: number
}

const FavoritesContext = createContext<FavoritesContextType>({
  saved: [],
  toggle: () => {},
  count: 0,
})

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<number[]>([])

  const toggle = (id: number): void =>
    setSaved(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

  return (
    <FavoritesContext.Provider value={{ saved, toggle, count: saved.length }}>
      {children}
    </FavoritesContext.Provider>
  )
}

// custom hook — always use this instead of useContext directly
export function useFavorites(): FavoritesContextType {
  return useContext(FavoritesContext)
}
```

```tsx
// src/main.tsx
import { FavoritesProvider } from './context/FavoritesContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FavoritesProvider>
      <App />
    </FavoritesProvider>
  </StrictMode>
)
```

```tsx
// any component — reads from context without prop drilling
import { useFavorites } from '../context/FavoritesContext'

export function SavedCount() {
  const { count } = useFavorites()
  return <span>{count} saved</span>
}

export function HeartButton({ id }: { id: number }) {
  const { saved, toggle } = useFavorites()
  return (
    <button onClick={() => toggle(id)}>
      {saved.includes(id) ? 'Unsave' : 'Save'}
    </button>
  )
}
```

**Run it:**
```bash
npm run dev
# click hearts — SavedCount updates without any prop passing
```

---

## useReducer

`useReducer` manages complex state with multiple related values. Better than multiple `useState` calls when state updates are interconnected.

```tsx
// src/store/reducer.ts
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
  | { type: 'TOGGLE_FAVORITE'; payload: number }

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LISTINGS':
      return { ...state, listings: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_FILTER':
      return { ...state, filter: action.payload }
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        saved: state.saved.includes(action.payload)
          ? state.saved.filter(id => id !== action.payload)
          : [...state.saved, action.payload],
      }
    default:
      return state
  }
}
```

```tsx
// src/App.tsx
import { useReducer, useEffect } from 'react'
import { reducer } from './store/reducer'
import type { State } from './store/reducer'

const initialState: State = {
  listings: [],
  loading: true,
  filter: '',
  saved: [],
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'SET_LISTINGS', payload: mockListings })
      dispatch({ type: 'SET_LOADING', payload: false })
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <input
        value={state.filter}
        onChange={e => dispatch({ type: 'SET_FILTER', payload: e.target.value })}
        placeholder="Search..."
      />
    </div>
  )
}
```

---

## useMemo & useCallback

Both memoize values to avoid unnecessary recalculations or re-renders.

### useMemo — expensive computations

```tsx
import { useMemo } from 'react'
import type { Listing } from './types'

interface Props {
  listings: Listing[]
  query: string
  maxPrice: number
}

function ListingsPage({ listings, query, maxPrice }: Props) {
  // recalculates ONLY when listings, query, or maxPrice changes
  const filtered = useMemo<Listing[]>(() =>
    listings.filter(l =>
      l.title.toLowerCase().includes(query.toLowerCase()) &&
      l.price <= maxPrice
    ),
    [listings, query, maxPrice]
  )

  return (
    <div>
      {filtered.map(l => <div key={l.id}>{l.title}</div>)}
    </div>
  )
}
```

### useCallback — stable function references

```tsx
import { useCallback, useState } from 'react'

function ListingsPage() {
  const [saved, setSaved] = useState<number[]>([])

  // stable reference — won't cause React.memo children to re-render
  const handleToggle = useCallback((id: number): void => {
    setSaved(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }, [])

  return (
    <div>
      {listings.map(l => (
        <ListingCard key={l.id} listing={l} onToggleSave={() => handleToggle(l.id)} />
      ))}
    </div>
  )
}
```

---

## Custom Hooks

A custom hook is a function that starts with `use` and calls other hooks. Extracts and reuses stateful logic.

```tsx
// src/hooks/useListings.ts
import { useState, useEffect } from 'react'
import type { Listing } from '../types'

interface UseListingsReturn {
  listings: Listing[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useListings(): UseListingsReturn {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      // replace with real fetch in Phase 4
      await new Promise(r => setTimeout(r, 1500))
      setListings(mockListings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  return { listings, loading, error, refresh }
}
```

```tsx
// src/hooks/useFavorites.ts
import { useState } from 'react'

interface UseFavoritesReturn {
  saved: number[]
  toggle: (id: number) => void
  count: number
  isSaved: (id: number) => boolean
}

export function useFavorites(): UseFavoritesReturn {
  const [saved, setSaved] = useState<number[]>([])

  const toggle = (id: number): void =>
    setSaved(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

  return {
    saved,
    toggle,
    count: saved.length,
    isSaved: (id: number) => saved.includes(id),
  }
}
```

```tsx
// src/App.tsx — clean component, all logic in hooks
import { useListings } from './hooks/useListings'
import { useFavorites } from './hooks/useFavorites'

export default function App() {
  const { listings, loading, error, refresh } = useListings()
  const { saved, toggle, count } = useFavorites()

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error} <button onClick={refresh}>Retry</button></p>

  return (
    <div>
      <p>{count} saved</p>
      {listings.map(l => (
        <ListingCard
          key={l.id}
          listing={l}
          saved={saved.includes(l.id)}
          onToggleSave={() => toggle(l.id)}
        />
      ))}
    </div>
  )
}
```

**Run it:**
```bash
npm run dev
```

---

## CSS Modules

CSS Modules scope styles to a single component — `.card` here won't clash with `.card` anywhere else.

### Setup

No installation needed — Vite supports CSS Modules out of the box. Name your file `*.module.css`.

```css
/* src/components/ListingCard.module.css */
.card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.body {
  padding: 12px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  margin: 4px 0;
}

.badge {
  font-size: 11px;
  background: rgba(255, 56, 92, 0.1);
  color: #FF385C;
  padding: 2px 8px;
  border-radius: 20px;
}
```

```tsx
// src/components/ListingCard.tsx
import styles from './ListingCard.module.css'
import type { Listing } from '../types'

interface ListingCardProps {
  listing: Listing
  saved: boolean
  onToggleSave: () => void
}

export function ListingCard({ listing, saved, onToggleSave }: ListingCardProps) {
  return (
    <div className={styles.card}>
      <img src={listing.img} alt={listing.title} className={styles.image} />
      <div className={styles.body}>
        <h4 className={styles.title}>{listing.title}</h4>
        {listing.superhost && (
          <span className={styles.badge}>Superhost</span>
        )}
      </div>
    </div>
  )
}
```

---

## Tailwind CSS

Utility-first CSS — compose styles using class names directly in JSX.

### Setup

```bash
npm install -D tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

```css
/* src/index.css */
@import "tailwindcss";
```

```tsx
// src/components/ListingCard.tsx
import type { Listing } from '../types'

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all bg-white">
      <img src={listing.img} alt={listing.title} className="w-full h-48 object-cover" />
      <div className="p-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">{listing.location}</span>
          <span className="text-xs text-gray-500">★ {listing.rating}</span>
        </div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">{listing.title}</h4>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-[#FF385C]">${listing.price} / night</span>
          {listing.superhost && (
            <span className="text-xs font-semibold bg-red-50 text-[#FF385C] px-2 py-0.5 rounded-full">
              Superhost
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Run it:**
```bash
npm run dev
```

---

## className Conditionals

```tsx
// Method 1: template literal
<div className={`card ${isActive ? 'card--active' : ''}`}>

// Method 2: array join
<div className={['card', isActive && 'card--active'].filter(Boolean).join(' ')}>

// Method 3: clsx (recommended)
// npm install clsx
import clsx from 'clsx'
<div className={clsx('card', { 'card--active': isActive, 'card--featured': superhost })}>
```

---

## Assignment

> See **[assignment-2.md](./assignment-2.md)** for the full description, file structure, acceptance criteria, and submission checklist.

**Summary:** Refactor your Phase 1 app to use `useReducer`, `FavoritesContext`, custom hooks (`useListings`, `useFavorites`), a simulated fetch with spinner, `useRef` auto-focus, and CSS Modules styling.

---

**Resources**
- [React Docs — useEffect](https://react.dev/reference/react/useEffect)
- [React Docs — useContext](https://react.dev/reference/react/useContext)
- [React Docs — useReducer](https://react.dev/reference/react/useReducer)
- [React Docs — Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
