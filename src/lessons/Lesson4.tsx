import { useState } from 'react'
import { ArrowRight, BookOpen, Code2, Eye, Clock, BarChart2 } from 'lucide-react'
import { CodeBlock, ConceptCard, SectionTitle, LivePreview, AssignmentCard, levelColor } from '../components/ui'

const listing = {
  title: 'Tropical Villa with Pool',
  location: 'Bali, Indonesia',
  price: 185,
  rating: 4.97,
  superhost: true,
  img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=260&fit=crop',
}

type StyleMode = 'plain' | 'inline' | 'tailwind'

function PlainCSSCard() {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="listing-card"
      style={{ transform: hovered ? 'translateY(-4px)' : 'none', transition: 'transform 0.2s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="listing-img-wrap">
        <img src={listing.img} alt={listing.title} className="listing-img" />
        {listing.superhost && <span className="superhost-badge">Superhost</span>}
      </div>
      <div className="listing-body">
        <div className="listing-top">
          <span className="listing-location">{listing.location}</span>
          <span className="listing-rating">★ {listing.rating}</span>
        </div>
        <h4 className="listing-title">{listing.title}</h4>
        <span className="listing-price"><strong>${listing.price}</strong> / night</span>
      </div>
    </div>
  )
}

function InlineStyleCard() {
  const [hovered, setHovered] = useState(false)
  const styles = {
    card: {
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden' as const,
      transform: hovered ? 'translateY(-4px)' : 'none',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.15)' : 'none',
    },
    img: { width: '100%', height: 140, objectFit: 'cover' as const, display: 'block' },
    body: { padding: '12px' },
    location: { fontSize: 11, color: 'var(--text-muted)' },
    title: { fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: '4px 0 8px' },
    price: { fontSize: 13, color: 'var(--text)' },
    badge: {
      fontSize: 10, fontWeight: 600,
      background: 'rgba(255,56,92,0.1)', color: '#FF385C',
      padding: '2px 8px', borderRadius: 20,
    },
  }
  return (
    <div style={styles.card} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <img src={listing.img} alt={listing.title} style={styles.img} />
      <div style={styles.body}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={styles.location}>{listing.location}</span>
          {listing.superhost && <span style={styles.badge}>Superhost</span>}
        </div>
        <h4 style={styles.title}>{listing.title}</h4>
        <span style={styles.price}><strong style={{ color: '#FF385C' }}>${listing.price}</strong> / night</span>
      </div>
    </div>
  )
}

// Tailwind-like utility simulation using className strings
function TailwindCard() {
  return (
    <div className="tw-card">
      <div className="tw-img-wrap">
        <img src={listing.img} alt={listing.title} className="tw-img" />
        {listing.superhost && <span className="tw-badge">Superhost</span>}
      </div>
      <div className="tw-body">
        <div className="tw-row">
          <span className="tw-location">{listing.location}</span>
          <span className="tw-rating">★ {listing.rating}</span>
        </div>
        <h4 className="tw-title">{listing.title}</h4>
        <span className="tw-price"><strong>${listing.price}</strong> / night</span>
      </div>
    </div>
  )
}

function Lesson4Preview() {
  const [mode, setMode] = useState<StyleMode>('plain')
  const modes: StyleMode[] = ['plain', 'inline', 'tailwind']
  const labels = { plain: 'Plain CSS Classes', inline: 'Inline Style Objects', tailwind: 'Tailwind Utilities' }

  return (
    <div>
      <div className="style-toggle-row">
        {modes.map(m => (
          <button
            key={m}
            className={`style-toggle-btn ${mode === m ? 'active' : ''}`}
            onClick={() => setMode(m)}
          >
            {labels[m]}
          </button>
        ))}
      </div>
      <div style={{ maxWidth: 260, marginTop: 20 }}>
        {mode === 'plain' && <PlainCSSCard />}
        {mode === 'inline' && <InlineStyleCard />}
        {mode === 'tailwind' && <TailwindCard />}
      </div>
      <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-dim)' }}>
        Same card, three different styling approaches — same visual result.
      </p>
    </div>
  )
}

export default function Lesson4({ onNext }: { onNext: () => void }) {
  return (
    <div className="lesson-content">
      <div className="lesson-header">
        <span className="phase-chip">Phase 2 — Hooks & Styling</span>
        <h1 className="lesson-heading">Styling Approaches</h1>
        <p className="lesson-desc">
          Compare CSS Modules, inline style objects, and Tailwind CSS utility classes —
          understand when to use each and how to apply conditional styling in React.
        </p>
        <div className="lesson-meta">
          <span className="meta-pill"><Clock size={11} className="inline-icon" />~25 min</span>
          <span className="meta-pill" style={{ color: levelColor.Intermediate }}>
            <BarChart2 size={11} className="inline-icon" />Intermediate
          </span>
        </div>
      </div>

      <SectionTitle><BookOpen size={13} className="inline-icon" />Core Concepts</SectionTitle>
      <div className="concepts-grid">
        <ConceptCard
          title="CSS Modules"
          plain="CSS Modules scope styles to a single component by auto-generating unique class names at build time. No global conflicts. Import the styles object and use styles.className."
          analogy="Like name tags at a conference — everyone has a name, but yours is unique so there's no confusion."
        />
        <ConceptCard
          title="Inline Styles"
          plain="Pass a JavaScript object to the style prop. camelCase property names (backgroundColor not background-color). Good for dynamic values. Bad for hover states and media queries."
          analogy="Like writing notes directly on a sticky note attached to the element — quick but limited."
        />
        <ConceptCard
          title="Tailwind CSS"
          plain="Utility-first CSS framework — compose styles using small single-purpose class names directly in JSX. No separate CSS files. Highly consistent design system out of the box."
          analogy="Like building with pre-cut LEGO pieces — you don't carve the pieces, you just pick and snap."
        />
      </div>

      <SectionTitle><Code2 size={13} className="inline-icon" />CSS Modules</SectionTitle>
      <CodeBlock filename="ListingCard.module.css" language="css" code={`/* Styles are scoped — .card here won't conflict with .card anywhere else */
.card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.body { padding: 12px; }

.title {
  font-size: 14px;
  font-weight: 600;
  margin: 4px 0;
}

.badge {
  font-size: 11px;
  background: rgba(255, 56, 92, 0.1);
  color: #FF385C;
  padding: 2px 8px;
  border-radius: 20px;
}`} />

      <CodeBlock filename="ListingCard.tsx" language="tsx" code={`// Import the CSS module as a styles object
import styles from './ListingCard.module.css'

function ListingCard({ title, superhost, img }: Props) {
  return (
    // Use styles.className — gets a unique scoped class name at build time
    <div className={styles.card}>
      <img src={img} className={styles.image} alt={title} />
      <div className={styles.body}>
        <h4 className={styles.title}>{title}</h4>

        {/* Conditional class — combine with template literal or clsx library */}
        <div className={\`\${styles.card} \${superhost ? styles.featured : ''}\`}>
          {superhost && <span className={styles.badge}>Superhost</span>}
        </div>
      </div>
    </div>
  )
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Inline Style Objects</SectionTitle>
      <CodeBlock filename="inline-styles.tsx" language="tsx" code={`function ListingCard({ price, superhost }: Props) {
  // Define styles as a JS object — camelCase property names
  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
  }

  // Dynamic styles based on props
  const badgeStyle: React.CSSProperties = {
    background: superhost ? 'rgba(255,56,92,0.1)' : '#f0f0f0',
    color: superhost ? '#FF385C' : '#888',
    padding: '2px 8px',
    borderRadius: 20,
    fontSize: 11,
  }

  return (
    <div style={cardStyle}>
      {/* Inline style directly on element */}
      <p style={{ fontSize: 13, color: '#888' }}>Location</p>

      {/* Dynamic color based on price */}
      <strong style={{ color: price > 300 ? '#FF385C' : '#1a1a1a' }}>
        \${price}
      </strong>

      <span style={badgeStyle}>
        {superhost ? 'Superhost' : 'Host'}
      </span>
    </div>
  )
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Tailwind CSS</SectionTitle>
      <CodeBlock filename="tailwind-setup.tsx" language="bash" code={`# Install Tailwind in a Vite + React project
npm install -D tailwindcss @tailwindcss/vite

# In vite.config.ts — add the plugin
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({ plugins: [react(), tailwindcss()] })

# In index.css — import Tailwind
@import "tailwindcss";`} />

      <CodeBlock filename="ListingCard.tsx" language="tsx" code={`// Tailwind: compose styles using utility class names directly in JSX
// No separate CSS file needed — classes map directly to CSS properties

function ListingCard({ title, location, price, rating, superhost, img }: Props) {
  return (
    // rounded-xl = border-radius, overflow-hidden, border, hover:shadow-lg etc.
    <div className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all">
      <img src={img} alt={title} className="w-full h-48 object-cover" />

      <div className="p-3">
        {/* flex justify-between = display:flex + justify-content:space-between */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">{location}</span>
          <span className="text-xs text-gray-500">★ {rating}</span>
        </div>

        <h4 className="text-sm font-semibold text-gray-900 mb-2">{title}</h4>

        <div className="flex justify-between items-center">
          <span className="text-sm">
            {/* Conditional class with ternary */}
            <strong className="text-[#FF385C]">\${price}</strong> / night
          </span>

          {/* Conditional rendering + conditional class */}
          {superhost && (
            <span className="text-xs font-semibold bg-red-50 text-[#FF385C] px-2 py-0.5 rounded-full">
              Superhost
            </span>
          )}
        </div>
      </div>
    </div>
  )
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />className Conditionals</SectionTitle>
      <CodeBlock filename="conditional-classes.tsx" language="tsx" code={`// Method 1: Template literal
<div className={\`card \${isActive ? 'card--active' : ''} \${superhost ? 'card--featured' : ''}\`}>

// Method 2: Array join (cleaner for multiple conditions)
<div className={['card', isActive && 'card--active', superhost && 'card--featured'].filter(Boolean).join(' ')}>

// Method 3: clsx library (most popular — install with: npm i clsx)
import clsx from 'clsx'
<div className={clsx('card', { 'card--active': isActive, 'card--featured': superhost })}>

// Method 4: Tailwind with cn utility (shadcn/ui pattern)
import { cn } from '@/lib/utils'
<div className={cn('rounded-xl border', isActive && 'border-red-500', superhost && 'bg-red-50')}>`} />

      <SectionTitle><Eye size={13} className="inline-icon" />Live Preview — Same Card, 3 Approaches</SectionTitle>
      <LivePreview><Lesson4Preview /></LivePreview>

      <AssignmentCard
        goal="Apply consistent styling to your full listings app using your preferred approach"
        tasks={[
          'Style your ListingCard using CSS Modules — create ListingCard.module.css',
          'Add hover effects: translateY(-4px) and box-shadow on card hover',
          'Create a responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop',
          'Style the search bar with a border, rounded corners, and focus ring',
          'Add conditional className for superhost cards (featured border or background)',
          'Style the Saved Only button with active/inactive states',
          'Bonus: try converting the same card to Tailwind utility classes',
        ]}
        starterCode={`/* ListingCard.module.css */
.card { /* TODO: base card styles */ }
.card:hover { /* TODO: hover lift effect */ }
.image { /* TODO: cover image */ }
.body { /* TODO: padding */ }
.badge { /* TODO: superhost badge */ }
.badge--featured { /* TODO: featured variant */ }

/* App.module.css */
.grid {
  display: grid;
  /* TODO: responsive columns with auto-fill */
  gap: 20px;
}

.searchBar {
  /* TODO: styled input */
}

.searchBar:focus {
  /* TODO: focus ring */
}`}
        expectedOutput="A polished listings grid with hover effects, responsive layout, styled search bar, and visually distinct superhost cards."
      />

      <button className="next-btn" onClick={onNext}>
        Next Lesson <ArrowRight size={14} className="inline-icon" />
      </button>
    </div>
  )
}
