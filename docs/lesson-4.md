# Phase 4: Real-World Skills

## Table of Contents
1. [Fetch API Basics](#fetch-api-basics)
2. [TanStack Query (React Query)](#tanstack-query-react-query)
3. [useQuery](#usequery)
4. [useMutation & Optimistic Updates](#usemutation--optimistic-updates)
5. [Controlled vs Uncontrolled Forms](#controlled-vs-uncontrolled-forms)
6. [Multi-Step Forms](#multi-step-forms)
7. [Form Validation](#form-validation)
8. [File Upload with Preview](#file-upload-with-preview)
9. [Why Testing Matters](#why-testing-matters)
10. [Vitest & Jest Basics](#vitest--jest-basics)
11. [React Testing Library](#react-testing-library)
12. [Mocking API Calls](#mocking-api-calls)
13. [Assignment](#assignment)

---

## Fetch API Basics

The Fetch API is built into the browser. It returns a Promise that resolves to a `Response` object. You must check `response.ok` manually — Fetch does NOT throw on HTTP errors like 404 or 500, only on network failures.

```tsx
// Basic GET request
async function fetchListings() {
  const response = await fetch('https://api.example.com/listings')

  // Fetch only throws on network errors (no internet, DNS failure)
  // HTTP errors (404, 500) resolve normally — you must check response.ok
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }

  const data = await response.json()
  return data
}

// POST request with JSON body
async function createBooking(booking: BookingData) {
  const response = await fetch('https://api.example.com/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  })

  if (!response.ok) throw new Error('Failed to create booking')
  return response.json()
}

// Using fetch in a component with useEffect
function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchListings()
      .then(setListings)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error) return <p>Error: {error}</p>
  return <ListingsGrid listings={listings} />
}
```

**The problem with manual fetch:** Every data-fetching component needs to manage `loading`, `error`, and `data` state manually. There's no caching — navigating away and back re-fetches the same data. There's no deduplication — two components fetching the same endpoint make two requests. TanStack Query solves all of this.

---

## TanStack Query (React Query)

TanStack Query is a server state management library. It handles caching, background refetching, deduplication, loading/error states, and more — automatically.

**Server state vs client state:**
- **Client state** — UI state that lives only in the browser (modal open/closed, form input values). Use `useState` or Zustand.
- **Server state** — data that lives on the server and is fetched over the network (listings, user profile, bookings). Use TanStack Query.

```bash
npm install @tanstack/react-query
```

```tsx
// main.tsx — wrap your app in QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // data stays "fresh" for 5 minutes — no refetch during this window
      retry: 2,                   // retry failed requests twice before showing an error
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
```

### What TanStack Query Gives You

| Feature | Without TQ | With TQ |
|---------|-----------|---------| 
| Loading state | Manual `useState` | Automatic `isLoading` |
| Error state | Manual `useState` | Automatic `isError` |
| Caching | None | Automatic, configurable |
| Background refetch | Manual | Automatic on window focus |
| Deduplication | None | Automatic |
| Optimistic updates | Complex | Built-in pattern |

---

## useQuery

`useQuery` fetches and caches data. The `queryKey` is the cache key — TanStack Query uses it to identify, cache, and invalidate data. Think of it as the unique name for a piece of server data.

```tsx
import { useQuery } from '@tanstack/react-query'

// Define your fetch function separately — keeps components clean
const fetchListings = () =>
  fetch('/api/listings').then(r => {
    if (!r.ok) throw new Error('Failed to fetch')
    return r.json()
  })

const fetchListing = (id: number) =>
  fetch(`/api/listings/${id}`).then(r => r.json())

function ListingsPage() {
  const {
    data: listings,
    isLoading,    // true only on the first fetch (no cached data yet)
    isError,
    error,
    refetch,
    isFetching,  // true during ANY fetch, including background refetches
  } = useQuery({
    queryKey: ['listings'],           // unique cache key
    queryFn: fetchListings,
    staleTime: 5 * 60 * 1000,        // don't refetch for 5 minutes
  })

  if (isLoading) return <Spinner />
  if (isError) return (
    <div>
      <p>Error: {(error as Error).message}</p>
      <button onClick={() => refetch()}>Retry</button>
    </div>
  )

  return (
    <div>
      {/* isFetching is true during background refetch — show a subtle indicator */}
      {isFetching && <p className="refetch-indicator">Refreshing...</p>}
      <ListingsGrid listings={listings} />
    </div>
  )
}

// Dynamic query — queryKey includes the id, so each listing has its own cache entry
function ListingDetail({ id }: { id: number }) {
  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],        // ['listing', 1], ['listing', 2], etc.
    queryFn: () => fetchListing(id),
    enabled: !!id,                    // only run when id is truthy
  })

  if (isLoading) return <Spinner />
  return <div>{listing?.title}</div>
}
```

**Caching behavior:** When you navigate away from a page and come back, TanStack Query shows the cached data immediately (no loading spinner) while refetching in the background. This makes navigation feel instant.

---

## useMutation & Optimistic Updates

`useMutation` handles write operations — creating, updating, or deleting data. Unlike `useQuery`, mutations don't run automatically — you call `mutate()` to trigger them.

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (booking: BookingData) =>
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      }).then(r => r.json()),

    onSuccess: () => {
      // Tell TanStack Query that the 'listings' cache is now stale
      // It will refetch listings on the next render that uses useQuery(['listings'])
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })
}
```

### Optimistic Updates

An optimistic update immediately updates the UI as if the server request succeeded, then rolls back if it fails. This makes the app feel instant — no waiting for the server.

```tsx
function useToggleSaved() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/saved/${id}`, { method: 'POST' }).then(r => r.json()),

    // Step 1: Immediately update the cache before the server responds
    onMutate: async (id) => {
      // Cancel any in-flight refetches that might overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['saved'] })

      // Snapshot the current value for rollback
      const previous = queryClient.getQueryData(['saved'])

      // Optimistically update the cache
      queryClient.setQueryData(['saved'], (old: number[]) =>
        old.includes(id) ? old.filter(x => x !== id) : [...old, id]
      )

      // Return snapshot so onError can roll back
      return { previous }
    },

    // Step 2: If the server returns an error, roll back to the snapshot
    onError: (_err, _id, context) => {
      queryClient.setQueryData(['saved'], context?.previous)
    },

    // Step 3: Whether success or error, sync with the server's actual state
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saved'] })
    },
  })
}

// Usage
function ListingCard({ id }: { id: number }) {
  const toggleSaved = useToggleSaved()

  return (
    <div>
      <button
        onClick={() => toggleSaved.mutate(id)}
        disabled={toggleSaved.isPending}  // prevent double-clicks
      >
        {toggleSaved.isPending ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
```

---

## Controlled vs Uncontrolled Forms

### Controlled

React state is the single source of truth. Every keystroke updates state, and the input's displayed value always matches state.

```tsx
function SearchForm() {
  const [query, setQuery] = useState('')

  return (
    <input
      value={query}                            // value tied to state
      onChange={e => setQuery(e.target.value)} // state updates on every keystroke
    />
  )
}
```

**Advantages:** Full control — you can validate on every keystroke, format input (e.g., phone number masking), derive other values from it, and reset it by resetting state.

### Uncontrolled

The DOM manages the value. You read it with a ref when needed (e.g., on submit).

```tsx
function SearchForm() {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    console.log(inputRef.current?.value)  // read value on demand
  }

  return <input ref={inputRef} defaultValue="" />
}
```

**Use controlled inputs** for most cases — they give you full control for validation, formatting, and derived state. Use uncontrolled only for file inputs (which can't be controlled) or when integrating with non-React libraries.

---

## Multi-Step Forms

Multi-step forms break a long form into smaller, focused steps. The key is managing which step is active and accumulating data across steps.

```tsx
const STEPS = ['Dates & Guests', 'Personal Info', 'Payment', 'Confirmation']

function BookingForm() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    checkIn: '', checkOut: '', guests: 1,
    name: '', email: '', phone: '',
    card: '', expiry: '', cvv: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Generic updater — updates any field and clears its error
  const update = (field: string, value: string | number) => {
    setData(d => ({ ...d, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))  // clear error on change
  }

  // Validate only the fields relevant to the current step
  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (!data.checkIn) e.checkIn = 'Check-in date is required'
      if (!data.checkOut) e.checkOut = 'Check-out date is required'
      if (data.checkIn && data.checkOut && data.checkIn >= data.checkOut)
        e.checkOut = 'Check-out must be after check-in'
    }
    if (step === 1) {
      if (!data.name.trim()) e.name = 'Name is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Valid email required'
      if (data.phone.replace(/\D/g, '').length < 7) e.phone = 'Valid phone required'
    }
    if (step === 2) {
      if (data.card.replace(/\s/g, '').length < 16) e.card = '16-digit card number required'
      if (!/^\d{2}\/\d{2}$/.test(data.expiry)) e.expiry = 'Format: MM/YY'
      if (data.cvv.length < 3) e.cvv = '3-digit CVV required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Only advance if the current step is valid
  const next = () => { if (validate()) setStep(s => s + 1) }
  const back = () => setStep(s => s - 1)

  return (
    <div>
      {/* Step indicators */}
      <div className="steps">
        {STEPS.map((label, i) => (
          <div key={i} className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
            {i + 1}. {label}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div>
          <input type="date" value={data.checkIn} onChange={e => update('checkIn', e.target.value)} />
          {errors.checkIn && <p className="error">{errors.checkIn}</p>}
          <input type="date" value={data.checkOut} onChange={e => update('checkOut', e.target.value)} />
          {errors.checkOut && <p className="error">{errors.checkOut}</p>}
        </div>
      )}

      {step === 1 && (
        <div>
          <input value={data.name} onChange={e => update('name', e.target.value)} placeholder="Full name" />
          {errors.name && <p className="error">{errors.name}</p>}
          <input type="email" value={data.email} onChange={e => update('email', e.target.value)} />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>
      )}

      <div className="form-actions">
        {step > 0 && <button onClick={back}>Back</button>}
        {step < STEPS.length - 1
          ? <button onClick={next}>Continue</button>
          : <button onClick={() => submitBooking(data)}>Confirm Booking</button>
        }
      </div>
    </div>
  )
}
```

---

## Form Validation

Manual validation works but gets repetitive. Zod is a TypeScript-first schema validation library — you define the shape and rules of your data once, and it validates and infers types automatically.

```tsx
// Validation with Zod
import { z } from 'zod'

// Define the schema — this is both validation rules AND the TypeScript type
const bookingSchema = z.object({
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1).max(16),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Valid phone number required'),
})

// TypeScript type is inferred from the schema — no duplication
type BookingData = z.infer<typeof bookingSchema>

function validateStep(data: Partial<BookingData>, step: number) {
  // Pick only the fields relevant to this step
  const stepSchemas = [
    bookingSchema.pick({ checkIn: true, checkOut: true, guests: true }),
    bookingSchema.pick({ name: true, email: true, phone: true }),
  ]

  // safeParse returns { success: true, data } or { success: false, error }
  const result = stepSchemas[step]?.safeParse(data)
  if (!result?.success) {
    // flatten() converts Zod's error format to { fieldName: ['error message'] }
    return result?.error.flatten().fieldErrors
  }
  return {}
}
```

**Why Zod over manual validation?**
- Schema is the single source of truth for both validation and TypeScript types
- Errors are structured and consistent
- Composable — you can pick, omit, extend, and merge schemas
- Works on both client and server (Node.js)

---

## File Upload with Preview

```tsx
function ProfilePhotoUpload() {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    // Validate file type and size before creating a preview
    if (!selected.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (selected.size > 5 * 1024 * 1024) {
      alert('File must be under 5MB')
      return
    }

    setFile(selected)
    // URL.createObjectURL creates a temporary local URL for the file
    // This lets you display the image without uploading it first
    const url = URL.createObjectURL(selected)
    setPreview(url)
  }

  // Object URLs hold a reference to the file in memory
  // Revoke them when done to prevent memory leaks
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  const handleUpload = async () => {
    if (!file) return
    // FormData is the correct way to send files — not JSON
    const formData = new FormData()
    formData.append('photo', file)
    await fetch('/api/upload', { method: 'POST', body: formData })
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleChange} />
      {preview && (
        <img src={preview} alt="Preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
      )}
      {file && <button onClick={handleUpload}>Upload</button>}
    </div>
  )
}
```

---

## Why Testing Matters

Tests catch bugs before users do. They also give you confidence to refactor — if tests pass after a change, you haven't broken anything. Without tests, every change is a gamble.

**Types of tests:**
- **Unit tests** — test a single function or component in isolation. Fast, cheap, many.
- **Integration tests** — test how multiple components work together. Some.
- **End-to-end tests** — test the full user flow in a real browser (Cypress, Playwright). Few, slow, expensive.

**The testing pyramid:**
```
        /\
       /E2E\        few, slow, expensive
      /------\
     /  Integ  \    some
    /------------\
   /    Unit      \  many, fast, cheap
  /-----------------\
```

**What to test:** User-visible behavior — "when I type in the search box, the listings filter." Not implementation details — "the `filtered` variable has 2 items."

---

## Vitest & Jest Basics

Vitest is the recommended test runner for Vite projects. It uses the same API as Jest but runs much faster because it reuses Vite's transformation pipeline.

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',    // simulate a browser environment
    globals: true,           // no need to import describe/it/expect
    setupFiles: './src/test-setup.ts',
  },
})

// src/test-setup.ts
import '@testing-library/jest-dom'  // adds matchers like toBeInTheDocument()
```

```ts
// Basic test structure
import { describe, it, expect, vi } from 'vitest'

describe('filterListings', () => {
  it('filters by title', () => {
    const listings = [
      { id: 1, title: 'Bali Villa', location: 'Bali', price: 185 },
      { id: 2, title: 'NYC Loft', location: 'New York', price: 240 },
    ]
    const result = filterListings(listings, 'bali')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Bali Villa')
  })

  it('is case insensitive', () => {
    const result = filterListings(listings, 'NYC')
    expect(result[0].location).toBe('New York')
  })

  it('returns all listings for empty query', () => {
    expect(filterListings(listings, '')).toHaveLength(2)
  })
})

// Common matchers
expect(value).toBe(42)                    // strict equality (===)
expect(value).toEqual({ id: 1 })          // deep equality
expect(array).toHaveLength(3)
expect(string).toContain('Bali')
expect(fn).toHaveBeenCalledWith(1)
expect(fn).toHaveBeenCalledTimes(2)
expect(value).toBeTruthy()
expect(value).toBeNull()
```

---

## React Testing Library

React Testing Library (RTL) tests components the way users interact with them — by finding elements by their visible text, role, and label. It deliberately avoids testing implementation details (internal state, component structure).

**Philosophy:** "The more your tests resemble the way your software is used, the more confidence they can give you."

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ListingCard from './ListingCard'

const props = {
  id: 1,
  title: 'Tropical Villa',
  location: 'Bali, Indonesia',
  price: 185,
  rating: 4.97,
  superhost: true,
  img: 'https://example.com/photo.jpg',
  saved: false,
  onToggleSave: vi.fn(),
}

describe('ListingCard', () => {
  it('renders title and price', () => {
    render(<ListingCard {...props} />)
    // screen.getByText finds elements by their visible text content
    expect(screen.getByText('Tropical Villa')).toBeInTheDocument()
    expect(screen.getByText(/\$185/)).toBeInTheDocument()
  })

  it('shows Superhost badge when superhost=true', () => {
    render(<ListingCard {...props} superhost={true} />)
    expect(screen.getByText('Superhost')).toBeInTheDocument()
  })

  it('hides Superhost badge when superhost=false', () => {
    render(<ListingCard {...props} superhost={false} />)
    // queryByText returns null instead of throwing when element is not found
    expect(screen.queryByText('Superhost')).not.toBeInTheDocument()
  })

  it('calls onToggleSave when heart button is clicked', async () => {
    const user = userEvent.setup()
    const onToggleSave = vi.fn()
    render(<ListingCard {...props} onToggleSave={onToggleSave} />)

    // userEvent simulates real user interactions (fires all the same events a real user would)
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onToggleSave).toHaveBeenCalledTimes(1)
  })
})

// Testing search filter
describe('Search', () => {
  it('filters listings as user types', async () => {
    const user = userEvent.setup()
    render(<ListingsPage />)

    const input = screen.getByPlaceholderText('Search listings...')
    await user.type(input, 'Bali')

    expect(screen.getByText('Tropical Villa')).toBeInTheDocument()
    expect(screen.queryByText('Manhattan Loft')).not.toBeInTheDocument()
  })
})
```

**`getBy` vs `queryBy` vs `findBy`:**
- `getBy` — throws if not found. Use when the element should always be there.
- `queryBy` — returns null if not found. Use when checking an element is NOT present.
- `findBy` — returns a Promise, waits for the element to appear. Use for async operations.

---

## Mocking API Calls

Tests should not make real network requests — they'd be slow, flaky, and dependent on external services. Mock `fetch` to return controlled responses.

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

// Mock fetch globally for all tests in this file
global.fetch = vi.fn()

describe('ListingsPage', () => {
  it('shows listings after loading', async () => {
    // Set up the mock response before rendering
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, title: 'Bali Villa', price: 185 }],
    } as Response)

    render(<ListingsPage />)

    // Loading state appears first
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // waitFor polls until the assertion passes (or times out)
    // Use for async operations that update the DOM
    await waitFor(() => {
      expect(screen.getByText('Bali Villa')).toBeInTheDocument()
    })
  })

  it('shows error on fetch failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))
    render(<ListingsPage />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
    })
  })
})
```

**For more complex API mocking**, consider [MSW (Mock Service Worker)](https://mswjs.io) — it intercepts requests at the network level, making tests more realistic and reusable between unit tests and browser testing.

---

## Assignment

> See **[assignment-4.md](./assignment-4.md)** for the full description, file structure, acceptance criteria, and submission checklist.

**Summary:** Build a full booking flow with TanStack Query for cached data fetching, a validated 4-step booking form with file upload, optimistic updates, and a complete Vitest + React Testing Library test suite.

---

**Resources**
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Vitest Docs](https://vitest.dev)
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro)
- [Zod Docs](https://zod.dev)
- [MSW — Mock Service Worker](https://mswjs.io)
