# Phase 1: Foundations

## Table of Contents
1. [What is React?](#what-is-react)
2. [How React Works](#how-react-works)
3. [JSX Syntax Rules](#jsx-syntax-rules)
4. [Functional Components](#functional-components)
5. [Props & Prop Destructuring](#props--prop-destructuring)
6. [Default Props](#default-props)
7. [Conditional Rendering](#conditional-rendering)
8. [Rendering Lists with .map()](#rendering-lists-with-map)
9. [useState Hook](#usestate-hook)
10. [Event Handlers](#event-handlers)
11. [Controlled Inputs](#controlled-inputs)
12. [How Re-renders Work](#how-re-renders-work)
13. [Assignment — Airbnb Listings Page](#assignment--airbnb-listings-page)

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
  function ListingCard({ title, price }) {
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
2. Compares it with the previous one (this is called **diffing**)
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

### React vs the DOM

| DOM | React |
|-----|-------|
| Imperative — tell it *how* to update | Declarative — describe *what* it should look like |
| Manual updates | Automatic updates when state changes |
| Hard to track state | State is explicit and predictable |
| Slow for frequent updates | Fast via Virtual DOM diffing |

---

## JSX Syntax Rules

JSX is a syntax extension that lets you write HTML-like code inside JavaScript. It gets compiled to `React.createElement()` calls by Babel or the TypeScript compiler.

### Rule 1 — Use `className` not `class`

`class` is a reserved keyword in JavaScript. JSX uses `className` instead.

```tsx
// WRONG
<div class="card">...</div>

// RIGHT
<div className="card">...</div>
```

### Rule 2 — All tags must close

Every tag must either have a closing tag or be self-closing.

```tsx
// WRONG
<img src="photo.jpg">
<input type="text">

// RIGHT
<img src="photo.jpg" />
<input type="text" />
<div className="card"></div>
```

### Rule 3 — Single root element

A component can only return one root element. Wrap multiple elements in a `<div>` or a Fragment `<>`.

```tsx
// WRONG — two root elements
function Card() {
  return (
    <h3>Title</h3>
    <p>Description</p>
  )
}

// RIGHT — wrapped in a single root
function Card() {
  return (
    <div>
      <h3>Title</h3>
      <p>Description</p>
    </div>
  )
}

// RIGHT — Fragment (no extra DOM element)
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

Anything inside `{}` is evaluated as JavaScript.

```tsx
const price = 185
const location = 'Bali, Indonesia'
const isAvailable = true

function ListingCard() {
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

### Rule 5 — Inline styles use objects

The `style` prop takes a JavaScript object with camelCase property names.

```tsx
// WRONG
<div style="background-color: red; font-size: 14px">

// RIGHT
<div style={{ backgroundColor: 'red', fontSize: 14 }}>
```

---

## Functional Components

A React component is a JavaScript function that returns JSX. The function name must start with a capital letter.

```tsx
// Simplest possible component
function Greeting() {
  return <h1>Hello, world!</h1>
}

// Arrow function syntax — same thing
const Greeting = () => <h1>Hello, world!</h1>

// Component with logic
function ListingCard() {
  const title = 'Tropical Villa with Pool'
  const price = 185
  const rating = 4.97

  return (
    <div className="card">
      <h3>{title}</h3>
      <p>${price} / night · ★ {rating}</p>
    </div>
  )
}

// Using a component inside another component (composition)
function ListingsPage() {
  return (
    <div>
      <h1>All Listings</h1>
      <ListingCard />
      <ListingCard />
      <ListingCard />
    </div>
  )
}
```

### Component Naming Rules

- Must start with a **capital letter** — `ListingCard` not `listingCard`
- Lowercase names are treated as HTML elements by React
- Use **PascalCase** — `ListingCard`, `SearchBar`, `BookingForm`

---

## Props & Prop Destructuring

Props are how you pass data into a component from its parent. They work like function arguments — the parent passes values, the component reads them.

### Basic Props

```tsx
// Define the shape of props with a TypeScript interface
interface ListingCardProps {
  title: string
  location: string
  price: number
  rating: number
  superhost: boolean
}

// Receive props as a parameter
function ListingCard(props: ListingCardProps) {
  return (
    <div className="card">
      <p>{props.location}</p>
      <h3>{props.title}</h3>
      <span>${props.price} / night</span>
      <span>★ {props.rating}</span>
    </div>
  )
}
```

### Prop Destructuring

Destructuring props in the function signature is cleaner and more readable.

```tsx
// Destructure directly in the function signature
function ListingCard({ title, location, price, rating, superhost }: ListingCardProps) {
  return (
    <div className="card">
      <p>{location}</p>
      <h3>{title}</h3>
      <span>${price} / night · ★ {rating}</span>
    </div>
  )
}

// Passing props from a parent
function App() {
  return (
    <ListingCard
      title="Tropical Villa with Pool"
      location="Bali, Indonesia"
      price={185}
      rating={4.97}
      superhost={true}
    />
  )
}
```

### Props are Read-Only

You can never modify props inside a component. They flow one way — parent to child.

```tsx
// WRONG — never mutate props
function ListingCard({ price }: { price: number }) {
  price = price * 2  // this will cause an error
  return <span>${price}</span>
}

// RIGHT — use the prop as-is, or derive a new value
function ListingCard({ price }: { price: number }) {
  const discountedPrice = price * 0.9  // new variable, props unchanged
  return <span>${discountedPrice}</span>
}
```

---

## Default Props

Use JavaScript default parameter values to set fallback values when a prop is not passed.

```tsx
interface ListingCardProps {
  title: string
  location: string
  price?: number      // ? makes it optional
  rating?: number
  superhost?: boolean
}

function ListingCard({
  title,
  location,
  price = 100,        // default value if not passed
  rating = 4.5,
  superhost = false,
}: ListingCardProps) {
  return (
    <div className="card">
      <p>{location}</p>
      <h3>{title}</h3>
      <span>${price} / night · ★ {rating}</span>
    </div>
  )
}

// price, rating, superhost will use defaults
<ListingCard title="Bali Villa" location="Bali" />

// overrides the defaults
<ListingCard title="NYC Loft" location="New York" price={240} rating={4.85} superhost={true} />
```

---

## Conditional Rendering

### The `&&` Operator

Renders the right side only when the left side is `true`. If the left side is `false`, nothing renders.

```tsx
function ListingCard({ superhost, isNew }: { superhost: boolean; isNew: boolean }) {
  return (
    <div>
      {/* Only renders if superhost is true */}
      {superhost && <span className="badge">Superhost</span>}

      {/* Only renders if isNew is true */}
      {isNew && <span className="badge badge--new">New</span>}
    </div>
  )
}
```

**Watch out:** If the left side is `0`, React will render `0` instead of nothing. Use `!!` or a boolean check.

```tsx
// WRONG — renders "0" if count is 0
{count && <span>{count} saved</span>}

// RIGHT
{count > 0 && <span>{count} saved</span>}
```

### Ternary Operator

Renders one of two options based on a condition.

```tsx
function ListingCard({ available, price }: { available: boolean; price: number }) {
  return (
    <div>
      {/* Ternary for content */}
      <span className={available ? 'text-green' : 'text-red'}>
        {available ? 'Available' : 'Booked'}
      </span>

      {/* Ternary for className */}
      <div className={`card ${price > 300 ? 'card--luxury' : ''}`}>
        ${price}
      </div>

      {/* Ternary for rendering different components */}
      {available ? <BookButton /> : <WaitlistButton />}
    </div>
  )
}
```

---

## Rendering Lists with .map()

Use `.map()` to transform an array of data into an array of JSX elements.

### The `key` Prop

Every element in a list must have a unique `key` prop. React uses it to track which items changed, were added, or were removed. Always use a stable unique ID — never use the array index if the list can reorder.

```tsx
const listings = [
  { id: 1, title: 'Tropical Villa', location: 'Bali', price: 185, rating: 4.97, superhost: true },
  { id: 2, title: 'Manhattan Loft', location: 'New York', price: 240, rating: 4.85, superhost: false },
  { id: 3, title: 'Malibu Beach House', location: 'Malibu', price: 520, rating: 4.99, superhost: true },
]

function ListingsGrid() {
  return (
    <div className="grid">
      {listings.map(listing => (
        // key must be unique and stable — use the ID from your data
        <ListingCard
          key={listing.id}
          title={listing.title}
          location={listing.location}
          price={listing.price}
          rating={listing.rating}
          superhost={listing.superhost}
        />
      ))}
    </div>
  )
}

// Shorthand using spread operator
{listings.map(l => <ListingCard key={l.id} {...l} />)}
```

### Filtering Before Rendering

```tsx
// Only render superhost listings
{listings
  .filter(l => l.superhost)
  .map(l => <ListingCard key={l.id} {...l} />)
}

// Only render listings under $200
{listings
  .filter(l => l.price < 200)
  .map(l => <ListingCard key={l.id} {...l} />)
}
```

---

## useState Hook

`useState` adds a reactive variable to your component. When you call the setter function, React re-renders the component with the new value.

```tsx
import { useState } from 'react'

// Syntax: const [value, setValue] = useState(initialValue)
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  )
}
```

### Functional Updates

When the new state depends on the previous state, use the functional form of the setter. This is safer because React batches state updates.

```tsx
// WRONG — may use stale state in async situations
setCount(count + 1)

// RIGHT — always gets the latest state
setCount(prev => prev + 1)

// Array state — always return a new array, never mutate
const [saved, setSaved] = useState<number[]>([])

// Add item
setSaved(prev => [...prev, newId])

// Remove item
setSaved(prev => prev.filter(id => id !== removeId))
```

### Multiple State Variables

```tsx
function ListingsPage() {
  const [query, setQuery] = useState('')           // string
  const [savedOnly, setSavedOnly] = useState(false) // boolean
  const [saved, setSaved] = useState<number[]>([]) // array
  const [priceMax, setPriceMax] = useState(500)    // number
}
```

---

## Event Handlers

### onClick

```tsx
function ListingCard({ id }: { id: number }) {
  const handleClick = () => {
    console.log('Card clicked:', id)
  }

  return (
    // Inline handler
    <button onClick={() => console.log('clicked')}>Click me</button>

    // Named handler — cleaner for complex logic
    <div onClick={handleClick}>Card</div>
  )
}
```

### onChange

Fires on every keystroke in an input.

```tsx
function SearchBar() {
  const [query, setQuery] = useState('')

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search listings..."
    />
  )
}
```

### onSubmit

```tsx
function SearchForm() {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()  // prevent page reload
    console.log('Searching for:', query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button type="submit">Search</button>
    </form>
  )
}
```

---

## Controlled Inputs

A controlled input has its `value` tied to React state. React is the single source of truth — not the DOM.

```tsx
function BookingForm() {
  const [checkIn, setCheckIn] = useState('')
  const [guests, setGuests] = useState(1)

  return (
    <form>
      {/* Controlled text input */}
      <input
        type="date"
        value={checkIn}
        onChange={e => setCheckIn(e.target.value)}
      />

      {/* Controlled select */}
      <select value={guests} onChange={e => setGuests(Number(e.target.value))}>
        <option value={1}>1 guest</option>
        <option value={2}>2 guests</option>
        <option value={3}>3 guests</option>
      </select>

      <p>Check-in: {checkIn} · Guests: {guests}</p>
    </form>
  )
}
```

---

## How Re-renders Work

React re-renders a component when:
1. Its own state changes (`setState` called)
2. Its parent re-renders and passes new props
3. A context it subscribes to changes

```tsx
// WRONG — mutating state directly, React won't detect the change
const [listings, setListings] = useState([...])
listings.push(newListing)      // React does NOT re-render
setListings(listings)          // still won't work — same array reference

// RIGHT — always return a new array or object
setListings(prev => [...prev, newListing])           // add
setListings(prev => prev.filter(l => l.id !== id))   // remove
setListings(prev => prev.map(l => l.id === id ? { ...l, price: 200 } : l)) // update
```

---

## Assignment — Airbnb Listings Page

> Build a fully static Airbnb listings page using components, props, conditional rendering, and `.map()`. All data is hardcoded — no API calls yet.

### Tasks

1. Define an array of **6 listings** — each with `id`, `title`, `location`, `price`, `rating`, `superhost`, `available`, and `img` (use Unsplash URLs)
2. Create a `ListingCard` component with a TypeScript interface for all props
3. Render all 6 cards using `.map()` with a `key` prop
4. Show a **Superhost** badge conditionally using `&&`
5. Show **Available** or **Booked** using a ternary
6. Show a **Luxury** tag for listings priced over `$300`
7. Add a live **search input** that filters cards by title and location using `useState`
8. Add a **heart toggle** per card — clicking saves/unsaves it
9. Show a **saved count** badge that updates as you toggle
10. Add a **Saved Only** button that filters to only saved listings

### Starter Code

```tsx
// src/App.tsx
import { useState } from 'react'

interface Listing {
  id: number
  title: string
  location: string
  price: number
  rating: number
  superhost: boolean
  available: boolean
  img: string
}

const listings: Listing[] = [
  // TODO: add 6 listings with real Unsplash image URLs
  // Example img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=260&fit=crop'
]

interface ListingCardProps extends Listing {
  saved: boolean
  onToggleSave: () => void
}

function ListingCard({ title, location, price, rating, superhost, available, img, saved, onToggleSave }: ListingCardProps) {
  return (
    <div className="card">
      <img src={img} alt={title} />
      {/* TODO: superhost badge with && */}
      {/* TODO: luxury tag if price > 300 */}
      <h3>{title}</h3>
      <p>{location}</p>
      <p>${price} / night · ★ {rating}</p>
      {/* TODO: available/booked ternary */}
      {/* TODO: heart button that calls onToggleSave */}
    </div>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState<number[]>([])
  const [savedOnly, setSavedOnly] = useState(false)

  const toggleSave = (id: number) => {
    // TODO: add or remove id from saved array
  }

  const filtered = listings
    // TODO: filter by query (title + location)
    // TODO: filter by savedOnly

  return (
    <div>
      {/* TODO: search input */}
      {/* TODO: saved count badge */}
      {/* TODO: Saved Only toggle button */}
      {/* TODO: results count */}
      <div className="grid">
        {filtered.map(l => (
          <ListingCard
            key={l.id}
            {...l}
            saved={saved.includes(l.id)}
            onToggleSave={() => toggleSave(l.id)}
          />
        ))}
      </div>
      {/* TODO: empty state when no listings match */}
    </div>
  )
}
```

### Expected Output

A responsive grid of 6 Airbnb-style listing cards. Each card shows a real property photo, location, title, price, rating, and conditional badges. Typing in the search box filters cards in real time. Clicking the heart saves/unsaves a card. The Saved Only button shows only saved listings. The saved count badge updates live.

---

**Resources**
- [React Docs — Your First Component](https://react.dev/learn/your-first-component)
- [React Docs — Passing Props](https://react.dev/learn/passing-props-to-a-component)
- [React Docs — Rendering Lists](https://react.dev/learn/rendering-lists)
- [React Docs — State: A Component's Memory](https://react.dev/learn/state-a-components-memory)
- [Unsplash Source](https://unsplash.com/developers) — free property images
