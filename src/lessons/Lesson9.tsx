import { useState, createContext, useContext } from 'react'
import { ArrowRight, BookOpen, Code2, Eye, Clock, BarChart2, Lock, User } from 'lucide-react'
import { CodeBlock, ConceptCard, SectionTitle, LivePreview, AssignmentCard, levelColor, mockListings } from '../components/ui'

// ── withAuth HOC ──────────────────────────────────────────────────────────────
function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthGuard(props: P & { isAuthenticated: boolean }) {
    const { isAuthenticated, ...rest } = props
    if (!isAuthenticated) {
      return (
        <div className="hoc-blocked">
          <Lock size={20} style={{ color: '#FF385C', marginBottom: 8 }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Login required to view this component</p>
        </div>
      )
    }
    return <Component {...(rest as P)} />
  }
}

function Dashboard() {
  return (
    <div className="dashboard-card">
      <User size={24} style={{ color: '#FF385C', marginBottom: 8 }} />
      <p style={{ fontSize: 14, fontWeight: 600 }}>Welcome to your Dashboard</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>You are authenticated.</p>
    </div>
  )
}

const ProtectedDashboard = withAuth(Dashboard)

// ── Compound Component ────────────────────────────────────────────────────────
const CardCtx = createContext<{ title: string; price: number; img: string; superhost: boolean }>({
  title: '', price: 0, img: '', superhost: false,
})

function Card({ children, listing }: { children: React.ReactNode; listing: typeof mockListings[0] }) {
  return (
    <CardCtx.Provider value={listing}>
      <div className="listing-card">{children}</div>
    </CardCtx.Provider>
  )
}

Card.Image = function CardImage() {
  const { img, title } = useContext(CardCtx)
  return (
    <div className="listing-img-wrap">
      <img src={img} alt={title} className="listing-img" />
    </div>
  )
}

Card.Title = function CardTitle() {
  const { title } = useContext(CardCtx)
  return <h4 className="listing-title" style={{ padding: '8px 12px 0' }}>{title}</h4>
}

Card.Price = function CardPrice() {
  const { price } = useContext(CardCtx)
  return <p className="listing-price" style={{ padding: '4px 12px 12px' }}><strong>${price}</strong> / night</p>
}

Card.Badge = function CardBadge() {
  const { superhost } = useContext(CardCtx)
  if (!superhost) return null
  return <span className="superhost-badge" style={{ position: 'absolute', top: 8, left: 8 }}>Superhost</span>
}

function Lesson9Preview() {
  const [isAuth, setIsAuth] = useState(false)
  const listing = mockListings[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* HOC Demo */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          HOC — withAuth(Dashboard)
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <button className={`filter-btn ${isAuth ? 'active' : ''}`} onClick={() => setIsAuth(a => !a)}>
            {isAuth ? 'Logout' : 'Login'}
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>isAuthenticated: {String(isAuth)}</span>
        </div>
        <ProtectedDashboard isAuthenticated={isAuth} />
      </div>

      {/* Compound Component Demo */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Compound Component — Card with sub-components
        </p>
        <div style={{ maxWidth: 220 }}>
          <Card listing={listing}>
            <Card.Image />
            <Card.Title />
            <Card.Price />
          </Card>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>
          Consumer controls which sub-components to render and in what order.
        </p>
      </div>
    </div>
  )
}

export default function Lesson9({ onNext }: { onNext: () => void }) {
  return (
    <div className="lesson-content">
      <div className="lesson-header">
        <span className="phase-chip">Phase 5 — Patterns & TypeScript</span>
        <h1 className="lesson-heading">Advanced Patterns & TypeScript</h1>
        <p className="lesson-desc">
          Master HOCs, compound components, render props, and the provider pattern —
          then type everything properly with TypeScript interfaces, generics, and event types.
        </p>
        <div className="lesson-meta">
          <span className="meta-pill"><Clock size={11} className="inline-icon" />~45 min</span>
          <span className="meta-pill" style={{ color: levelColor.Expert }}>
            <BarChart2 size={11} className="inline-icon" />Expert
          </span>
        </div>
      </div>

      <SectionTitle><BookOpen size={13} className="inline-icon" />Core Concepts</SectionTitle>
      <div className="concepts-grid">
        <ConceptCard
          title="Higher-Order Components"
          plain="A function that takes a component and returns a new enhanced component. Used for cross-cutting concerns: auth guards, loading wrappers, analytics tracking. Largely replaced by hooks but still common."
          analogy="Like a security badge machine — you feed in any employee, it wraps them with an access card."
        />
        <ConceptCard
          title="Compound Components"
          plain="A pattern where a parent component shares implicit state with its children via Context. Children are attached as properties of the parent (Card.Image, Card.Title). Gives consumers flexible composition."
          analogy="Like a HTML select/option relationship — select manages state, option just declares itself."
        />
        <ConceptCard
          title="TypeScript in React"
          plain="Type your props with interfaces, type useState with generics, type events with React.ChangeEvent and React.MouseEvent. Generic components work like generic functions — reusable across types."
          analogy="Like labelling every box in a warehouse — you always know what's inside without opening it."
        />
      </div>

      <SectionTitle><Code2 size={13} className="inline-icon" />Higher-Order Components (HOC)</SectionTitle>
      <CodeBlock filename="withAuth.tsx" language="tsx" code={`// HOC: a function that takes a component and returns an enhanced version
function withAuth<P extends object>(Component: React.ComponentType<P>) {
  // Return a new component with the same props + isAuthenticated
  return function AuthGuard(props: P & { isAuthenticated: boolean }) {
    const { isAuthenticated, ...rest } = props

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }

    // Pass through all original props
    return <Component {...(rest as P)} />
  }
}

// withLoading HOC — shows spinner while loading
function withLoading<P extends object>(Component: React.ComponentType<P>) {
  return function WithLoading(props: P & { isLoading: boolean }) {
    const { isLoading, ...rest } = props
    if (isLoading) return <Spinner />
    return <Component {...(rest as P)} />
  }
}

// Usage — wrap any component
const ProtectedDashboard = withAuth(Dashboard)
const ListingsWithLoading = withLoading(ListingsGrid)

function App() {
  return (
    <>
      <ProtectedDashboard isAuthenticated={user !== null} />
      <ListingsWithLoading isLoading={loading} listings={data} />
    </>
  )
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Compound Components</SectionTitle>
      <CodeBlock filename="Card.tsx" language="tsx" code={`import { createContext, useContext } from 'react'

// 1. Create context to share state between parent and sub-components
const CardContext = createContext<{ listing: Listing } | null>(null)

function useCard() {
  const ctx = useContext(CardContext)
  if (!ctx) throw new Error('useCard must be used inside <Card>')
  return ctx
}

// 2. Parent component — provides context
function Card({ listing, children }: { listing: Listing; children: React.ReactNode }) {
  return (
    <CardContext.Provider value={{ listing }}>
      <div className="card">{children}</div>
    </CardContext.Provider>
  )
}

// 3. Sub-components — consume context, no props needed
Card.Image = function CardImage() {
  const { listing } = useCard()
  return <img src={listing.img} alt={listing.title} className="card-img" />
}

Card.Title = function CardTitle() {
  const { listing } = useCard()
  return <h3 className="card-title">{listing.title}</h3>
}

Card.Price = function CardPrice() {
  const { listing } = useCard()
  return <p><strong>\${listing.price}</strong> / night</p>
}

Card.Badge = function CardBadge() {
  const { listing } = useCard()
  if (!listing.superhost) return null
  return <span className="badge">Superhost</span>
}

// 4. Consumer controls composition — flexible, no prop drilling
function ListingsPage() {
  return (
    <Card listing={myListing}>
      <Card.Image />
      <Card.Badge />
      <Card.Title />
      <Card.Price />
      {/* Can omit any sub-component, reorder them, add custom content between */}
    </Card>
  )
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />TypeScript — Typing Props & Hooks</SectionTitle>
      <CodeBlock filename="types.ts" language="ts" code={`// Interface vs Type — both work, interface is preferred for objects
interface Listing {
  id: number
  title: string
  location: string
  price: number
  rating: number
  superhost: boolean
  img: string
}

// Props interface — always define for components
interface ListingCardProps {
  listing: Listing
  saved?: boolean                          // optional prop
  onToggleSave?: (id: number) => void      // optional callback
  className?: string
}

// Typing useState
const [listings, setListings] = useState<Listing[]>([])
const [selected, setSelected] = useState<Listing | null>(null)
const [count, setCount] = useState<number>(0)

// Typing useReducer
type Action =
  | { type: 'SET_LISTINGS'; payload: Listing[] }
  | { type: 'TOGGLE_SAVE'; payload: number }

function reducer(state: State, action: Action): State {
  // TypeScript narrows action.type in each case
  switch (action.type) {
    case 'SET_LISTINGS': return { ...state, listings: action.payload }
    case 'TOGGLE_SAVE': return { ...state }
    default: return state
  }
}

// Typing event handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setQuery(e.target.value)
}

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault()
}

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Generic Components</SectionTitle>
      <CodeBlock filename="generic.tsx" language="tsx" code={`// Generic component — works with any data type
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string | number
  emptyMessage?: string
}

function List<T>({ items, renderItem, keyExtractor, emptyMessage = 'No items' }: ListProps<T>) {
  if (items.length === 0) return <p>{emptyMessage}</p>
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}

// Usage — TypeScript infers T from items
<List
  items={listings}                          // T = Listing
  keyExtractor={l => l.id}
  renderItem={l => <ListingCard listing={l} />}
  emptyMessage="No listings found"
/>

<List
  items={['Bali', 'NYC', 'Malibu']}        // T = string
  keyExtractor={s => s}
  renderItem={s => <span>{s}</span>}
/>`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Typing Custom Hooks</SectionTitle>
      <CodeBlock filename="useListings.ts" language="ts" code={`// Define the return type explicitly for clarity
interface UseListingsReturn {
  listings: Listing[]
  loading: boolean
  error: string | null
  refresh: () => void
  total: number
}

function useListings(): UseListingsReturn {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await fetchListings()
      setListings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  return { listings, loading, error, refresh, total: listings.length }
}

// Usage — fully typed, IDE autocomplete works perfectly
function ListingsPage() {
  const { listings, loading, error, refresh, total } = useListings()
  // TypeScript knows: listings is Listing[], loading is boolean, etc.
}`} />

      <SectionTitle><Eye size={13} className="inline-icon" />Live Preview</SectionTitle>
      <LivePreview><Lesson9Preview /></LivePreview>

      <AssignmentCard
        goal="Refactor your app using HOCs, compound components, and full TypeScript types"
        tasks={[
          'Build a withAuth HOC that wraps Dashboard and redirects to /login if not authenticated',
          'Refactor ListingCard into a compound component: Card, Card.Image, Card.Title, Card.Price, Card.Badge',
          'Write TypeScript interfaces for Listing, ListingCardProps, BookingFormData, and StoreState',
          'Type all useState and useReducer calls with explicit generics',
          'Type all event handlers with React.ChangeEvent, React.MouseEvent, React.FormEvent',
          'Create a generic List<T> component and use it for listings and saved items',
          'Add return type annotations to all custom hooks',
        ]}
        starterCode={`// types.ts
export interface Listing {
  id: number
  title: string
  location: string
  price: number
  rating: number
  superhost: boolean
  img: string
}

export interface ListingCardProps {
  listing: Listing
  saved?: boolean
  onToggleSave?: (id: number) => void
}

// withAuth.tsx
function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthGuard(props: P & { isAuthenticated: boolean }) {
    // TODO: redirect if not authenticated
    return <Component {...(props as P)} />
  }
}

// Card.tsx — compound component
const CardContext = createContext<{ listing: Listing } | null>(null)

function Card({ listing, children }: { listing: Listing; children: React.ReactNode }) {
  // TODO: provide context
}

Card.Image = function CardImage() {
  // TODO: consume context, render image
}

Card.Title = function CardTitle() {
  // TODO: consume context, render title
}`}
        expectedOutput="Dashboard protected by withAuth HOC. ListingCard rebuilt as compound component with flexible sub-component composition. All props, state, and hooks fully typed with TypeScript."
      />

      <button className="next-btn" onClick={onNext}>
        Next Lesson <ArrowRight size={14} className="inline-icon" />
      </button>
    </div>
  )
}
