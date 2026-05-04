# Phase 2: Hooks & Styling

## Table of Contents
1. [useEffect](#useeffect)
2. [useRef](#useref)
3. [useContext](#usecontext)
4. [useReducer](#usereducer)
5. [useMemo & useCallback](#usememo--usecallback)
6. [Custom Hooks](#custom-hooks)
7. [CSS Modules](#css-modules)
8. [Inline Style Objects](#inline-style-objects)
9. [Tailwind CSS](#tailwind-css)
10. [className Conditionals](#classname-conditionals)
11. [Assignment — Airbnb App with Hooks & Styling](#assignment--airbnb-app-with-hooks--styling)

---

## useEffect

`useEffect` runs side effects after a component renders. Side effects are anything that reaches outside React — fetching data, setting up subscriptions, updating the document title, or directly manipulating the DOM.

### Dependency Array Patterns

```tsx
import { useState, useEffect } from 'react'

function ListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  // Runs ONCE on mount — empty dependency array
  useEffect(() => {
    fetchListings().then(data => {
      setListings(data)
      setLoading(false)
    })
  }, [])

  // Runs every time 'query' changes
  useEffect(() => {
    document.title = `Search: ${query} | Airbnb`
  }, [query])

  // Runs on EVERY render — no dependency array (usually avoid this)
  useEffect(() => {
    console.log('Component rendered')
  })
}
```

### Cleanup Function

The function returned from `useEffect` runs when the component unmounts or before the effect runs again. Use it to cancel subscriptions, clear timers, or abort fetch requests.

```tsx
useEffect(() => {
  let cancelled = false

  async function load() {
    const data = await fetchListings()
    // Guard against setting state on an unmounted component
    if (!cancelled) setListings(data)
  }

  load()

  // Cleanup — runs on unmount
  return () => { cancelled = true }
}, [])

// Timer cleanup
useEffect(() => {
  const timer = setInterval(() => setTime(Date.now()), 1000)
  return () => clearInterval(timer)  // clear on unmount
}, [])
```

### Simulating a Fetch

```tsx
function useListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    // Simulate API delay
    const timer = setTimeout(() => {
      setListings(mockListings)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return { listings, loading, error }
}
```

---

## useRef

`useRef` returns a mutable object whose `.current` property persists across renders without causing re-renders. Two main uses: accessing DOM elements directly, and storing values that shouldn't trigger re-renders.

### DOM Access

```tsx
import { useRef, useEffect } from 'react'

function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus the input when the component mounts
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.focus()
    }
  }

  return (
    <div>
      <input ref={inputRef} placeholder="Search listings..." />
      <button onClick={handleClear}>Clear</button>
    </div>
  )
}
```

### Storing Values Without Re-renders

```tsx
function Timer() {
  const [elapsed, setElapsed] = useState(0)
  // Store the interval ID — changing it shouldn't cause a re-render
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = () => {
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
  }

  const stop = () => {
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

`useContext` reads a value from the nearest matching Context Provider above it in the component tree. It solves **prop drilling** — passing props through many layers just to reach a deeply nested component.

### Creating and Using Context

```tsx
import { createContext, useContext, useState } from 'react'

// 1. Define the context shape
interface FavoritesContextType {
  saved: number[]
  toggle: (id: number) => void
  count: number
}

// 2. Create the context with a default value
const FavoritesContext = createContext<FavoritesContextType>({
  saved: [],
  toggle: () => {},
  count: 0,
})

// 3. Create a Provider component
function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<number[]>([])

  const toggle = (id: number) =>
    setSaved(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

  return (
    <FavoritesContext.Provider value={{ saved, toggle, count: saved.length }}>
      {children}
    </FavoritesContext.Provider>
  )
}

// 4. Custom hook for clean consumption
function useFavorites() {
  return useContext(FavoritesContext)
}

// 5. Any component in the tree can read from context
function SavedCount() {
  const { count } = useFavorites()
  return <span>{count} saved</span>
}

function ListingCard({ id }: { id: number }) {
  const { saved, toggle } = useFavorites()
  return (
    <button onClick={() => toggle(id)}>
      {saved.includes(id) ? 'Unsave' : 'Save'}
    </button>
  )
}

// 6. Wrap your app with the Provider
function App() {
  return (
    <FavoritesProvider>
      <SavedCount />
      <ListingsGrid />
    </FavoritesProvider>
  )
}
```

### When to Use Context

Context is not a replacement for all state. Use it for:
- Theme (dark/light mode)
- Current user / auth state
- Language / locale
- Shared data needed by many components at different nesting levels

For local state that only one or two components need, stick with `useState`.

---

## useReducer

`useReducer` is an alternative to `useState` for managing complex state with multiple sub-values or when the next state depends on the previous one in non-trivial ways.

```tsx
import { useReducer } from 'react'

// 1. Define state shape
type State = {
  listings: Listing[]
  loading: boolean
  filter: string
  saved: number[]
}

// 2. Define all possible actions as a union type
type Action =
  | { type: 'SET_LISTINGS'; payload: Listing[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: number }

// 3. Pure reducer function — no side effects, always returns new state
function reducer(state: State, action: Action): State {
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

// 4. Use in a component
function ListingsPage() {
  const [state, dispatch] = useReducer(reducer, {
    listings: [],
    loading: true,
    filter: '',
    saved: [],
  })

  // Dispatch actions instead of calling multiple setters
  dispatch({ type: 'SET_FILTER', payload: 'Bali' })
  dispatch({ type: 'TOGGLE_FAVORITE', payload: 3 })
}
```

### useState vs useReducer

| Situation | Use |
|-----------|-----|
| Simple independent values | `useState` |
| Next state depends on previous | `useReducer` |
| Multiple related values that change together | `useReducer` |
| Complex update logic | `useReducer` |
| Sharing update logic across components | `useReducer` |

---

## useMemo & useCallback

Both are performance optimizations that memoize values to avoid unnecessary recalculations or re-renders.

### useMemo — Memoize Computed Values

```tsx
import { useMemo } from 'react'

function ListingsPage({ listings, query, maxPrice }) {
  // Without useMemo — recalculates on every render even if listings/query didn't change
  const filtered = listings.filter(l =>
    l.title.toLowerCase().includes(query.toLowerCase()) &&
    l.price <= maxPrice
  )

  // With useMemo — only recalculates when listings, query, or maxPrice changes
  const filtered = useMemo(() =>
    listings.filter(l =>
      l.title.toLowerCase().includes(query.toLowerCase()) &&
      l.price <= maxPrice
    ),
    [listings, query, maxPrice]
  )
}
```

### useCallback — Memoize Functions

```tsx
import { useCallback } from 'react'

function ListingsPage() {
  const [saved, setSaved] = useState<number[]>([])

  // Without useCallback — new function reference on every render
  // This causes child components wrapped in React.memo to re-render unnecessarily
  const handleToggle = (id: number) =>
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  // With useCallback — stable function reference across renders
  const handleToggle = useCallback((id: number) =>
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]),
    []  // no dependencies — function never needs to change
  )

  return listings.map(l => (
    <ListingCard key={l.id} {...l} onToggleSave={() => handleToggle(l.id)} />
  ))
}
```

### When to Use Them

Don't add `useMemo` and `useCallback` everywhere — they have overhead too. Use them when:
- A computation is genuinely expensive (large array filtering, sorting)
- A function is passed as a prop to a `React.memo` wrapped component
- A value is used as a dependency in another `useEffect` or `useMemo`

---

## Custom Hooks

A custom hook is a function that starts with `use` and calls other hooks. It lets you extract and reuse stateful logic across multiple components.

```tsx
// useListings — encapsulates fetch + loading + error + refresh
function useListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchListings()
      setListings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  return { listings, loading, error, refresh }
}

// useFavorites — encapsulates saved state and toggle logic
function useFavorites() {
  const [saved, setSaved] = useState<number[]>([])

  const toggle = (id: number) =>
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  return { saved, toggle, count: saved.length, isSaved: (id: number) => saved.includes(id) }
}

// useLocalStorage — persists state to localStorage
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initial
  })

  const set = (newValue: T) => {
    setValue(newValue)
    localStorage.setItem(key, JSON.stringify(newValue))
  }

  return [value, set] as const
}

// Clean component — all logic lives in hooks
function ListingsPage() {
  const { listings, loading, error, refresh } = useListings()
  const { saved, toggle, count } = useFavorites()

  if (loading) return <Spinner />
  if (error) return <p>{error} <button onClick={refresh}>Retry</button></p>

  return (
    <div>
      <p>{count} saved</p>
      {listings.map(l => (
        <ListingCard key={l.id} {...l}
          saved={saved.includes(l.id)}
          onToggleSave={() => toggle(l.id)}
        />
      ))}
    </div>
  )
}
```

---

## CSS Modules

CSS Modules scope styles to a single component by auto-generating unique class names at build time. No global conflicts — `.card` in `ListingCard.module.css` won't clash with `.card` anywhere else.

```css
/* ListingCard.module.css */
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

.body { padding: 12px; }

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

/* Variant — combined with base class */
.badge--superhost {
  background: #FF385C;
  color: #fff;
}
```

```tsx
// ListingCard.tsx
import styles from './ListingCard.module.css'

function ListingCard({ title, superhost, img }: Props) {
  return (
    <div className={styles.card}>
      <img src={img} className={styles.image} alt={title} />
      <div className={styles.body}>
        <h4 className={styles.title}>{title}</h4>
        {superhost && (
          <span className={`${styles.badge} ${styles['badge--superhost']}`}>
            Superhost
          </span>
        )}
      </div>
    </div>
  )
}
```

---

## Inline Style Objects

Pass a JavaScript object to the `style` prop. Property names are camelCase. Good for dynamic values — bad for hover states and media queries (use CSS for those).

```tsx
function ListingCard({ price, superhost }: Props) {
  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
  }

  return (
    <div style={cardStyle}>
      {/* Dynamic color based on price */}
      <strong style={{ color: price > 300 ? '#FF385C' : '#1a1a1a' }}>
        ${price}
      </strong>

      {/* Dynamic background based on prop */}
      <span style={{
        background: superhost ? 'rgba(255,56,92,0.1)' : '#f0f0f0',
        color: superhost ? '#FF385C' : '#888',
        padding: '2px 8px',
        borderRadius: 20,
        fontSize: 11,
      }}>
        {superhost ? 'Superhost' : 'Host'}
      </span>
    </div>
  )
}
```

---

## Tailwind CSS

Tailwind is a utility-first CSS framework. You compose styles using small single-purpose class names directly in JSX — no separate CSS files needed.

### Setup with Vite

```bash
npm install -D tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({ plugins: [react(), tailwindcss()] })
```

```css
/* index.css */
@import "tailwindcss";
```

### Usage

```tsx
function ListingCard({ title, location, price, rating, superhost, img }: Props) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all">
      <img src={img} alt={title} className="w-full h-48 object-cover" />

      <div className="p-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">{location}</span>
          <span className="text-xs text-gray-500">★ {rating}</span>
        </div>

        <h4 className="text-sm font-semibold text-gray-900 mb-2">{title}</h4>

        <div className="flex justify-between items-center">
          <span className="text-sm">
            <strong className="text-[#FF385C]">${price}</strong> / night
          </span>
          {superhost && (
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

---

## className Conditionals

```tsx
// Method 1: Template literal
<div className={`card ${isActive ? 'card--active' : ''} ${superhost ? 'card--featured' : ''}`}>

// Method 2: Array filter and join
<div className={['card', isActive && 'card--active', superhost && 'card--featured'].filter(Boolean).join(' ')}>

// Method 3: clsx library (most popular)
// npm install clsx
import clsx from 'clsx'
<div className={clsx('card', { 'card--active': isActive, 'card--featured': superhost })}>

// Method 4: Tailwind with cn utility (shadcn/ui pattern)
import { cn } from '@/lib/utils'
<div className={cn('rounded-xl border', isActive && 'border-red-500', superhost && 'bg-red-50')}>
```

---

## Assignment — Airbnb App with Hooks & Styling

> Refactor your Phase 1 listings page to use core hooks, Context, useReducer, and apply consistent styling with CSS Modules or Tailwind.

### Tasks

1. Wrap your app in a `FavoritesContext` Provider — any component can read saved listings without prop drilling
2. Move all state into a `useReducer` with actions: `SET_LISTINGS`, `SET_LOADING`, `SET_FILTER`, `TOGGLE_FAVORITE`
3. Add a `useEffect` that simulates fetching listings with a 1.5s delay — show a spinner while loading
4. Use `useRef` to auto-focus the search input when the page loads
5. Extract a `useListings()` custom hook that handles the simulated fetch, loading, and error states
6. Extract a `useFavorites()` custom hook that reads from `FavoritesContext`
7. Add a `<SavedListings />` panel that reads from context and shows saved listing titles
8. Wrap your filtered computation in `useMemo`
9. Style your `ListingCard` with CSS Modules — add hover lift effect, responsive grid, styled search bar
10. Add a **Superhost** variant style that gives featured cards a colored border

### Starter Code

```tsx
// src/context/FavoritesContext.tsx
import { createContext, useContext, useReducer } from 'react'

type State = {
  listings: Listing[]
  loading: boolean
  filter: string
  saved: number[]
}

type Action =
  | { type: 'SET_LISTINGS'; payload: Listing[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: number }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LISTINGS': // TODO
    case 'SET_LOADING':  // TODO
    case 'SET_FILTER':   // TODO
    case 'TOGGLE_FAVORITE': // TODO
    default: return state
  }
}

const FavoritesContext = createContext<{
  state: State
  dispatch: React.Dispatch<Action>
}>({ state: { listings: [], loading: true, filter: '', saved: [] }, dispatch: () => {} })

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    listings: [], loading: true, filter: '', saved: [],
  })
  return (
    <FavoritesContext.Provider value={{ state, dispatch }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavoritesContext = () => useContext(FavoritesContext)

// src/hooks/useListings.ts
export function useListings() {
  const { dispatch } = useFavoritesContext()

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true })
    const timer = setTimeout(() => {
      // TODO: dispatch SET_LISTINGS with mock data
      // TODO: dispatch SET_LOADING false
    }, 1500)
    return () => clearTimeout(timer)
  }, [])
}

// src/components/SavedListings.tsx
export function SavedListings() {
  const { state } = useFavoritesContext()
  const savedListings = state.listings.filter(l => state.saved.includes(l.id))
  // TODO: render saved listing titles
}
```

### Expected Output

App loads with a spinner, listings appear after 1.5s, search input is auto-focused. Favorites are shared via Context — the SavedListings panel updates when you toggle hearts. All state lives in useReducer. Cards are styled with CSS Modules including hover effects and a responsive grid.

---

**Resources**
- [React Docs — useEffect](https://react.dev/reference/react/useEffect)
- [React Docs — useContext](https://react.dev/reference/react/useContext)
- [React Docs — useReducer](https://react.dev/reference/react/useReducer)
- [React Docs — Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [CSS Modules](https://github.com/css-modules/css-modules)
