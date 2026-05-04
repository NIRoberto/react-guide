# Phase 5: Modern Patterns & TypeScript

## Table of Contents
1. [Higher-Order Components (HOCs)](#higher-order-components-hocs)
2. [Compound Components](#compound-components)
3. [Render Props Pattern](#render-props-pattern)
4. [Provider Pattern](#provider-pattern)
5. [TypeScript — Types vs Interfaces](#typescript--types-vs-interfaces)
6. [Typing Component Props](#typing-component-props)
7. [Typing useState & useReducer](#typing-usestate--usereducer)
8. [Typing Events](#typing-events)
9. [Typing Custom Hooks](#typing-custom-hooks)
10. [Generic Components](#generic-components)
11. [Assignment](#assignment)

---

## Higher-Order Components (HOCs)

A Higher-Order Component is a function that takes a component and returns a new, enhanced component. It's a pattern for reusing component logic — specifically for **cross-cutting concerns**: logic that needs to be applied to many components without modifying each one.

**Common use cases:** auth guards, loading wrappers, analytics tracking, error boundaries.

```tsx
// withAuth — redirects to login if not authenticated
// P extends object — P is the props type of the wrapped component
function withAuth<P extends object>(Component: React.ComponentType<P>) {
  // Returns a new component that accepts P's props plus isAuthenticated
  return function AuthGuard(props: P & { isAuthenticated: boolean }) {
    const { isAuthenticated, ...rest } = props

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }

    // Pass through all original props to the wrapped component
    return <Component {...(rest as P)} />
  }
}

// withLoading — shows a spinner while data is loading
function withLoading<P extends object>(Component: React.ComponentType<P>) {
  return function WithLoading(props: P & { isLoading: boolean }) {
    const { isLoading, ...rest } = props
    if (isLoading) return <div className="spinner" />
    return <Component {...(rest as P)} />
  }
}

// withErrorBoundary — wraps component in an error boundary
function withErrorBoundary<P extends object>(Component: React.ComponentType<P>) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Compose HOCs — apply multiple enhancements
// Read right-to-left: Dashboard is first wrapped with withLoading, then withAuth
const ProtectedDashboard = withAuth(withLoading(Dashboard))

function App() {
  return (
    <ProtectedDashboard
      isAuthenticated={user !== null}
      isLoading={loading}
    />
  )
}
```

### When to Use HOCs

HOCs are largely replaced by hooks in modern React. Use them when:
- You need to wrap a component with a Provider or boundary (structural wrapping)
- You're working with class components (legacy code)
- The enhancement is purely structural (redirecting, wrapping)

For logic reuse, prefer custom hooks — they're simpler, more composable, and easier to type.

---

## Compound Components

The compound component pattern lets a parent component share implicit state with its children via Context. Children are attached as static properties of the parent (`Card.Image`, `Card.Title`). The consumer controls which sub-components to render and in what order — giving maximum flexibility without prop drilling.

**The problem it solves:** A `ListingCard` component that accepts 10 props for every possible layout variation becomes hard to maintain. Compound components let the consumer compose the layout themselves.

```tsx
import { createContext, useContext } from 'react'

// 1. Create context — shared state between parent and sub-components
interface CardContextType {
  listing: Listing
}

const CardContext = createContext<CardContextType | null>(null)

// Custom hook with error boundary — throws if used outside <Card>
function useCard() {
  const ctx = useContext(CardContext)
  if (!ctx) throw new Error('useCard must be used inside <Card>')
  return ctx
}

// 2. Parent component — provides context, renders children
function Card({ listing, children }: { listing: Listing; children: React.ReactNode }) {
  return (
    <CardContext.Provider value={{ listing }}>
      <div className="card">{children}</div>
    </CardContext.Provider>
  )
}

// 3. Sub-components — consume context, no props needed
// They read the listing from context automatically
Card.Image = function CardImage() {
  const { listing } = useCard()
  return <img src={listing.img} alt={listing.title} className="card-img" />
}

Card.Title = function CardTitle() {
  const { listing } = useCard()
  return <h3 className="card-title">{listing.title}</h3>
}

Card.Location = function CardLocation() {
  const { listing } = useCard()
  return <p className="card-location">{listing.location}</p>
}

Card.Price = function CardPrice() {
  const { listing } = useCard()
  return <p><strong>${listing.price}</strong> / night</p>
}

Card.Rating = function CardRating() {
  const { listing } = useCard()
  return <span>★ {listing.rating}</span>
}

Card.Badge = function CardBadge() {
  const { listing } = useCard()
  if (!listing.superhost) return null
  return <span className="badge">Superhost</span>
}

// 4. Consumer controls composition — flexible, no prop drilling
// Standard layout
function ListingsGrid({ listings }: { listings: Listing[] }) {
  return (
    <div className="grid">
      {listings.map(listing => (
        <Card key={listing.id} listing={listing}>
          <Card.Image />
          <Card.Badge />
          <Card.Location />
          <Card.Title />
          <Card.Price />
          <Card.Rating />
        </Card>
      ))}
    </div>
  )
}

// Different layout — same components, different order, different sub-components
function FeaturedCard({ listing }: { listing: Listing }) {
  return (
    <Card listing={listing}>
      <Card.Badge />
      <Card.Image />
      <Card.Title />
      <Card.Price />
      {/* No rating shown in this layout */}
    </Card>
  )
}
```

**Key insight:** The consumer decides the layout. The parent doesn't need to know about every possible variation — it just provides the data via context.

---

## Render Props Pattern

A component accepts a function as a prop and calls it to render its output. This shares stateful logic without HOCs or hooks — the component manages state, the consumer decides what to render with it.

```tsx
// Render prop component — manages hover state, consumer decides what to render
function Hoverable({ render }: { render: (isHovered: boolean) => React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {render(isHovered)}
    </div>
  )
}

// Usage — consumer receives isHovered and decides what to do with it
<Hoverable
  render={(isHovered) => (
    <div className={`card ${isHovered ? 'card--hovered' : ''}`}>
      {isHovered && <span>Quick View</span>}
      <h3>Bali Villa</h3>
    </div>
  )}
/>

// More common modern pattern — children as a function
// This is the same pattern but uses the children prop instead of a named prop
function DataFetcher<T>({
  url,
  children,
}: {
  url: string
  children: (data: T | null, loading: boolean, error: string | null) => React.ReactNode
}) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [url])

  return <>{children(data, loading, error)}</>
}

// Usage
<DataFetcher<Listing[]> url="/api/listings">
  {(listings, loading, error) => {
    if (loading) return <Spinner />
    if (error) return <p>{error}</p>
    return <ListingsGrid listings={listings ?? []} />
  }}
</DataFetcher>
```

**Note:** In modern React, custom hooks have largely replaced render props for logic sharing. Render props are still useful when you need to share both state and rendering control.

---

## Provider Pattern

The Provider pattern uses React Context to make values available to any component in the tree without prop drilling. It's the foundation of most state management solutions.

```tsx
// Auth Provider — makes auth state available everywhere
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string) => {
    const data = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json())

    setUser(data.user)
    localStorage.setItem('token', data.token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

// Always expose context through a custom hook
// This throws a clear error if used outside the provider, instead of silently returning null
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

// Usage anywhere in the tree — no prop drilling
function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Hello, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  )
}
```

---

## TypeScript — Types vs Interfaces

Both define the shape of an object. The practical difference is small — use `interface` for objects and component props (it's more extensible and gives better error messages), and `type` for unions, primitives, and computed types.

```ts
// Interface — preferred for objects and props
interface Listing {
  id: number
  title: string
  location: string
  price: number
  rating: number
  superhost: boolean
  img: string
}

// Interface extension — use extends to add fields
interface FeaturedListing extends Listing {
  featuredUntil: Date
  discount: number
}

// Type — for unions, primitives, computed types
type ListingStatus = 'available' | 'booked' | 'pending'  // union
type ListingId = number                                    // alias
type ListingMap = Record<number, Listing>                  // computed

// Type intersection — similar to interface extension
type FeaturedListing = Listing & {
  featuredUntil: Date
  discount: number
}
```

**Key difference:** Interfaces can be merged (declaration merging) — if you declare the same interface twice, TypeScript merges them. Types cannot. This matters when extending third-party types.

---

## Typing Component Props

TypeScript makes component APIs explicit and self-documenting. When you hover over a component in your editor, you see exactly what props it accepts and their types.

```tsx
// Basic props interface
interface ListingCardProps {
  listing: Listing
  saved?: boolean                          // optional — has a default or may not be needed
  onToggleSave?: (id: number) => void      // optional callback
  className?: string
  style?: React.CSSProperties
}

// Props with children
interface LayoutProps {
  children: React.ReactNode                // any valid JSX — elements, strings, arrays, null
  title: string
}

// Props extending HTML element props
// This lets you pass any valid button attribute (disabled, type, aria-*, etc.)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

function Button({ variant = 'primary', loading, children, ...rest }: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant}`}
      disabled={loading || rest.disabled}
      {...rest}  // spread remaining HTML button attributes
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
```

---

## Typing useState & useReducer

TypeScript can usually infer the type from the initial value. Provide an explicit generic when the initial value doesn't reflect the full type (e.g., `null` for something that will become an object).

```tsx
// useState — TypeScript infers the type from the initial value
const [count, setCount] = useState(0)           // inferred: number
const [name, setName] = useState('')             // inferred: string
const [active, setActive] = useState(false)      // inferred: boolean

// Explicit generic when initial value is null or empty
// Without the generic, TypeScript would infer Listing | null — which is correct here
const [listing, setListing] = useState<Listing | null>(null)
const [listings, setListings] = useState<Listing[]>([])
const [error, setError] = useState<string | null>(null)

// useReducer — type the state and action
type State = {
  listings: Listing[]
  loading: boolean
  filter: string
  saved: number[]
}

// Discriminated union — each action type has a specific payload type
// TypeScript narrows the type inside each case block
type Action =
  | { type: 'SET_LISTINGS'; payload: Listing[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'TOGGLE_SAVED'; payload: number }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LISTINGS': return { ...state, listings: action.payload }  // payload: Listing[]
    case 'SET_LOADING': return { ...state, loading: action.payload }    // payload: boolean
    case 'SET_FILTER': return { ...state, filter: action.payload }      // payload: string
    case 'TOGGLE_SAVED':
      return {
        ...state,
        saved: state.saved.includes(action.payload)
          ? state.saved.filter(id => id !== action.payload)
          : [...state.saved, action.payload],
      }
    default: return state
  }
}

const [state, dispatch] = useReducer(reducer, {
  listings: [], loading: true, filter: '', saved: [],
})
```

---

## Typing Events

React's synthetic event types are generic — the type parameter specifies which HTML element the event comes from. This gives you accurate types for `e.target`.

```tsx
// Input change — e.target.value is string
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setQuery(e.target.value)
}

// Select change — e.target.value is string (always, even for number options)
const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setGuests(Number(e.target.value))  // convert string to number
}

// Textarea change
const handleTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setDescription(e.target.value)
}

// Button click — e.currentTarget is the button element
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault()
  console.log('clicked')
}

// Form submit — always call e.preventDefault() to prevent page reload
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  submitBooking(data)
}

// Keyboard event — e.key is the key name ('Enter', 'Escape', 'ArrowDown', etc.)
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') search(query)
  if (e.key === 'Escape') clearSearch()
}

// File input — e.target.files is a FileList
const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) setPhoto(URL.createObjectURL(file))
}
```

---

## Typing Custom Hooks

Always define an explicit return type interface for custom hooks. This makes the hook's API clear and prevents TypeScript from inferring a complex union type.

```tsx
// Define the return type explicitly
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
    setError(null)
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

// Hook with generic type parameter — works with any data type
// T is inferred from the initial value
function useLocalStorage<T>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    // Lazy initializer — runs once on mount, reads from localStorage
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : initial
  })

  const set = (newValue: T) => {
    setValue(newValue)
    localStorage.setItem(key, JSON.stringify(newValue))
  }

  return [value, set]
}

// Usage — TypeScript infers T from the initial value
const [theme, setTheme] = useLocalStorage('theme', 'light')        // T = string
const [saved, setSaved] = useLocalStorage<number[]>('saved', [])   // T = number[]
```

---

## Generic Components

Generic components work with any data type — like generic functions in TypeScript. They let you write one component that handles lists of listings, users, bookings, or any other type.

```tsx
// Generic list component — T is the item type
interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string | number
  emptyMessage?: string
  loading?: boolean
}

function List<T>({ items, renderItem, keyExtractor, emptyMessage = 'No items', loading }: ListProps<T>) {
  if (loading) return <Spinner />
  if (items.length === 0) return <p className="empty">{emptyMessage}</p>

  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  )
}

// TypeScript infers T from the items prop
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
/>

// Generic select component — works with any option type
interface SelectProps<T> {
  options: T[]
  value: T
  onChange: (value: T) => void
  getLabel: (option: T) => string
  getValue: (option: T) => string | number
}

function Select<T>({ options, value, onChange, getLabel, getValue }: SelectProps<T>) {
  return (
    <select
      value={String(getValue(value))}
      onChange={e => {
        const selected = options.find(o => String(getValue(o)) === e.target.value)
        if (selected) onChange(selected)
      }}
    >
      {options.map(option => (
        <option key={getValue(option)} value={getValue(option)}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  )
}
```

**Why generics matter:** Without generics, you'd need a separate `ListingList`, `UserList`, `BookingList` component — all with identical logic. With generics, one `List<T>` handles all of them.

---

## Assignment

> See **[assignment-5.md](./assignment-5.md)** for the full description, file structure, acceptance criteria, and submission checklist.

**Summary:** Refactor your app using `withAuth` HOC, compound `Card` component, `AuthProvider`, generic `List<T>`, `useLocalStorage<T>`, and full TypeScript types with no `any`.

---

**Resources**
- [React Docs — Context](https://react.dev/reference/react/createContext)
- [TypeScript Handbook — Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app)
- [Patterns.dev — React Patterns](https://www.patterns.dev/react)
