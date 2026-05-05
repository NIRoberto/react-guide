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

### 1. Create the Feature Folder Structure
Create the `src/features/listings/` directory with subfolders `components/` and `pages/`. Create empty `types.ts` and `index.ts` files. This structure is the contract — everything listings-related lives here and nowhere else.

### 2. Define the Listing Type
In `src/features/listings/types.ts`, define and export a `Listing` interface. It needs these fields: `id` (number), `title` (string), `location` (string), `price` (number), `rating` (number), `superhost` (boolean), `available` (boolean), `availableFrom` (string — ISO date like "2025-01-12"), `img` (string — URL), and `category` (a union type of `'beach' | 'mountain' | 'city' | 'countryside'`). Every listing in the app will be shaped by this interface.

### 3. Create Mock Listings Data
Create `src/data/listings.ts` and export an array of exactly 6 listings. Use real Unsplash image URLs (format: `https://images.unsplash.com/photo-XXXXX?w=400&h=260&fit=crop`). Make sure you have variety: at least one of each category, a mix of superhost and non-superhost, at least one unavailable listing, and at least one listing priced over $300 so the luxury tag logic can be tested.

### 4. Build the ListingCard Component
Create `src/features/listings/components/ListingCard.tsx`. This component accepts three props: `listing` (the full Listing object), `saved` (boolean — whether this listing is currently saved), and `onToggleSave` (a callback with no arguments). The component must:
- Use `clsx` to apply `card--saved` when saved, `card--luxury` when price > 300, and `card--booked` when not available — no template literal conditionals
- Use `react-icons` FaHeart when saved and FaRegHeart when not saved on the heart button, FaStar before the rating, and FaMapMarkerAlt before the location text
- Use `date-fns` `format()` to display `availableFrom` as "Jan 12, 2025"
- Use `numeral` to format price as "$185" and rating as "4.97"
- Show a "Superhost" badge using `&&` — only renders when `superhost` is true
- Show a "Luxury" tag using `&&` — only renders when `price > 300`
- Show "Available" or "Booked" using a ternary on the `available` field
- The heart button calls `onToggleSave` when clicked

### 5. Build the SearchBar Component
Create `src/features/listings/components/SearchBar.tsx`. This is a controlled input — it accepts `value` (string) and `onChange` (callback that receives the new string value) as props. The input's value is always driven by the `value` prop. When the user types, it calls `onChange` with the new value. Add a placeholder of "Search listings...". This component owns no state.

### 6. Build the SavedBadge Component
Create `src/features/listings/components/SavedBadge.tsx`. It accepts a `count` prop (number) and displays how many listings are saved. Handle singular and plural correctly — "1 saved" vs "3 saved". If count is 0, you can either hide the badge or show "0 saved" — your choice, but be consistent.

### 7. Build the ListingsPage
Create `src/features/listings/pages/ListingsPage.tsx`. This is the only component in the listings feature that owns state. It manages three pieces of state: `query` (the current search string), `saved` (an array of listing IDs that are saved), and `savedOnly` (a boolean toggle). It imports the listings array from `src/data/listings.ts` and derives the filtered list from it — first filtering by query (matching title OR location, case-insensitive), then filtering by savedOnly if enabled. It renders the header with SearchBar, SavedBadge, and a "Saved Only" / "Show All" toggle button, a results count, a grid of ListingCard components, and an empty state message when the filtered list is empty.

### 8. Wire Up the Feature Public API
In `src/features/listings/index.ts`, export `ListingsPage`. This is the only file that other parts of the app should import from — never import directly from inside the feature's subfolders.

### 9. Update App.tsx
Import `ListingsPage` from `src/features/listings` (the index.ts) and render it as the main content of the app. App.tsx should be minimal — just rendering the page.

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
