import { Eye, ClipboardList, CheckCircle, Lightbulb } from 'lucide-react'

export function CodeBlock({ filename, language, code, label }: {
  filename: string
  language: string
  code: string
  label?: '✅ RIGHT' | '❌ WRONG'
}) {
  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-filename">{filename}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {label && (
            <span className={`code-label ${label.includes('✅') ? 'label-right' : 'label-wrong'}`}>
              {label}
            </span>
          )}
          <span className="code-lang">{language}</span>
        </div>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  )
}

export function ConceptCard({ title, plain, analogy }: {
  title: string; plain: string; analogy: string
}) {
  return (
    <div className="concept-card">
      <h4 className="concept-title">{title}</h4>
      <p className="concept-plain">{plain}</p>
      <p className="concept-analogy">
        <Lightbulb size={12} className="inline-icon" />
        {analogy}
      </p>
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="section-title">{children}</h3>
}

export function LivePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="live-preview-wrap">
      <div className="live-preview-header">
        <span className="live-dot" />
        <span className="live-dot" />
        <span className="live-dot" />
        <span className="live-preview-label">
          <Eye size={11} className="inline-icon" />
          Live Preview
        </span>
      </div>
      <div className="live-preview-body">{children}</div>
    </div>
  )
}

export function AssignmentCard({ goal, tasks, starterCode, expectedOutput }: {
  goal: string
  tasks: string[]
  starterCode: string
  expectedOutput: string
}) {
  return (
    <div className="assignment-card">
      <div className="assignment-header">
        <ClipboardList size={14} className="inline-icon" />
        Assignment
      </div>
      <p className="assignment-goal">{goal}</p>
      <ol className="assignment-tasks">
        {tasks.map((t, i) => <li key={i}>{t}</li>)}
      </ol>
      <CodeBlock filename="starter.tsx" language="tsx" code={starterCode} />
      <div className="assignment-output">
        <span className="output-label">
          <CheckCircle size={11} className="inline-icon" />
          Expected Output:
        </span>
        <p>{expectedOutput}</p>
      </div>
    </div>
  )
}

export const levelColor: Record<string, string> = {
  Beginner: '#22c55e',
  Intermediate: '#3b82f6',
  Advanced: '#f97316',
  Expert: '#a855f7',
}

export const mockListings = [
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
  {
    id: 4,
    title: 'Santorini Cave Suite',
    location: 'Santorini, Greece',
    price: 310,
    rating: 4.96,
    superhost: true,
    img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=260&fit=crop',
  },
  {
    id: 5,
    title: 'Tokyo Minimalist Studio',
    location: 'Tokyo, Japan',
    price: 95,
    rating: 4.88,
    superhost: false,
    img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=260&fit=crop',
  },
  {
    id: 6,
    title: 'Tuscany Farmhouse',
    location: 'Tuscany, Italy',
    price: 275,
    rating: 4.93,
    superhost: true,
    img: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=400&h=260&fit=crop',
  },
]

export function ListingCard({ title, location, price, rating, superhost, img, saved, onToggleSave }: {
  title: string
  location: string
  price: number
  rating: number
  superhost: boolean
  img: string
  saved?: boolean
  onToggleSave?: () => void
}) {
  return (
    <div className="listing-card">
      <div className="listing-img-wrap">
        <img src={img} alt={title} className="listing-img" />
        {onToggleSave && (
          <button className={`heart-btn ${saved ? 'saved' : ''}`} onClick={onToggleSave}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? '#FF385C' : 'none'} stroke={saved ? '#FF385C' : '#fff'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
        {superhost && <span className="superhost-badge">Superhost</span>}
      </div>
      <div className="listing-body">
        <div className="listing-top">
          <span className="listing-location">{location}</span>
          <span className="listing-rating">★ {rating}</span>
        </div>
        <h4 className="listing-title">{title}</h4>
        <span className="listing-price"><strong>${price}</strong> / night</span>
      </div>
    </div>
  )
}
