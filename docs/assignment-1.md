# Assignment 1: Listings Feature Foundation

## Description

You are building the first working version of an Airbnb clone. The goal of this assignment is to lay the correct foundation — not just make something that works, but make something that is structured to grow. Every future phase will add features on top of what you build here, so getting the structure right now saves you from painful refactoring later.

You will follow the **feature-based architecture** defined in `structure.md`. This means all listing-related code lives under `src/features/listings/` — its own components, its own types, its own page. The page manages state and passes data down to components as props. Components are pure — they receive data and call callbacks, they do not own state.

By the end of this assignment you will have a fully interactive listings page: 6 real listing cards with images, live search that filters as you type, a heart button on each card that toggles saved state, a saved-only filter, and an empty state when nothing matches.

---

## New Library to Learn — `clsx`

When you need to apply CSS classes conditionally in React, the naive approach is string concatenation or template literals:

```
className={`card ${saved ? 'card--saved' : ''} ${price > 300 ? 'card--luxury' : ''}`}
```

This gets messy fast. `clsx` is a tiny utility that accepts an object where keys are class names and values are booleans. It returns a clean string of only the truthy classes:

```
className={clsx('card', { 'card--saved': saved, 'card--luxury': price > 300 })}
```

Read the `clsx` docs and understand how to pass strings, objects, and arrays to it. You will use it on every conditional className in this assignment.

---

## Libraries in This Assignment

| Library | Purpose |
|---------|---------|
| `clsx` | Conditional CSS class names without messy string concatenation |
| `date-fns` | Format ISO date strings into human-readable dates like "Jan 12, 2025" |
| `react-icons` | Drop-in SVG icons — heart, star, location pin — from Font Awesome and more |
| `numeral` | Format numbers as currency ("$185") and fixed decimals ("4.97") |

```bash
npm install clsx date-fns react-icons numeral
npm install -D @types/numeral
```

---

## Target Structure

```
src/
├── features/
│   └── listings/
│       ├── components/
│       │   ├── ListingCard.tsx
│       │   ├── ListingCard.css
│       │   ├── SearchBar.tsx
│       │   └── SavedBadge.tsx
│       ├── pages/
│       │   └── ListingsPage.tsx
│       ├── types.ts
│       └── index.ts
├── data/
│   └── listings.ts
├── App.tsx
└── main.tsx
```

---

## Tasks

### 1. Set Up the Feature Structure and Types
**Purpose:** Establish the listings featurle boundary so all listing-related code lives in one place and never bleeds into the rest of the app.

Create `src/features/listings/` with `components/`, `pages/`, `types.ts`, and `index.ts`. In `types.ts` define and export a `Listing` interface with: `id`, `title`, `location`, `price`, `rating`, `superhost`, `available`, `availableFrom` (ISO date string), `img` (URL), and `category` (`'beach' | 'mountain' | 'city' | 'countryside'`). In `src/data/listings.ts` create an array of 6 listings using real Unsplash URLs — include variety across categories, prices, superhost status, and availability.

### 2. Build the ListingCard Component
**Purpose:** Create the core visual unit of the app — a card that displays one listing and lets the user save or unsave it.

Accept three props: `listing` (Listing), `saved` (boolean), `onToggleSave` (callback). Use `clsx` for all conditional classNames — no template literals. Use `react-icons` for the heart button, star, and location pin. Use `date-fns` `format()` to display `availableFrom` as "Jan 12, 2025". Use `numeral` to format price as "$185" and rating as "4.97". Show a Superhost badge with `&&`, a Luxury tag with `&&` for price > 300, and Available/Booked with a ternary.

### 3. Build SearchBar and SavedBadge
**Purpose:** Create two small presentational components that display search state and saved count — both are controlled and own no state themselves.

`SearchBar` accepts `value` and `onChange` as props — the input value is always driven by the prop, never internal state. `SavedBadge` accepts `count` and displays "1 saved" or "3 saved" with correct singular/plural. Neither component calls any hooks or manages any state.

### 4. Build ListingsPage and Wire Up the App
**Purpose:** Create the single component that owns all state and orchestrates the listings feature — the page is the brain, components are the display.

`ListingsPage` manages `query`, `saved` (number[]), and `savedOnly`. It derives the filtered list using `.filter()` chained for query and savedOnly. It renders SearchBar, SavedBadge, the Saved Only toggle, a results count, the card grid, and an empty state. Export `ListingsPage` from `index.ts` and render it in `App.tsx`.

---

## Acceptance Criteria

| # | Criteria |
|---|----------|
| 1 | Feature structure exists under `src/features/listings/` with `components/`, `pages/`, `types.ts`, `index.ts` |
| 2 | `Listing` interface has all 10 fields with correct types including the category union |
| 3 | 6 listings in `src/data/listings.ts` — variety of categories, prices, superhost, availability |
| 4 | `clsx` used for all conditional classNames — no template literal conditionals |
| 5 | `react-icons` used for heart, star, and location pin |
| 6 | `date-fns` formats `availableFrom` as "Jan 12, 2025" |
| 7 | `numeral` formats price as "$185" and rating as "4.97" |
| 8 | Superhost badge only shows when `superhost === true` |
| 9 | Luxury tag only shows when `price > 300` |
| 10 | Available/Booked status is correct per listing |
| 11 | SearchBar is a controlled component — no internal state |
| 12 | Search filters by title AND location in real-time |
| 13 | Heart button toggles saved state correctly |
| 14 | Saved count in SavedBadge updates when hearts are toggled |
| 15 | "Saved Only" toggle shows only saved listings |
| 16 | Empty state message shows when no listings match |
| 17 | `ListingsPage` is the only component with state |
| 18 | Feature exports through `index.ts` — no deep imports |
| 19 | `npm run build` passes with zero TypeScript errors |

---

## Submission Checklist

- [ ] All 19 acceptance criteria pass
- [ ] Feature structure matches `structure.md`
- [ ] Components are pure — receive data via props, no internal state
- [ ] Page manages all state and passes it down
- [ ] Feature exports only through `index.ts`
- [ ] All 4 libraries used: `clsx`, `date-fns`, `react-icons`, `numeral`
- [ ] No TypeScript errors
