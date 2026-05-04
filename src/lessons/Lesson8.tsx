import { useState } from 'react'
import { ArrowRight, BookOpen, Code2, Eye, Clock, BarChart2, Play, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { CodeBlock, ConceptCard, SectionTitle, LivePreview, AssignmentCard, levelColor } from '../components/ui'

// ── Simulated test runner ─────────────────────────────────────────────────────
type TestStatus = 'pending' | 'running' | 'pass' | 'fail'

interface TestCase {
  id: number
  suite: string
  name: string
  status: TestStatus
  duration?: number
  error?: string
}

const testCases: Omit<TestCase, 'status'>[] = [
  { id: 1, suite: 'ListingCard', name: 'renders title correctly', duration: 12 },
  { id: 2, suite: 'ListingCard', name: 'renders price with $ sign', duration: 8 },
  { id: 3, suite: 'ListingCard', name: 'shows Superhost badge when superhost=true', duration: 11 },
  { id: 4, suite: 'ListingCard', name: 'hides Superhost badge when superhost=false', duration: 9 },
  { id: 5, suite: 'Favorites', name: 'clicking heart toggles favorite', duration: 18 },
  { id: 6, suite: 'Favorites', name: 'saved count updates after toggle', duration: 14 },
  { id: 7, suite: 'Search', name: 'search input filters listings by title', duration: 22 },
  { id: 8, suite: 'Search', name: 'search input filters listings by location', duration: 19 },
  { id: 9, suite: 'Search', name: 'empty search shows all listings', duration: 10 },
  { id: 10, suite: 'API', name: 'mock API returns listings array', duration: 31 },
  { id: 11, suite: 'API', name: 'loading state shown during fetch', duration: 16 },
  { id: 12, suite: 'BookingForm', name: 'validates required check-in date', duration: 20 },
  { id: 13, suite: 'BookingForm', name: 'validates email format', duration: 17 },
  { id: 14, suite: 'BookingForm', name: 'advances to next step on valid input', duration: 25 },
  { id: 15, suite: 'BookingForm', name: 'shows error messages on invalid submit', duration: 21 },
]

// Simulate one test failing for realism
const failingIds = [13]

function TestRunner() {
  const [tests, setTests] = useState<TestCase[]>(testCases.map(t => ({ ...t, status: 'pending' })))
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  const run = async () => {
    setRunning(true)
    setDone(false)
    setTests(testCases.map(t => ({ ...t, status: 'pending' })))

    for (let i = 0; i < testCases.length; i++) {
      setTests(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'running' } : t))
      await new Promise(r => setTimeout(r, testCases[i].duration! * 4))
      setTests(prev => prev.map((t, idx) =>
        idx === i ? { ...t, status: failingIds.includes(t.id) ? 'fail' : 'pass', error: failingIds.includes(t.id) ? 'Expected "john@" to match email pattern' : undefined } : t
      ))
    }

    setRunning(false)
    setDone(true)
  }

  const passed = tests.filter(t => t.status === 'pass').length
  const failed = tests.filter(t => t.status === 'fail').length
  const suites = [...new Set(testCases.map(t => t.suite))]

  return (
    <div className="test-runner">
      <div className="test-toolbar">
        <button className={`next-btn ${running ? 'disabled' : ''}`} style={{ fontSize: 12, padding: '8px 16px' }} onClick={run} disabled={running}>
          {running ? <><RefreshCw size={12} className="inline-icon spin" />Running...</> : <><Play size={12} className="inline-icon" />Run Tests</>}
        </button>
        {done && (
          <div className="test-summary">
            <span style={{ color: '#22c55e' }}><CheckCircle size={13} className="inline-icon" />{passed} passed</span>
            {failed > 0 && <span style={{ color: '#ef4444' }}><XCircle size={13} className="inline-icon" />{failed} failed</span>}
            <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{testCases.reduce((a, t) => a + (t.duration || 0), 0)}ms</span>
          </div>
        )}
      </div>

      {suites.map(suite => (
        <div key={suite} className="test-suite">
          <p className="suite-name">{suite}</p>
          {tests.filter(t => t.suite === suite).map(t => (
            <div key={t.id} className={`test-case ${t.status}`}>
              <span className="test-icon">
                {t.status === 'pending' && <span className="test-pending-dot" />}
                {t.status === 'running' && <RefreshCw size={12} className="spin" style={{ color: '#3b82f6' }} />}
                {t.status === 'pass' && <CheckCircle size={13} style={{ color: '#22c55e' }} />}
                {t.status === 'fail' && <XCircle size={13} style={{ color: '#ef4444' }} />}
              </span>
              <span className="test-name">{t.name}</span>
              {t.status === 'pass' && <span className="test-duration">{t.duration}ms</span>}
              {t.status === 'fail' && <span className="test-error">{t.error}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function Lesson8({ onNext }: { onNext: () => void }) {
  return (
    <div className="lesson-content">
      <div className="lesson-header">
        <span className="phase-chip">Phase 4 — Real-World Skills</span>
        <h1 className="lesson-heading">Testing</h1>
        <p className="lesson-desc">
          Write reliable tests with Jest and React Testing Library — unit tests, interaction tests,
          API mocking, and end-to-end testing concepts.
        </p>
        <div className="lesson-meta">
          <span className="meta-pill"><Clock size={11} className="inline-icon" />~35 min</span>
          <span className="meta-pill" style={{ color: levelColor.Advanced }}>
            <BarChart2 size={11} className="inline-icon" />Advanced
          </span>
        </div>
      </div>

      <SectionTitle><BookOpen size={13} className="inline-icon" />Core Concepts</SectionTitle>
      <div className="concepts-grid">
        <ConceptCard
          title="Jest"
          plain="JavaScript test runner. describe() groups tests, it()/test() defines a test, expect() makes assertions. Runs in Node — fast, no browser needed. Built into Vite projects via vitest."
          analogy="Like a quality inspector on a factory line — checks each part meets spec before it ships."
        />
        <ConceptCard
          title="React Testing Library"
          plain="Tests components the way users interact with them — by text, role, label. Avoids testing implementation details. render() mounts the component, screen queries find elements, fireEvent/userEvent simulates actions."
          analogy="Like a usability tester — they don't read the code, they just use the UI and check if it works."
        />
        <ConceptCard
          title="Mocking"
          plain="Replace real dependencies (API calls, modules) with controlled fakes during tests. jest.fn() creates a mock function. MSW (Mock Service Worker) intercepts real fetch calls at the network level."
          analogy="Like a flight simulator — same controls, same feedback, but no real plane needed."
        />
      </div>

      <SectionTitle><Code2 size={13} className="inline-icon" />Jest Basics</SectionTitle>
      <CodeBlock filename="utils.test.ts" language="ts" code={`import { describe, it, expect } from 'vitest'  // or jest

// describe — groups related tests into a suite
describe('filterListings', () => {

  // it/test — defines a single test case
  it('filters by title', () => {
    const listings = [
      { id: 1, title: 'Bali Villa', location: 'Bali' },
      { id: 2, title: 'NYC Loft', location: 'New York' },
    ]
    const result = filterListings(listings, 'bali')
    // expect — assertion: result should equal expected value
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Bali Villa')
  })

  it('returns all listings for empty query', () => {
    const result = filterListings(listings, '')
    expect(result).toHaveLength(2)
  })

  it('is case insensitive', () => {
    const result = filterListings(listings, 'NYC')
    expect(result[0].location).toBe('New York')
  })
})

// Common matchers
expect(value).toBe(42)                    // strict equality
expect(value).toEqual({ id: 1 })          // deep equality
expect(array).toHaveLength(3)             // array length
expect(string).toContain('Bali')          // string contains
expect(fn).toHaveBeenCalledWith(1)        // function called with args
expect(value).toBeTruthy()               // truthy
expect(value).toBeNull()                  // null`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />React Testing Library</SectionTitle>
      <CodeBlock filename="ListingCard.test.tsx" language="tsx" code={`import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ListingCard from './ListingCard'

const props = {
  title: 'Tropical Villa',
  location: 'Bali, Indonesia',
  price: 185,
  rating: 4.97,
  superhost: true,
  img: 'https://example.com/photo.jpg',
}

describe('ListingCard', () => {
  it('renders title correctly', () => {
    render(<ListingCard {...props} />)
    // getByText — finds element by its text content
    expect(screen.getByText('Tropical Villa')).toBeInTheDocument()
  })

  it('renders price with $ sign', () => {
    render(<ListingCard {...props} />)
    expect(screen.getByText(/\$185/)).toBeInTheDocument()
  })

  it('shows Superhost badge when superhost=true', () => {
    render(<ListingCard {...props} superhost={true} />)
    expect(screen.getByText('Superhost')).toBeInTheDocument()
  })

  it('hides Superhost badge when superhost=false', () => {
    render(<ListingCard {...props} superhost={false} />)
    expect(screen.queryByText('Superhost')).not.toBeInTheDocument()
  })

  it('calls onToggleSave when heart button clicked', async () => {
    const user = userEvent.setup()
    const onToggleSave = vi.fn()  // mock function
    render(<ListingCard {...props} onToggleSave={onToggleSave} />)

    // userEvent simulates real user interactions (more realistic than fireEvent)
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onToggleSave).toHaveBeenCalledTimes(1)
  })
})`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Testing User Interactions</SectionTitle>
      <CodeBlock filename="SearchBar.test.tsx" language="tsx" code={`import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ListingsPage from './ListingsPage'

describe('Search', () => {
  it('filters listings as user types', async () => {
    const user = userEvent.setup()
    render(<ListingsPage />)

    // getByPlaceholderText — find input by placeholder
    const input = screen.getByPlaceholderText('Search listings...')

    // Type into the input
    await user.type(input, 'Bali')

    // Only Bali listings should be visible
    expect(screen.getByText('Tropical Villa')).toBeInTheDocument()
    expect(screen.queryByText('Manhattan Loft')).not.toBeInTheDocument()
  })

  it('shows all listings when search is cleared', async () => {
    const user = userEvent.setup()
    render(<ListingsPage />)
    const input = screen.getByPlaceholderText('Search listings...')

    await user.type(input, 'Bali')
    await user.clear(input)

    // All listings visible again
    expect(screen.getAllByRole('article')).toHaveLength(6)
  })
})`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Mocking API Calls</SectionTitle>
      <CodeBlock filename="api.test.tsx" language="tsx" code={`import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import ListingsPage from './ListingsPage'

// Method 1: Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { id: 1, title: 'Bali Villa', price: 185 },
    ]),
  } as Response)
)

describe('API', () => {
  it('shows loading state then listings', async () => {
    render(<ListingsPage />)

    // Loading state appears first
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // Wait for async update — listings appear
    await waitFor(() => {
      expect(screen.getByText('Bali Villa')).toBeInTheDocument()
    })
  })

  it('shows error state on fetch failure', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))
    render(<ListingsPage />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
    })
  })
})

// Method 2: MSW (Mock Service Worker) — intercepts at network level
// npm install msw
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('/api/listings', () => {
    return HttpResponse.json([{ id: 1, title: 'Bali Villa' }])
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Vitest Setup (Vite projects)</SectionTitle>
      <CodeBlock filename="vite.config.ts" language="ts" code={`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',           // simulate browser DOM
    globals: true,                  // no need to import describe/it/expect
    setupFiles: './src/test-setup.ts',
  },
})

// src/test-setup.ts
import '@testing-library/jest-dom'  // adds toBeInTheDocument() etc.

// package.json scripts
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",       // visual test UI in browser
    "test:coverage": "vitest --coverage"
  }
}`} />

      <SectionTitle><Eye size={13} className="inline-icon" />Live Preview — Visual Test Runner</SectionTitle>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
        Click "Run Tests" to simulate running the test suite. Watch each test pass or fail in real time.
      </p>
      <LivePreview><TestRunner /></LivePreview>

      <AssignmentCard
        goal="Write a full test suite for your Airbnb app"
        tasks={[
          'Set up Vitest with jsdom environment and @testing-library/jest-dom',
          'Write unit tests for ListingCard: renders title, price, superhost badge, hides badge when false',
          'Test the favorite toggle: clicking heart calls onToggleSave, saved count updates',
          'Test the search filter: typing filters by title and location, clearing shows all',
          'Mock the listings API with vi.fn() and test loading + success + error states',
          'Write a multi-step form test: validates required fields, advances on valid input',
          'Run tests with coverage report: vitest --coverage',
        ]}
        starterCode={`// ListingCard.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ListingCard from './ListingCard'

const props = {
  title: 'Tropical Villa',
  location: 'Bali, Indonesia',
  price: 185,
  rating: 4.97,
  superhost: true,
  img: 'https://example.com/photo.jpg',
}

describe('ListingCard', () => {
  it('renders title correctly', () => {
    render(<ListingCard {...props} />)
    // TODO: assert title is in the document
  })

  it('shows Superhost badge when superhost=true', () => {
    // TODO
  })

  it('hides Superhost badge when superhost=false', () => {
    // TODO
  })

  it('calls onToggleSave when heart clicked', async () => {
    const user = userEvent.setup()
    const onToggleSave = vi.fn()
    // TODO: render, click heart, assert onToggleSave called
  })
})`}
        expectedOutput="All tests pass (green). Coverage report shows >80% coverage. One intentionally failing test demonstrates error output format."
      />

      <button className="next-btn" onClick={onNext}>
        Next Lesson <ArrowRight size={14} className="inline-icon" />
      </button>
    </div>
  )
}
