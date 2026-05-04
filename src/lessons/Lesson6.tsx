import { useState, useRef, memo, useMemo } from 'react'
import { ArrowRight, BookOpen, Code2, Eye, Clock, BarChart2, Zap } from 'lucide-react'
import { CodeBlock, ConceptCard, SectionTitle, LivePreview, AssignmentCard, levelColor, mockListings, ListingCard } from '../components/ui'

// ── Zustand-like store pattern ────────────────────────────────────────────────
type StoreState = { saved: number[]; filter: string }
type StoreActions = { toggle: (id: number) => void; setFilter: (f: string) => void; reset: () => void }

let _state: StoreState = { saved: [], filter: '' }
const _listeners = new Set<() => void>()

function createStore() {
  const getState = () => _state
  const setState = (partial: Partial<StoreState>) => {
    _state = { ..._state, ...partial }
    _listeners.forEach(l => l())
  }
  const subscribe = (listener: () => void) => {
    _listeners.add(listener)
    return () => _listeners.delete(listener)
  }
  return { getState, setState, subscribe }
}

const store = createStore()

function useStore<T>(selector: (s: StoreState) => T): T {
  const [, forceRender] = useState(0)
  const selected = useRef(selector(store.getState()))

  store.subscribe(() => {
    const next = selector(store.getState())
    if (next !== selected.current) {
      selected.current = next
      forceRender(n => n + 1)
    }
  })

  return selector(store.getState())
}

const actions: StoreActions = {
  toggle: (id) => {
    const { saved } = store.getState()
    store.setState({ saved: saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id] })
  },
  setFilter: (filter) => store.setState({ filter }),
  reset: () => store.setState({ saved: [], filter: '' }),
}

// ── React.memo demo ───────────────────────────────────────────────────────────
let renderCount = 0

const MemoCard = memo(function MemoCard({ title, price }: { title: string; price: number }) {
  renderCount++
  return (
    <div className="memo-card">
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{title}</span>
      <span style={{ fontSize: 12, color: '#FF385C' }}>${price}</span>
      <span className="render-badge">render #{renderCount}</span>
    </div>
  )
})

function NonMemoCard({ title, price }: { title: string; price: number }) {
  renderCount++
  return (
    <div className="memo-card" style={{ borderColor: '#f97316' }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{title}</span>
      <span style={{ fontSize: 12, color: '#FF385C' }}>${price}</span>
      <span className="render-badge" style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>render #{renderCount}</span>
    </div>
  )
}

// ── Virtualized list ──────────────────────────────────────────────────────────
const ITEM_HEIGHT = 56
const VISIBLE_COUNT = 6

const bigList = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: mockListings[i % mockListings.length].title,
  location: mockListings[i % mockListings.length].location,
  price: mockListings[i % mockListings.length].price,
}))

function VirtualList() {
  const [scrollTop, setScrollTop] = useState(0)
  const startIndex = Math.floor(scrollTop / ITEM_HEIGHT)
  const endIndex = Math.min(startIndex + VISIBLE_COUNT + 1, bigList.length)
  const visibleItems = bigList.slice(startIndex, endIndex)

  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
        50 items — only {VISIBLE_COUNT} rendered at a time (virtualized)
      </p>
      <div
        style={{ height: ITEM_HEIGHT * VISIBLE_COUNT, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}
        onScroll={e => setScrollTop((e.target as HTMLDivElement).scrollTop)}
      >
        <div style={{ height: bigList.length * ITEM_HEIGHT, position: 'relative' }}>
          {visibleItems.map((item, i) => (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                top: (startIndex + i) * ITEM_HEIGHT,
                left: 0, right: 0, height: ITEM_HEIGHT,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 16px', borderBottom: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              <span style={{ fontSize: 13 }}>#{item.id} {item.title}</span>
              <span style={{ fontSize: 12, color: '#FF385C' }}>${item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Lesson6Preview() {
  const [counter, setCounter] = useState(0)
  const saved = useStore(s => s.saved)
  const filter = useStore(s => s.filter)

  const filtered = useMemo(() =>
    mockListings.filter(l => l.title.toLowerCase().includes(filter.toLowerCase())),
    [filter]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Zustand store demo */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Zustand-like Global Store
        </p>
        <div className="preview-toolbar" style={{ marginBottom: 12 }}>
          <input
            className="search-input"
            placeholder="Filter via store..."
            value={filter}
            onChange={e => actions.setFilter(e.target.value)}
          />
          <span className="count-badge" style={{ background: '#FF385C', color: '#fff' }}>{saved.length} saved</span>
          <button className="filter-btn" onClick={actions.reset}>Reset</button>
        </div>
        <div className="cards-grid">
          {filtered.slice(0, 3).map(l => (
            <ListingCard key={l.id} {...l} saved={saved.includes(l.id)} onToggleSave={() => actions.toggle(l.id)} />
          ))}
        </div>
      </div>

      {/* React.memo demo */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          React.memo — Counter increments, memo card does NOT re-render
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <button className="filter-btn active" onClick={() => setCounter(c => c + 1)}>
            <Zap size={12} className="inline-icon" />Counter: {counter}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <p style={{ fontSize: 11, color: '#22c55e', marginBottom: 6 }}>With React.memo</p>
            <MemoCard title="Bali Villa" price={185} />
          </div>
          <div>
            <p style={{ fontSize: 11, color: '#f97316', marginBottom: 6 }}>Without memo</p>
            <NonMemoCard title="NYC Loft" price={240} />
          </div>
        </div>
      </div>

      {/* Virtualization */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Virtualized List — 50 items, only visible ones rendered
        </p>
        <VirtualList />
      </div>
    </div>
  )
}

export default function Lesson6({ onNext }: { onNext: () => void }) {
  return (
    <div className="lesson-content">
      <div className="lesson-header">
        <span className="phase-chip">Phase 3 — Advanced</span>
        <h1 className="lesson-heading">State Management & Performance</h1>
        <p className="lesson-desc">
          Scale your state with Zustand, prevent unnecessary re-renders with React.memo,
          split code with lazy loading, and handle long lists with virtualization.
        </p>
        <div className="lesson-meta">
          <span className="meta-pill"><Clock size={11} className="inline-icon" />~40 min</span>
          <span className="meta-pill" style={{ color: levelColor.Advanced }}>
            <BarChart2 size={11} className="inline-icon" />Advanced
          </span>
        </div>
      </div>

      <SectionTitle><BookOpen size={13} className="inline-icon" />Core Concepts</SectionTitle>
      <div className="concepts-grid">
        <ConceptCard
          title="Zustand"
          plain="A minimal global state library. You define a store with state and actions. Any component can subscribe to slices of the store — only re-renders when its subscribed slice changes."
          analogy="Like a shared Google Doc — anyone can read or edit, and only people watching the changed section get notified."
        />
        <ConceptCard
          title="React.memo"
          plain="Wraps a component so it only re-renders when its props actually change. Without it, a component re-renders every time its parent re-renders — even if its own props didn't change."
          analogy="Like a smart employee who only acts when their specific task changes — ignores unrelated office noise."
        />
        <ConceptCard
          title="Virtualization"
          plain="Instead of rendering all 1000 list items in the DOM, only render the ones visible in the viewport. As the user scrolls, items are swapped in/out. Massive performance win for long lists."
          analogy="Like a restaurant menu that only shows the page you're on — the rest exists but isn't printed until you flip."
        />
      </div>

      <SectionTitle><Code2 size={13} className="inline-icon" />Zustand Setup</SectionTitle>
      <CodeBlock filename="store.ts" language="ts" code={`// npm install zustand
import { create } from 'zustand'

interface StoreState {
  saved: number[]
  filter: string
  toggle: (id: number) => void
  setFilter: (filter: string) => void
  reset: () => void
}

// create() defines your store — state + actions in one object
export const useStore = create<StoreState>((set) => ({
  // Initial state
  saved: [],
  filter: '',

  // Actions — call set() to update state
  toggle: (id) => set((state) => ({
    saved: state.saved.includes(id)
      ? state.saved.filter(x => x !== id)
      : [...state.saved, id],
  })),

  setFilter: (filter) => set({ filter }),

  reset: () => set({ saved: [], filter: '' }),
}))`} />

      <CodeBlock filename="ListingsPage.tsx" language="tsx" code={`import { useStore } from './store'

function ListingsPage() {
  // Subscribe to only the slice you need — component only re-renders when that slice changes
  const saved = useStore(state => state.saved)
  const filter = useStore(state => state.filter)
  const toggle = useStore(state => state.toggle)
  const setFilter = useStore(state => state.setFilter)

  const filtered = listings.filter(l =>
    l.title.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      {filtered.map(l => (
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

// Any other component can access the same store
function SavedCount() {
  const count = useStore(state => state.saved.length)
  return <span>{count} saved</span>
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />React.memo</SectionTitle>
      <CodeBlock filename="memo.tsx" language="tsx" code={`import { memo, useCallback } from 'react'

// Without memo — re-renders every time parent re-renders
function ListingCard({ title, price, onToggle }: Props) {
  console.log('ListingCard rendered:', title)
  return <div onClick={onToggle}>{title} - \${price}</div>
}

// With memo — only re-renders when title, price, or onToggle changes
const ListingCard = memo(function ListingCard({ title, price, onToggle }: Props) {
  console.log('ListingCard rendered:', title)
  return <div onClick={onToggle}>{title} - \${price}</div>
})

function ListingsPage() {
  const [counter, setCounter] = useState(0)

  // Without useCallback — new function reference on every render
  // This breaks memo because onToggle prop "changes" every render
  const handleToggle = (id: number) => toggle(id)  // BAD with memo

  // With useCallback — stable function reference, memo works correctly
  const handleToggle = useCallback((id: number) => toggle(id), [toggle])  // GOOD

  return (
    <div>
      <button onClick={() => setCounter(c => c + 1)}>Counter: {counter}</button>
      {/* ListingCard will NOT re-render when counter changes — props unchanged */}
      <ListingCard title="Bali Villa" price={185} onToggle={() => handleToggle(1)} />
    </div>
  )
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Virtualization with react-window</SectionTitle>
      <CodeBlock filename="VirtualList.tsx" language="tsx" code={`// npm install react-window
import { FixedSizeList } from 'react-window'

const listings = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  title: \`Listing #\${i + 1}\`,
  price: Math.floor(Math.random() * 500) + 50,
}))

// Row component — receives index and style from react-window
function Row({ index, style }: { index: number; style: React.CSSProperties }) {
  const item = listings[index]
  return (
    // style MUST be applied — it positions the row absolutely
    <div style={style} className="list-row">
      <span>{item.title}</span>
      <span>\${item.price}</span>
    </div>
  )
}

function VirtualListings() {
  return (
    // Only renders ~10 rows at a time regardless of list size
    <FixedSizeList
      height={400}       // visible height of the list container
      itemCount={1000}   // total number of items
      itemSize={60}      // height of each row in px
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}`} />

      <SectionTitle><Eye size={13} className="inline-icon" />Live Preview</SectionTitle>
      <LivePreview><Lesson6Preview /></LivePreview>

      <AssignmentCard
        goal="Add a Zustand store, React.memo optimization, and virtualized list to your app"
        tasks={[
          'Install zustand and create a store with saved, filter, toggle, setFilter, reset',
          'Replace all useState for saved/filter with useStore selectors',
          'Wrap ListingCard with React.memo',
          'Wrap the toggle handler with useCallback so memo works correctly',
          'Generate a list of 50 listings and implement manual virtualization (render only visible items)',
          'Add console.log inside ListingCard to verify it does not re-render when unrelated state changes',
          'Bonus: install react-window and replace manual virtualization with FixedSizeList',
        ]}
        starterCode={`// store.ts
import { create } from 'zustand'

export const useStore = create((set) => ({
  saved: [],
  filter: '',
  // TODO: toggle action
  // TODO: setFilter action
  // TODO: reset action
}))

// ListingCard.tsx — wrap with memo
const ListingCard = memo(function ListingCard({ title, price, onToggle }) {
  // TODO: render card
})

// App.tsx
export default function App() {
  const saved = useStore(s => s.saved)
  const filter = useStore(s => s.filter)
  const toggle = useStore(s => s.toggle)

  // TODO: useCallback for toggle handler
  // TODO: useMemo for filtered list
  // TODO: render virtualized list of 50 items
}`}
        expectedOutput="Global store powers saved/filter state. ListingCard only re-renders when its own props change. A scrollable list of 50 items renders only visible rows."
      />

      <button className="next-btn" onClick={onNext}>
        Next Lesson <ArrowRight size={14} className="inline-icon" />
      </button>
    </div>
  )
}
