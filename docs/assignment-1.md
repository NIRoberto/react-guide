# Assignment 1: Airbnb Listings Page

## Description

Build a fully static Airbnb listings page using TypeScript, React components, props, conditional rendering, and `useState`. All data is hardcoded — no API calls yet. This is your foundation — every phase builds on top of it.

---

## Setup

```bash
npm create vite@latest assignment-1 -- --template react-ts
cd assignment-1
npm install
npm run dev
```

---

## File Structure

```
src/
├── components/
│   ├── ListingCard.tsx       # single listing card
│   ├── SearchBar.tsx         # search input
│   └── SavedBadge.tsx        # saved count badge
├── data/
│   └── listings.ts           # hardcoded listings array
├── types/
│   └── index.ts              # TypeScript interfaces
├── App.tsx                   # root — renders grid + controls
├── App.css                   # styles
└── main.tsx                  # entry point
```

---

## Tasks

1. Define a `Listing` interface in `src/types/index.ts` with fields: `id`, `title`, `location`, `price`, `rating`, `superhost`, `available`, `img`
2. Create `src/data/listings.ts` with an array of **6 listings** — use real Unsplash image URLs
3. Build `ListingCard.tsx` — accepts a `Listing` prop plus `saved: boolean` and `onToggleSave: () => void`
4. Render all 6 cards in `App.tsx` using `.map()` with a `key` prop
5. Show a **Superhost** badge conditionally using `&&`
6. Show **Available** or **Booked** using a ternary
7. Show a **Luxury** tag for listings priced over `$300` using a ternary
8. Add a live **search input** that filters cards by `title` and `location` as you type
9. Add a **heart button** per card — clicking toggles it in/out of a `saved: number[]` state array
10. Show a **saved count** badge that updates as you toggle hearts
11. Add a **Saved Only** button that filters to only saved listings
12. Show an **empty state** message when no listings match the search

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
```

### `src/data/listings.ts`

```ts
import type { Listing } from '../types'

export const listings: Listing[] = [
  {
    id: 1,
    title: 'Tropical Villa with Pool',
    location: 'Bali, Indonesia',
    price: 185,
    rating: 4.97,
    superhost: true,
    available: true,
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=260&fit=crop',
  },
  // TODO: add 5 more listings
]
```

### `src/components/ListingCard.tsx`

```tsx
import type { Listing } from '../types'

interface ListingCardProps {
  listing: Listing
  saved: boolean
  onToggleSave: () => void
}

export function ListingCard({ listing, saved, onToggleSave }: ListingCardProps) {
  const { title, location, price, rating, superhost, available, img } = listing

  return (
    <div className="card">
      <div className="card-img-wrap">
        <img src={img} alt={title} />
        {/* TODO: superhost badge with && */}
        {/* TODO: luxury tag if price > 300 */}
        <button
          className={`heart-btn ${saved ? 'saved' : ''}`}
          onClick={onToggleSave}
          aria-label={saved ? 'Unsave listing' : 'Save listing'}
        >
          ♥
        </button>
      </div>
      <div className="card-body">
        <p className="location">{location}</p>
        <h3 className="title">{title}</h3>
        <div className="card-footer">
          <span className="price"><strong>${price}</strong> / night</span>
          <span className="rating">★ {rating}</span>
        </div>
        {/* TODO: available/booked ternary */}
      </div>
    </div>
  )
}
```

### `src/App.tsx`

```tsx
import { useState } from 'react'
import { listings } from './data/listings'
import { ListingCard } from './components/ListingCard'
import type { Listing } from './types'
import './App.css'

export default function App() {
  const [query, setQuery] = useState<string>('')
  const [saved, setSaved] = useState<number[]>([])
  const [savedOnly, setSavedOnly] = useState<boolean>(false)

  const toggleSave = (id: number): void => {
    setSaved(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const filtered: Listing[] = listings
    .filter(l =>
      l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.location.toLowerCase().includes(query.toLowerCase())
    )
    .filter(l => (savedOnly ? saved.includes(l.id) : true))

  return (
    <div className="app">
      <header className="header">
        <h1>Airbnb Listings</h1>
        <div className="controls">
          {/* TODO: search input bound to query state */}
          {/* TODO: saved count badge */}
          {/* TODO: Saved Only toggle button */}
        </div>
        <p className="results-count">{filtered.length} listing{filtered.length !== 1 ? 's' : ''} found</p>
      </header>

      {filtered.length === 0 ? (
        <p className="empty">No listings match your search.</p>
      ) : (
        <div className="grid">
          {filtered.map(l => (
            <ListingCard
              key={l.id}
              listing={l}
              saved={saved.includes(l.id)}
              onToggleSave={() => toggleSave(l.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Run the Assignment

```bash
cd assignment-1
npm install
npm run dev
# open http://localhost:5173
```

---

## Acceptance Criteria

| # | Criteria | How to verify |
|---|----------|---------------|
| 1 | `Listing` interface defined in `src/types/index.ts` with all 8 fields typed correctly | TypeScript compiles with no errors (`npm run build`) |
| 2 | 6 listings in `src/data/listings.ts` with real Unsplash image URLs | All 6 cards render with visible photos |
| 3 | `ListingCard` accepts `listing`, `saved`, `onToggleSave` props — all typed | No TypeScript errors in the component |
| 4 | All 6 cards render using `.map()` with a `key` prop | Open React DevTools — no key warnings in console |
| 5 | Superhost badge shows only when `superhost === true` | Toggle `superhost` in data — badge appears/disappears |
| 6 | Available/Booked status shows correctly per listing | Cards with `available: false` show "Booked" |
| 7 | Luxury tag shows only for listings with `price > 300` | Only the $520 listing shows the Luxury tag |
| 8 | Search input filters by title AND location in real time | Type "bali" — only Bali listings remain |
| 9 | Heart button toggles saved state per card | Click heart — card stays saved, click again — unsaved |
| 10 | Saved count badge shows correct number | Save 3 cards — badge shows "3" |
| 11 | Saved Only button filters to saved listings only | Click Saved Only — only saved cards visible |
| 12 | Empty state shows when no listings match | Type "zzz" — empty state message appears |
| 13 | No TypeScript errors | `npm run build` completes with no errors |
| 14 | No `any` types used anywhere | Search codebase for `: any` — none found |

---

## Submission Checklist

- [ ] All 14 acceptance criteria pass
- [ ] `npm run build` completes with zero TypeScript errors
- [ ] No `console.error` warnings in the browser
- [ ] All 6 listings have real Unsplash image URLs (not placeholder text)
- [ ] Code is split across the correct files — no everything-in-one-file
- [ ] All props are typed with interfaces — no implicit `any`
