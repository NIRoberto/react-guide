import { ArrowRight, BookOpen, Code2, Eye, Layers, List, Shuffle, Clock, BarChart2 } from 'lucide-react'
import { CodeBlock, ConceptCard, SectionTitle, LivePreview, AssignmentCard, levelColor, mockListings, ListingCard } from '../components/ui'

function Lesson1Preview() {
  return (
    <div className="cards-grid">
      {mockListings.slice(0, 3).map(l => <ListingCard key={l.id} {...l} />)}
    </div>
  )
}

export default function Lesson1({ onNext }: { onNext: () => void }) {
  return (
    <div className="lesson-content">
      <div className="lesson-header">
        <span className="phase-chip">Phase 1 — Foundations</span>
        <h1 className="lesson-heading">React Basics</h1>
        <p className="lesson-desc">
          Learn what React is, how JSX works, how to build components, pass props,
          and render lists — all through building a real Airbnb-style listing card.
        </p>
        <div className="lesson-meta">
          <span className="meta-pill"><Clock size={11} className="inline-icon" />~25 min</span>
          <span className="meta-pill" style={{ color: levelColor.Beginner }}>
            <BarChart2 size={11} className="inline-icon" />Beginner
          </span>
        </div>
      </div>

      <SectionTitle><BookOpen size={13} className="inline-icon" />Core Concepts</SectionTitle>
      <div className="concepts-grid">
        <ConceptCard
          title="What is React?"
          plain="React is a JavaScript library for building UIs out of small reusable pieces called components. You describe what the UI should look like — React handles all DOM updates efficiently via the Virtual DOM."
          analogy="Like LEGO — build small blocks (components), snap them together to form a full page."
        />
        <ConceptCard
          title="JSX"
          plain="JSX lets you write HTML-like syntax inside JavaScript. It compiles to React.createElement() calls. Rules: use className not class, all tags must close, only one root element, use {} for JS expressions."
          analogy="Like an email template — write the structure, drop in live variables with curly braces."
        />
        <ConceptCard
          title="Props"
          plain="Props pass data from parent to child — like function arguments. They flow one way only: parent → child. Destructure them directly in the function signature for cleaner code."
          analogy="Like a form the parent fills out — the component just reads and displays the values."
        />
      </div>

      <SectionTitle><Code2 size={13} className="inline-icon" />JSX Rules</SectionTitle>
      <CodeBlock filename="jsx-rules.tsx" language="tsx" label="❌ WRONG" code={`function Bad() {
  return (
    // WRONG: 'class' should be 'className'
    <div class="card">
      // WRONG: img tag not self-closed
      <img src="photo.jpg">
      <h1>Title</h1>
      // WRONG: two sibling root elements — must have one parent
      <p>Subtitle</p>
  )
}`} />

      <CodeBlock filename="jsx-rules.tsx" language="tsx" label="✅ RIGHT" code={`function Good() {
  const price = 85          // JS variable
  const isHost = true       // boolean for conditional

  return (
    // Single root element
    <div className="card">
      {/* Self-closing tag */}
      <img src="photo.jpg" />
      <h1>Bali Loft</h1>
      {/* JS expression inside {} */}
      <p>\${price} / night</p>
      {/* Conditional rendering with && */}
      {isHost && <span>Superhost</span>}
    </div>
  )
}`} />

      <SectionTitle><Layers size={13} className="inline-icon" />Components & Props</SectionTitle>
      <CodeBlock filename="ListingCard.tsx" language="tsx" code={`// 1. Define prop types with an interface
interface ListingCardProps {
  title: string
  location: string
  price: number
  rating: number
  superhost: boolean
}

// 2. Destructure props in the function signature
function ListingCard({ title, location, price, rating, superhost }: ListingCardProps) {
  return (
    <div className="card">
      <p>{location}</p>

      {/* && — only renders when superhost is true */}
      {superhost && <span className="badge">Superhost</span>}

      <h3>{title}</h3>
      <span>\${price} / night</span>
      <span>★ {rating}</span>
    </div>
  )
}

// 3. Default prop values using JS default parameters
function ListingCard({
  title,
  location,
  price = 100,       // default if not passed
  rating = 4.5,      // default if not passed
  superhost = false  // default if not passed
}: ListingCardProps) {
  // ...
}

// 4. Use the component — pass props like HTML attributes
function App() {
  return (
    <ListingCard
      title="Cozy Loft in Bali"
      location="Bali, Indonesia"
      price={85}
      rating={4.92}
      superhost={true}
    />
  )
}`} />

      <SectionTitle><List size={13} className="inline-icon" />Rendering Lists with .map()</SectionTitle>
      <CodeBlock filename="ListingsPage.tsx" language="tsx" code={`const listings = [
  { id: 1, title: 'Tropical Villa', location: 'Bali', price: 185, rating: 4.97, superhost: true },
  { id: 2, title: 'Manhattan Loft', location: 'New York', price: 240, rating: 4.85, superhost: false },
  { id: 3, title: 'Malibu Beach House', location: 'Malibu', price: 520, rating: 4.99, superhost: true },
]

function ListingsPage() {
  return (
    <div className="grid">
      {listings.map(listing => (
        // key prop is REQUIRED — React uses it to track list items efficiently
        // Never use array index as key if list can reorder
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

// Shorthand using spread operator — passes all fields as props at once
{listings.map(l => <ListingCard key={l.id} {...l} />)}`} />

      <SectionTitle><Shuffle size={13} className="inline-icon" />Conditional Rendering</SectionTitle>
      <CodeBlock filename="conditional.tsx" language="tsx" code={`function ListingCard({ superhost, available, price }: Props) {
  return (
    <div>
      {/* && operator: renders right side only when left side is true */}
      {superhost && <span className="badge">Superhost</span>}

      {/* Ternary: pick between two outputs */}
      <span className={available ? 'text-green' : 'text-red'}>
        {available ? 'Available' : 'Booked'}
      </span>

      {/* Ternary inside className for conditional styling */}
      <div className={\`card \${superhost ? 'card--featured' : ''}\`}>
        <strong>\${price}</strong>
      </div>

      {/* Null to render nothing */}
      {price > 500 ? <span className="luxury-tag">Luxury</span> : null}
    </div>
  )
}`} />

      <SectionTitle><Eye size={13} className="inline-icon" />Live Preview</SectionTitle>
      <LivePreview><Lesson1Preview /></LivePreview>

      <AssignmentCard
        goal="Build a static Airbnb listings page using components, props, and .map()"
        tasks={[
          'Define an array of 4 listings — each with id, title, location, price, rating, superhost, available',
          'Create a ListingCard component that accepts and renders all those props',
          'Render all 4 cards using .map() — make sure each has a key prop',
          'Show a Superhost badge conditionally using the && operator',
          'Show "Available" or "Booked" using a ternary expression',
          'Add a "Luxury" tag using a ternary for listings priced over $300',
        ]}
        starterCode={`const listings = [
  // TODO: add 4 listings here with id, title, location, price, rating, superhost, available
]

interface ListingCardProps {
  id: number
  title: string
  location: string
  price: number
  rating: number
  superhost: boolean
  available: boolean
}

function ListingCard({ title, location, price, rating, superhost, available }: ListingCardProps) {
  return (
    <div className="card">
      {/* TODO: location */}
      {/* TODO: superhost badge with && */}
      {/* TODO: title */}
      {/* TODO: price and rating */}
      {/* TODO: available/booked ternary */}
      {/* TODO: luxury tag if price > 300 */}
    </div>
  )
}

export default function App() {
  return (
    <div className="grid">
      {listings.map(l => (
        <ListingCard key={l.id} {...l} />
      ))}
    </div>
  )
}`}
        expectedOutput="A grid of 4 listing cards each showing location, title, price, rating, conditional superhost badge, available/booked status, and a luxury tag for expensive listings."
      />

      <button className="next-btn" onClick={onNext}>
        Next Lesson <ArrowRight size={14} className="inline-icon" />
      </button>
    </div>
  )
}
