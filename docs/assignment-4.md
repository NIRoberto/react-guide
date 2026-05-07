# Assignment 4: Bookings Feature & Data Fetching

## Description

In the previous phases, data was hardcoded and loaded from a local array. Real apps fetch data from an API. In this assignment you will replace the simulated data loading with **TanStack Query** — the industry standard for server state management in React. You will also add the **bookings feature**: a 4-step form that walks the user through selecting dates, entering personal info, entering payment details, and confirming the booking.

The bookings feature introduces two important concepts: **form validation with Zod** (define your validation rules as a schema, get TypeScript types for free) and **react-hook-form** (manage form state with minimal re-renders).

By the end of this assignment, the app fetches real data, handles loading and error states gracefully, and has a complete booking flow.

---

## New Library to Learn — `zod`

Zod is a TypeScript-first schema validation library. You define the shape and rules of your data once as a schema, and Zod gives you both runtime validation and TypeScript types — no duplication.

Example: instead of writing a TypeScript interface AND a separate validation function, you write one Zod schema:
```
const schema = z.object({
  email: z.string().email('Valid email required'),
  guests: z.number().min(1).max(16),
})
type FormData = z.infer<typeof schema>  // TypeScript type for free
```

When you call `schema.parse(data)`, Zod validates the data and throws with detailed error messages if anything is wrong. When used with `react-hook-form` via `@hookform/resolvers`, validation runs automatically on form submit and on field blur.

Read the Zod docs and understand `z.object`, `z.string`, `z.number`, `.min`, `.max`, `.email`, `.regex`, `.refine`, and `z.infer`. You will write 3 schemas for the booking form steps.

---

## Libraries in This Assignment

| Library | Purpose |
|---------|---------|
| `@tanstack/react-query` | Server state management — caching, background refetch, loading/error states automatically |
| `@tanstack/react-query-devtools` | Browser DevTools panel showing all cache entries and their status |
| `zod` | TypeScript-first schema validation — define rules once, get types automatically |
| `react-hook-form` | Performant forms with minimal re-renders — integrates with Zod via resolvers |
| `@hookform/resolvers` | Connects react-hook-form with Zod so validation runs automatically |
| `axios` | HTTP client with interceptors, automatic JSON parsing, better error handling than fetch |

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools zod react-hook-form @hookform/resolvers axios
```

---

## Target Structure

```
src/
├── features/
│   ├── listings/
│   │   ├── hooks/
│   │   │   ├── useListings.ts        ← replace simulated fetch with useQuery
│   │   │   ├── useListing.ts         ← new: single listing query
│   │   │   └── useToggleSaved.ts     ← new: mutation with optimistic update
│   │   └── ...
│   └── bookings/
│       ├── components/
│       │   ├── BookingForm.tsx
│       │   ├── StepDates.tsx
│       │   ├── StepPersonal.tsx
│       │   ├── StepPayment.tsx
│       │   └── StepConfirmation.tsx
│       ├── hooks/
│       │   └── useBooking.ts
│       ├── schemas/
│       │   └── booking.ts
│       ├── types.ts
│       └── index.ts
├── lib/
│   └── axios.ts
├── App.tsx
└── main.tsx
```

---

## Tasks

### 1. Create the Axios Instance
Create `src/lib/axios.ts`. This is a shared axios instance used by all API calls in the app. Configure it with a `baseURL` from `import.meta.env.VITE_API_URL`. Add a request interceptor that reads a token from `localStorage` and attaches it as a `Bearer` token in the `Authorization` header. Add a response interceptor that catches 401 errors — when a 401 happens, clear the token from localStorage and redirect to `/login`. This centralises all HTTP configuration in one place.

### 2. Set Up TanStack Query
In `main.tsx`, wrap the app with `QueryClientProvider`. Create a `QueryClient` with default options: `staleTime` of 5 minutes (data is considered fresh for 5 minutes before refetching) and `retry: 2` (retry failed requests twice). Add `<ReactQueryDevtools initialIsOpen={false} />` so you can inspect the cache in the browser during development.

### 3. Refactor useListings to Use useQuery
Replace the `setTimeout` simulation in `useListings` with a real `useQuery` call. Use `queryKey: ['listings']` and a `queryFn` that calls the axios instance to fetch from `/listings`. Return the full query result so the page can access `data`, `isLoading`, `isError`, and `isFetching`.

### 4. Build useListing Hook
Create `src/features/listings/hooks/useListing.ts`. This fetches a single listing by ID. Use `useQuery` with `queryKey: ['listing', id]`. Set `enabled: !!id` so the query only runs when an ID is actually provided. Use this hook in `ListingDetail` instead of finding the listing from the store.

### 5. Build useToggleSaved with Optimistic Updates
Create `src/features/listings/hooks/useToggleSaved.ts`. Use `useMutation` to POST to `/saved/:id`. Implement an optimistic update: in `onMutate`, immediately update the `['saved']` cache before the request completes so the UI feels instant. In `onError`, roll back to the previous cache value if the request fails. In `onSettled`, invalidate the `['saved']` query to sync with the server.

### 6. Handle All Query States in ListingsPage
Update `ListingsPage` to handle all states from `useListings`: show `<Spinner />` while `isLoading` is true, show an error message with a "Try again" button when `isError` is true, show the empty state when data is an empty array, and show the grid when data is available.

### 7. Define Booking Validation Schemas
Create `src/features/bookings/schemas/booking.ts`. Write three Zod schemas: one for Step 1 (dates) with `checkIn` (required string), `checkOut` (required string), and `guests` (number, min 1, max 16) — add a `.refine` check that `checkOut` is after `checkIn`. One for Step 2 (personal) with `name` (min 2 chars), `email` (valid email format), and `phone` (min 7 chars). One for Step 3 (payment) with `card` (exactly 16 digits), `expiry` (MM/YY format), and `cvv` (exactly 3 digits). Export the inferred TypeScript types from each schema using `z.infer`.

### 8. Build the Booking Form Steps
Create four step components inside `src/features/bookings/components/`. Each step uses `react-hook-form` with its Zod schema as the resolver. Each step shows inline validation error messages below each field. Each step has a "Continue" button that only advances when all fields are valid.

- `StepDates.tsx` — date inputs for check-in and check-out, a number input or select for guests
- `StepPersonal.tsx` — text inputs for name, email, phone, plus a file input for a profile photo with a live image preview and a validation error if the file exceeds 5MB
- `StepPayment.tsx` — inputs for card number, expiry, and CVV
- `StepConfirmation.tsx` — read-only display of all data collected in steps 1–3, a "Confirm Booking" submit button

### 9. Build the useBooking Hook
Create `src/features/bookings/hooks/useBooking.ts`. This hook manages the multi-step form state. It holds the current step index and the accumulated form data from all completed steps. It exposes `currentStep`, `next(data)` (advance to next step and merge data), `back()` (go to previous step), and `submit()` (call the booking API with all accumulated data).

### 10. Build the BookingForm Orchestrator
Create `src/features/bookings/components/BookingForm.tsx`. This component uses `useBooking` to know which step to show. It renders step indicators (e.g. "Step 2 of 4" or four dots). It renders the correct step component based on `currentStep`. It passes `onNext` and `onBack` callbacks to each step.

### 11. Add Booking Entry Point to ListingDetail
Add a "Book Now" button to `ListingDetail`. When clicked, show the `BookingForm`. Export `BookingForm` through `src/features/bookings/index.ts`.

---

## Acceptance Criteria

| # | Criteria |
|---|----------|
| 1 | `src/lib/axios.ts` has base URL, request interceptor, and 401 response interceptor |
| 2 | `QueryClientProvider` + `ReactQueryDevtools` in `main.tsx` |
| 3 | `useListings` uses `useQuery` — no setTimeout or manual loading state |
| 4 | `useListing` fetches a single listing with `enabled: !!id` |
| 5 | ListingsPage handles loading, error, empty, and success states |
| 6 | `useToggleSaved` optimistic update — UI updates before request completes |
| 7 | Optimistic update rolls back on error |
| 8 | Zod schemas defined for all 3 form steps with correct validation rules |
| 9 | `react-hook-form` + Zod resolver used on each step |
| 10 | Inline validation errors shown per field |
| 11 | Booking form has 4 steps with step indicators |
| 12 | Step 2 has file upload with image preview and 5MB validation |
| 13 | Step 4 shows full booking summary |
| 14 | Bookings feature exports through `src/features/bookings/index.ts` |
| 15 | `npm run build` passes with zero TypeScript errors |

---

## Submission Checklist

- [ ] All 15 acceptance criteria pass
- [ ] `npm run build` — zero TypeScript errors
- [ ] Bookings feature is self-contained under `src/features/bookings/`
- [ ] Axios instance in `src/lib/` — not inside a feature
- [ ] Optimistic update confirmed working
- [ ] File upload shows preview and validates size
- [ ] All 4 form steps validate with Zod before advancing
