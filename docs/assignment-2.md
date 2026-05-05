# Assignment 2: Hooks & Styling Refactor

## Description

Refactor your Phase 1 listings page to use core React hooks, Context, `useReducer`, custom hooks, and consistent styling. The app should load with a spinner, auto-focus the search input, and share favorites state across components via Context — no prop drilling.

---

## What You'll Learn

- How `useEffect` manages side effects and cleanup
- How `useRef` accesses DOM elements directly
- How `useReducer` manages complex interconnected state
- How Context API eliminates prop drilling
- How `useMemo` prevents expensive recalculations
- How to write and compose custom hooks
- How to use external libraries for styling, animations, and notifications

---

## Packages to Install

```bash
cd airbnb-app
npm install react-hot-toast framer-motion @headlessui/react lodash
npm install -D @types/lodash
```

| Package | What it does | Usage in this assignment |
|---------|-------------|--------------------------|
| `react-hot-toast` | Beautiful toast notifications with zero config | Show "Saved!" / "Removed from saved" toast on heart toggle |
| `framer-motion` | Production-ready animations for React | Animate listing cards on mount with fade-in + slide-up |
| `@headlessui/react` | Unstyled accessible UI components | Use `Transition` for the saved panel slide-in animation |
| `lodash` | Utility functions — debounce, groupBy, sortBy, etc. | Debounce the search input so it doesn't filter on every keystroke |

---

## File Structure

```
src/
├── components/
│   ├── ListingCard.tsx
│   ├── ListingCard.module.css
│   ├── SearchBar.tsx
│   ├── SavedListings.tsx
│   └── Spinner.tsx
├── context/
│   └── FavoritesContext.tsx
├── hooks/
│   ├── useListings.ts
│   └── useFavorites.ts
├── store/
│   └── reducer.ts
├── data/
│   └── listings.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

---

## Tasks

1. Create `src/store/reducer.ts` — `State`, `Action` union, `reducer` with cases: `SET_LISTINGS`, `SET_LOADING`, `SET_FILTER`, `TOGGLE_FAVORITE`
2. Create `src/context/FavoritesContext.tsx` — `FavoritesProvider` wraps the app, exposes `state` and `dispatch`
3. Wrap `<App />` in `<FavoritesProvider>` in `main.tsx`
4. Create `src/hooks/useListings.ts` — simulates a 1.5s fetch, dispatches `SET_LISTINGS` and `SET_LOADING`
5. Create `src/hooks/useFavorites.ts` — reads `saved` from context, returns `toggle`, `count`, `isSaved`
6. Add `useRef` to `SearchBar` — auto-focus the input on mount
7. Use `lodash` `debounce` on the search input — wait 300ms after the user stops typing before filtering
8. Wrap the filtered listings computation in `useMemo`
9. Use `react-hot-toast` to show a toast when a listing is saved or removed
10. Use `framer-motion` `motion.div` to animate each `ListingCard` on mount — fade in + slide up
11. Use `@headlessui/react` `Transition` to animate the `SavedListings` panel sliding in from the right
12. Style `ListingCard` with CSS Modules — hover lift, superhost border variant
13. Show a `<Spinner />` while `loading` is `true`
14. Create `src/components/SavedListings.tsx` — reads saved IDs from context, renders saved listing titles with location and price

---

## Starter Code

### `src/store/reducer.ts`

```ts
import type { Listing } from '../types'

export type State = {
  listings: Listing[]
  loading: boolean
  filter: string
  saved: number[]
}

export type Action =
  | { type: 'SET_LISTINGS'; payload: Listing[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: number }

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LISTINGS':
      // TODO: return new state with updated listings
    case 'SET_LOADING':
      // TODO: return new state with updated loading
    case 'SET_FILTER':
      // TODO: return new state with updated filter
    case 'TOGGLE_FAVORITE':
      // TODO: add or remove payload from saved array
    default:
      return state
  }
}
```

### `src/context/FavoritesContext.tsx`

```tsx
import { createContext, useContext, useReducer } from 'react'
import { reducer } from '../store/reducer'
import type { State, Action } from '../store/reducer'

interface FavoritesContextType {
  state: State
  dispatch: React.Dispatch<Action>
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    listings: [],
    loading: true,
    filter: '',
    saved: [],
  })

  return (
    <FavoritesContext.Provider value={{ state, dispatch }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavoritesContext(): FavoritesContextType {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavoritesContext must be used inside FavoritesProvider')
  return ctx
}
```

### `src/hooks/useListings.ts`

```ts
import { useEffect } from 'react'
import { useFavoritesContext } from '../context/FavoritesContext'
import { listings as mockListings } from '../data/listings'

export function useListings(): void {
  const { dispatch } = useFavoritesContext()

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true })
    const timer = setTimeout(() => {
      // TODO: dispatch SET_LISTINGS with mockListings
      // TODO: dispatch SET_LOADING with false
    }, 1500)
    return () => clearTimeout(timer)
  }, [dispatch])
}
```

### `src/hooks/useFavorites.ts`

```ts
import toast from 'react-hot-toast'
import { useFavoritesContext } from '../context/FavoritesContext'

interface UseFavoritesReturn {
  saved: number[]
  toggle: (id: number, title: string) => void
  count: number
  isSaved: (id: number) => boolean
}

export function useFavorites(): UseFavoritesReturn {
  const { state, dispatch } = useFavoritesContext()

  const toggle = (id: number, title: string): void => {
    const isSaved = state.saved.includes(id)
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id })
    // TODO: show toast — "Saved: {title}" or "Removed: {title}"
  }

  return {
    saved: state.saved,
    toggle,
    count: state.saved.length,
    isSaved: (id: number) => state.saved.includes(id),
  }
}
```

### `src/components/SearchBar.tsx`

```tsx
import { useRef, useEffect } from 'react'
import { debounce } from 'lodash'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // TODO: wrap onChange with lodash debounce (300ms)
  // hint: use useMemo or useCallback to memoize the debounced function

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search listings..."
    />
  )
}
```

### `src/components/ListingCard.tsx`

```tsx
import { motion } from 'framer-motion'
import styles from './ListingCard.module.css'
import type { Listing } from '../types'

interface ListingCardProps {
  listing: Listing
  saved: boolean
  onToggleSave: () => void
}

export function ListingCard({ listing, saved, onToggleSave }: ListingCardProps) {
  return (
    // TODO: wrap with motion.div — animate from opacity 0, y 20 to opacity 1, y 0
    <div className={styles.card}>
      <img src={listing.img} alt={listing.title} className={styles.image} />
      <div className={styles.body}>
        <h4 className={styles.title}>{listing.title}</h4>
        {listing.superhost && <span className={styles.badge}>Superhost</span>}
        <button onClick={onToggleSave}>{saved ? '♥' : '♡'}</button>
      </div>
    </div>
  )
}
```

### `src/main.tsx`

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { FavoritesProvider } from './context/FavoritesContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FavoritesProvider>
      <App />
      <Toaster position="bottom-right" />
    </FavoritesProvider>
  </StrictMode>
)
```

---

## Run the Assignment

```bash
cd airbnb-app
npm run dev
# open http://localhost:5173
```

---

## Acceptance Criteria

| # | Criteria | How to verify |
|---|----------|---------------|
| 1 | `reducer.ts` handles all 4 action types | `npm run build` passes |
| 2 | `FavoritesProvider` wraps the app in `main.tsx` | App renders without context errors |
| 3 | App shows a spinner for ~1.5s then listings appear | Refresh — spinner visible then listings load |
| 4 | Search input is auto-focused on mount | Page loads — cursor in search box immediately |
| 5 | Search is debounced 300ms with `lodash` | Fast typing — filter waits until you stop |
| 6 | `react-hot-toast` shows on save/unsave | Toggle heart — toast appears bottom-right |
| 7 | `framer-motion` animates cards on mount | Cards fade in and slide up on load |
| 8 | `@headlessui/react` `Transition` animates saved panel | Panel slides in smoothly |
| 9 | `useFavorites` reads from context — no prop drilling | `SavedListings` updates when hearts toggled anywhere |
| 10 | `SavedListings` shows title, location, price | Toggle 2 hearts — both appear in panel |
| 11 | Filtered listings wrapped in `useMemo` | No unnecessary recalculations |
| 12 | `ListingCard` styled with CSS Modules — hover lift | Hover a card — it lifts with shadow |
| 13 | Superhost cards have distinct styling | Superhost cards visually different |
| 14 | No TypeScript errors | `npm run build` passes |
| 15 | No `any` types | `grep -r ": any" src/` — no results |

---

## Submission Checklist

- [ ] All 15 acceptance criteria pass
- [ ] `npm run build` — zero errors
- [ ] `react-hot-toast`, `framer-motion`, `@headlessui/react`, `lodash` all used
- [ ] Spinner shows on initial load
- [ ] Search auto-focuses and is debounced
- [ ] CSS Modules used for `ListingCard`
- [ ] All hooks have explicit TypeScript return types
