# React App Structure

A scalable React project organizes code by **feature**, not by file type. Instead of dumping all components into one folder, each feature owns its own components, hooks, and types. Shared code lives in a `shared/` folder.

---

## Folder Structure

```
airbnb-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── features/                  # one folder per feature
│   │   ├── listings/
│   │   │   ├── components/        # UI components for listings
│   │   │   ├── hooks/             # listings-specific hooks
│   │   │   ├── pages/             # ListingsPage, ListingDetail
│   │   │   ├── types.ts           # Listing interface
│   │   │   └── index.ts           # public API — what this feature exports
│   │   │
│   │   ├── bookings/
│   │   │   ├── components/        # BookingForm and its steps
│   │   │   ├── hooks/             # useBooking
│   │   │   ├── pages/             # BookingConfirmation
│   │   │   ├── types.ts           # Booking interface
│   │   │   └── index.ts
│   │   │
│   │   └── auth/
│   │       ├── components/        # LoginForm
│   │       ├── context/           # AuthContext, AuthProvider
│   │       ├── hooks/             # useAuth
│   │       ├── pages/             # Login, Dashboard
│   │       ├── types.ts           # User interface
│   │       └── index.ts
│   │
│   ├── shared/                    # code used by 2+ features
│   │   ├── components/            # Navbar, Spinner, ProtectedRoute, NotFound
│   │   ├── hooks/                 # useLocalStorage
│   │   └── types/
│   │       └── index.ts           # shared interfaces (Listing, Booking, User)
│   │
│   ├── store/                     # global state
│   │   ├── types.ts               # State shape and Action union
│   │   ├── reducer.ts             # pure reducer function
│   │   └── StoreContext.tsx       # context, StoreProvider, useStore hook
│   │
│   ├── data/                      # mock data (replaced by API in Phase 4)
│   │   └── listings.ts
│   │
│   ├── config/
│   │   └── env.ts                 # typed environment variables
│   │
│   ├── App.tsx                    # routes only
│   ├── index.css                  # global styles / Tailwind import
│   └── main.tsx                   # entry point + providers
│
├── .env.local                     # local env vars — never commit
├── .env.production                # production env vars
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Why Feature-Based?

The alternative — organizing by file type — breaks down fast as the app grows:

```
# Type-based (does not scale)
components/
  ListingCard.tsx
  BookingForm.tsx
  LoginForm.tsx
  Navbar.tsx
hooks/
  useListings.ts
  useBooking.ts
  useAuth.ts
```

When you work on the listings feature, you're jumping between `components/`, `hooks/`, and `types/` constantly. At 50+ files this becomes painful.

```
# Feature-based (scales well)
features/listings/    ← everything listings lives here
features/bookings/    ← everything bookings lives here
features/auth/        ← everything auth lives here
shared/               ← only what is truly shared
```

When you work on listings, you stay inside `features/listings/`. Everything you need is right there.

---

## Folder by Folder

### `src/main.tsx` — Entry Point

Mounts React into the DOM and wraps the app with all global providers — `BrowserRouter`, `StoreProvider`, `AuthProvider`. Nothing else goes here. No UI, no logic.

---

### `src/App.tsx` — Routes Only

Defines the route structure of the entire app. It should be thin — just routes and layout. No `useState`, no `useEffect`, no data fetching.

---

### `src/features/` — Feature Modules

The heart of the app. Each feature is a self-contained module with its own components, hooks, pages, and types.

**`features/listings/`** — everything related to browsing and viewing listings. The `ListingCard`, `ListingsGrid`, `SearchBar` components live here. So do the `useListings` and `useFilteredListings` hooks. The `ListingsPage` and `ListingDetail` pages live here too.

**`features/bookings/`** — everything related to creating a booking. The multi-step `BookingForm` and all its step components live here. The `useBooking` hook manages form state and validation.

**`features/auth/`** — everything related to authentication. The `AuthContext` and `AuthProvider` live here. The `useAuth` hook exposes `login`, `logout`, `user`, and `isAuthenticated`. The `Login` and `Dashboard` pages live here.

---

### `features/*/index.ts` — Public API

Each feature has an `index.ts` that controls what it exposes to the rest of the app. Other features and `App.tsx` import from this file only — never from deep inside the feature.

This boundary means you can refactor the internals of a feature without breaking anything outside it. If it is not exported from `index.ts`, it is private to that feature.

---

### `src/shared/` — Truly Shared Code

Only put something here if **two or more features** use it. If only one feature uses it, it belongs inside that feature. This prevents `shared/` from becoming a dumping ground.

- `shared/components/` — `Navbar`, `Spinner`, `ProtectedRoute`, `NotFound`
- `shared/hooks/` — `useLocalStorage`
- `shared/types/` — `Listing`, `Booking`, `User` interfaces used across features

---

### `src/store/` — Global State

Shared state that multiple features need — `listings`, `loading`, `filter`, `saved`. Built with Context API + useReducer.

- `types.ts` — defines the `State` shape and the `Action` discriminated union
- `reducer.ts` — pure function that takes `(state, action)` and returns new state
- `StoreContext.tsx` — creates the context, exports `StoreProvider` and the `useStore` hook

**What belongs in the store:** state that multiple pages or features need to read or update — the listings array, the search filter, saved listing IDs.

**What does NOT belong in the store:** local UI state like "is this dropdown open" or "which tab is active". That stays in `useState` inside the component.

---

### `src/config/env.ts` — Environment Variables

A single typed object that wraps all `import.meta.env` access. Components never use `import.meta.env` directly — they import from `config` instead. This gives you one place to see every env var the app uses.

---

### `src/data/` — Mock Data

Static data arrays used before a real API exists. In Phase 4 these are replaced by actual API calls via TanStack Query. Keeping mock data here means you only change one place when you switch to a real API.

---

## Data Flow

```
User types in SearchBar
  → SearchBar dispatches SET_FILTER to the store
  → reducer returns new state with updated filter
  → ListingsPage re-renders and recomputes filtered listings
  → ListingsGrid renders only the matching cards
```

```
User clicks Save on a ListingCard
  → ListingCard dispatches TOGGLE_SAVED to the store
  → reducer adds or removes the ID from saved array
  → SavedBadge in Navbar re-renders with updated count
  → ListingCard re-renders with new saved state
```

```
User visits /dashboard without being logged in
  → ProtectedRoute reads isAuthenticated from AuthContext
  → isAuthenticated is false → redirects to /login
  → User submits login form → AuthProvider sets user
  → isAuthenticated becomes true → Dashboard renders
```

---

## Rules

| Rule | Why |
|------|-----|
| Import from a feature's `index.ts`, never its internals | Keeps feature boundaries clean and refactoring safe |
| Pages connect to the store and compose components | Separates data concerns from UI concerns |
| Components receive data via props | Makes them reusable and independently testable |
| Hooks contain logic, never JSX | Single responsibility principle |
| Only truly shared code goes in `shared/` | Prevents it from becoming a junk drawer |
| Store holds only cross-feature state | Local UI state stays in `useState` |
| All shared types in `shared/types/index.ts` | Single source of truth — no duplicate interfaces |
| Never use `import.meta.env` directly in components | Centralised in `config/env.ts` |
