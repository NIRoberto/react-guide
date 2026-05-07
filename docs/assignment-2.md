# Assignment 2: Hooks, Global State & Styling

## Description

In Phase 1 you built a working listings page, but all state lived in `ListingsPage` and was passed down as props. This works for a small app, but as you add more features — a navbar that shows saved count, a saved listings panel, a dashboard that needs the same data — you will end up passing props through 5 layers of components (prop drilling). The solution is **global state**.

In this assignment you will build a global store using Context API + useReducer. The store will hold `listings`, `loading`, `filter`, and `saved` state. Any component anywhere in the app can read from the store and dispatch actions to update it. You will also extract logic into custom hooks (`useListings`, `useFavorites`), add a simulated async data load with a spinner, debounce the search input so it doesn't filter on every keystroke, show toast notifications when listings are saved, animate cards on mount, and style the ListingCard with CSS Modules.

This is the phase where you learn how React apps scale beyond a single page.

---

## New Library to Learn — `framer-motion`

`framer-motion` is the most popular animation library for React. It wraps any element in a `motion.div` and lets you animate it declaratively — no manual CSS transitions or keyframes. You define the initial state, the animate state, and framer-motion handles the rest.

Example:
```
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
  Card content
</motion.div>
```

This fades in and slides up on mount. Read the framer-motion docs and understand `initial`, `animate`, `transition`, and `variants`. You will use it to animate every listing card on mount.

---

## Libraries in This Assignment

| Library | Purpose |
|---------|---------|
| `react-hot-toast` | Beautiful toast notifications with zero config — show "Saved!" when a listing is saved |
| `framer-motion` | Declarative animations — fade in and slide up listing cards on mount |
| `@headlessui/react` | Unstyled accessible UI components — use `Transition` for the saved panel slide-in |
| `lodash` | Utility functions — use `debounce` to delay search filtering until the user stops typing |

```bash
npm install react-hot-toast framer-motion @headlessui/react lodash
npm install -D @types/lodash
```

---

## Target Structure

```
src/
├── features/
│   └── listings/
│       ├── components/
│       │   ├── ListingCard.tsx
│       │   ├── ListingCard.module.css
│       │   ├── SearchBar.tsx
│       │   ├── SavedBadge.tsx
│       │   └── SavedListings.tsx
│       ├── hooks/
│       │   ├── useListings.ts
│       │   └── useFavorites.ts
│       ├── pages/
│       │   └── ListingsPage.tsx
│       ├── types.ts
│       └── index.ts
├── shared/
│   └── components/
│       └── Spinner.tsx
├── store/
│   ├── types.ts
│   ├── reducer.ts
│   └── StoreContext.tsx
├── data/
│   └── listings.ts
├── App.tsx
└── main.tsx
```

---

## Tasks

### 1. Build the Global Store
**Purpose:** Replace scattered `useState` calls with a single source of truth so any component can read or update shared state without passing props through layers.

Create `src/store/types.ts` with a `State` interface (`listings`, `loading`, `filter`, `saved`) and an `Action` discriminated union with four types: `SET_LISTINGS`, `SET_LOADING`, `SET_FILTER`, `TOGGLE_FAVORITE`. Create `src/store/reducer.ts` as a pure function — never mutate state, always return a new object. Create `src/store/StoreContext.tsx` with a `StoreProvider` using `useReducer` and a `useStore` hook that throws if used outside the provider.

### 2. Wrap the App and Build the Shared Spinner
**Purpose:** Make the store and toast system available to every component in the tree, and create a reusable loading indicator for async operations.

In `main.tsx`, wrap `<App />` with `<StoreProvider>` and add `<Toaster position="bottom-right" />` from `react-hot-toast`. Create `src/shared/components/Spinner.tsx` — a simple spinning indicator that will be shown while data is loading.

### 3. Build Custom Hooks and Refactor SearchBar
**Purpose:** Extract data-fetching and favorites logic out of components into dedicated hooks so the page stays clean and logic is reusable.

Create `useListings.ts` — uses `useEffect` to simulate a 1.5s fetch, dispatches `SET_LOADING` true, then after the delay dispatches `SET_LISTINGS` and `SET_LOADING` false. Create `useFavorites.ts` — reads `saved` from the store, returns `toggle(id, title)`, `count`, and `isSaved(id)`. The `toggle` function dispatches `TOGGLE_FAVORITE` and shows a `react-hot-toast`. Update `SearchBar` to dispatch `SET_FILTER` to the store, add `useRef` auto-focus on mount, and wrap the dispatch in `lodash` `debounce` with 300ms delay.

### 4. Refactor ListingsPage, Animate Cards, and Build the Saved Panel
**Purpose:** Connect the page to the store, add visual polish with animations, and build the saved listings panel that proves global state works without prop drilling.

Update `ListingsPage` to call `useListings()` on mount, read from the store via `useStore`, wrap the filtered computation in `useMemo`, and show `<Spinner />` while loading. Wrap `ListingCard`'s root element with `motion.div` from `framer-motion` — animate from `opacity: 0, y: 20` to `opacity: 1, y: 0`. Convert `ListingCard.css` to CSS Modules and add a hover lift effect with distinct superhost styling. Create `SavedListings.tsx` that reads saved IDs from the store and uses `@headlessui/react` `Transition` to animate the panel sliding in.

---

## Acceptance Criteria

| # | Criteria |
|---|----------|
| 1 | `src/store/` exists with `types.ts`, `reducer.ts`, `StoreContext.tsx` |
| 2 | Reducer handles all 4 action types correctly — no state mutation |
| 3 | `StoreProvider` wraps the app in `main.tsx` |
| 4 | `useStore` throws an error if used outside the provider |
| 5 | App shows spinner for ~1.5s then listings appear |
| 6 | Search input auto-focuses on mount |
| 7 | Search is debounced 300ms — filter waits until typing stops |
| 8 | `react-hot-toast` shows "Saved: {title}" or "Removed: {title}" on toggle |
| 9 | `framer-motion` animates cards on mount — fade in + slide up |
| 10 | `@headlessui/react` Transition animates the saved panel |
| 11 | `useFavorites` reads from store — no prop drilling |
| 12 | SavedListings panel shows title, location, price for each saved listing |
| 13 | Filtered listings wrapped in `useMemo` |
| 14 | ListingCard styled with CSS Modules — hover lift visible |
| 15 | Superhost cards have distinct styling |
| 16 | `npm run build` passes with zero TypeScript errors |
| 17 | No `any` types anywhere |

---

## Submission Checklist

- [ ] All 17 acceptance criteria pass
- [ ] `src/store/` follows structure from `structure.md`
- [ ] Custom hooks in `src/features/listings/hooks/`
- [ ] No prop drilling — favorites state comes from store
- [ ] All 4 packages used: `react-hot-toast`, `framer-motion`, `@headlessui/react`, `lodash`
- [ ] CSS Modules used for ListingCard
- [ ] No TypeScript errors
