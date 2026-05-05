# Assignment 1: Airbnb Listings Page

## Description

Build a fully static Airbnb listings page using TypeScript, React components, props, conditional rendering, and `useState`. All data is hardcoded — no API calls yet. This is your foundation — every phase builds on top of it.

---

## What You'll Learn

- How to scaffold a Vite + React + TypeScript project from scratch
- How to define TypeScript interfaces and use them across files
- How to build reusable components with typed props
- How to render lists with `.map()` and why `key` matters
- How to use `useState` for interactive UI — search, toggle, filter
- How to use conditional rendering with `&&` and ternary operators
- How to use external utility libraries to write cleaner code

---

## Packages to Install

```bash
npm create vite@latest airbnb-app -- --template react-ts
cd airbnb-app
npm install
npm install clsx date-fns react-icons numeral
npm install -D @types/numeral
```

| Package | What it does | Usage in this assignment |
|---------|-------------|--------------------------|
| `clsx` | Merges class names conditionally — no messy template literals | Apply `card--saved`, `card--luxury`, `card--booked` classes cleanly |
| `date-fns` | Modern date utility library — format, parse, compare dates | Format `availableFrom` as "Jan 12, 2025" on each card |
| `react-icons` | Thousands of icons from Font Awesome, Material, Heroicons etc. | Heart icon for save button, star icon for rating, location pin |
| `numeral` | Format numbers — currency, percentages, abbreviations | Format price as "$185" and rating as "4.97" consistently |

---

## File Structure

```
src/
├── components/
│   ├── ListingCard.tsx
│   ├── ListingCard.css
│   ├── SearchBar.tsx
│   └── SavedBadge.tsx
├── data/
│   └── listings.ts
├── types/
│   └── index.ts
├── App.tsx
├── App.css
└── main.tsx
```

---

## Tasks

1. Define a `Listing` interface in `src/types/index.ts` with fields: `id`, `title`, `location`, `price`, `rating`, `superhost`, `available`, `availableFrom`, `img`, `category`
2. Create `src/data/listings.ts` with **6 listings** using real Unsplash image URLs
3. Build `ListingCard.tsx` — accepts `listing`, `saved`, `onToggleSave` props
4. Use `clsx` for all conditional className logic — `card--saved`, `card--luxury`, `card--booked`
5. Use `react-icons` for the heart button (`FaHeart`, `FaRegHeart`), rating star (`FaStar`), and location pin (`FaMapMarkerAlt`)
6. Use `date-fns` `format()` to display `availableFrom` as "Jan 12, 2025"
7. Use `numeral` to format price as `$185/night` and rating as a fixed decimal
8. Show a **Superhost** badge using `&&`
9. Show **Available** or **Booked** using a ternary
10. Show a **Luxury** tag for listings priced over `$300`
11. Add a live **search input** that filters by `title` and `location`
12. Add a **heart button** per card that toggles saved state
13. Show a **saved count** badge
14. Add a **Saved Only** toggle button
15. Show an **empty state** when no listings match

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
  availableFrom: string    // ISO date string — "2025-01-12"
  img: string
  category: 'beach' | 'mountain' | 'city' | 'countryside'
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
    availableFrom: '2025-01-12',
    category: 'beach',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=260&fit=crop',
  },
  // TODO: add 5 more listings with different categories
]
```

### `src/components/ListingCard.tsx`

```tsx
import clsx from 'clsx'
import { format } from 'date-fns'
import numeral from 'numeral'
import { FaHeart, FaRegHeart, FaStar, FaMapMarkerAlt } from 'react-icons/fa'
import type { Listing } from '../types'
import './ListingCard.css'

interface ListingCardProps {
  listing: Listing
  saved: boolean
  onToggleSave: () => void
}

export function ListingCard({ listing, saved, onToggleSave }: ListingCardProps) {
  const { title, location, price, rating, superhost, available, availableFrom, img } = listing

  return (
    <div className={clsx('card', { 'card--saved': saved, 'card--luxury': price > 300, 'card--booked': !available })}>
      <div className="card-img-wrap">
        <img src={img} alt={title} />
        {superhost && <span className="badge badge--superhost">Superhost</span>}
        {price > 300 && <span className="badge badge--luxury">Luxury</span>}
        <button
          className="heart-btn"
          onClick={onToggleSave}
          aria-label={saved ? 'Unsave listing' : 'Save listing'}
        >
          {/* TODO: use FaHeart when saved, FaRegHeart when not */}
        </button>
      </div>
      <div className="card-body">
        <p className="location">
          {/* TODO: use FaMapMarkerAlt icon before location text */}
          {location}
        </p>
        <h3 className="title">{title}</h3>
        <p className="available-from">
          Available from {format(new Date(availableFrom), 'MMM d, yyyy')}
        </p>
        <div className="card-footer">
          <span className="price">
            {/* TODO: use numeral to format price as "$185" */}
            / night
          </span>
          <span className="rating">
            {/* TODO: use FaStar icon before rating */}
            {/* TODO: use numeral to format rating as "4.97" */}
          </span>
        </div>
        <span className={clsx('status', { 'status--available': available, 'status--booked': !available })}>
          {available ? 'Available' : 'Booked'}
        </span>
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
import { SearchBar } from './components/SearchBar'
import { SavedBadge } from './components/SavedBadge'
import type { Listing } from './types'
import './App.css'

export default function App() {
  const [query, setQuery] = useState<string>('')
  const [saved, setSaved] = useState<number[]>([])
  const [savedOnly, setSavedOnly] = useState<boolean>(false)

  const toggleSave = (id: number): void =>
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const filtered: Listing[] = listings
    .filter(l =>
      l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.location.toLowerCase().includes(query.toLowerCase())
    )
    .filter(l => savedOnly ? saved.includes(l.id) : true)

  return (
    <div className="app">
      <header className="header">
        <h1>Airbnb Listings</h1>
        <div className="controls">
          <SearchBar value={query} onChange={setQuery} />
          <SavedBadge count={saved.length} />
          <button onClick={() => setSavedOnly(prev => !prev)}>
            {savedOnly ? 'Show All' : 'Saved Only'}
          </button>
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
cd airbnb-app
npm run dev
# open http://localhost:5173
```

---

## Acceptance Criteria

| # | Criteria | How to verify |
|---|----------|---------------|
| 1 | `Listing` interface has all 10 fields typed correctly | `npm run build` passes |
| 2 | 6 listings with real Unsplash URLs and different categories | All 6 cards render with visible photos |
| 3 | `clsx` used for all conditional classNames | No template literal class conditionals |
| 4 | `react-icons` used for heart, star, and location pin | Icons visible on cards |
| 5 | `date-fns` formats `availableFrom` as "Jan 12, 2025" | Cards show readable date |
| 6 | `numeral` formats price and rating | Price shows "$185", rating shows "4.97" |
| 7 | Superhost badge shows only when `superhost === true` | Toggle in data — badge appears/disappears |
| 8 | Luxury tag shows only for `price > 300` | Only expensive listings show the tag |
| 9 | Available/Booked status correct per listing | `available: false` cards show "Booked" |
| 10 | Search filters by title AND location in real time | Type "bali" — only Bali listings remain |
| 11 | Heart button toggles saved state | Click heart — saved, click again — unsaved |
| 12 | Saved count badge updates correctly | Save 3 cards — badge shows "3" |
| 13 | Saved Only button works | Only saved cards visible when active |
| 14 | Empty state shows when no listings match | Type "zzz" — empty state appears |
| 15 | No TypeScript errors | `npm run build` passes |
| 16 | No `any` types | `grep -r ": any" src/` — no results |

---

## Submission Checklist

- [ ] All 16 acceptance criteria pass
- [ ] `npm run build` — zero errors
- [ ] `clsx`, `date-fns`, `react-icons`, `numeral` all used
- [ ] No `console.error` warnings in the browser
- [ ] All 6 listings have real Unsplash image URLs
- [ ] All props typed with interfaces — no implicit `any`
