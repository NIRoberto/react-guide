# Assignment 3: Multi-Page App with Routing & Auth

## Description

So far the app is a single page. Real apps have multiple pages — a home page, a listing detail page, a login page, a dashboard. In this assignment you will turn the app into a multi-page experience using React Router v6.

You will also add a second feature: **auth**. The auth feature lives under `src/features/auth/` and is completely self-contained — its own context, its own hooks, its own pages. The listings feature does not know about auth. The auth feature does not know about listings. They communicate only through the shared store and shared components.

You will also learn two important performance techniques: lazy loading (splitting your JavaScript bundle so pages only load when visited) and virtualization (only rendering the DOM nodes that are visible on screen, not all 50 at once).

By the end of this assignment, the app has 5 pages, working navigation, a login flow, a protected dashboard, and a listing detail page — all wired together with React Router.

---

## New Library to Learn — `react-window`

When you render a list of 50 or 500 items, React creates a DOM node for every single one. Most of them are off-screen and invisible, but they still exist in the DOM, consuming memory and slowing down scroll performance.

`react-window` solves this with **virtualization** — it only renders the items that are currently visible in the viewport. As you scroll, it removes items that go off-screen and adds new ones that come into view. The DOM always has ~10 nodes regardless of whether your list has 50 or 50,000 items.

Read the `react-window` docs and understand `FixedSizeList`. You will use it to render the listings grid on the home page.

---

## Libraries in This Assignment

| Library | Purpose |
|---------|---------|
| `react-router-dom` | Client-side routing — navigate between pages without a full page reload |
| `react-window` | Virtualized lists — only render visible rows, not all 50 at once |
| `nprogress` | Slim progress bar at the top of the page — shows when lazy pages are loading |
| `dayjs` | Lightweight date formatting (2kb vs date-fns 13kb) — format dates on the detail page |

```bash
npm install react-router-dom react-window nprogress dayjs
npm install -D @types/react-window @types/nprogress
```

---

## Target Structure

```
src/
├── features/
│   ├── listings/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── ListingsPage.tsx
│   │   │   └── ListingDetail.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   └── auth/
│       ├── components/
│       │   └── LoginForm.tsx
│       ├── context/
│       │   └── AuthContext.tsx
│       ├── hooks/
│       │   └── useAuth.ts
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   └── DashboardPage.tsx
│       ├── types.ts
│       └── index.ts
├── shared/
│   └── components/
│       ├── Navbar.tsx
│       ├── ProtectedRoute.tsx
│       ├── Spinner.tsx
│       └── NotFound.tsx
├── store/
├── data/
├── App.tsx
└── main.tsx
```

---

## Tasks

### 1. Set Up React Router
Wrap `<App />` with `<BrowserRouter>` in `main.tsx`. In `App.tsx`, define all routes using `<Routes>` and `<Route>`. App.tsx should contain only routes — no state, no useEffect, no data fetching. This is the rule from `structure.md`: App.tsx is routes only.

### 2. Build the Auth Feature — Context and Hook
Create `src/features/auth/context/AuthContext.tsx`. Build an `AuthProvider` that holds `isAuthenticated` (boolean), `login(email, password)`, and `logout()`. For now, `login` just sets `isAuthenticated` to true — no real API call. Create `src/features/auth/hooks/useAuth.ts` that returns the context and throws if used outside the provider. Wrap `<App />` with `<AuthProvider>` in `main.tsx`.

### 3. Build the Auth Feature — Pages
Create `src/features/auth/components/LoginForm.tsx` — a form with email and password fields that calls `login` on submit. Create `src/features/auth/pages/LoginPage.tsx` — renders the LoginForm and redirects to `/dashboard` after successful login using `useNavigate`. Create `src/features/auth/pages/DashboardPage.tsx` — shows a welcome message and the count of saved listings from the store. Export both pages through `src/features/auth/index.ts`.

### 4. Build Shared Navbar
Create `src/shared/components/Navbar.tsx`. Use `NavLink` from react-router-dom for links to `/` (Home) and `/dashboard` (Dashboard). `NavLink` automatically adds an `active` class to the currently active link — use this to style the active link differently so users know which page they are on.

### 5. Build ProtectedRoute
Create `src/shared/components/ProtectedRoute.tsx`. This component wraps a page and checks `isAuthenticated` from `useAuth`. If the user is not authenticated, show a toast notification ("Please log in to access this page") and redirect to `/login` using `<Navigate replace />`. If authenticated, render the children. This component is what makes the dashboard private.

### 6. Build NotFound Page
Create `src/shared/components/NotFound.tsx`. A simple 404 page with a message and a link back to the home page. This renders when no route matches.

### 7. Build the Listing Detail Page
Create `src/features/listings/pages/ListingDetail.tsx`. Use `useParams` to extract the `id` from the URL. Find the matching listing from the store. If no listing matches, show a "Listing not found" message. If found, display the full listing — image, title, location, price, rating, superhost badge, and availability. Use `dayjs` to format `availableFrom` as a readable date. Add a back button that calls `useNavigate(-1)` to go back to the previous page. Make each listing card on the home page a clickable link to `/listings/:id`.

### 8. Define All Routes in App.tsx
Set up these routes: `/` renders ListingsPage, `/listings/:id` renders ListingDetail (lazy loaded), `/login` renders LoginPage, `/dashboard` renders DashboardPage wrapped in ProtectedRoute (lazy loaded), and `*` renders NotFound. Wrap lazy-loaded routes in `<Suspense fallback={<Spinner />}>`.

### 9. Add NProgress Loading Bar
In `App.tsx`, use `useLocation` to detect route changes. On every location change, start NProgress. After a short delay (100ms), finish it. This gives users visual feedback that navigation is happening, especially when lazy-loaded pages are downloading.

### 10. Lazy Load Heavy Pages
Use `React.lazy` to lazy load `ListingDetail` and `DashboardPage`. These pages are only downloaded when the user navigates to them, keeping the initial bundle small. Verify this works by checking the Network tab — you should see separate JS chunks loading on navigation.

### 11. Optimize ListingCard with React.memo
Wrap `ListingCard` with `React.memo`. This prevents the card from re-rendering when its parent re-renders but its own props haven't changed. Wrap the `onToggleSave` callback in `ListingsPage` with `useCallback` so the function reference stays stable between renders — otherwise memo won't help because a new function is created every render.

### 12. Virtualize the Listings List
Expand `src/data/listings.ts` to 50 listings. Use `react-window` `FixedSizeList` in `ListingsPage` to render the list. Only the visible rows should be in the DOM at any time. Verify this by opening DevTools and inspecting the DOM — you should see ~10 card elements, not 50.

### 13. Add RESET Action to Store
Add a `RESET` action type to the store that clears `filter` and `saved` back to their initial values. Add a "Clear All" button somewhere in the UI that dispatches it.

---

## Acceptance Criteria

| # | Criteria |
|---|----------|
| 1 | `BrowserRouter`, `StoreProvider`, `AuthProvider` all wrap the app in `main.tsx` |
| 2 | `App.tsx` contains only routes — no state, no logic |
| 3 | Navbar renders with NavLink active styling on current route |
| 4 | Clicking a listing card navigates to `/listings/:id` |
| 5 | ListingDetail shows the correct listing using `useParams` |
| 6 | `dayjs` formats the date on the detail page |
| 7 | Back button navigates to the previous page |
| 8 | `/dashboard` redirects to `/login` when not authenticated |
| 9 | Toast shows when redirected from a protected route |
| 10 | Login form sets `isAuthenticated` and redirects to `/dashboard` |
| 11 | `ListingDetail` and `DashboardPage` are lazy loaded — separate JS chunks in Network tab |
| 12 | NProgress bar shows on navigation |
| 13 | `ListingCard` wrapped with `React.memo` |
| 14 | `onToggleSave` wrapped with `useCallback` |
| 15 | Virtualized list of 50 items — DOM has ~10 rows, not 50 |
| 16 | 404 page shows for unknown routes |
| 17 | Each feature exports through its own `index.ts` |
| 18 | `npm run build` passes with zero TypeScript errors |

---

## Submission Checklist

- [ ] All 18 acceptance criteria pass
- [ ] Auth feature is self-contained under `src/features/auth/`
- [ ] `App.tsx` is routes only
- [ ] Shared components in `src/shared/components/`
- [ ] All packages used: `react-router-dom`, `react-window`, `nprogress`, `dayjs`
- [ ] No TypeScript errors
