# Assignment 4: Real-World Integration — Guest, Host & Admin

## Description

In the previous phases, you built the foundation — listings display, routing, auth context. Now you integrate **real server state management** with TanStack Query and build the three core user flows that make this a complete Airbnb clone: **Guest** (browse and book), **Host** (manage listings), and **Admin** (moderate platform).

This assignment is not about building isolated components. It's about integrating features that talk to a real API, handle loading and error states gracefully, cache data intelligently, and provide instant feedback with optimistic updates.

By the end of this assignment, you have a production-ready app where guests can book listings, hosts can create and edit their properties, and admins can approve or reject content — all with proper validation, error handling, and real-time UI updates.

---

## New Libraries

| Library | Purpose |
|---------|------------|
| `@tanstack/react-query` | Server state management — caching, background refetch, loading/error states |
| `@tanstack/react-query-devtools` | Browser DevTools panel to inspect cache entries and query status |
| `zod` | TypeScript-first schema validation — define rules once, get types automatically |
| `react-hook-form` | Performant forms with minimal re-renders |
| `@hookform/resolvers` | Connects react-hook-form with Zod for automatic validation |

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools zod react-hook-form @hookform/resolvers
```

---

## Target Structure

```
src/
├── features/
│   ├── listings/
│   │   ├── hooks/
│   │   │   ├── useListings.ts
│   │   │   ├── useListing.ts
│   │   │   └── useToggleSaved.ts
│   │   └── ...
│   ├── bookings/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   ├── useCreateBooking.ts
│   │   │   └── useMyBookings.ts
│   │   ├── schemas/
│   │   │   └── booking.ts
│   │   ├── pages/
│   │   │   └── MyBookingsPage.tsx
│   │   └── index.ts
│   ├── host/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   ├── useMyListings.ts
│   │   │   ├── useCreateListing.ts
│   │   │   ├── useUpdateListing.ts
│   │   │   └── useDeleteListing.ts
│   │   ├── schemas/
│   │   │   └── listing.ts
│   │   ├── pages/
│   │   │   ├── HostDashboard.tsx
│   │   │   ├── CreateListingPage.tsx
│   │   │   └── EditListingPage.tsx
│   │   └── index.ts
│   └── admin/
│       ├── hooks/
│       │   ├── usePendingListings.ts
│       │   ├── useApprove.ts
│       │   ├── useReject.ts
│       │   └── useAllBookings.ts
│       ├── pages/
│       │   ├── AdminDashboard.tsx
│       │   └── ModerationQueue.tsx
│       └── index.ts
├── lib/
│   └── api.ts
└── main.tsx
```

---

## Part 1: Foundation — API Client & Query Setup

### Task 1: Build the Shared API Client
Create `src/lib/api.ts` — a shared fetch wrapper used by every API call in the app. It should read `VITE_API_URL` from environment variables as the base URL. Attach the auth token from localStorage to every request as a Bearer token in the Authorization header. Handle 401 responses globally — clear the token and redirect to login. Export typed convenience methods: `api.get<T>(path)`, `api.post<T>(path, body)`, `api.put<T>(path, body)`, `api.delete<T>(path)`.

### Task 2: Set Up TanStack Query Provider
Wrap the app with `QueryClientProvider` in `main.tsx`. Configure the QueryClient with sensible defaults: data stays fresh for 5 minutes before background refetch, retry failed requests twice with exponential backoff. Add `ReactQueryDevtools` so you can inspect the cache during development.

### Task 3: Refactor Listings to Use Real Data
Replace the hardcoded listings array with a `useListings` hook that uses `useQuery` to fetch from `/api/listings`. The queryKey should be `['listings']`. Update `ListingsPage` to handle all query states: show a full-page spinner while loading, show an error message with a retry button on failure, show an empty state when the array is empty, and show the grid when data is available. Add a subtle "Refreshing..." indicator when `isFetching` is true during background refetch.

### Task 4: Fetch Single Listing by ID
Build `useListing(id)` that fetches a single listing from `/api/listings/:id`. Use `queryKey: ['listing', id]` so each listing has its own cache entry. Set `enabled: !!id` so the query doesn't run until an ID is provided. Use this hook in `ListingDetail` instead of finding the listing from the store.

---

## Part 2: Guest Flow — Browse, Save, and Book

### Task 5: Optimistic Save/Unsave
Build `useToggleSaved` mutation that POSTs to `/api/saved/:id`. Implement a full optimistic update: immediately update the `['saved']` cache in `onMutate` before the request completes so the heart button feels instant. Snapshot the previous cache value. If the request fails in `onError`, roll back to the snapshot. In `onSettled`, invalidate the `['saved']` query to sync with the server's real state. The UI should never freeze or show a loading spinner when toggling save — it should feel instant even on a slow connection.

### Task 6: Booking Form — Step 1 (Dates & Guests)
Create the bookings feature under `src/features/bookings/`. Define a Zod schema for the first step: `checkIn` (required date string), `checkOut` (required date string), `guests` (number between 1 and 16). Add a custom `.refine` validation that check-out must be after check-in. Build a form component using `react-hook-form` with the Zod schema as the resolver. Show inline validation errors below each field. The form should only advance to the next step when all fields are valid.

### Task 7: Booking Form — Step 2 (Guest Info)
Define a Zod schema for guest information: `name` (min 2 characters), `email` (valid email format), `phone` (min 7 characters). Build the form step with `react-hook-form`. Add a file input for a profile photo with live image preview. Validate that the file is under 5MB — show an error if it exceeds the limit. The preview should show immediately after selecting a file, before any upload happens.

### Task 8: Booking Form — Step 3 (Payment)
Define a Zod schema for payment: `card` (exactly 16 digits), `expiry` (MM/YY format), `cvv` (exactly 3 digits). Build the form step. Show inline validation errors. This is a mock payment form — no real payment processing, but the validation should be production-ready.

### Task 9: Booking Form — Step 4 (Confirmation)
Build the final step that displays a read-only summary of all data collected in steps 1–3. Show the listing details, selected dates, guest count, guest name and email, and total price. Add a "Confirm Booking" button that submits the booking.

### Task 10: Submit Booking with Mutation
Build `useCreateBooking` mutation that POSTs all accumulated form data to `/api/bookings`. On success, invalidate the `['bookings']` and `['listing', id]` queries so the listing's availability updates. Show a success toast and redirect to `/bookings` (the guest's bookings page). On error, show the error message and let the user retry without losing their form data.

### Task 11: My Bookings Page
Build `MyBookingsPage` that shows all bookings for the logged-in guest. Use `useMyBookings` hook with `useQuery` and queryKey `['bookings', 'me']`. Display each booking as a card showing the listing image, title, dates, guest count, and total price. Show booking status (pending, confirmed, cancelled). Add a "Cancel Booking" button that calls a `useCancelBooking` mutation with optimistic update — the booking should disappear from the list immediately, then roll back if the request fails.

---

## Part 3: Host Flow — Manage Listings

### Task 12: Host Dashboard
Build `HostDashboard` page that shows all listings owned by the logged-in host. Use `useMyListings` hook with queryKey `['listings', 'mine']`. Display each listing as a card with image, title, price, status (draft, pending approval, published, rejected), and action buttons (Edit, Delete, View). Show total earnings, total bookings, and average rating as summary stats at the top.

### Task 13: Create Listing Form
Build `CreateListingPage` with a form for all listing fields: title, description, location, price, category, superhost toggle, availability toggle, available from date, and image upload with preview. Define a Zod schema with all validation rules: title min 10 characters, description min 50 characters, price min $10, image required and under 5MB. Use `react-hook-form` with the Zod resolver. On submit, call `useCreateListing` mutation that POSTs to `/api/listings`. On success, invalidate `['listings', 'mine']` and redirect to the host dashboard.

### Task 14: Edit Listing Form
Build `EditListingPage` that loads an existing listing with `useListing(id)` and pre-fills the form with its data. Use the same Zod schema and form structure as create. On submit, call `useUpdateListing` mutation that PUTs to `/api/listings/:id`. Use optimistic update: immediately update the `['listing', id]` cache with the new data before the request completes. If the request fails, roll back to the previous data. On success, invalidate `['listings', 'mine']` and redirect to the host dashboard.

### Task 15: Delete Listing
Add a "Delete" button to each listing card in the host dashboard. On click, show a confirmation dialog. If confirmed, call `useDeleteListing` mutation that DELETEs `/api/listings/:id`. Use optimistic update: immediately remove the listing from the `['listings', 'mine']` cache. If the request fails, roll back and show an error toast. The listing should disappear from the UI instantly, not after waiting for the server.

### Task 16: Host Bookings View
Add a "Bookings" tab to the host dashboard that shows all bookings for the host's listings. Use `useHostBookings` with queryKey `['bookings', 'host']`. Display each booking with guest name, listing title, dates, status, and total price. Add "Approve" and "Decline" buttons for pending bookings. Each button calls a mutation with optimistic update — the booking status should change instantly in the UI.

---

## Part 4: Admin Flow — Moderation & Analytics

### Task 17: Admin Dashboard
Build `AdminDashboard` that shows platform-wide stats: total users, total listings, total bookings, total revenue. Use `useAdminStats` with queryKey `['admin', 'stats']`. Display the stats as cards with icons. Add navigation links to the moderation queue and all bookings.

### Task 18: Moderation Queue
Build `ModerationQueue` page that shows all listings with status "pending approval". Use `usePendingListings` with queryKey `['listings', 'pending']`. Display each listing as a card with full details: image, title, description, price, host name. Add "Approve" and "Reject" buttons. Each button calls a mutation (`useApprove` or `useReject`) that PATCHes `/api/listings/:id/status`. Use optimistic update: immediately remove the listing from the pending queue. If the request fails, roll back and show an error.

### Task 19: All Bookings View
Build a page that shows all bookings across the platform. Use `useAllBookings` with queryKey `['bookings', 'all']`. Add filters for status (all, pending, confirmed, cancelled) and date range. When a filter changes, update the queryKey to include the filter values so TanStack Query treats each filter combination as a separate cache entry. Add pagination — use `placeholderData: keepPreviousData` so the previous page stays visible while the next page loads.

### Task 20: Ban User
Add a "Ban User" action to the admin dashboard. When clicked, show a confirmation dialog. If confirmed, call `useBanUser` mutation that POSTs to `/api/admin/users/:id/ban`. On success, invalidate all queries that include user data: `['users']`, `['listings']`, `['bookings']`. The banned user's listings should disappear from the moderation queue and their bookings should be cancelled automatically.

---

## Acceptance Criteria

| # | Criteria |
|---|----------|
| 1 | Shared API client in `src/lib/api.ts` with auth headers and 401 handling |
| 2 | `QueryClientProvider` + `ReactQueryDevtools` in `main.tsx` |
| 3 | `useListings` fetches from real API — no hardcoded data |
| 4 | `ListingsPage` handles loading, error, empty, and success states |
| 5 | `useListing(id)` fetches single listing with `enabled: !!id` |
| 6 | `useToggleSaved` optimistic update — heart toggles instantly, rolls back on error |
| 7 | Booking form has 4 steps with Zod validation on each step |
| 8 | Step 2 has file upload with preview and 5MB validation |
| 9 | Step 4 shows full booking summary before submit |
| 10 | `useCreateBooking` invalidates correct queries on success |
| 11 | My Bookings page shows all guest bookings with cancel button |
| 12 | Host dashboard shows all host listings with stats |
| 13 | Create listing form validates with Zod before submit |
| 14 | Edit listing form pre-fills with existing data and uses optimistic update |
| 15 | Delete listing uses optimistic update — listing disappears instantly |
| 16 | Host bookings view shows all bookings for host's listings |
| 17 | Admin dashboard shows platform-wide stats |
| 18 | Moderation queue shows pending listings with approve/reject |
| 19 | All bookings view has filters and pagination with `keepPreviousData` |
| 20 | Ban user invalidates all relevant queries |
| 21 | All features export through their own `index.ts` |
| 22 | `npm run build` passes with zero TypeScript errors |

---

## Submission Checklist

- [ ] All 22 acceptance criteria pass
- [ ] Three features: `bookings/`, `host/`, `admin/` — each self-contained
- [ ] Every mutation uses optimistic updates where appropriate
- [ ] Every form uses Zod + react-hook-form
- [ ] All loading, error, and empty states handled gracefully
- [ ] ReactQueryDevtools shows all cache entries correctly
- [ ] No TypeScript errors
- [ ] No hardcoded data — everything fetched from API

---

## What You Built

A complete Airbnb clone with three user roles:

**Guest** — Browse listings, save favorites with instant feedback, book a listing through a validated 4-step form, view and cancel bookings.

**Host** — Create listings with image upload and validation, edit listings with optimistic updates, delete listings with instant UI feedback, view bookings for their properties and approve/decline them.

**Admin** — View platform stats, moderate pending listings with approve/reject, view all bookings with filters and pagination, ban users with automatic cleanup of their content.

Every feature uses TanStack Query for caching and background refetch. Every write operation uses optimistic updates for instant UI feedback. Every form uses Zod for validation and react-hook-form for performance. The app feels fast even on slow connections because the UI updates immediately and syncs with the server in the background.
