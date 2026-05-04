# Assignment 2: Hooks & Styling Refactor

## Description

Refactor your Phase 1 listings page to use core React hooks, Context, `useReducer`, custom hooks, and consistent styling with CSS Modules. The app should load with a spinner, auto-focus the search input, and share favorites state across components via Context — no prop drilling.

---

## Setup

```bash
# continue from Phase 1 — same project
cd airbnb-app
npm install
npm run dev
```

---

## File Structure

```
src/
├── components/
│   ├── ListingCard.tsx
│   ├── ListingCard.module.css    # NEW — scoped styles
│   ├── SearchBar.tsx
│   ├── SavedListings.tsx         # NEW — reads from context
│   └── Spinner.tsx               # NEW
├── context/
│   └── FavoritesContext.tsx      # NEW — Context + Provider
├── hooks/
│   ├── useListings.ts            # NEW — fetch + loading + error
│   └── useFavorites.ts           # NEW — reads from context
├── store/
│   └── reducer.ts                # NEW — useReducer logic
├── data/
│   └── listings.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

---

## Tasks

1. Create `src/store/reducer.ts` — define `State`, `Action` union type, and `reducer` function with cases: `SET_LISTINGS`, `SET_LOADING`, `SET_FILTER`, `TOGGLE_FAVORITE`
2. Create `src/context/FavoritesContext.tsx` — `FavoritesProvider` wraps the app, exposes `state` and `dispatch` via context
3. Wrap `<App />` in `<FavoritesProvider>` inside `main.tsx`
4. Create `src/hooks/useListings.ts` — `useEffect` simulates a 1.5s fetch, dispatches `SET_LISTINGS` and `SET_LOADING`
5. Create `src/hooks/useFavorites.ts` — reads `saved` from context, returns `toggle`, `count`, `isSaved`
6. Add `useRef` to `SearchBar` — auto-focus the input on mount
7. Create `src/components/SavedListings.tsx` — reads saved IDs from context, renders saved listing titles
8. Wrap the filtered listings computation in `useMemo`
9. Style `ListingCard` with CSS Modules — hover lift, responsive grid, superhost border variant
10. Show a `<Spinner />` while `loading` is `true`

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
import { useFavoritesContext } from '../context/FavoritesContext'

interface UseFavoritesReturn {
  saved: number[]
  toggle: (id: number) => void
  count: number
  isSaved: (id: number) => boolean
}

export function useFavorites(): UseFavoritesReturn {
  const { state, dispatch } = useFavoritesContext()

  const toggle = (id: number): void =>
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id })

  return {
    saved: state.saved,
    toggle,
    count: state.saved.length,
    isSaved: (id: number) => state.saved.includes(id),
  }
}
```

### `src/components/SavedListings.tsx`

```tsx
import { useFavoritesContext } from '../context/FavoritesContext'

export function SavedListings() {
  const { state } = useFavoritesContext()
  const savedListings = state.listings.filter(l => state.saved.includes(l.id))

  if (savedListings.length === 0) return null

  return (
    <aside>
      <h3>Saved ({savedListings.length})</h3>
      <ul>
        {savedListings.map(l => (
          <li key={l.id}>{l.title}</li>
          // TODO: also show location and price
        ))}
      </ul>
    </aside>
  )
}
```

---

## Run the Assignment

```bash
cd airbnb-app
npm install
npm run dev
# open http://localhost:5173
```

---

## Acceptance Criteria

| # | Criteria | How to verify |
|---|----------|---------------|
| 1 | `reducer.ts` handles all 4 action types with no TypeScript errors | `npm run build` passes |
| 2 | `FavoritesProvider` wraps the app in `main.tsx` | App renders without context errors |
| 3 | App shows a spinner for ~1.5s then listings appear | Refresh the page — spinner visible then listings load |
| 4 | Search input is auto-focused on mount | Page loads — cursor is in the search box immediately |
| 5 | `useListings` hook dispatches `SET_LISTINGS` and `SET_LOADING` | Listings appear after delay, loading state clears |
| 6 | `useFavorites` hook reads from context — no prop drilling | `SavedListings` updates when hearts are toggled anywhere |
| 7 | `SavedListings` panel shows saved listing titles | Toggle 2 hearts — both titles appear in the panel |
| 8 | Filtered listings wrapped in `useMemo` | Check React DevTools Profiler — no unnecessary recalculations |
| 9 | `ListingCard` styled with CSS Modules — hover lift effect | Hover a card — it lifts with shadow |
| 10 | Superhost cards have a distinct border or background via CSS Module variant | Superhost cards visually different from regular cards |
| 11 | No TypeScript errors | `npm run build` completes cleanly |
| 12 | No `any` types | Search for `: any` — none found |

---

## Submission Checklist

- [ ] All 12 acceptance criteria pass
- [ ] `npm run build` completes with zero errors
- [ ] Spinner shows on initial load
- [ ] Search auto-focuses on mount
- [ ] `SavedListings` panel updates in real time
- [ ] CSS Modules used for `ListingCard` — not inline styles
- [ ] All hooks have explicit TypeScript return types
