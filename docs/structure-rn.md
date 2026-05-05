# React Native App Structure

A scalable React Native project follows the same feature-based approach as React — each feature owns its own components, hooks, screens, and types. The key difference is that React Native uses **screens** instead of pages, and navigation is handled by React Navigation instead of React Router.

---

## Folder Structure

```
airbnb-mobile/
├── assets/                        # fonts, images, icons
│   ├── fonts/
│   └── images/
│
├── src/
│   ├── features/                  # one folder per feature
│   │   ├── listings/
│   │   │   ├── components/        # ListingCard, ListingsGrid, SearchBar
│   │   │   ├── hooks/             # useListings, useFilteredListings
│   │   │   ├── screens/           # ListingsScreen, ListingDetailScreen
│   │   │   ├── types.ts           # Listing interface
│   │   │   └── index.ts           # public API
│   │   │
│   │   ├── bookings/
│   │   │   ├── components/        # BookingForm, BookingSummary
│   │   │   ├── hooks/             # useBooking
│   │   │   ├── screens/           # BookingScreen, ConfirmationScreen
│   │   │   ├── types.ts           # Booking interface
│   │   │   └── index.ts
│   │   │
│   │   ├── profile/
│   │   │   ├── components/        # ProfileCard, AvatarUpload
│   │   │   ├── hooks/             # useProfile
│   │   │   ├── screens/           # ProfileScreen, EditProfileScreen
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── auth/
│   │       ├── components/        # LoginForm, SignupForm
│   │       ├── context/           # AuthContext, AuthProvider
│   │       ├── hooks/             # useAuth
│   │       ├── screens/           # LoginScreen, SignupScreen
│   │       ├── types.ts           # User interface
│   │       └── index.ts
│   │
│   ├── navigation/                # all navigation config lives here
│   │   ├── RootNavigator.tsx      # top-level navigator — switches auth/app stacks
│   │   ├── AppNavigator.tsx       # bottom tabs + main stack (authenticated)
│   │   ├── AuthNavigator.tsx      # login / signup stack (unauthenticated)
│   │   └── types.ts               # typed route params for every screen
│   │
│   ├── shared/                    # code used by 2+ features
│   │   ├── components/            # Button, Input, Spinner, EmptyState, Card
│   │   ├── hooks/                 # useAsyncStorage, useDebounce
│   │   └── types/
│   │       └── index.ts           # shared interfaces
│   │
│   ├── store/                     # global state
│   │   ├── types.ts               # State shape and Action union
│   │   ├── reducer.ts             # pure reducer function
│   │   └── StoreContext.tsx       # context, StoreProvider, useStore hook
│   │
│   ├── data/                      # mock data
│   │   └── listings.ts
│   │
│   ├── config/
│   │   └── env.ts                 # typed environment variables
│   │
│   └── App.tsx                    # root — renders RootNavigator + providers
│
├── .env                           # environment variables
├── .gitignore
├── app.json                       # Expo config
├── babel.config.js
├── package.json
└── tsconfig.json
```

---

## Key Differences from React (Web)

### Screens instead of Pages

In React Native there are no URLs. Navigation is stack-based — screens are pushed onto and popped off a stack, like a deck of cards. Each screen is the equivalent of a page in a web app.

### React Navigation instead of React Router

React Navigation manages the navigation stack, tab bars, and drawer menus. It lives entirely in `src/navigation/` and is separate from your feature code.

### No CSS — StyleSheet or NativeWind

React Native has no CSS files. Styles are written with `StyleSheet.create()` (built-in) or NativeWind (Tailwind for React Native). Each component manages its own styles.

### AsyncStorage instead of localStorage

React Native has no `localStorage`. Persistent storage uses `AsyncStorage` from `@react-native-async-storage/async-storage`. The `useAsyncStorage` hook in `shared/hooks/` wraps it.

---

## Folder by Folder

### `src/App.tsx` — Root Component

Wraps the app with all providers and renders the `RootNavigator`. Nothing else. No screens, no UI.

---

### `src/navigation/` — All Navigation Config

Navigation is complex enough to deserve its own top-level folder. Keeping all navigator files here means your feature folders stay clean — they only contain screens, not navigation logic.

**`RootNavigator.tsx`** — the top-level navigator. It reads `isAuthenticated` from `AuthContext` and renders either the `AuthNavigator` (login/signup) or the `AppNavigator` (the main app). This is how you gate the entire app behind authentication.

**`AppNavigator.tsx`** — the main app navigation for authenticated users. Typically a bottom tab navigator with tabs for Listings, Saved, Bookings, and Profile. Each tab can have its own nested stack navigator.

**`AuthNavigator.tsx`** — a stack navigator for unauthenticated screens — Login and Signup.

**`types.ts`** — typed route params for every screen. This gives you autocomplete and type safety when navigating between screens.

---

### `src/features/` — Feature Modules

Same concept as the web app — each feature is self-contained.

**`features/listings/`** — browsing and viewing listings. Contains `ListingCard`, `ListingsGrid`, `SearchBar` components. The `ListingsScreen` shows the grid with search. The `ListingDetailScreen` shows a single listing with a booking button.

**`features/bookings/`** — creating and managing bookings. The `BookingScreen` contains the booking form. The `ConfirmationScreen` shows the booking summary after submission.

**`features/auth/`** — authentication. `AuthContext` holds the current user and exposes `login` and `logout`. `LoginScreen` and `SignupScreen` are the entry points for unauthenticated users.

**`features/profile/`** — user profile. `ProfileScreen` shows the current user's info and saved listings. `EditProfileScreen` allows updating name, email, and avatar.

---

### `features/*/index.ts` — Public API

Each feature exports only what other parts of the app need. Screens, key components, and hooks are exported. Internal implementation details stay private. Other features and the navigation config import from `index.ts` only.

---

### `src/shared/` — Truly Shared Code

Only code used by two or more features belongs here.

- `shared/components/` — `Button`, `Input`, `Spinner`, `EmptyState`, `Card` — primitive UI building blocks used everywhere
- `shared/hooks/` — `useAsyncStorage` for persistent storage, `useDebounce` for search inputs
- `shared/types/` — `Listing`, `Booking`, `User` interfaces shared across features

---

### `src/store/` — Global State

Same pattern as the web app — Context API + useReducer. Holds state that multiple features need: listings array, loading flag, search filter, saved IDs.

The structure is identical to the web app: `types.ts` defines the shape, `reducer.ts` is the pure function, `StoreContext.tsx` provides the context and `useStore` hook.

---

### `src/config/env.ts` — Environment Variables

In Expo, environment variables are accessed via `process.env.EXPO_PUBLIC_*`. This file wraps all of them in a typed `config` object. No feature or component accesses `process.env` directly.

---

### `assets/` — Static Files

Fonts, images, and icons used across the app. Expo loads fonts from here via `expo-font`. Images are imported directly into components.

---

## Navigation Flow

```
App.tsx
  └── RootNavigator
        ├── AuthNavigator (when not logged in)
        │     ├── LoginScreen
        │     └── SignupScreen
        │
        └── AppNavigator (when logged in)
              ├── Tab: Listings
              │     ├── ListingsScreen        (tab home)
              │     └── ListingDetailScreen   (pushed on tap)
              │           └── BookingScreen   (pushed on "Book Now")
              │                 └── ConfirmationScreen
              │
              ├── Tab: Saved
              │     └── SavedListingsScreen
              │
              ├── Tab: Bookings
              │     └── BookingsScreen
              │
              └── Tab: Profile
                    ├── ProfileScreen
                    └── EditProfileScreen
```

---

## Data Flow

```
User types in SearchBar on ListingsScreen
  → SearchBar dispatches SET_FILTER to the store
  → reducer returns new state with updated filter
  → ListingsScreen re-renders and recomputes filtered listings
  → ListingsGrid renders only matching cards
```

```
User taps a ListingCard
  → navigation.navigate('ListingDetail', { id: listing.id })
  → ListingDetailScreen receives id via route.params
  → screen finds the listing from the store by id
  → full listing detail renders
```

```
User taps "Book Now"
  → navigation.navigate('Booking', { listingId: listing.id })
  → BookingScreen renders the booking form
  → on submit → ConfirmationScreen pushed with booking data
```

```
App launches — user not logged in
  → RootNavigator reads isAuthenticated = false
  → AuthNavigator renders → LoginScreen shown
  → User logs in → isAuthenticated = true
  → RootNavigator switches to AppNavigator
  → ListingsScreen shown
```

---

## Rules

| Rule | Why |
|------|-----|
| Import from a feature's `index.ts`, never its internals | Keeps feature boundaries clean |
| All navigation config in `src/navigation/` | Keeps feature folders focused on UI and logic |
| Screens connect to the store and compose components | Separates data from UI |
| Components receive data via props | Reusable and testable |
| Hooks contain logic, never JSX | Single responsibility |
| Only truly shared code goes in `shared/` | Prevents it becoming a junk drawer |
| Store holds only cross-feature state | Local UI state stays in `useState` |
| Never access `process.env` directly in components | Centralised in `config/env.ts` |
| Typed route params in `navigation/types.ts` | Catch navigation bugs at compile time |
