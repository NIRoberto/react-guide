import { useEffect, useRef, useContext, useReducer, createContext, useCallback, useMemo } from 'react'
import { ArrowRight, BookOpen, Code2, Eye, Clock, BarChart2 } from 'lucide-react'
import { CodeBlock, ConceptCard, SectionTitle, LivePreview, AssignmentCard, levelColor, mockListings, ListingCard } from '../components/ui'

// ── Favorites Context ─────────────────────────────────────────────────────────
const FavCtx = createContext<{
  saved: number[]
  toggle: (id: number) => void
  count: number
}>({ saved: [], toggle: () => {}, count: 0 })

// ── Reducer ───────────────────────────────────────────────────────────────────
type State = { listings: typeof mockListings; loading: boolean; filter: string; saved: number[] }
type Action =
  | { type: 'SET_LISTINGS'; payload: typeof mockListings }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: number }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LISTINGS': return { ...state, listings: action.payload }
    case 'SET_LOADING': return { ...state, loading: action.payload }
    case 'SET_FILTER': return { ...state, filter: action.payload }
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        saved: state.saved.includes(action.payload)
          ? state.saved.filter(id => id !== action.payload)
          : [...state.saved, action.payload],
      }
    default: return state
  }
}

function Lesson3Preview() {
  const [state, dispatch] = useReducer(reducer, {
    listings: [],
    loading: true,
    filter: '',
    saved: [],
  })

  const searchRef = useRef<HTMLInputElement>(null)

  // useEffect: simulate fetch on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'SET_LISTINGS', payload: mockListings })
      dispatch({ type: 'SET_LOADING', payload: false })
      searchRef.current?.focus()
    }, 1500)
    return () => clearTimeout(timer) // cleanup
  }, [])

  const favCtxValue = useMemo(() => ({
    saved: state.saved,
    toggle: (id: number) => dispatch({ type: 'TOGGLE_FAVORITE', payload: id }),
    count: state.saved.length,
  }), [state.saved])

  const filtered = useMemo(() =>
    state.listings.filter(l =>
      l.title.toLowerCase().includes(state.filter.toLowerCase())
    ), [state.listings, state.filter])

  const handleFilter = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_FILTER', payload: e.target.value })
  }, [])

  return (
    <FavCtx.Provider value={favCtxValue}>
      <div>
        {state.loading ? (
          <div className="spinner-wrap">
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Fetching listings...</p>
          </div>
        ) : (
          <>
            <div className="preview-toolbar">
              <input
                ref={searchRef}
                className="search-input"
                placeholder="Search (auto-focused via useRef)..."
                value={state.filter}
                onChange={handleFilter}
              />
              <FavoritesPanel />
            </div>
            <CardList listings={filtered} />
          </>
        )}
      </div>
    </FavCtx.Provider>
  )
}

function CardList({ listings }: { listings: typeof mockListings }) {
  const { saved, toggle } = useContext(FavCtx)
  return (
    <div className="cards-grid" style={{ marginTop: 16 }}>
      {listings.map(l => (
        <ListingCard
          key={l.id}
          {...l}
          saved={saved.includes(l.id)}
          onToggleSave={() => toggle(l.id)}
        />
      ))}
    </div>
  )
}

function FavoritesPanel() {
  const { count, saved } = useContext(FavCtx)
  return (
    <div className="fav-panel">
      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        Saved via Context:
      </span>
      <span className="count-badge" style={{ background: '#FF385C', color: '#fff' }}>{count}</span>
      {saved.length > 0 && (
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          IDs: {saved.join(', ')}
        </span>
      )}
    </div>
  )
}

export default function Lesson3({ onNext }: { onNext: () => void }) {
  return (
    <div className="lesson-content">
      <div className="lesson-header">
        <span className="phase-chip">Phase 2 — Hooks & Styling</span>
        <h1 className="lesson-heading">Core Hooks</h1>
        <p className="lesson-desc">
          Master useEffect, useRef, useContext, useReducer, useMemo, useCallback, and custom hooks —
          the tools that power every real React application.
        </p>
        <div className="lesson-meta">
          <span className="meta-pill"><Clock size={11} className="inline-icon" />~40 min</span>
          <span className="meta-pill" style={{ color: levelColor.Intermediate }}>
            <BarChart2 size={11} className="inline-icon" />Intermediate
          </span>
        </div>
      </div>

      <SectionTitle><BookOpen size={13} className="inline-icon" />Core Concepts</SectionTitle>
      <div className="concepts-grid">
        <ConceptCard
          title="useEffect"
          plain="Runs side effects after render — data fetching, subscriptions, DOM manipulation. The dependency array controls when it re-runs: [] = once on mount, [val] = when val changes, nothing = every render."
          analogy="Like setting an alarm — you define when it fires and what happens. The cleanup is like cancelling the alarm."
        />
        <ConceptCard
          title="useRef"
          plain="Holds a mutable value that persists across renders without causing re-renders. Two uses: accessing DOM elements directly (focus, scroll) and storing values that shouldn't trigger re-renders."
          analogy="Like a sticky note on your monitor — you can read/write it anytime without disrupting your work."
        />
        <ConceptCard
          title="useContext"
          plain="Reads a value from the nearest Context Provider above it in the tree. Avoids prop drilling — passing props through many layers just to reach a deeply nested component."
          analogy="Like a company-wide announcement — instead of passing a memo through every manager, you broadcast it and anyone can tune in."
        />
      </div>

      <SectionTitle><Code2 size={13} className="inline-icon" />useEffect Patterns</SectionTitle>
      <CodeBlock filename="useEffect.tsx" language="tsx" code={`import { useState, useEffect } from 'react'

function ListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Runs once on mount — empty dependency array []
  useEffect(() => {
    let cancelled = false  // cleanup flag to avoid state update on unmounted component

    async function fetchListings() {
      try {
        const res = await fetch('/api/listings')
        const data = await res.json()
        if (!cancelled) {
          setListings(data)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load listings')
      }
    }

    fetchListings()

    // Cleanup function — runs when component unmounts or before next effect
    return () => { cancelled = true }
  }, []) // [] = run once on mount only

  // Runs every time 'query' changes
  useEffect(() => {
    document.title = \`Search: \${query}\`
  }, [query])

  // Runs on every render (no dependency array) — usually avoid this
  useEffect(() => {
    console.log('Component rendered')
  })
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />useRef</SectionTitle>
      <CodeBlock filename="useRef.tsx" language="tsx" code={`import { useRef, useEffect } from 'react'

function SearchBar() {
  // ref.current holds the actual DOM element
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus the input when component mounts
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return <input ref={inputRef} placeholder="Auto-focused on mount" />
}

function Timer() {
  const [count, setCount] = useState(0)
  // Store interval ID without causing re-renders
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = () => {
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
  }

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  return (
    <div>
      <p>{count}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  )
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />useContext — Avoid Prop Drilling</SectionTitle>
      <CodeBlock filename="context.tsx" language="tsx" code={`import { createContext, useContext, useState } from 'react'

// 1. Create the context with a default value
const FavoritesContext = createContext<{
  saved: number[]
  toggle: (id: number) => void
}>({ saved: [], toggle: () => {} })

// 2. Create a Provider component that wraps your app
function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<number[]>([])

  const toggle = (id: number) =>
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  return (
    <FavoritesContext.Provider value={{ saved, toggle }}>
      {children}
    </FavoritesContext.Provider>
  )
}

// 3. Any component in the tree can read from context — no prop drilling
function ListingCard({ id }: { id: number }) {
  const { saved, toggle } = useContext(FavoritesContext)
  return (
    <button onClick={() => toggle(id)}>
      {saved.includes(id) ? 'Unsave' : 'Save'}
    </button>
  )
}

// 4. Wrap your app with the Provider
function App() {
  return (
    <FavoritesProvider>
      <ListingsPage />  {/* ListingCard deep inside can access context */}
    </FavoritesProvider>
  )
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />useReducer — Complex State</SectionTitle>
      <CodeBlock filename="useReducer.tsx" language="tsx" code={`import { useReducer } from 'react'

// 1. Define your state shape
type State = {
  listings: Listing[]
  loading: boolean
  filter: string
  saved: number[]
}

// 2. Define all possible actions
type Action =
  | { type: 'SET_LISTINGS'; payload: Listing[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: number }

// 3. Pure reducer function — takes state + action, returns new state
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
    default: return state
  }
}

// 4. Use it in your component
function ListingsPage() {
  const [state, dispatch] = useReducer(reducer, {
    listings: [], loading: true, filter: '', saved: [],
  })

  // Dispatch an action instead of calling multiple setters
  dispatch({ type: 'SET_FILTER', payload: 'Bali' })
  dispatch({ type: 'TOGGLE_FAVORITE', payload: 3 })
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Custom Hooks</SectionTitle>
      <CodeBlock filename="customHooks.tsx" language="tsx" code={`// Custom hooks are just functions that start with 'use' and call other hooks
// They let you extract and reuse stateful logic across components

// useListings — handles fetch, loading, error, and refresh
function useListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/listings')
      setListings(await res.json())
    } catch {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  return { listings, loading, error, refresh: fetch }
}

// useFavorites — handles saved state and toggle logic
function useFavorites() {
  const [saved, setSaved] = useState<number[]>([])

  const toggleFavorite = (id: number) =>
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  return { saved, toggleFavorite, count: saved.length }
}

// Usage — clean component, logic lives in hooks
function ListingsPage() {
  const { listings, loading, error, refresh } = useListings()
  const { saved, toggleFavorite, count } = useFavorites()

  if (loading) return <Spinner />
  if (error) return <p>{error}</p>

  return (
    <div>
      <p>{count} saved</p>
      <button onClick={refresh}>Refresh</button>
      {listings.map(l => (
        <ListingCard key={l.id} {...l}
          saved={saved.includes(l.id)}
          onToggleSave={() => toggleFavorite(l.id)}
        />
      ))}
    </div>
  )
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />useMemo & useCallback</SectionTitle>
      <CodeBlock filename="memoization.tsx" language="tsx" code={`import { useMemo, useCallback } from 'react'

function ListingsPage({ listings, query, saved }) {
  // useMemo — memoize expensive computation
  // Only re-runs when listings or query changes, not on every render
  const filtered = useMemo(() =>
    listings.filter(l =>
      l.title.toLowerCase().includes(query.toLowerCase())
    ),
    [listings, query]  // dependencies
  )

  // useCallback — memoize a function reference
  // Without this, a new function is created on every render
  // causing child components that receive it as a prop to re-render unnecessarily
  const handleToggle = useCallback((id: number) => {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }, [])  // no dependencies — function never changes

  return (
    <div>
      {filtered.map(l => (
        // handleToggle reference is stable — ListingCard won't re-render unnecessarily
        <ListingCard key={l.id} {...l} onToggleSave={() => handleToggle(l.id)} />
      ))}
    </div>
  )
}`} />

      <SectionTitle><Eye size={13} className="inline-icon" />Live Preview</SectionTitle>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
        Loads with a 1.5s simulated fetch (useEffect), auto-focuses search (useRef), favorites managed via Context, state via useReducer.
      </p>
      <LivePreview><Lesson3Preview /></LivePreview>

      <AssignmentCard
        goal="Refactor your listings app to use useReducer, Context, and custom hooks"
        tasks={[
          'Create a FavoritesContext with a Provider that wraps your app',
          'Move all state into a useReducer with actions: SET_FILTER, TOGGLE_FAVORITE, SET_LOADING, SET_LISTINGS',
          'Extract a useListings() custom hook that handles simulated fetch + loading + error',
          'Extract a useFavorites() custom hook that reads from FavoritesContext',
          'Add a SavedListings panel component that reads saved IDs from context and displays them',
          'Use useRef to auto-focus the search input on mount',
          'Wrap your filtered computation in useMemo',
        ]}
        starterCode={`// 1. Create context
const FavoritesContext = createContext({ saved: [], toggle: () => {} })

// 2. Reducer
function reducer(state, action) {
  switch (action.type) {
    case 'SET_LISTINGS': // TODO
    case 'SET_LOADING':  // TODO
    case 'SET_FILTER':   // TODO
    case 'TOGGLE_FAVORITE': // TODO
    default: return state
  }
}

// 3. Custom hooks
function useListings() {
  // TODO: useEffect to simulate fetch, return { listings, loading, error, refresh }
}

function useFavorites() {
  // TODO: read from FavoritesContext, return { saved, toggle, count }
}

// 4. SavedListings panel
function SavedListings() {
  const { saved } = useFavorites()
  // TODO: render saved listing IDs or cards
}

// 5. App
export default function App() {
  const [state, dispatch] = useReducer(reducer, { listings: [], loading: true, filter: '', saved: [] })
  // TODO: wrap in FavoritesContext.Provider
  // TODO: use useListings and useFavorites
}`}
        expectedOutput="App loads with spinner, listings appear after 1.5s, search auto-focused, favorites shared via context, SavedListings panel shows saved cards."
      />

      <button className="next-btn" onClick={onNext}>
        Next Lesson <ArrowRight size={14} className="inline-icon" />
      </button>
    </div>
  )
}
