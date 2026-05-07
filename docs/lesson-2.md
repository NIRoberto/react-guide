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

`useEffect` runs side effects after a component renders. A **side effect** is anything that reaches outside the component — fetching data, setting up subscriptions, manipulating the DOM, starting timers.

**Why after render?** React renders synchronously. If you fetched data during render, you'd block the UI. `useEffect` defers the work until after the browser has painted, keeping the UI responsive.

### Setup

```bash
# continuing from Phase 1 project
cd airbnb-app
npm run dev
```

### Dependency array patterns

The second argument to `useEffect` is the **dependency array**. It controls when the effect re-runs.

```tsx
// src/App.tsx
import { useState, useEffect } from 'react'
import type { Listing } from './types'

export default function App() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [query, setQuery] = useState<string>('')

  // [] — runs ONCE on mount, never again
  // Use for: initial data fetch, setting up subscriptions
  useEffect(() => {
    const timer = setTimeout(() => {
      setListings(mockListings)
      setLoading(false)
    }, 1500)

    // cleanup — runs when component unmounts (or before the effect re-runs)
    return () => clearTimeout(timer)
  }, [])

  // [query] — runs on mount AND every time 'query' changes
  // Use for: syncing with external systems when a value changes
  useEffect(() => {
    document.title = query ? `Search: ${query} | Airbnb` : 'Airbnb'
  }, [query])

  // No array — runs after EVERY render (rarely what you want)
  // useEffect(() => { ... })

  if (loading) return <p>Loading...</p>

  return <div>{/* listings */}</div>
}
```

### Cleanup function

The function returned from `useEffect` is the **cleanup function**. React calls it:
- When the component unmounts (removed from the DOM)
- Before the effect runs again (if dependencies changed)

This prevents memory leaks and stale state updates.

```tsx
useEffect(() => {
  let cancelled = false

  async function load() {
    const data = await fetchListings()
    // Without this guard, if the component unmounts while fetching,
    // you'd try to call setState on an unmounted component
    if (!cancelled) setListings(data)
  }

  load()

  return () => { cancelled = true }  // runs on unmount
}, [])

// timer cleanup — without this, the interval keeps running after unmount
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

### Examples

**Example 1 — Log every time count changes:**
```tsx
import { useState, useEffect } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log(`Count changed to: ${count}`)
  }, [count])

  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
}
```
```
// Console output when you click the button:
Count changed to: 0   ← on mount
Count changed to: 1   ← after first click
Count changed to: 2   ← after second click
```

**Example 2 — Fetch user data when userId changes:**
```tsx
import { useState, useEffect } from 'react'

export function UserProfile({ userId }: { userId: number }) {
  const [name, setName] = useState('')

  useEffect(() => {
    console.log(`Fetching user ${userId}...`)
    // Simulated fetch
    setTimeout(() => setName(`User #${userId}`), 500)
  }, [userId])

  return <p>{name || 'Loading...'}</p>
}
```
```
// UI output:
// userId=1 → shows "Loading..." → then "User #1"
// userId=2 → shows "Loading..." → then "User #2"

// Console:
Fetching user 1...
Fetching user 2...
```

### Common useEffect mistakes

```tsx
// MISTAKE 1: Missing dependency
const [userId, setUserId] = useState(1)
useEffect(() => {
  fetchUser(userId)  // userId is used but not in the dependency array
}, [])              // ESLint will warn about this

// FIX: include all values used inside the effect
useEffect(() => {
  fetchUser(userId)
}, [userId])

// MISTAKE 2: Object/function in dependency array causes infinite loop
useEffect(() => {
  fetchData(options)
}, [options])  // if options is created inline, it's a new object every render

// FIX: move the object outside the component or use useMemo
```

---

## useRef

`useRef` holds a mutable value that persists across renders **without causing re-renders**. It's a box that holds a value — changing the value doesn't trigger a re-render.

Two main uses:
1. **DOM access** — get a direct reference to a DOM element
2. **Storing values** — hold values that shouldn't trigger re-renders (timers, previous values, flags)

### DOM access — auto-focus

```tsx
// src/components/SearchBar.tsx
import { useRef, useEffect } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  // inputRef.current will point to the actual <input> DOM element after mount
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // .current is null before mount, then holds the DOM element
    inputRef.current?.focus()
  }, [])

  return (
    <input
      ref={inputRef}  // React sets inputRef.current to this element after render
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search listings..."
    />
  )
}
```

### Storing values without re-renders

Use `useRef` when you need to remember a value between renders but don't want that value to trigger a re-render when it changes. Common for: timer IDs, previous prop values, whether the component has mounted.

```tsx
// src/components/Timer.tsx
import { useState, useRef } from 'react'

export function Timer() {
  const [elapsed, setElapsed] = useState<number>(0)
  // Storing the interval ID — changing it shouldn't re-render the component
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

### Examples

**Example 1 — Track how many times a component re-renders (without causing more renders):**
```tsx
import { useState, useRef, useEffect } from 'react'

export function RenderCounter() {
  const [text, setText] = useState('')
  const renderCount = useRef(0)

  useEffect(() => {
    renderCount.current += 1
  })

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <p>Renders: {renderCount.current}</p>
    </div>
  )
}
```
```
// UI output as you type "hi":
// Input: "h"  → Renders: 1
// Input: "hi" → Renders: 2
// (renderCount.current updates silently — no extra re-render triggered)
```

**Example 2 — Store previous value:**
```tsx
import { useState, useRef, useEffect } from 'react'

export function PriceTracker() {
  const [price, setPrice] = useState(100)
  const prevPrice = useRef(100)

  useEffect(() => {
    prevPrice.current = price
  }, [price])

  return (
    <div>
      <p>Current: ${price}  |  Previous: ${prevPrice.current}</p>
      <button onClick={() => setPrice(p => p + 10)}>+$10</button>
    </div>
  )
}
```
```
// UI output:
// Start:       Current: $100  |  Previous: $100
// After click: Current: $110  |  Previous: $100
// After click: Current: $120  |  Previous: $110
```

**Key difference from useState:** `ref.current = newValue` does NOT trigger a re-render. `setState(newValue)` DOES. Use `useRef` when you need to remember something but the UI doesn't depend on it.

---

## useContext

`useContext` reads a value from the nearest Context Provider above it in the tree. It solves **prop drilling** — the problem of passing props through many layers of components just to reach a deeply nested one.

**The problem prop drilling causes:**
```
App (has savedIds state)
  └── ListingsPage (passes savedIds down)
        └── ListingsGrid (passes savedIds down)
              └── ListingCard (finally uses savedIds)
```
`ListingsPage` and `ListingsGrid` don't need `savedIds` — they're just passing it through. Context eliminates this.

### Full example

```tsx
// src/context/FavoritesContext.tsx
import { createContext, useContext, useState } from 'react'

interface FavoritesContextType {
  saved: number[]
  toggle: (id: number) => void
  count: number
}

// Default value is used when a component reads context outside a Provider
// In practice, this should never happen — the error in the custom hook catches it
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
    // All components inside this Provider can read { saved, toggle, count }
    <FavoritesContext.Provider value={{ saved, toggle, count: saved.length }}>
      {children}
    </FavoritesContext.Provider>
  )
}

// Always expose context through a custom hook — never useContext directly
// This lets you add validation and keeps the context name out of consumer components
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

### Examples

**Example 1 — Theme context (dark/light mode):**
```tsx
import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext<'light' | 'dark'>('light')

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  return (
    <ThemeContext.Provider value={theme}>
      {children}
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle
      </button>
    </ThemeContext.Provider>
  )
}

function Page() {
  const theme = useContext(ThemeContext)
  return <div style={{ background: theme === 'dark' ? '#222' : '#fff' }}>Hello</div>
}
```
```
// UI output:
// Click "Toggle" → background switches between white and dark gray
// No props passed — Page reads theme directly from context
```

**Example 2 — Cart count badge (any component reads it):**
```tsx
const CartContext = createContext({ count: 0, add: () => {} })

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0)
  return (
    <CartContext.Provider value={{ count, add: () => setCount(c => c + 1) }}>
      {children}
    </CartContext.Provider>
  )
}

function CartBadge() {
  const { count } = useContext(CartContext)
  return <span>🛒 {count}</span>   // reads from context, no props needed
}

function AddButton() {
  const { add } = useContext(CartContext)
  return <button onClick={add}>Add to cart</button>
}
```
```
// UI output:
// Start:       🛒 0
// After click: 🛒 1
// After click: 🛒 2
// CartBadge and AddButton share state with zero prop drilling
```

**Run it:**
```bash
npm run dev
# click hearts — SavedCount updates without any prop passing
```

### When NOT to use Context

Context is not a replacement for all state. Use it for:
- Theme (dark/light mode)
- Auth state (current user)
- Language/locale
- Shared UI state (favorites, cart)

Don't use it for state that only one or two components need — just pass props. Context re-renders every subscriber when the value changes, which can hurt performance if overused.

---

## useReducer

`useReducer` manages complex state with multiple related values. It's an alternative to multiple `useState` calls when state updates are interconnected or when the next state depends on the previous in complex ways.

**Mental model:** Think of it like a Redux store in miniature. You dispatch **actions** (plain objects describing what happened), and a **reducer** function (pure function) computes the next state.

**When to prefer `useReducer` over `useState`:**
- Multiple state values that change together
- Next state depends on previous state in complex ways
- State transitions have names (makes code self-documenting)

```tsx
// src/store/reducer.ts
import type { Listing } from '../types'

export type State = {
  listings: Listing[]
  loading: boolean
  filter: string
  saved: number[]
}

// Discriminated union — TypeScript knows exactly which payload type goes with each action
export type Action =
  | { type: 'SET_LISTINGS'; payload: Listing[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: number }

// Pure function — same inputs always produce same output, no side effects
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

### Examples

**Example 1 — Simple counter with named actions:**
```tsx
import { useReducer } from 'react'

type Action = { type: 'INCREMENT' } | { type: 'DECREMENT' } | { type: 'RESET' }

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'INCREMENT': return state + 1
    case 'DECREMENT': return state - 1
    case 'RESET':     return 0
    default:          return state
  }
}

export function Counter() {
  const [count, dispatch] = useReducer(reducer, 0)
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </div>
  )
}
```
```
// UI output:
// Start:          Count: 0
// Click "+":      Count: 1
// Click "+":      Count: 2
// Click "-":      Count: 1
// Click "Reset":  Count: 0
```

**Example 2 — Form state with multiple fields:**
```tsx
import { useReducer } from 'react'

type FormState = { name: string; email: string; submitted: boolean }
type FormAction =
  | { type: 'SET_FIELD'; field: 'name' | 'email'; value: string }
  | { type: 'SUBMIT' }

function reducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD': return { ...state, [action.field]: action.value }
    case 'SUBMIT':    return { ...state, submitted: true }
    default:          return state
  }
}

export function BookingForm() {
  const [form, dispatch] = useReducer(reducer, { name: '', email: '', submitted: false })

  if (form.submitted) return <p>Booked for {form.name}!</p>

  return (
    <form onSubmit={e => { e.preventDefault(); dispatch({ type: 'SUBMIT' }) }}>
      <input placeholder="Name"  onChange={e => dispatch({ type: 'SET_FIELD', field: 'name',  value: e.target.value })} />
      <input placeholder="Email" onChange={e => dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })} />
      <button type="submit">Book</button>
    </form>
  )
}
```
```
// UI output:
// Type "Alice" in Name, "alice@email.com" in Email, click Book
// → Form disappears, shows: "Booked for Alice!"
```

**Benefit of named actions:** When you read `dispatch({ type: 'TOGGLE_FAVORITE', payload: id })`, you immediately understand what's happening. Compare to `setSaved(prev => prev.includes(id) ? ...)` — the intent is less clear.

---

## useMemo & useCallback

Both hooks memoize values to avoid unnecessary recalculations or re-renders. They are **performance optimizations** — only add them when you have a measured performance problem.

### useMemo — expensive computations

`useMemo` caches the result of a computation. It only recalculates when its dependencies change.

```tsx
import { useMemo } from 'react'
import type { Listing } from './types'

interface Props {
  listings: Listing[]
  query: string
  maxPrice: number
}

function ListingsPage({ listings, query, maxPrice }: Props) {
  // Without useMemo: this filter runs on EVERY render, even if listings/query/maxPrice didn't change
  // With useMemo: only recalculates when listings, query, or maxPrice changes
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

**When to use:** Only when the computation is genuinely expensive (sorting/filtering thousands of items, complex math). For simple filters on small arrays, `useMemo` adds overhead without benefit.

### useCallback — stable function references

`useCallback` caches a function so its reference stays the same between renders. This matters because functions are recreated on every render — a new reference means `React.memo` children will re-render even if the logic is identical.

```tsx
import { useCallback, useState } from 'react'

function ListingsPage() {
  const [saved, setSaved] = useState<number[]>([])

  // Without useCallback — new function reference on every render
  // This breaks React.memo because onToggle "changes" every render
  // const handleToggle = (id: number) => setSaved(...)  // BAD

  // With useCallback — stable reference, React.memo works correctly
  const handleToggle = useCallback((id: number): void => {
    setSaved(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }, [])  // no dependencies — setSaved is stable

  return (
    <div>
      {listings.map(l => (
        <ListingCard key={l.id} listing={l} onToggleSave={() => handleToggle(l.id)} />
      ))}
    </div>
  )
}
```

### Examples

**Example 1 — useMemo to filter a list:**
```tsx
import { useState, useMemo } from 'react'

const items = ['Tokyo', 'Paris', 'New York', 'London', 'Sydney']

export function CitySearch() {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    console.log('Filtering...')  // only logs when query changes
    return items.filter(city => city.toLowerCase().includes(query.toLowerCase()))
  }, [query])

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search city" />
      <ul>{results.map(c => <li key={c}>{c}</li>)}</ul>
    </div>
  )
}
```
```
// Console + UI output:
// Type "o" → Filtering... → shows: Tokyo, London, New York
// Type "on" → Filtering... → shows: London
// (no re-filter on unrelated re-renders)
```

**Example 2 — useCallback to prevent child re-renders:**
```tsx
import { useState, useCallback, memo } from 'react'

// memo: only re-renders if props change
const SaveButton = memo(({ onSave }: { onSave: () => void }) => {
  console.log('SaveButton rendered')
  return <button onClick={onSave}>Save</button>
})

export function ListingCard({ id }: { id: number }) {
  const [count, setCount] = useState(0)

  // Without useCallback: new function every render → SaveButton always re-renders
  // With useCallback: same function reference → SaveButton skips re-render
  const handleSave = useCallback(() => {
    console.log(`Saved listing ${id}`)
  }, [id])

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Clicks: {count}</button>
      <SaveButton onSave={handleSave} />
    </div>
  )
}
```
```
// Console output:
// Initial render:       SaveButton rendered
// Click "Clicks" btn:   (nothing — SaveButton skips re-render ✓)
// Without useCallback:  SaveButton rendered  ← would fire on every click
```

**Rule of thumb:** Use `useCallback` when passing a function to a `React.memo`-wrapped child. Otherwise, it's premature optimization.

---

## Custom Hooks

A custom hook is a function that starts with `use` and calls other hooks. It extracts stateful logic out of components so it can be reused and tested independently.

**Why custom hooks?**
- Components stay clean — they describe UI, not logic
- Logic can be reused across multiple components
- Logic can be tested in isolation

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

CSS Modules scope styles to a single component — `.card` here won't clash with `.card` anywhere else in the app. Vite compiles each class name to a unique identifier like `ListingCard_card__x7k2p`.

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
    // styles.card compiles to something like "ListingCard_card__x7k2p"
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

**Why CSS Modules over plain CSS?**
- No class name collisions — `.card` in one module never affects `.card` in another
- Dead code elimination — unused styles are removed at build time
- Explicit imports — you can see exactly which styles a component uses

---

## Tailwind CSS

Utility-first CSS — compose styles using small, single-purpose class names directly in JSX. Instead of writing `.card { border-radius: 12px; overflow: hidden; }`, you write `className="rounded-xl overflow-hidden"`.

**Why Tailwind?**
- No context switching between JSX and CSS files
- No naming things — no more `.card-wrapper-inner-container`
- Consistent design system — spacing, colors, and sizes come from a predefined scale
- Unused styles are automatically removed at build time (tiny CSS bundle)

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

Applying classes conditionally is a common pattern. There are several approaches — `clsx` is the most readable for complex cases.

```tsx
// Method 1: template literal — simple cases
<div className={`card ${isActive ? 'card--active' : ''}`}>

// Method 2: array join — multiple conditionals
<div className={['card', isActive && 'card--active', featured && 'card--featured'].filter(Boolean).join(' ')}>

// Method 3: clsx (recommended for complex cases)
// npm install clsx
import clsx from 'clsx'

<div className={clsx(
  'card',
  { 'card--active': isActive },
  { 'card--featured': superhost },
  price > 300 && 'card--luxury'
)}>
```

`clsx` handles all the edge cases — it ignores `false`, `null`, and `undefined` values, so you never get stray spaces or empty class names.

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
