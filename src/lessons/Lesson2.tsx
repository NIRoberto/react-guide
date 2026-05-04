import { useState } from 'react'
import { ArrowRight, BookOpen, Code2, Eye, Clock, BarChart2, Search, Heart } from 'lucide-react'
import { CodeBlock, ConceptCard, SectionTitle, LivePreview, AssignmentCard, levelColor, mockListings, ListingCard } from '../components/ui'

function Lesson2Preview() {
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState<number[]>([])
  const [savedOnly, setSavedOnly] = useState(false)

  const toggle = (id: number) =>
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const filtered = mockListings
    .filter(l => l.title.toLowerCase().includes(query.toLowerCase()) || l.location.toLowerCase().includes(query.toLowerCase()))
    .filter(l => savedOnly ? saved.includes(l.id) : true)

  return (
    <div>
      <div className="preview-toolbar">
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search listings..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button className={`filter-btn ${savedOnly ? 'active' : ''}`} onClick={() => setSavedOnly(s => !s)}>
          <Heart size={13} className="inline-icon" />
          Saved Only {saved.length > 0 && <span className="count-badge">{saved.length}</span>}
        </button>
      </div>
      <p className="results-count">{filtered.length} listing{filtered.length !== 1 ? 's' : ''} found</p>
      <div className="cards-grid">
        {filtered.map(l => (
          <ListingCard
            key={l.id}
            {...l}
            saved={saved.includes(l.id)}
            onToggleSave={() => toggle(l.id)}
          />
        ))}
        {filtered.length === 0 && (
          <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', padding: '24px 0' }}>
            No listings match your search.
          </p>
        )}
      </div>
    </div>
  )
}

export default function Lesson2({ onNext }: { onNext: () => void }) {
  return (
    <div className="lesson-content">
      <div className="lesson-header">
        <span className="phase-chip">Phase 1 — Foundations</span>
        <h1 className="lesson-heading">State and Events</h1>
        <p className="lesson-desc">
          Make your UI interactive with useState, handle user events, build controlled inputs,
          and manage lists — all demonstrated through a live searchable, filterable listings page.
        </p>
        <div className="lesson-meta">
          <span className="meta-pill"><Clock size={11} className="inline-icon" />~30 min</span>
          <span className="meta-pill" style={{ color: levelColor.Beginner }}>
            <BarChart2 size={11} className="inline-icon" />Beginner
          </span>
        </div>
      </div>

      <SectionTitle><BookOpen size={13} className="inline-icon" />Core Concepts</SectionTitle>
      <div className="concepts-grid">
        <ConceptCard
          title="useState"
          plain="useState is a hook that adds a reactive variable to your component. When you call the setter, React re-renders the component with the new value. State is local to the component unless lifted up."
          analogy="Like a whiteboard in the room — when you erase and rewrite it, everyone in the room sees the update instantly."
        />
        <ConceptCard
          title="State vs Props"
          plain="Props come from the parent and are read-only. State lives inside the component and can change. When state changes, the component re-renders. Props never change unless the parent re-renders with new values."
          analogy="Props are like your birth certificate — given to you, can't change. State is like your mood — internal, changes all the time."
        />
        <ConceptCard
          title="Controlled Inputs"
          plain="A controlled input has its value tied to state. Every keystroke calls onChange which updates state, which updates the input. React is the single source of truth — not the DOM."
          analogy="Like a live translator — every word you say is immediately transcribed and displayed."
        />
      </div>

      <SectionTitle><Code2 size={13} className="inline-icon" />useState Hook</SectionTitle>
      <CodeBlock filename="useState.tsx" language="tsx" code={`import { useState } from 'react'

function Counter() {
  // useState returns [currentValue, setterFunction]
  // 0 is the initial value
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>

      {/* Call setter directly with new value */}
      <button onClick={() => setCount(count + 1)}>+1</button>

      {/* Functional update — use when new state depends on old state */}
      <button onClick={() => setCount(prev => prev - 1)}>-1</button>

      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  )
}

// Multiple state variables — one useState per piece of state
function ListingPage() {
  const [query, setQuery] = useState('')          // string
  const [savedOnly, setSavedOnly] = useState(false) // boolean
  const [saved, setSaved] = useState<number[]>([]) // array
  const [price, setPrice] = useState(500)          // number
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Event Handlers</SectionTitle>
      <CodeBlock filename="events.tsx" language="tsx" code={`function SearchBar() {
  const [query, setQuery] = useState('')

  // onChange fires on every keystroke — e.target.value is the current input text
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  // onClick — fires when button is clicked
  const handleClear = () => setQuery('')

  // onSubmit — fires when form is submitted (Enter key or submit button)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()  // prevent page reload
    console.log('Searching for:', query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={query}           // controlled: value tied to state
        onChange={handleChange} // updates state on every keystroke
        placeholder="Search..."
      />
      <button type="button" onClick={handleClear}>Clear</button>
      <button type="submit">Search</button>
    </form>
  )
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Filtering Lists with State</SectionTitle>
      <CodeBlock filename="FilteredList.tsx" language="tsx" code={`function ListingsPage() {
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState<number[]>([])
  const [savedOnly, setSavedOnly] = useState(false)

  // Toggle an ID in/out of the saved array
  const toggleSave = (id: number) => {
    setSaved(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)  // remove if already saved
        : [...prev, id]               // add if not saved
    )
  }

  // Derived state — computed from existing state, no useState needed
  const filtered = listings
    .filter(l =>
      l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.location.toLowerCase().includes(query.toLowerCase())
    )
    .filter(l => savedOnly ? saved.includes(l.id) : true)

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." />

      <button onClick={() => setSavedOnly(s => !s)}>
        {savedOnly ? 'Show All' : 'Saved Only'} ({saved.length})
      </button>

      <p>{filtered.length} listings found</p>

      {filtered.map(l => (
        <ListingCard
          key={l.id}
          {...l}
          saved={saved.includes(l.id)}
          onToggleSave={() => toggleSave(l.id)}
        />
      ))}
    </div>
  )
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />How Re-renders Work</SectionTitle>
      <CodeBlock filename="rerenders.tsx" language="tsx" code={`// React re-renders a component when:
// 1. Its own state changes (setState called)
// 2. Its parent re-renders and passes new props
// 3. A context it subscribes to changes

// WRONG: mutating state directly — React won't detect the change
const [items, setItems] = useState([1, 2, 3])
items.push(4)          // React does NOT re-render
setItems(items)        // still won't work — same reference

// RIGHT: always return a new array/object
setItems([...items, 4])                    // add item
setItems(items.filter(x => x !== 2))       // remove item
setItems(items.map(x => x === 2 ? 99 : x)) // update item`} />

      <SectionTitle><Eye size={13} className="inline-icon" />Live Preview</SectionTitle>
      <LivePreview><Lesson2Preview /></LivePreview>

      <AssignmentCard
        goal="Add interactivity to your listings page — live search, favorite toggle, saved filter"
        tasks={[
          'Add a search input that filters listings by title and location as you type',
          'Add a heart button on each card that toggles it in/out of a saved array',
          'Show a saved count badge next to the "Saved Only" button',
          'Add a "Saved Only" toggle button that filters to only saved listings',
          'Show "X listings found" count that updates as filters change',
          'Handle the empty state — show a message when no listings match',
        ]}
        starterCode={`export default function App() {
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState<number[]>([])
  const [savedOnly, setSavedOnly] = useState(false)

  const toggleSave = (id: number) => {
    // TODO: add/remove id from saved array
  }

  const filtered = listings
    // TODO: filter by query (title + location)
    // TODO: filter by savedOnly

  return (
    <div>
      {/* TODO: search input */}
      {/* TODO: saved only button with count badge */}
      {/* TODO: results count */}
      {/* TODO: map filtered listings with ListingCard */}
      {/* TODO: empty state message */}
    </div>
  )
}`}
        expectedOutput="A searchable, filterable listings grid. Typing in the search box filters cards in real time. Clicking the heart saves/unsaves a card. The Saved Only button shows only saved listings. Count updates live."
      />

      <button className="next-btn" onClick={onNext}>
        Next Lesson <ArrowRight size={14} className="inline-icon" />
      </button>
    </div>
  )
}
