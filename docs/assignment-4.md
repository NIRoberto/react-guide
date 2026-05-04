# Assignment 4: Booking Flow & Test Suite

## Description

Build a full booking flow with TanStack Query for cached data fetching, a validated 4-step booking form with file upload, optimistic updates, and a complete Vitest + React Testing Library test suite.

---

## Setup

```bash
cp -r assignment-3 assignment-4
cd assignment-4
npm install @tanstack/react-query
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
npm run dev
```

---

## File Structure

```
src/
├── components/
│   ├── ListingCard.tsx
│   ├── ListingCard.module.css
│   ├── BookingForm/
│   │   ├── BookingForm.tsx         # 4-step form
│   │   ├── StepDates.tsx           # step 1
│   │   ├── StepPersonal.tsx        # step 2
│   │   ├── StepPayment.tsx         # step 3
│   │   └── StepConfirmation.tsx    # step 4
│   ├── Navbar.tsx
│   ├── ProtectedRoute.tsx
│   └── Spinner.tsx
├── hooks/
│   ├── useListings.ts              # useQuery wrapper
│   ├── useListing.ts               # single listing query
│   └── useToggleSaved.ts           # useMutation with optimistic update
├── pages/
│   ├── Home.tsx
│   ├── ListingDetail.tsx           # includes BookingForm
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

1. Install `@tanstack/react-query` and wrap the app in `QueryClientProvider` in `main.tsx`
2. Create `src/hooks/useListings.ts` — `useQuery` with `queryKey: ['listings']` and `staleTime: 5 * 60 * 1000`
3. Create `src/hooks/useListing.ts` — `useQuery` with `queryKey: ['listing', id]`, `enabled: !!id`
4. Create `src/hooks/useToggleSaved.ts` — `useMutation` with optimistic update: update cache immediately, roll back on error
5. Build `BookingForm` as a 4-step form: **Dates & Guests → Personal Info → Payment → Confirmation**
6. Validate each step before advancing — show inline error messages per field
7. Add a file upload input in Step 2 for profile photo with image preview and 5MB size validation
8. Handle all query states: `isLoading`, `isError`, `isFetching`, empty results
9. Set up Vitest with `jsdom` environment and `@testing-library/jest-dom`
10. Write `ListingCard.test.tsx` — test renders title, price, superhost badge, hides badge when false, calls `onToggleSave` on click
11. Write `SearchFilter.test.tsx` — test search filters by title and location, clearing shows all
12. Write `api.test.tsx` — mock fetch, test loading state then listings appear, test error state
13. Write `BookingForm.test.tsx` — test required field validation, test advancing to next step on valid input

---

## Starter Code

### `src/main.tsx`

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
```

### `src/hooks/useListings.ts`

```ts
import { useQuery } from '@tanstack/react-query'
import type { Listing } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function fetchListings(): Promise<Listing[]> {
  const res = await fetch(`${API_URL}/listings`)
  if (!res.ok) throw new Error(`Failed to fetch listings: ${res.status}`)
  return res.json()
}

export function useListings() {
  return useQuery<Listing[], Error>({
    queryKey: ['listings'],
    queryFn: fetchListings,
    staleTime: 5 * 60 * 1000,
  })
}
```

### `src/hooks/useToggleSaved.ts`

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function useToggleSaved() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: (id: number) =>
      fetch(`${API_URL}/saved/${id}`, { method: 'POST' }).then(r => {
        if (!r.ok) throw new Error('Failed to toggle saved')
      }),

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

### `src/components/BookingForm/BookingForm.tsx`

```tsx
import { useState } from 'react'
import { StepDates } from './StepDates'
import { StepPersonal } from './StepPersonal'
import { StepPayment } from './StepPayment'
import { StepConfirmation } from './StepConfirmation'

export interface BookingData {
  checkIn: string
  checkOut: string
  guests: number
  name: string
  email: string
  phone: string
  photo: string | null
  card: string
  expiry: string
  cvv: string
}

const STEPS = ['Dates & Guests', 'Personal Info', 'Payment', 'Confirmation'] as const

interface BookingFormProps {
  listingId: number
  listingTitle: string
  pricePerNight: number
}

export function BookingForm({ listingId, listingTitle, pricePerNight }: BookingFormProps) {
  const [step, setStep] = useState<number>(0)
  const [data, setData] = useState<BookingData>({
    checkIn: '', checkOut: '', guests: 1,
    name: '', email: '', phone: '', photo: null,
    card: '', expiry: '', cvv: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof BookingData, string>>>({})

  const update = (field: keyof BookingData, value: string | number | null): void => {
    setData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof BookingData, string>> = {}
    // TODO: validate fields for current step
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = (): void => { if (validate()) setStep(s => s + 1) }
  const back = (): void => setStep(s => s - 1)

  return (
    <div className="booking-form">
      {/* TODO: step indicator */}
      {step === 0 && <StepDates data={data} errors={errors} onChange={update} />}
      {step === 1 && <StepPersonal data={data} errors={errors} onChange={update} />}
      {step === 2 && <StepPayment data={data} errors={errors} onChange={update} />}
      {step === 3 && <StepConfirmation data={data} listingTitle={listingTitle} pricePerNight={pricePerNight} />}
      <div className="form-actions">
        {step > 0 && <button type="button" onClick={back}>Back</button>}
        {step < STEPS.length - 1
          ? <button type="button" onClick={next}>Continue</button>
          : <button type="button" onClick={() => console.log('Booking confirmed', data)}>Confirm Booking</button>
        }
      </div>
    </div>
  )
}
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
cd assignment-4
npm install
npm run dev          # run the app
npm test             # run tests in watch mode
npm run build        # verify TypeScript
```

---

## Acceptance Criteria

| # | Criteria | How to verify |
|---|----------|---------------|
| 1 | `QueryClientProvider` wraps the app | App renders without TanStack Query errors |
| 2 | `useListings` uses `useQuery` with correct `queryKey` and `staleTime` | React Query DevTools shows cache entry |
| 3 | Listings load with `isLoading` spinner, `isError` retry button | Disconnect network — error state shows |
| 4 | `useToggleSaved` optimistic update — UI updates before server responds | Toggle heart — instant UI change |
| 5 | Optimistic update rolls back on error | Mock a failed mutation — state reverts |
| 6 | Booking form has 4 steps with step indicators | All 4 steps navigable |
| 7 | Step 1 validates check-in, check-out, guests before advancing | Leave check-in empty — error message shows |
| 8 | Step 2 validates name, email format, phone before advancing | Enter invalid email — error message shows |
| 9 | Step 2 has file upload with image preview and 5MB validation | Upload an image — preview appears |
| 10 | Step 3 validates card number (16 digits), expiry (MM/YY), CVV (3 digits) | Enter short card number — error shows |
| 11 | Step 4 shows booking summary | All entered data visible in confirmation |
| 12 | `ListingCard` tests: title, price, badge, toggle — all pass | `npm test` — all green |
| 13 | Search filter tests pass | `npm test` — filter tests green |
| 14 | API mock tests: loading, success, error — all pass | `npm test` — API tests green |
| 15 | Booking form validation tests pass | `npm test` — form tests green |
| 16 | No TypeScript errors | `npm run build` passes |

---

## Submission Checklist

- [ ] All 16 acceptance criteria pass
- [ ] `npm test` — all tests green
- [ ] `npm run build` — zero TypeScript errors
- [ ] Optimistic update confirmed working
- [ ] File upload shows preview
- [ ] All 4 form steps validate before advancing
- [ ] Test files in `src/tests/` — not mixed with source files
