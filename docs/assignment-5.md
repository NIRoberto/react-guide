# Assignment 5: Patterns & TypeScript Refactor

## Description

Refactor your Airbnb app using Higher-Order Components, compound components, the Provider pattern, and full TypeScript types across every file. No `any` types, no implicit types — everything explicitly typed.

---

## Setup

```bash
cd airbnb-app
npm install
npm run dev
```

---

## File Structure

```
src/
├── components/
│   ├── Card/
│   │   ├── Card.tsx              # compound component root
│   │   ├── Card.Image.tsx
│   │   ├── Card.Title.tsx
│   │   ├── Card.Location.tsx
│   │   ├── Card.Price.tsx
│   │   ├── Card.Rating.tsx
│   │   ├── Card.Badge.tsx
│   │   └── index.ts              # re-exports Card with sub-components attached
│   ├── List.tsx                  # generic List<T> component
│   ├── Navbar.tsx
│   ├── ProtectedRoute.tsx
│   └── Spinner.tsx
├── hocs/
│   ├── withAuth.tsx              # redirects if not authenticated
│   └── withLoading.tsx           # shows spinner while loading
├── context/
│   ├── AuthContext.tsx
│   └── FavoritesContext.tsx
├── hooks/
│   ├── useListings.ts
│   ├── useListing.ts
│   ├── useFavorites.ts
│   ├── useToggleSaved.ts
│   └── useLocalStorage.ts        # generic hook
├── pages/
│   ├── Home.tsx
│   ├── ListingDetail.tsx
│   ├── Login.tsx
│   └── Dashboard.tsx             # protected via withAuth HOC
├── types/
│   └── index.ts                  # all interfaces here
├── App.tsx
└── main.tsx
```

---

## Tasks

1. Define all interfaces in `src/types/index.ts`: `Listing`, `Booking`, `User`, `BookingData`, `StoreState`
2. Build `withAuth<P>` HOC in `src/hocs/withAuth.tsx` — redirects to `/login` if `isAuthenticated` is false
3. Build `withLoading<P>` HOC in `src/hocs/withLoading.tsx` — renders `<Spinner />` while `isLoading` is true
4. Apply `withAuth` to `Dashboard` — remove `ProtectedRoute` wrapper from routes
5. Refactor `ListingCard` into a compound component in `src/components/Card/` — `Card`, `Card.Image`, `Card.Title`, `Card.Location`, `Card.Price`, `Card.Rating`, `Card.Badge`
6. Use the compound `Card` in `Home.tsx` and `ListingDetail.tsx`
7. Build a generic `List<T>` component in `src/components/List.tsx`
8. Use `List<Listing>` for the listings grid and `List<Listing>` for the saved panel
9. Create `src/hooks/useLocalStorage.ts` — generic `useLocalStorage<T>(key, initial)` hook
10. Use `useLocalStorage<number[]>('saved', [])` to persist saved listings across page refreshes
11. Add explicit return types to all custom hooks
12. Type all event handlers with `React.ChangeEvent`, `React.MouseEvent`, `React.FormEvent`
13. Add explicit generic types to all `useState` calls that use `null` or `[]` as initial values

---

## Starter Code

### `src/types/index.ts`

```ts
export interface Listing {
  id: number
  title: string
  location: string
  price: number
  rating: number
  superhost: boolean
  available: boolean
  img: string
}

export interface Booking {
  id: number
  listingId: number
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled'
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

export type ListingStatus = 'available' | 'booked' | 'pending'
```

### `src/hocs/withAuth.tsx`

```tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthGuard(props: P) {
    const { isAuthenticated } = useAuth()

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }

    return <Component {...props} />
  }
}
```

### `src/hocs/withLoading.tsx`

```tsx
import { Spinner } from '../components/Spinner'

export function withLoading<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P & { isLoading: boolean }> {
  return function WithLoading({ isLoading, ...rest }: P & { isLoading: boolean }) {
    if (isLoading) return <Spinner />
    return <Component {...(rest as P)} />
  }
}
```

### `src/components/Card/Card.tsx`

```tsx
import { createContext, useContext } from 'react'
import type { Listing } from '../../types'

interface CardContextType {
  listing: Listing
}

const CardContext = createContext<CardContextType | null>(null)

export function useCard(): CardContextType {
  const ctx = useContext(CardContext)
  if (!ctx) throw new Error('useCard must be used inside <Card>')
  return ctx
}

interface CardProps {
  listing: Listing
  children: React.ReactNode
  className?: string
}

export function Card({ listing, children, className }: CardProps) {
  return (
    <CardContext.Provider value={{ listing }}>
      <div className={className ?? 'card'}>{children}</div>
    </CardContext.Provider>
  )
}
```

### `src/components/Card/Card.Image.tsx`

```tsx
import { useCard } from './Card'

export function CardImage() {
  const { listing } = useCard()
  return (
    <img
      src={listing.img}
      alt={listing.title}
      className="card-img"
    />
  )
}
```

### `src/components/Card/index.ts`

```ts
import { Card } from './Card'
import { CardImage } from './Card.Image'
import { CardTitle } from './Card.Title'
import { CardLocation } from './Card.Location'
import { CardPrice } from './Card.Price'
import { CardRating } from './Card.Rating'
import { CardBadge } from './Card.Badge'

// attach sub-components as static properties
const CardWithSubs = Object.assign(Card, {
  Image: CardImage,
  Title: CardTitle,
  Location: CardLocation,
  Price: CardPrice,
  Rating: CardRating,
  Badge: CardBadge,
})

export { CardWithSubs as Card }
```

### `src/components/List.tsx`

```tsx
import { Spinner } from './Spinner'

interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string | number
  emptyMessage?: string
  loading?: boolean
  className?: string
}

export function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items found',
  loading = false,
  className,
}: ListProps<T>) {
  if (loading) return <Spinner />
  if (items.length === 0) return <p className="empty">{emptyMessage}</p>

  return (
    <ul className={className}>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  )
}
```

### `src/hooks/useLocalStorage.ts`

```ts
import { useState } from 'react'

export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initial
    } catch {
      return initial
    }
  })

  const set = (newValue: T): void => {
    setValue(newValue)
    localStorage.setItem(key, JSON.stringify(newValue))
  }

  return [value, set]
}
```

### Usage in `src/pages/Home.tsx`

```tsx
import { Card } from '../components/Card'
import { List } from '../components/List'
import { useListings } from '../hooks/useListings'
import type { Listing } from '../types'

export default function Home() {
  const { data: listings = [], isLoading } = useListings()

  return (
    <List<Listing>
      items={listings}
      loading={isLoading}
      keyExtractor={l => l.id}
      emptyMessage="No listings found"
      renderItem={listing => (
        <Card listing={listing}>
          <Card.Image />
          <Card.Badge />
          <Card.Location />
          <Card.Title />
          <Card.Price />
          <Card.Rating />
        </Card>
      )}
    />
  )
}
```

---

## Run the Assignment

```bash
cd airbnb-app
npm install
npm run dev
npm run build   # verify all TypeScript
```

---

## Acceptance Criteria

| # | Criteria | How to verify |
|---|----------|---------------|
| 1 | All interfaces in `src/types/index.ts` — `Listing`, `Booking`, `User`, `BookingData` | `npm run build` — no implicit type errors |
| 2 | `withAuth` HOC redirects to `/login` when not authenticated | Visit `/dashboard` without login — redirected |
| 3 | `withLoading` HOC shows `<Spinner />` while `isLoading` is true | Slow network — spinner shows before content |
| 4 | `Dashboard` uses `withAuth` HOC — no `ProtectedRoute` wrapper in routes | Check `App.tsx` — no `ProtectedRoute` around Dashboard |
| 5 | `Card` compound component has all 6 sub-components attached | `<Card.Image />`, `<Card.Title />` etc. all render correctly |
| 6 | `Card` context throws if used outside `<Card>` | Use `Card.Title` outside `Card` — error thrown |
| 7 | `List<T>` component works with `Listing[]` and `string[]` | Both usages compile and render |
| 8 | `List<Listing>` used for listings grid | Home page uses `<List<Listing> ...>` |
| 9 | `useLocalStorage<number[]>` persists saved listings | Save listings, refresh page — still saved |
| 10 | All custom hooks have explicit return type annotations | Check each hook file — return type declared |
| 11 | All event handlers typed with `React.ChangeEvent`, `React.MouseEvent`, `React.FormEvent` | Search for `e.target` — all `e` params typed |
| 12 | No `any` types anywhere | `grep -r ": any" src/` — no results |
| 13 | No implicit `any` — `strict: true` in `tsconfig.json` | `npm run build` passes with strict mode |
| 14 | `npm run build` completes with zero errors | Build output shows no errors |

---

## Submission Checklist

- [ ] All 14 acceptance criteria pass
- [ ] `npm run build` — zero TypeScript errors
- [ ] `grep -r ": any" src/` — no results
- [ ] `withAuth` HOC applied to Dashboard
- [ ] Compound `Card` component used in at least 2 pages
- [ ] `List<T>` generic component used for listings grid
- [ ] `useLocalStorage` persists saved state across refreshes
- [ ] All hook return types explicitly annotated
