import { Check, ExternalLink, RotateCcw } from 'lucide-react'

const checklist = [
  { phase: 'Phase 1', items: ['JSX syntax rules', 'Functional components', 'Props & destructuring', 'Conditional rendering', 'Lists with .map()', 'useState hook', 'Event handlers', 'Controlled inputs', 'Functional state updates'] },
  { phase: 'Phase 2', items: ['useEffect patterns & cleanup', 'useRef for DOM & values', 'useContext & Provider', 'useReducer & actions', 'useMemo & useCallback', 'Custom hooks', 'CSS Modules', 'Inline style objects', 'Tailwind CSS utilities', 'className conditionals'] },
  { phase: 'Phase 3', items: ['React Router v6', 'Dynamic routes & useParams', 'useNavigate', 'Protected routes', 'Nested routes & Outlet', 'React.lazy + Suspense', 'Zustand global store', 'React.memo', 'Virtualization', 'Code splitting'] },
  { phase: 'Phase 4', items: ['TanStack Query useQuery', 'useMutation & optimistic updates', 'Caching & staleTime', 'Multi-step forms', 'Form validation', 'File upload & preview', 'Jest & Vitest basics', 'React Testing Library', 'Mocking APIs', 'E2E testing concepts'] },
  { phase: 'Phase 5', items: ['Higher-Order Components', 'Compound components', 'Render props pattern', 'Provider pattern', 'TypeScript interfaces', 'Typing hooks & events', 'Generic components', 'Return type annotations'] },
  { phase: 'Phase 6', items: ['Vite production build', 'Environment variables', 'Vercel deployment', 'GitHub Actions CI/CD', 'Next.js App Router', 'Server vs Client Components', 'SSR / SSG / ISR', 'API routes', 'generateStaticParams'] },
]

const resources = [
  { name: 'react.dev', desc: 'Official React documentation', url: 'https://react.dev' },
  { name: 'React TypeScript Cheatsheet', desc: 'Community TypeScript + React reference', url: 'https://react-typescript-cheatsheet.netlify.app' },
  { name: 'TanStack Query Docs', desc: 'Data fetching library docs', url: 'https://tanstack.com/query' },
  { name: 'Zustand Docs', desc: 'Minimal state management', url: 'https://zustand-demo.pmnd.rs' },
  { name: 'Next.js Docs', desc: 'Full-stack React framework', url: 'https://nextjs.org/docs' },
]

const nextProjects = [
  { title: 'Full-Stack with Supabase', desc: 'Add auth, real DB, and storage to your Airbnb clone using Supabase.' },
  { title: 'Mobile with React Native', desc: 'Port your Airbnb UI to iOS and Android using React Native + Expo.' },
  { title: 'Contribute to Open Source', desc: 'Find a React project on GitHub and submit your first PR.' },
]

export default function CourseComplete({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="lesson-content">
      <div className="complete-hero">
        <div className="complete-badge">
          <Check size={32} strokeWidth={3} />
        </div>
        <h1 className="lesson-heading" style={{ textAlign: 'center' }}>You're a React Engineer!</h1>
        <p className="lesson-desc" style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
          You've completed all 6 phases of the React × Airbnb course. You built a real app from scratch
          and learned every major concept in the React ecosystem.
        </p>
      </div>

      {/* Checklist */}
      <div>
        <h3 className="section-title" style={{ marginBottom: 20 }}>Everything You Learned</h3>
        <div className="checklist-grid">
          {checklist.map(phase => (
            <div key={phase.phase} className="checklist-card">
              <p className="checklist-phase">{phase.phase}</p>
              <ul className="checklist-items">
                {phase.items.map(item => (
                  <li key={item}>
                    <Check size={11} style={{ color: '#22c55e', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* What you built */}
      <div className="built-card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>What You Built</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>
          A full Airbnb clone with: static listing cards → live search & favorites → hooks & context →
          styled components → multi-page routing → global state → cached data fetching → multi-step booking form →
          full test suite → TypeScript types → production deployment pipeline.
        </p>
      </div>

      {/* Resources */}
      <div>
        <h3 className="section-title" style={{ marginBottom: 16 }}>Resources</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {resources.map(r => (
            <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="resource-link">
              <div>
                <span className="resource-name">{r.name}</span>
                <span className="resource-desc">{r.desc}</span>
              </div>
              <ExternalLink size={13} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
            </a>
          ))}
        </div>
      </div>

      {/* What to build next */}
      <div>
        <h3 className="section-title" style={{ marginBottom: 16 }}>What to Build Next</h3>
        <div className="concepts-grid">
          {nextProjects.map(p => (
            <div key={p.title} className="concept-card">
              <h4 className="concept-title">{p.title}</h4>
              <p className="concept-plain">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="next-btn" onClick={onRestart} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <RotateCcw size={14} />
        Restart Course
      </button>
    </div>
  )
}
