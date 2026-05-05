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

### 1. Build the Global Store — Types
Create `src/store/types.ts`. Define a `State` interface with four fields: `listings` (array of Listing), `loading` (boolean), `filter` (string), and `saved` (array of numbers — listing IDs). Define an `Action` discriminated union with four types: `SET_LISTINGS` (payload: Listing[]), `SET_LOADING` (payload: boolean), `SET_FILTER` (payload: string), and `TOGGLE_FAVORITE` (payload: number — the listing ID). Export both types.

### 2. Build the Global Store — Reducer
Create `src/store/reducer.ts`. Export a pure reducer function that takes `(state: State, action: Action)` and returns a new State. Handle all four action types. For `TOGGLE_FAVORITE`, check if the ID is already in the `saved` array — if yes, remove it; if no, add it. Never mutate state — always return a new object or array.

### 3. Build the Global Store — Context
Create `src/store/StoreContext.tsx`. Use `createContext` to create a context that holds `{ state: State, dispatch: Dispatch<Action> }`. Build a `StoreProvider` component that uses `useReducer` with your reducer and an initial state (empty listings, loading true, empty filter, empty saved). Export a `useStore` hook that calls `useContext` and throws an error if used outside the provider.

### 4. Wrap the App with Providers
In `main.tsx`, wrap `<App />` with `<StoreProvider>`. Also add `<Toaster position="bottom-right" />` from `react-hot-toast` so toasts appear in the bottom-right corner.

### 5. Create the Shared Spinner
Create `src/shared/components/Spinner.tsx`. This is a simple loading spinner — a spinning circle or three dots. It will be used while data is loading. Keep it simple.

### 6. Build the useListings Hook
Create `src/features/listings/hooks/useListings.ts`. This hook simulates an async data fetch. Use `useEffect` to dispatch `SET_LOADING` true, then after 1.5 seconds dispatch `SET_LISTINGS` with the mock data from `src/data/listings.ts`, then dispatch `SET_LOADING` false. Clean up the timer on unmount. This hook has no return value — it just triggers the side effect.

### 7. Build the useFavorites Hook
Create `src/features/listings/hooks/useFavorites.ts`. This hook reads `saved` from the store via `useStore`. It returns an object with `toggle(id: number, title: string)`, `count` (number of saved listings), and `isSaved(id: number)` (boolean). The `toggle` function dispatches `TOGGLE_FAVORITE` and shows a toast — "Saved: {title}" if adding, "Removed: {title}" if removing.

### 8. Refactor SearchBar to Dispatch to Store
Update `SearchBar` to dispatch `SET_FILTER` to the store instead of calling an `onChange` prop. Add `useRef` to auto-focus the input on mount. Wrap the dispatch call in `lodash` `debounce` with a 300ms delay — the filter should only update 300ms after the user stops typing, not on every keystroke.

### 9. Refactor ListingsPage to Use the Store
Update `ListingsPage` to call `useListings()` on mount (triggers the simulated fetch). Read `listings`, `loading`, and `filter` from the store via `useStore`. Compute the filtered listings and wrap the computation in `useMemo` so it only recalculates when `listings` or `filter` changes. Show `<Spinner />` while `loading` is true. Use `useFavorites` for the save/unsave logic.

### 10. Animate ListingCard with Framer Motion
Wrap the root element of `ListingCard` with `motion.div` from `framer-motion`. Set `initial={{ opacity: 0, y: 20 }}` and `animate={{ opacity: 1, y: 0 }}`. Each card should fade in and slide up on mount.

### 11. Convert ListingCard to CSS Modules
Rename `ListingCard.css` to `ListingCard.module.css`. Import it as `import styles from './ListingCard.module.css'` and use `styles.card`, `styles.title`, etc. Add a hover lift effect — when you hover a card, it should lift slightly with a shadow. Add distinct styling for superhost cards — maybe a gold border or background tint.

### 12. Build the SavedListings Panel
Create `src/features/listings/components/SavedListings.tsx`. This component reads `saved` IDs from the store, finds the corresponding listings, and displays them in a panel with title, location, and price. Use `@headlessui/react` `Transition` to animate the panel sliding in from the right when it opens.

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
