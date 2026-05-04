# Phase 1: Foundations

## Table of Contents
1. [What is React?](#what-is-react)
2. [How React Works](#how-react-works)
3. [Project Setup](#project-setup)
4. [JSX Syntax Rules](#jsx-syntax-rules)
5. [Functional Components](#functional-components)
6. [Props & Prop Destructuring](#props--prop-destructuring)
7. [Default Props](#default-props)
8. [Conditional Rendering](#conditional-rendering)
9. [Rendering Lists with .map()](#rendering-lists-with-map)
10. [useState Hook](#usestate-hook)
11. [Event Handlers](#event-handlers)
12. [Controlled Inputs](#controlled-inputs)
13. [How Re-renders Work](#how-re-renders-work)
14. [Assignment](#assignment)

---

## What is React?

Before React, building interactive UIs meant manually finding DOM elements and updating them every time data changed. As apps grew, this became impossible to maintain.

**React changed that.** Instead of telling the browser *how* to update the DOM step by step, you describe *what* the UI should look like for a given state — and React figures out the minimal set of DOM changes needed.

React is a **JavaScript library** for building user interfaces out of small, reusable pieces called **components**.

```
Without React:
  document.getElementById('title').innerText = newTitle
  document.getElementById('price').innerText = newPrice
  // manually update every element every time data changes

With React:
  function ListingCard({ title, price }: { title: string; price: number }) {
    return <div><h3>{title}</h3><p>${price}</p></div>
  }
  // React handles all DOM updates automatically
```

**Who uses React in production:** Airbnb, Facebook, Instagram, Netflix, Uber, Atlassian

---

## How React Works

### The Virtual DOM

Directly manipulating the real DOM is slow. React solves this with a **Virtual DOM** — a lightweight JavaScript copy of the real DOM kept in memory.

When your data changes:
1. React creates a new Virtual DOM tree
2. Compares it with the previous one (**diffing**)
3. Calculates the minimum number of real DOM changes needed
4. Applies only those changes to the real DOM (**reconciliation**)

**Analogy:** Instead of reprinting an entire newspaper when one word changes, React finds exactly which word changed and only reprints that word.

### Component Tree

Every React app is a tree of components. Data flows **down** from parent to child via props. Events flow **up** from child to parent via callback functions.

```
App
├── Navbar
├── ListingsPage
│   ├── SearchBar
│   ├── FilterTabs
│   └── ListingsGrid
│       ├── ListingCard
│       ├── ListingCard
│       └── ListingCard
└── Footer
```

---

## Project Setup

### Create a new Vite + React + TypeScript project

```bash
npm create vite@latest airbnb-app -- --template react-ts
cd airbnb-app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Project structure

```
airbnb-app/
├── src/
│   ├── components/       # reusable components
│   ├── types/            # TypeScript interfaces
│   ├── data/             # mock data
│   ├── App.tsx           # root component
│   ├── main.tsx          # entry point
│   └── index.css         # global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### tsconfig.json — recommended settings

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Run the examples in this phase

Each example below can be dropped into `src/App.tsx` and run with `npm run dev`.

---

## JSX Syntax Rules

JSX is a syntax extension that lets you write HTML-like code inside TypeScript. It compiles to `React.createElement()` calls.

### Rule 1 — Use `className` not `class`

```tsx
// WRONG
<div class="card">...</div>

// RIGHT
<div className="card">...</div>
```

### Rule 2 — All tags must close

```tsx
// WRONG
<img src="photo.jpg">
<input type="text">

// RIGHT
<img src="photo.jpg" />
<input type="text" />
```

### Rule 3 — Single root element

```tsx
// WRONG — two root elements
function Card() {
  return (
    <h3>Title</h3>
    <p>Description</p>
  )
}

// RIGHT — Fragment (no extra DOM node)
function Card() {
  return (
    <>
      <h3>Title</h3>
      <p>Description</p>
    </>
  )
}
```

### Rule 4 — JavaScript expressions use `{}`

```tsx
// src/App.tsx
const price: number = 185
const location: string = 'Bali, Indonesia'
const isAvailable: boolean = true

export default function App() {
  return (
    <div className="card">
      <p>{location}</p>
      <strong>${price} / night</strong>
      <span>{isAvailable ? 'Available' : 'Booked'}</span>
      {/* This is a JSX comment */}
    </div>
  )
}
```

**Run it:**
```bash
npm run dev
# open http://localhost:5173
```

### Rule 5 — Inline styles use objects with camelCase

```tsx
// WRONG
<div style="background-color: red; font-size: 14px">

// RIGHT
<div style={{ backgroundColor: 'red', fontSize: 14 }}>
```

---

## Functional Components

A React component is a TypeScript function that returns JSX. The function name must start with a capital letter.

```tsx
// src/components/ListingCard.tsx

interface ListingCardProps {
  title: string
  price: number
  rating: number
}

export function ListingCard({ title, price, rating }: ListingCardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>${price} / night · ★ {rating}</p>
    </div>
  )
}
```

```tsx
// src/App.tsx
import { ListingCard } from './components/ListingCard'

export default function App() {
  return (
    <div>
      <h1>All Listings</h1>
      <ListingCard title="Tropical Villa" price={185} rating={4.97} />
      <ListingCard title="Manhattan Loft" price={240} rating={4.85} />
    </div>
  )
}
```

**Run it:**
```bash
npm run dev
```

### Component naming rules

- Must start with a **capital letter** — `ListingCard` not `listingCard`
- Use **PascalCase** — `ListingCard`, `SearchBar`, `BookingForm`
- Lowercase names are treated as HTML elements by React

---

## Props & Prop Destructuring

Props are how you pass data into a component from its parent — like function arguments.

```tsx
// src/types/index.ts
export interface Listing {
  id: number
  title: string
  location: string
  price: number
  rating: number
  superhost: boolean
  img: string
}
```

```tsx
// src/components/ListingCard.tsx
import type { Listing } from '../types'

interface ListingCardProps {
  listing: Listing
}

// Destructure props directly in the function signature
export function ListingCard({ listing }: ListingCardProps) {
  const { title, location, price, rating } = listing

  return (
    <div className="card">
      <img src={listing.img} alt={title} />
      <p>{location}</p>
      <h3>{title}</h3>
      <span>${price} / night · ★ {rating}</span>
    </div>
  )
}
```

```tsx
// src/App.tsx
import { ListingCard } from './components/ListingCard'
import type { Listing } from './types'

const listing: Listing = {
  id: 1,
  title: 'Tropical Villa with Pool',
  location: 'Bali, Indonesia',
  price: 185,
  rating: 4.97,
  superhost: true,
  img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=260&fit=crop',
}

export default function App() {
  return <ListingCard listing={listing} />
}
```

### Props are read-only

```tsx
// WRONG — never mutate props
function ListingCard({ price }: { price: number }) {
  price = price * 2  // TypeScript error + React warning
  return <span>${price}</span>
}

// RIGHT — derive a new value
function ListingCard({ price }: { price: number }) {
  const discountedPrice = price * 0.9
  return <span>${discountedPrice}</span>
}
```

---

## Default Props

Use TypeScript default parameter values to set fallback values when a prop is not passed.

```tsx
// src/components/ListingCard.tsx
interface ListingCardProps {
  title: string
  location: string
  price?: number       // ? = optional
  rating?: number
  superhost?: boolean
}

export function ListingCard({
  title,
  location,
  price = 100,         // default if not passed
  rating = 4.5,
  superhost = false,
}: ListingCardProps) {
  return (
    <div className="card">
      <p>{location}</p>
      <h3>{title}</h3>
      <span>${price} / night · ★ {rating}</span>
      {superhost && <span className="badge">Superhost</span>}
    </div>
  )
}
```

```tsx
// src/App.tsx
// price, rating, superhost use defaults
<ListingCard title="Bali Villa" location="Bali" />

// overrides defaults
<ListingCard title="NYC Loft" location="New York" price={240} rating={4.85} superhost={true} />
```

---

## Conditional Rendering

### The `&&` operator

Renders the right side only when the left side is `true`.

```tsx
function ListingCard({ superhost, isNew }: { superhost: boolean; isNew: boolean }) {
  return (
    <div>
      {superhost && <span className="badge">Superhost</span>}
      {isNew && <span className="badge badge--new">New</span>}
    </div>
  )
}
```

**Watch out:** If the left side is `0`, React renders `0`. Use a boolean check.

```tsx
// WRONG — renders "0" when count is 0
{count && <span>{count} saved</span>}

// RIGHT
{count > 0 && <span>{count} saved</span>}
```

### Ternary operator

```tsx
function ListingCard({ available, price }: { available: boolean; price: number }) {
  return (
    <div>
      {/* Content ternary */}
      <span className={available ? 'text-green' : 'text-red'}>
        {available ? 'Available' : 'Booked'}
      </span>

      {/* className ternary */}
      <div className={`card ${price > 300 ? 'card--luxury' : ''}`}>
        ${price}
      </div>
    </div>
  )
}
```

---

## Rendering Lists with .map()

```tsx
// src/data/listings.ts
import type { Listing } from '../types'

export const listings: Listing[] = [
  {
    id: 1,
    title: 'Tropical Villa with Pool',
    location: 'Bali, Indonesia',
    price: 185,
    rating: 4.97,
    superhost: true,
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=260&fit=crop',
  },
  {
    id: 2,
    title: 'Manhattan Skyline Loft',
    location: 'New York, USA',
    price: 240,
    rating: 4.85,
    superhost: false,
    img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=260&fit=crop',
  },
  {
    id: 3,
    title: 'Malibu Beachfront House',
    location: 'Malibu, USA',
    price: 520,
    rating: 4.99,
    superhost: true,
    img: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&h=260&fit=crop',
  },
]
```

```tsx
// src/App.tsx
import { listings } from './data/listings'
import { ListingCard } from './components/ListingCard'

export default function App() {
  return (
    <div className="grid">
      {listings.map(listing => (
        // key must be unique and stable — use the ID from your data
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
```

**Run it:**
```bash
npm run dev
```

### Filtering before rendering

```tsx
// Only superhost listings
{listings
  .filter(l => l.superhost)
  .map(l => <ListingCard key={l.id} listing={l} />)
}
```

---

## useState Hook

`useState` adds a reactive variable to your component. When you call the setter, React re-renders with the new value.

```tsx
// src/App.tsx
import { useState } from 'react'

export default function App() {
  // const [value, setValue] = useState<Type>(initialValue)
  const [count, setCount] = useState<number>(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(prev => prev - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  )
}
```

### Functional updates — always use when new state depends on previous

```tsx
// WRONG — may use stale state
setCount(count + 1)

// RIGHT — always gets the latest state
setCount(prev => prev + 1)

// Array state — always return a new array, never mutate
const [saved, setSaved] = useState<number[]>([])

setSaved(prev => [...prev, newId])                    // add
setSaved(prev => prev.filter(id => id !== removeId))  // remove
```

### Multiple state variables

```tsx
function ListingsPage() {
  const [query, setQuery] = useState<string>('')
  const [savedOnly, setSavedOnly] = useState<boolean>(false)
  const [saved, setSaved] = useState<number[]>([])
  const [priceMax, setPriceMax] = useState<number>(500)
}
```

---

## Event Handlers

### onClick

```tsx
// src/components/ListingCard.tsx
interface ListingCardProps {
  id: number
  title: string
  onSelect: (id: number) => void
}

export function ListingCard({ id, title, onSelect }: ListingCardProps) {
  const handleClick = () => onSelect(id)

  return (
    <div onClick={handleClick} className="card">
      <h3>{title}</h3>
    </div>
  )
}
```

### onChange

```tsx
// src/components/SearchBar.tsx
import { useState } from 'react'

export function SearchBar() {
  const [query, setQuery] = useState<string>('')

  return (
    <input
      type="text"
      value={query}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
      placeholder="Search listings..."
    />
  )
}
```

### onSubmit

```tsx
// src/components/SearchForm.tsx
import { useState } from 'react'

export function SearchForm() {
  const [query, setQuery] = useState<string>('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Searching for:', query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button type="submit">Search</button>
    </form>
  )
}
```

---

## Controlled Inputs

A controlled input has its `value` tied to React state. React is the single source of truth.

```tsx
// src/components/BookingForm.tsx
import { useState } from 'react'

export function BookingForm() {
  const [checkIn, setCheckIn] = useState<string>('')
  const [guests, setGuests] = useState<number>(1)

  return (
    <form>
      <label>
        Check-in
        <input
          type="date"
          value={checkIn}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckIn(e.target.value)}
        />
      </label>

      <label>
        Guests
        <select
          value={guests}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGuests(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5, 6].map(n => (
            <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
          ))}
        </select>
      </label>

      <p>Check-in: {checkIn || 'not set'} · Guests: {guests}</p>
    </form>
  )
}
```

---

## How Re-renders Work

React re-renders a component when:
1. Its own state changes
2. Its parent re-renders and passes new props
3. A context it subscribes to changes

```tsx
// WRONG — mutating state directly, React won't detect the change
const [listings, setListings] = useState<Listing[]>([])
listings.push(newListing)       // React does NOT re-render
setListings(listings)           // still won't work — same array reference

// RIGHT — always return a new array or object
setListings(prev => [...prev, newListing])
setListings(prev => prev.filter(l => l.id !== id))
setListings(prev => prev.map(l => l.id === id ? { ...l, price: 200 } : l))
```

---

## Assignment

> See **[assignment-1.md](./assignment-1.md)** for the full description, file structure, acceptance criteria, and submission checklist.

**Summary:** Build a static Airbnb listings page with TypeScript interfaces, conditional rendering, live search, heart toggle, and saved filter — all in a properly structured Vite + React + TypeScript project.

---

**Resources**
- [React Docs — Your First Component](https://react.dev/learn/your-first-component)
- [React Docs — Passing Props](https://react.dev/learn/passing-props-to-a-component)
- [React Docs — Rendering Lists](https://react.dev/learn/rendering-lists)
- [React Docs — State: A Component's Memory](https://react.dev/learn/state-a-components-memory)
- [TypeScript Handbook — Interfaces](https://www.typescriptlang.org/docs/handbook/2/objects.html)
