# Assignment 5: Advanced Patterns & Full TypeScript

## Description

The app works. Now you are going to make it professional. This assignment is about **patterns** — reusable solutions to common problems that every large React codebase uses.

You will learn three patterns: **Higher-Order Components** (HOCs) for cross-cutting concerns like auth guards and loading states, **Compound Components** for flexible UI composition, and **Generic Components and Hooks** for reusable logic that works with any type.

You will also enforce full TypeScript coverage across the entire codebase. No `any` types. No implicit types. Explicit return type annotations on every hook. Every event handler typed correctly. This is what production TypeScript looks like.

By the end of this assignment, the codebase is fully typed, the Card component is composable, the Dashboard is protected by a HOC instead of a wrapper component, and saved listings persist across page refreshes.

---

## New Library to Learn — `immer`

Managing immutable state updates in a reducer gets verbose. To update a nested field you have to spread every level:
```
return { ...state, listings: state.listings.map(l => l.id === id ? { ...l, saved: true } : l) }
```

`immer` lets you write mutations that look like direct assignments but produce immutable updates under the hood. You use `produce(state, draft => { draft.listings[0].saved = true })` and immer handles the immutability for you.

Read the immer docs and understand `produce`, `Draft`, and how immer integrates with useReducer. Refactor your store reducer to use `produce` — every case becomes a simple mutation instead of a spread chain.

```bash
npm install immer
```

---

## Libraries in This Assignment

| Library | Purpose |
|---------|---------|
| `immer` | Write immutable state updates as simple mutations — refactor the store reducer |

No other new packages — this phase is about refactoring and patterns.

---

## Target Structure

```
src/
├── features/
│   ├── listings/
│   │   ├── components/
│   │   │   └── Card/
│   │   │       ├── Card.tsx
│   │   │       ├── Card.Image.tsx
│   │   │       ├── Card.Title.tsx
│   │   │       ├── Card.Location.tsx
│   │   │       ├── Card.Price.tsx
│   │   │       ├── Card.Rating.tsx
│   │   │       ├── Card.Badge.tsx
│   │   │       └── index.ts
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── bookings/
│   └── auth/
│       └── pages/
│           └── DashboardPage.tsx    ← protected via withAuth HOC
├── shared/
│   ├── components/
│   │   ├── List.tsx
│   │   └── ...
│   ├── hooks/
│   │   └── useLocalStorage.ts
│   └── hocs/
│       ├── withAuth.tsx
│       └── withLoading.tsx
├── store/
│   ├── types.ts
│   ├── reducer.ts                   ← refactor with immer
│   └── StoreContext.tsx
└── ...
```

---

## Tasks

### 1. Refactor the Reducer with Immer
Install `immer`. Refactor `src/store/reducer.ts` to use `produce` from immer. Each case in the switch statement should directly mutate the `draft` instead of spreading. For example, `SET_FILTER` becomes `draft.filter = action.payload` instead of `return { ...state, filter: action.payload }`. The reducer logic becomes much easier to read. Verify the app still works exactly the same after the refactor.

### 2. Build the withAuth HOC
Create `src/shared/hocs/withAuth.tsx`. A HOC is a function that takes a component and returns a new component. Use the generic type `<P extends object>` so it works with any component's props. Inside the returned component, call `useAuth` to check `isAuthenticated`. If false, return `<Navigate to="/login" replace />`. If true, return `<Component {...props} />`. The HOC adds auth protection without the wrapped component knowing anything about auth.

### 3. Build the withLoading HOC
Create `src/shared/hocs/withLoading.tsx`. This HOC adds an `isLoading` prop to any component. If `isLoading` is true, render `<Spinner />`. If false, render the wrapped component with all its original props. Use `<P extends object>` generic and return type `React.ComponentType<P & { isLoading: boolean }>`.

### 4. Apply withAuth to DashboardPage
Wrap `DashboardPage` with `withAuth` at the bottom of the file: `export default withAuth(DashboardPage)`. In `App.tsx`, remove the `<ProtectedRoute>` wrapper from the dashboard route — the HOC handles protection now. The dashboard should still redirect to `/login` when not authenticated.

### 5. Refactor ListingCard into a Compound Component
The current `ListingCard` is a monolithic component — you can't control which parts render or in what order. The compound component pattern fixes this by splitting it into composable pieces.

Create `src/features/listings/components/Card/Card.tsx`. This is the root component. It creates a React context that holds the `listing` object and wraps children in a `CardContext.Provider`. Create a `useCard` hook that reads the context and throws a clear error if used outside `<Card>`.

Create six sub-components, each in its own file: `Card.Image.tsx` (renders the listing image), `Card.Title.tsx` (renders the title), `Card.Location.tsx` (renders location with icon), `Card.Price.tsx` (renders formatted price), `Card.Rating.tsx` (renders star + rating), `Card.Badge.tsx` (renders Superhost/Luxury badges). Each sub-component calls `useCard()` to get the listing — no props needed.

In `src/features/listings/components/Card/index.ts`, use `Object.assign` to attach all sub-components as static properties on `Card` and export the result. This enables the `<Card.Image />` syntax.

### 6. Use the Compound Card in Pages
In `ListingsPage`, replace `<ListingCard listing={l} saved={...} onToggleSave={...} />` with the compound card syntax: `<Card listing={l}><Card.Image /><Card.Badge /><Card.Location /><Card.Title /><Card.Price /><Card.Rating /></Card>`. Do the same in `ListingDetail`. Notice how you can now reorder or omit sub-components without touching the Card component itself.

### 7. Build the Generic List Component
Create `src/shared/components/List.tsx`. Use a generic type `<T>` for the items. Accept these props: `items: T[]`, `renderItem: (item: T, index: number) => React.ReactNode`, `keyExtractor: (item: T) => string | number`, `emptyMessage?: string`, `loading?: boolean`, `className?: string`. If `loading` is true, render `<Spinner />`. If `items` is empty, render the empty message. Otherwise, map over items and render each with `renderItem`. This component works with any data type — listings, bookings, users, strings.

### 8. Use List<Listing> in ListingsPage
Replace the manual `.map()` in `ListingsPage` with `<List<Listing> items={filtered} keyExtractor={l => l.id} renderItem={l => <Card listing={l}>...</Card>} />`. The generic ensures TypeScript knows the type of each item in `renderItem`.

### 9. Build the Generic useLocalStorage Hook
Create `src/shared/hooks/useLocalStorage.ts`. Use generic type `<T>`. Accept `key: string` and `initial: T`. Return `[T, (value: T) => void]`. On initialization, try to read from `localStorage` and parse the JSON — if it fails or is empty, use `initial`. When the setter is called, update state and write the new value to `localStorage` as JSON. Wrap the initialization in a try/catch in case `localStorage` is unavailable.

### 10. Persist Saved Listings with useLocalStorage
Replace the `saved` state in the store (or in `ListingsPage`) with `useLocalStorage<number[]>('saved', [])`. After this change, saved listings should survive a page refresh — open the app, save some listings, refresh the page, and they should still be saved.

### 11. Add Explicit Return Types to All Hooks
Go through every custom hook in the codebase. Add an explicit return type annotation to each one. For hooks that return a query result, use the TanStack Query types. For custom hooks that return an object, define an interface for the return type. No hook should have an implicit return type.

### 12. Type All Event Handlers
Find every `onChange`, `onClick`, and `onSubmit` handler in the codebase. Add explicit parameter types: `React.ChangeEvent<HTMLInputElement>` for input changes, `React.ChangeEvent<HTMLSelectElement>` for select changes, `React.MouseEvent<HTMLButtonElement>` for button clicks, `React.FormEvent<HTMLFormElement>` for form submits.

### 13. Add Explicit Generics to All useState Calls
Find every `useState` call that uses `null`, `[]`, or `{}` as the initial value. Add an explicit generic type: `useState<Listing[]>([])`, `useState<User | null>(null)`, `useState<Record<string, string>>({})`. TypeScript should never have to infer these.

### 14. Eliminate All `any` Types
Run `grep -r ": any" src/` in the terminal. Fix every result. Also check for implicit `any` — if TypeScript is inferring `any` somewhere, add an explicit type. Run `npm run build` and fix all errors.

---

## Acceptance Criteria

| # | Criteria |
|---|----------|
| 1 | Store reducer refactored with `immer` — no spread operators in reducer cases |
| 2 | `withAuth` HOC created in `src/shared/hocs/` |
| 3 | `withLoading` HOC created in `src/shared/hocs/` |
| 4 | `DashboardPage` uses `withAuth` HOC — no `ProtectedRoute` in `App.tsx` |
| 5 | Dashboard still redirects to `/login` when not authenticated |
| 6 | `Card` compound component has all 6 sub-components |
| 7 | `useCard` throws a clear error if used outside `<Card>` |
| 8 | Compound `Card` used in `ListingsPage` and `ListingDetail` |
| 9 | `List<T>` generic component works with any type |
| 10 | `List<Listing>` used in `ListingsPage` |
| 11 | `useLocalStorage<T>` generic hook created |
| 12 | Saved listings persist across page refreshes |
| 13 | All custom hooks have explicit return type annotations |
| 14 | All event handlers typed with `React.*Event` types |
| 15 | All `useState` with `null` or `[]` have explicit generics |
| 16 | `grep -r ": any" src/` returns no results |
| 17 | `npm run build` passes with zero TypeScript errors |

---

## Submission Checklist

- [ ] All 17 acceptance criteria pass
- [ ] `npm run build` — zero TypeScript errors
- [ ] `immer` used in the store reducer
- [ ] No `any` types anywhere
- [ ] `withAuth` HOC applied to Dashboard
- [ ] Compound `Card` used in at least 2 pages
- [ ] `List<T>` generic component used
- [ ] `useLocalStorage` persists saved state across refreshes
- [ ] All hook return types explicitly annotated
