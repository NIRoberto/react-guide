# Assignment 4: Booking Flow & Test Suite

## Description

Build a full booking flow with TanStack Query for cached data fetching, a validated 4-step booking form, optimistic updates, and a complete Vitest + React Testing Library test suite.

---

## What You'll Learn

- How TanStack Query handles caching, loading, and error states automatically
- How `useQuery` and `useMutation` replace manual fetch + useState patterns
- How optimistic updates make the UI feel instant
- How to build multi-step forms with per-step validation
- How to validate forms with Zod schemas
- How to write unit and integration tests with Vitest and React Testing Library
- How to mock API calls in tests

---

## Packages to Install

```bash
cd airbnb-app
npm install @tanstack/react-query @tanstack/react-query-devtools zod react-hook-form @hookform/resolvers axios
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

| Package | What it does | Usage in this assignment |
|---------|-------------|--------------------------|
| `@tanstack/react-query` | Server state management — caching, background refetch, loading/error states | Fetch listings and single listing with automatic caching |
| `@tanstack/react-query-devtools` | Browser DevTools panel showing all cache entries and their status | Debug query cache during development |
| `zod` | TypeScript-first schema validation — define rules once, infer types automatically | Validate each booking form step before advancing |
| `react-hook-form` | Performant forms with minimal re-renders — integrates with Zod via resolvers | Manage all booking form fields and validation |
| `@hookform/resolvers` | Connects `react-hook-form` with Zod (and other validators) | Pass Zod schema directly to `useForm` as a resolver |
| `axios` | HTTP client with interceptors, automatic JSON parsing, and better error handling than fetch | Replace raw `fetch` calls with `axios` in all query functions |

---

## File Structure

```
src/
├── components/
│   ├── ListingCard.tsx
│   ├── ListingCard.module.css
│   ├── BookingForm/
│   │   ├── BookingForm.tsx
│   │   ├── StepDates.tsx
│   │   ├── StepPersonal.tsx
│   │   ├── StepPayment.tsx
│   │   └── StepConfirmation.tsx
│   ├── Navbar.tsx
│   ├── ProtectedRoute.tsx
│   └── Spinner.tsx
├── hooks/
│   ├── useListings.ts
│   ├── useListing.ts
│   └── useToggleSaved.ts
├── lib/
│   └── axios.ts              # axios instance with base URL
├── schemas/
│   └── booking.ts            # Zod schemas for each form step
├── pages/
│   ├── Home.tsx
│   ├── ListingDetail.tsx
│   ├── Login.tsx
│   └── Dashboard.tsx
├── tests/
│   ├── ListingCard.test.tsx
│   ├── SearchFilter.test.tsx
│   ├── BookingForm.test.tsx
│   └── api.test.tsx
├── types/
│   └── index.ts
├── data/
│   └── listings.ts
├── test-setup.ts
├── App.tsx
└── main.tsx
```

---

## Tasks

1. Create `src/lib/axios.ts` — axios instance with `baseURL` from `import.meta.env.VITE_API_URL`
2. Wrap the app in `QueryClientProvider` with `ReactQueryDevtools` in `main.tsx`
3. Create `src/hooks/useListings.ts` — `useQuery` with `queryKey: ['listings']`, uses axios instance
4. Create `src/hooks/useListing.ts` — `useQuery` with `queryKey: ['listing', id]`, `enabled: !!id`
5. Create `src/hooks/useToggleSaved.ts` — `useMutation` with optimistic update and rollback on error
6. Create `src/schemas/booking.ts` — Zod schemas for each step: dates, personal info, payment
7. Build `BookingForm` as a 4-step form using `react-hook-form` + Zod resolver per step
8. Show inline validation errors from Zod on each field
9. Add file upload in Step 2 for profile photo with preview and 5MB validation
10. Handle all query states: `isLoading`, `isError`, `isFetching`, empty results
11. Set up Vitest with `jsdom` and `@testing-library/jest-dom`
12. Write `ListingCard.test.tsx` — title, price, badge, toggle
13. Write `SearchFilter.test.tsx` — filters by title and location
14. Write `api.test.tsx` — mock axios, test loading → success → error states
15. Write `BookingForm.test.tsx` — validation errors, step advancement

---

## Starter Code

### `src/lib/axios.ts`

```ts
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach auth token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### `src/hooks/useListings.ts`

```ts
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/axios'
import type { Listing } from '../types'

export function useListings() {
  return useQuery<Listing[], Error>({
    queryKey: ['listings'],
    queryFn: () => api.get<Listing[]>('/listings').then(res => res.data),
    staleTime: 5 * 60 * 1000,
  })
}
```

### `src/hooks/useToggleSaved.ts`

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/axios'

export function useToggleSaved() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: (id: number) => api.post(`/saved/${id}`).then(() => {}),

    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['saved'] })
      const previous = queryClient.getQueryData<number[]>(['saved'])
      queryClient.setQueryData<number[]>(['saved'], (old = []) =>
        old.includes(id) ? old.filter(x => x !== id) : [...old, id]
      )
      return { previous }
    },

    onError: (_err, _id, context) => {
      // TODO: roll back to previous state
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saved'] })
    },
  })
}
```

### `src/schemas/booking.ts`

```ts
import { z } from 'zod'

export const stepDatesSchema = z.object({
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1, 'At least 1 guest').max(16, 'Maximum 16 guests'),
}).refine(data => data.checkIn < data.checkOut, {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
})

export const stepPersonalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Valid phone number required'),
})

export const stepPaymentSchema = z.object({
  card: z.string().regex(/^\d{16}$/, '16-digit card number required'),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Format: MM/YY'),
  cvv: z.string().regex(/^\d{3}$/, '3-digit CVV required'),
})

export type StepDatesData = z.infer<typeof stepDatesSchema>
export type StepPersonalData = z.infer<typeof stepPersonalSchema>
export type StepPaymentData = z.infer<typeof stepPaymentSchema>
```

### `src/components/BookingForm/StepDates.tsx`

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { stepDatesSchema, type StepDatesData } from '../../schemas/booking'

interface StepDatesProps {
  defaultValues: Partial<StepDatesData>
  onNext: (data: StepDatesData) => void
}

export function StepDates({ defaultValues, onNext }: StepDatesProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<StepDatesData>({
    resolver: zodResolver(stepDatesSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <label>
        Check-in
        <input type="date" {...register('checkIn')} />
        {errors.checkIn && <p className="error">{errors.checkIn.message}</p>}
      </label>
      <label>
        Check-out
        <input type="date" {...register('checkOut')} />
        {errors.checkOut && <p className="error">{errors.checkOut.message}</p>}
      </label>
      {/* TODO: guests select field */}
      <button type="submit">Continue</button>
    </form>
  )
}
```

### `src/main.tsx`

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { StoreProvider } from './store/StoreContext'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 2 },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <StoreProvider>
          <AuthProvider>
            <App />
            <Toaster position="bottom-right" />
          </AuthProvider>
        </StoreProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)
```

### `src/test-setup.ts`

```ts
import '@testing-library/jest-dom'
```

### `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
  },
})
```

### `src/tests/ListingCard.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ListingCard } from '../components/ListingCard'
import type { Listing } from '../types'

const listing: Listing = {
  id: 1,
  title: 'Tropical Villa',
  location: 'Bali, Indonesia',
  price: 185,
  rating: 4.97,
  superhost: true,
  available: true,
  availableFrom: '2025-01-12',
  category: 'beach',
  img: 'https://example.com/photo.jpg',
}

describe('ListingCard', () => {
  it('renders title and price', () => {
    render(<ListingCard listing={listing} saved={false} onToggleSave={vi.fn()} />)
    // TODO: assert title is in the document
    // TODO: assert price is in the document
  })

  it('shows Superhost badge when superhost is true', () => {
    // TODO
  })

  it('hides Superhost badge when superhost is false', () => {
    // TODO
  })

  it('calls onToggleSave when heart button is clicked', async () => {
    const user = userEvent.setup()
    const onToggleSave = vi.fn()
    // TODO: render, click heart, assert called once
  })
})
```

---

## Run the Assignment

```bash
cd airbnb-app
npm run dev          # run the app
npm test             # run tests in watch mode
npm run build        # verify TypeScript
```

---

## Acceptance Criteria

| # | Criteria | How to verify |
|---|----------|---------------|
| 1 | `axios` instance created with base URL and interceptors | Check `src/lib/axios.ts` |
| 2 | `QueryClientProvider` + `ReactQueryDevtools` in `main.tsx` | DevTools panel visible in browser |
| 3 | `useListings` uses `useQuery` with axios | React Query DevTools shows cache entry |
| 4 | Listings load with `isLoading` spinner, `isError` retry button | Disconnect network — error state shows |
| 5 | `useToggleSaved` optimistic update — UI updates instantly | Toggle heart — instant UI change |
| 6 | Optimistic update rolls back on error | Mock failed mutation — state reverts |
| 7 | Zod schemas defined for all 3 form steps | `src/schemas/booking.ts` has 3 schemas |
| 8 | `react-hook-form` + Zod resolver used on each step | No manual `useState` for form fields |
| 9 | Inline validation errors shown per field | Leave check-in empty — error message shows |
| 10 | Booking form has 4 steps with step indicators | All 4 steps navigable |
| 11 | Step 2 has file upload with image preview and 5MB validation | Upload image — preview appears |
| 12 | Step 4 shows full booking summary | All entered data visible in confirmation |
| 13 | `ListingCard` tests all pass | `npm test` — all green |
| 14 | Search filter tests pass | `npm test` — filter tests green |
| 15 | API mock tests pass | `npm test` — API tests green |
| 16 | Booking form validation tests pass | `npm test` — form tests green |
| 17 | No TypeScript errors | `npm run build` passes |

---

## Submission Checklist

- [ ] All 17 acceptance criteria pass
- [ ] `npm test` — all tests green
- [ ] `npm run build` — zero TypeScript errors
- [ ] `axios`, `@tanstack/react-query`, `zod`, `react-hook-form`, `@hookform/resolvers` all used
- [ ] Optimistic update confirmed working
- [ ] File upload shows preview
- [ ] All 4 form steps validate with Zod before advancing
- [ ] Test files in `src/tests/`
