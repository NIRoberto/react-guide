# Phase 4: Real-World Skills

## Table of Contents
1. [Fetch API — The Right Way](#fetch-api--the-right-way)
2. [TanStack Query Setup](#tanstack-query-setup)
3. [useQuery — Deep Dive](#usequery--deep-dive)
4. [useMutation — Deep Dive](#usemutation--deep-dive)
5. [Zod — Schema Validation](#zod--schema-validation)
6. [react-hook-form + Zod](#react-hook-form--zod)
7. [Assignment](#assignment)

---

## Fetch API — The Right Way

`fetch` is built into the browser. It returns a Promise that resolves to a `Response` object. The most important thing to know: **fetch only throws on network failure** — not on 404, 500, or any HTTP error. You must check `response.ok` yourself.

```ts
// src/lib/api.ts — one shared fetch wrapper used by the whole app
const BASE_URL = import.meta.env.VITE_API_URL  // e.g. https://api.example.com

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  if (!res.ok) {
    // Parse the error body if the server sends one
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `HTTP ${res.status}`)
  }

  return res.json()
}

// Convenience methods
export const api = {
  get:    <T>(path: string)                  => request<T>(path),
  post:   <T>(path: string, body: unknown)   => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)   => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: <T>(path: string)                  => request<T>(path, { method: 'DELETE' }),
}
```

Now every API call in the app goes through `api.get(...)`, `api.post(...)` etc. Auth headers and error handling are handled once, not repeated everywhere.

### Why Not Raw fetch Everywhere?

```ts
// ❌ repeated in every file — error handling, auth, base URL all duplicated
const res = await fetch('https://api.example.com/listings', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})
if (!res.ok) throw new Error(`HTTP ${res.status}`)
const data = await res.json()

// ✅ one line, consistent everywhere
const data = await api.get<Listing[]>('/listings')
```

---

## TanStack Query Setup

TanStack Query manages **server state** — data that lives on the server and is fetched over the network. It handles caching, background refetching, deduplication, and loading/error states automatically.

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // data is "fresh" for 5 min — no refetch during this window
      retry: 2,                   // retry failed requests twice before showing an error
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
)
```

`ReactQueryDevtools` adds a panel in the browser where you can see every cache entry, its status (fresh / stale / fetching), and manually trigger refetches. Use it constantly while building.

### Server State vs Client State

| | Client State | Server State |
|---|---|---|
| What | UI state — modal open, form values | Data from the server — listings, bookings |
| Tool | `useState`, `useReducer` | TanStack Query |
| Persists | Browser memory only | Server — must be fetched |
| Stale? | Never | Yes — can go out of date |

---

## useQuery — Deep Dive

`useQuery` fetches data and puts it in the cache. Every query has a `queryKey` (the cache identifier) and a `queryFn` (the async function that fetches the data).

### The queryKey

The `queryKey` is an array. TanStack Query uses it to:
- Store the result in the cache
- Decide when to refetch (when the key changes)
- Let you invalidate specific entries

```ts
queryKey: ['listings']              // all listings
queryKey: ['listing', id]           // one listing — separate cache entry per id
queryKey: ['listings', { category }] // filtered listings — separate cache per filter
```

When a variable is in the key, the query automatically re-runs when that variable changes — just like a `useEffect` dependency array.

### All the Options

```ts
const query = useQuery({
  queryKey: ['listings'],
  queryFn: () => api.get<Listing[]>('/listings'),

  staleTime: 5 * 60 * 1000,   // how long data is considered fresh (no background refetch)
  gcTime: 10 * 60 * 1000,     // how long unused cache data is kept in memory (default 5 min)
  retry: 3,                    // how many times to retry on failure
  retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),  // exponential backoff
  refetchOnWindowFocus: true,  // refetch when user tabs back to the app (default: true)
  refetchInterval: 30_000,     // poll every 30 seconds (useful for live data)
  enabled: true,               // set to false to pause the query
  placeholderData: [],         // shown while loading — no spinner, but not real data
  initialData: cachedListings, // treat existing data as the initial cache value
  select: data => data.filter(l => l.available),  // transform data before it reaches the component
})
```

### All the Return Values

```ts
const {
  data,           // the resolved value from queryFn — undefined until first success
  isLoading,      // true only on the FIRST fetch (no cached data yet)
  isFetching,     // true during ANY fetch — first load OR background refetch
  isSuccess,      // true when data is available
  isError,        // true when the last fetch failed
  error,          // the Error object thrown by queryFn
  refetch,        // manually trigger a refetch
  isStale,        // true when data is older than staleTime
  isPending,      // alias for isLoading in v5
  status,         // 'pending' | 'success' | 'error'
  fetchStatus,    // 'fetching' | 'paused' | 'idle'
} = useQuery({ queryKey: ['listings'], queryFn: ... })
```

### isLoading vs isFetching

```
First load:          isLoading=true   isFetching=true
Background refetch:  isLoading=false  isFetching=true   ← data is shown, subtle indicator only
Idle (fresh data):   isLoading=false  isFetching=false
```

```tsx
if (isLoading) return <Spinner />                          // full-page spinner — first load only
if (isError)   return <p>Error: {(error as Error).message}</p>

return (
  <div>
    {isFetching && <div className="refetch-bar">Refreshing…</div>}  {/* subtle top bar */}
    <ListingsGrid listings={data} />
  </div>
)
```

### Dependent Queries

Run a query only when another query's data is ready:

```ts
const { data: user } = useQuery({
  queryKey: ['user'],
  queryFn: () => api.get<User>('/me'),
})

const { data: bookings } = useQuery({
  queryKey: ['bookings', user?.id],
  queryFn: () => api.get<Booking[]>(`/users/${user!.id}/bookings`),
  enabled: !!user,   // ← only runs after user is loaded
})
```

### Parallel Queries

Just call `useQuery` multiple times — they run in parallel automatically:

```ts
const listingsQuery = useQuery({ queryKey: ['listings'], queryFn: fetchListings })
const savedQuery    = useQuery({ queryKey: ['saved'],    queryFn: fetchSaved })

// Both fire at the same time, no waterfall
```

### The `select` Option — Transform Without Extra State

Instead of deriving data with `useMemo`, use `select` to transform the raw API response before it reaches the component. The transformed result is memoized — it only recomputes when the raw data changes.

```ts
// Raw API returns all listings — component only wants beach listings
const { data: beachListings } = useQuery({
  queryKey: ['listings'],
  queryFn: () => api.get<Listing[]>('/listings'),
  select: data => data.filter(l => l.category === 'beach'),
})

// Multiple components can use the same queryKey with different selects
// They share ONE network request but each gets their own transformed slice
const { data: count } = useQuery({
  queryKey: ['listings'],
  queryFn: () => api.get<Listing[]>('/listings'),
  select: data => data.length,   // this component only cares about the count
})
```

### placeholderData — Instant Navigation

Show previous data while new data loads — no spinner, no layout shift:

```ts
import { keepPreviousData } from '@tanstack/react-query'

const { data, isPlaceholderData } = useQuery({
  queryKey: ['listings', { page }],
  queryFn: () => api.get<Listing[]>(`/listings?page=${page}`),
  placeholderData: keepPreviousData,  // show page 1 data while page 2 loads
})

// Dim the grid while new page loads
<div style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
  <ListingsGrid listings={data} />
</div>
```

### Prefetching

Load data before the user navigates to it — so the page feels instant:

```ts
// Prefetch on hover — by the time they click, data is already cached
const queryClient = useQueryClient()

<Link
  to={`/listings/${id}`}
  onMouseEnter={() =>
    queryClient.prefetchQuery({
      queryKey: ['listing', id],
      queryFn: () => api.get<Listing>(`/listings/${id}`),
    })
  }
>
  View listing
</Link>
```

---

## useMutation — Deep Dive

`useMutation` handles write operations — POST, PUT, DELETE. Unlike `useQuery`, it doesn't run automatically. You call `mutate()` or `mutateAsync()` to trigger it.

### All the Options

```ts
const mutation = useMutation({
  mutationFn: (data: BookingData) => api.post<Booking>('/bookings', data),

  onMutate:  (variables) => { /* runs before the request — use for optimistic updates */ },
  onSuccess: (data, variables, context) => { /* runs when request succeeds */ },
  onError:   (error, variables, context) => { /* runs when request fails */ },
  onSettled: (data, error, variables, context) => { /* runs on success OR error */ },

  retry: 1,   // retry failed mutations once
})
```

### All the Return Values

```ts
const {
  mutate,          // fire and forget — mutate(variables)
  mutateAsync,     // returns a Promise — await mutateAsync(variables)
  isPending,       // true while the request is in flight
  isSuccess,       // true after a successful mutation
  isError,         // true after a failed mutation
  error,           // the Error object
  data,            // the response data from a successful mutation
  reset,           // reset status back to idle
} = useMutation({ mutationFn: ... })
```

### mutate vs mutateAsync

```ts
// mutate — fire and forget, handle results in callbacks
mutation.mutate(bookingData)

// mutateAsync — use when you need to await the result inline
try {
  const booking = await mutation.mutateAsync(bookingData)
  navigate(`/bookings/${booking.id}`)   // use the response immediately
} catch (err) {
  console.error(err)
}
```

### Cache Invalidation After Mutation

After a write, tell TanStack Query which cached data is now stale so it refetches:

```ts
const queryClient = useQueryClient()

const createBooking = useMutation({
  mutationFn: (data: BookingData) => api.post('/bookings', data),
  onSuccess: () => {
    // Invalidate all queries whose key starts with 'bookings'
    queryClient.invalidateQueries({ queryKey: ['bookings'] })

    // Invalidate a specific listing (its availability changed)
    queryClient.invalidateQueries({ queryKey: ['listing', listingId] })
  },
})
```

### Optimistic Updates — Full Pattern

An optimistic update immediately updates the UI before the server responds, then rolls back if it fails. Three lifecycle hooks work together:

```ts
// src/features/listings/hooks/useToggleSaved.ts
export function useToggleSaved() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => api.post(`/saved/${id}`),

    onMutate: async (id) => {
      // 1. Cancel any in-flight refetches — they could overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['saved'] })

      // 2. Snapshot the current cache value so we can roll back
      const previous = queryClient.getQueryData<number[]>(['saved'])

      // 3. Apply the optimistic update immediately
      queryClient.setQueryData<number[]>(['saved'], old =>
        old?.includes(id) ? old.filter(x => x !== id) : [...(old ?? []), id]
      )

      // 4. Return the snapshot — onError receives it as `context`
      return { previous }
    },

    onError: (_err, _id, context) => {
      // 5. Roll back to the snapshot if the request failed
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['saved'], context.previous)
      }
    },

    onSettled: () => {
      // 6. Always sync with the server's real state after success or failure
      queryClient.invalidateQueries({ queryKey: ['saved'] })
    },
  })
}
```

```tsx
// Usage in a component
function ListingCard({ listing }: { listing: Listing }) {
  const { data: saved = [] } = useQuery({ queryKey: ['saved'], queryFn: fetchSaved })
  const toggleSaved = useToggleSaved()

  const isSaved = saved.includes(listing.id)

  return (
    <button
      onClick={() => toggleSaved.mutate(listing.id)}
      disabled={toggleSaved.isPending}
      aria-label={isSaved ? 'Unsave' : 'Save'}
    >
      <FaHeart color={isSaved ? 'red' : 'gray'} />
    </button>
  )
}
```

### setQueryData — Direct Cache Writes

Sometimes you already have the data from a mutation response — no need to refetch:

```ts
const createListing = useMutation({
  mutationFn: (data: NewListing) => api.post<Listing>('/listings', data),

  onSuccess: (newListing) => {
    // Add the new listing directly into the cache — no extra network request
    queryClient.setQueryData<Listing[]>(['listings'], old =>
      old ? [...old, newListing] : [newListing]
    )
  },
})
```

### Global Mutation Callbacks

Set default callbacks on the `QueryClient` for things like showing a toast on every error:

```ts
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error((error as Error).message)
    },
  }),
})
```

---

## Zod — Schema Validation

Zod is a TypeScript-first schema validation library. Define your validation rules once as a schema — you get runtime validation AND TypeScript types from the same source.

```bash
npm install zod
```

```ts
// src/features/bookings/schemas/booking.ts
import { z } from 'zod'

export const datesSchema = z.object({
  checkIn:  z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests:   z.number({ invalid_type_error: 'Guests is required' }).min(1).max(16),
}).refine(d => d.checkOut > d.checkIn, {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
})

export const personalSchema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Valid phone number required'),
})

export const paymentSchema = z.object({
  card:   z.string().regex(/^\d{16}$/, '16-digit card number required'),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Format: MM/YY'),
  cvv:    z.string().regex(/^\d{3}$/, '3-digit CVV required'),
})

// TypeScript types inferred from schemas — no separate interface needed
export type DatesData    = z.infer<typeof datesSchema>
export type PersonalData = z.infer<typeof personalSchema>
export type PaymentData  = z.infer<typeof paymentSchema>
```

### Key Zod Methods

| Method | What it does |
|--------|-------------|
| `z.string().min(n, msg)` | Minimum string length |
| `z.string().email(msg)` | Valid email format |
| `z.string().regex(pattern, msg)` | Must match regex |
| `z.number().min(n).max(n)` | Number range |
| `z.boolean()` | Boolean field |
| `z.enum(['a', 'b'])` | One of a fixed set of values |
| `z.optional()` | Field is not required |
| `.refine(fn, opts)` | Custom cross-field validation |
| `z.infer<typeof schema>` | Extract TypeScript type |

---

## react-hook-form + Zod

`react-hook-form` manages form state with minimal re-renders. With `@hookform/resolvers`, Zod validation runs automatically on submit and on blur — no manual validation code.

```bash
npm install react-hook-form @hookform/resolvers
```

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function StepDates({ onNext }: { onNext: (data: DatesData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatesData>({
    resolver: zodResolver(datesSchema),
  })

  // handleSubmit only calls onNext if Zod validation passes
  // otherwise it populates errors and the form stays put
  return (
    <form onSubmit={handleSubmit(onNext)}>
      <div>
        <label>Check-in</label>
        <input type="date" {...register('checkIn')} />
        {errors.checkIn && <p className="error">{errors.checkIn.message}</p>}
      </div>
      <div>
        <label>Check-out</label>
        <input type="date" {...register('checkOut')} />
        {errors.checkOut && <p className="error">{errors.checkOut.message}</p>}
      </div>
      <div>
        <label>Guests</label>
        <input type="number" {...register('guests', { valueAsNumber: true })} />
        {errors.guests && <p className="error">{errors.guests.message}</p>}
      </div>
      <button type="submit">Continue</button>
    </form>
  )
}
```

`register` connects the input to the form — it spreads `name`, `ref`, `onChange`, and `onBlur` onto the input. `handleSubmit` wraps your submit handler and runs Zod validation first.

### File Upload in a Form Step

File inputs can't be registered with `register` the normal way — use `watch` + a manual `onChange`:

```tsx
function StepPersonal({ onNext, onBack }: { onNext: (d: PersonalData) => void; onBack: () => void }) {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<PersonalData>({
    resolver: zodResolver(personalSchema),
  })
  const [preview, setPreview] = useState<string | null>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('root', { message: 'Photo must be under 5MB' })
      return
    }
    setPreview(URL.createObjectURL(file))
  }

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <input {...register('name')} placeholder="Full name" />
      {errors.name && <p className="error">{errors.name.message}</p>}

      <input type="email" {...register('email')} placeholder="Email" />
      {errors.email && <p className="error">{errors.email.message}</p>}

      <input {...register('phone')} placeholder="Phone" />
      {errors.phone && <p className="error">{errors.phone.message}</p>}

      <input type="file" accept="image/*" onChange={handlePhoto} />
      {preview && <img src={preview} alt="Preview" className="photo-preview" />}
      {errors.root && <p className="error">{errors.root.message}</p>}

      <div className="form-actions">
        <button type="button" onClick={onBack}>Back</button>
        <button type="submit">Continue</button>
      </div>
    </form>
  )
}
```

---

## Assignment

> See **[assignment-4.md](./assignment-4.md)** for the full description, file structure, acceptance criteria, and submission checklist.

**Summary:** Build a full booking flow — a shared `fetch` wrapper in `src/lib/api.ts`, TanStack Query for cached listings with optimistic save/unsave, Zod schemas for all 3 form steps, and react-hook-form on each step with inline validation errors.

---

**Resources**
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zod Docs](https://zod.dev)
- [react-hook-form Docs](https://react-hook-form.com)
