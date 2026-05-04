import { useState, useEffect, useRef } from 'react'
import { ArrowRight, BookOpen, Code2, Eye, Clock, BarChart2, Upload, Check } from 'lucide-react'
import { CodeBlock, ConceptCard, SectionTitle, LivePreview, AssignmentCard, levelColor, mockListings } from '../components/ui'

// ── Simulated useQuery ────────────────────────────────────────────────────────
function useQuery<T>(key: string, fetcher: () => Promise<T>, staleTime = 3000) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<number | null>(null)
  const cache = useRef<Record<string, { data: T; time: number }>>({})

  const fetch = async (background = false) => {
    const cached = cache.current[key]
    if (cached) {
      setData(cached.data)
      setLoading(false)
      if (Date.now() - cached.time < staleTime) return
    }
    if (!background) setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 1200))
      const result = await fetcher()
      cache.current[key] = { data: result, time: Date.now() }
      setData(result)
      setFetchedAt(Date.now())
    } catch {
      setError('Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [key])

  return { data, loading, error, refetch: () => fetch(false), fetchedAt }
}

// ── Multi-step booking form ───────────────────────────────────────────────────
type BookingData = {
  checkIn: string; checkOut: string; guests: string
  name: string; email: string; phone: string
  card: string; expiry: string; cvv: string
}

const steps = ['Dates & Guests', 'Personal Info', 'Payment', 'Confirmation']

function BookingForm() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<BookingData>({
    checkIn: '', checkOut: '', guests: '1',
    name: '', email: '', phone: '',
    card: '', expiry: '', cvv: '',
  })
  const [errors, setErrors] = useState<Partial<BookingData>>({})
  const [photo, setPhoto] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const set = (field: keyof BookingData, value: string) => {
    setData(d => ({ ...d, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = (): boolean => {
    const e: Partial<BookingData> = {}
    if (step === 0) {
      if (!data.checkIn) e.checkIn = 'Required'
      if (!data.checkOut) e.checkOut = 'Required'
      if (!data.guests) e.guests = 'Required'
    }
    if (step === 1) {
      if (!data.name) e.name = 'Required'
      if (!data.email.includes('@')) e.email = 'Valid email required'
      if (data.phone.length < 7) e.phone = 'Valid phone required'
    }
    if (step === 2) {
      if (data.card.replace(/\s/g, '').length < 16) e.card = '16 digits required'
      if (!data.expiry.includes('/')) e.expiry = 'Format: MM/YY'
      if (data.cvv.length < 3) e.cvv = '3 digits required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate()) setStep(prev => prev + 1) }
  const back = () => setStep(prev => prev - 1)

  if (submitted) return (
    <div className="booking-success">
      <div className="success-icon"><Check size={28} /></div>
      <h3>Booking Confirmed!</h3>
      <p>See you in {mockListings[0].location}, {data.name}!</p>
      <button className="filter-btn active" onClick={() => { setStep(0); setSubmitted(false); setData({ checkIn: '', checkOut: '', guests: '1', name: '', email: '', phone: '', card: '', expiry: '', cvv: '' }) }}>
        Book Again
      </button>
    </div>
  )

  return (
    <div className="booking-form">
      {/* Step indicators */}
      <div className="step-indicators">
        {steps.map((_s, i) => (
          <div key={i} className={`step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
            {i < step ? <Check size={10} /> : i + 1}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        Step {step + 1} of {steps.length}: <strong>{steps[step]}</strong>
      </p>

      {step === 0 && (
        <div className="form-grid">
          <div className="form-field">
            <label>Check-in</label>
            <input type="date" value={data.checkIn} onChange={e => set('checkIn', e.target.value)} className={errors.checkIn ? 'input-error' : ''} />
            {errors.checkIn && <span className="error-msg">{errors.checkIn}</span>}
          </div>
          <div className="form-field">
            <label>Check-out</label>
            <input type="date" value={data.checkOut} onChange={e => set('checkOut', e.target.value)} className={errors.checkOut ? 'input-error' : ''} />
            {errors.checkOut && <span className="error-msg">{errors.checkOut}</span>}
          </div>
          <div className="form-field">
            <label>Guests</label>
            <select value={data.guests} onChange={e => set('guests', e.target.value)}>
              {[1,2,3,4,5,6].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="form-grid">
          <div className="form-field">
            <label>Full Name</label>
            <input value={data.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" className={errors.name ? 'input-error' : ''} />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>
          <div className="form-field">
            <label>Email</label>
            <input type="email" value={data.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" className={errors.email ? 'input-error' : ''} />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>
          <div className="form-field">
            <label>Phone</label>
            <input value={data.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" className={errors.phone ? 'input-error' : ''} />
            {errors.phone && <span className="error-msg">{errors.phone}</span>}
          </div>
          <div className="form-field">
            <label>Profile Photo</label>
            <label className="upload-label">
              <Upload size={14} className="inline-icon" />
              {photo ? 'Photo selected' : 'Upload photo'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                const file = e.target.files?.[0]
                if (file) { const url = URL.createObjectURL(file); setPhoto(url) }
              }} />
            </label>
            {photo && <img src={photo} alt="preview" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginTop: 8 }} />}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="form-grid">
          <div className="form-field" style={{ gridColumn: '1/-1' }}>
            <label>Card Number</label>
            <input value={data.card} onChange={e => set('card', e.target.value)} placeholder="1234 5678 9012 3456" maxLength={19} className={errors.card ? 'input-error' : ''} />
            {errors.card && <span className="error-msg">{errors.card}</span>}
          </div>
          <div className="form-field">
            <label>Expiry</label>
            <input value={data.expiry} onChange={e => set('expiry', e.target.value)} placeholder="MM/YY" maxLength={5} className={errors.expiry ? 'input-error' : ''} />
            {errors.expiry && <span className="error-msg">{errors.expiry}</span>}
          </div>
          <div className="form-field">
            <label>CVV</label>
            <input value={data.cvv} onChange={e => set('cvv', e.target.value)} placeholder="123" maxLength={3} className={errors.cvv ? 'input-error' : ''} />
            {errors.cvv && <span className="error-msg">{errors.cvv}</span>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="summary-box">
          <h4 style={{ marginBottom: 12 }}>Booking Summary</h4>
          <div className="summary-row"><span>Property</span><span>{mockListings[0].title}</span></div>
          <div className="summary-row"><span>Check-in</span><span>{data.checkIn}</span></div>
          <div className="summary-row"><span>Check-out</span><span>{data.checkOut}</span></div>
          <div className="summary-row"><span>Guests</span><span>{data.guests}</span></div>
          <div className="summary-row"><span>Name</span><span>{data.name}</span></div>
          <div className="summary-row"><span>Email</span><span>{data.email}</span></div>
        </div>
      )}

      <div className="form-actions">
        {step > 0 && <button className="filter-btn" onClick={back}>Back</button>}
        {step < steps.length - 1
          ? <button className="next-btn" style={{ fontSize: 13, padding: '10px 20px' }} onClick={next}>Continue</button>
          : <button className="next-btn" style={{ fontSize: 13, padding: '10px 20px' }} onClick={() => setSubmitted(true)}>Confirm Booking</button>
        }
      </div>
    </div>
  )
}

function Lesson7Preview() {
  const { data, loading, refetch, fetchedAt } = useQuery(
    'listings',
    async () => mockListings,
    5000
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          useQuery — Cached Data Fetching
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          {loading && <div className="spinner" style={{ width: 16, height: 16 }} />}
          {fetchedAt && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Last fetched: {new Date(fetchedAt).toLocaleTimeString()}</span>}
          <button className="filter-btn" onClick={refetch}>Refetch</button>
        </div>
        {loading && !data && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</p>}
        {data && (
          <div className="cards-grid">
            {data.slice(0, 3).map(l => (
              <div key={l.id} className="listing-card">
                <div className="listing-img-wrap">
                  <img src={l.img} alt={l.title} className="listing-img" />
                </div>
                <div className="listing-body">
                  <span className="listing-location">{l.location}</span>
                  <h4 className="listing-title">{l.title}</h4>
                  <span className="listing-price"><strong>${l.price}</strong> / night</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Multi-Step Booking Form
        </p>
        <BookingForm />
      </div>
    </div>
  )
}

export default function Lesson7({ onNext }: { onNext: () => void }) {
  return (
    <div className="lesson-content">
      <div className="lesson-header">
        <span className="phase-chip">Phase 4 — Real-World Skills</span>
        <h1 className="lesson-heading">Data Fetching & Forms</h1>
        <p className="lesson-desc">
          Fetch data with caching using the TanStack Query pattern, build multi-step forms
          with validation, handle file uploads, and implement optimistic updates.
        </p>
        <div className="lesson-meta">
          <span className="meta-pill"><Clock size={11} className="inline-icon" />~45 min</span>
          <span className="meta-pill" style={{ color: levelColor.Advanced }}>
            <BarChart2 size={11} className="inline-icon" />Advanced
          </span>
        </div>
      </div>

      <SectionTitle><BookOpen size={13} className="inline-icon" />Core Concepts</SectionTitle>
      <div className="concepts-grid">
        <ConceptCard
          title="TanStack Query"
          plain="A data-fetching library that handles caching, background refetching, stale data, loading/error states, and deduplication automatically. useQuery fetches and caches. useMutation handles writes."
          analogy="Like a smart assistant who remembers your last answer, gives it to you instantly, then quietly checks if it's still correct in the background."
        />
        <ConceptCard
          title="Controlled Forms"
          plain="Every input's value is tied to React state. onChange updates state on every keystroke. React is the single source of truth. Validation runs before proceeding to the next step."
          analogy="Like a live form with a supervisor — every field is checked before you can move on."
        />
        <ConceptCard
          title="Optimistic Updates"
          plain="Update the UI immediately before the server confirms. If the server fails, roll back. Makes the app feel instant. Common pattern with useMutation in TanStack Query."
          analogy="Like a bank showing your balance after a transfer before it clears — optimistic, rolls back if it fails."
        />
      </div>

      <SectionTitle><Code2 size={13} className="inline-icon" />TanStack Query Setup</SectionTitle>
      <CodeBlock filename="main.tsx" language="tsx" code={`// npm install @tanstack/react-query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // data is fresh for 5 minutes
      retry: 2,                   // retry failed requests twice
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)`} />

      <CodeBlock filename="useListings.ts" language="ts" code={`import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// useQuery — fetch and cache listings
export function useListings() {
  return useQuery({
    queryKey: ['listings'],          // cache key — unique identifier
    queryFn: () => fetch('/api/listings').then(r => r.json()),
    staleTime: 5 * 60 * 1000,       // don't refetch for 5 minutes
  })
}

// useQuery with params — refetches when id changes
export function useListing(id: number) {
  return useQuery({
    queryKey: ['listing', id],       // different key per listing
    queryFn: () => fetch(\`/api/listings/\${id}\`).then(r => r.json()),
    enabled: !!id,                   // only run when id exists
  })
}

// useMutation — create/update/delete with optimistic update
export function useAddListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newListing: Listing) =>
      fetch('/api/listings', { method: 'POST', body: JSON.stringify(newListing) }).then(r => r.json()),

    // Optimistic update — add to cache before server responds
    onMutate: async (newListing) => {
      await queryClient.cancelQueries({ queryKey: ['listings'] })
      const previous = queryClient.getQueryData(['listings'])
      queryClient.setQueryData(['listings'], (old: Listing[]) => [...old, { ...newListing, id: Date.now() }])
      return { previous }  // return snapshot for rollback
    },

    // Rollback on error
    onError: (err, newListing, context) => {
      queryClient.setQueryData(['listings'], context?.previous)
    },

    // Refetch after success to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })
}`} />

      <CodeBlock filename="ListingsPage.tsx" language="tsx" code={`function ListingsPage() {
  // Destructure everything you need from useQuery
  const { data: listings, isLoading, isError, error, refetch, isFetching } = useListings()
  const addListing = useAddListing()

  if (isLoading) return <Spinner />
  if (isError) return <p>Error: {error.message} <button onClick={refetch}>Retry</button></p>

  return (
    <div>
      {/* isFetching is true during background refetch — show subtle indicator */}
      {isFetching && <p>Refreshing...</p>}

      <button onClick={() => addListing.mutate({ title: 'New Listing', price: 100 })}>
        {addListing.isPending ? 'Adding...' : 'Add Listing'}
      </button>

      {listings.map(l => <ListingCard key={l.id} {...l} />)}
    </div>
  )
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />Multi-Step Form with Validation</SectionTitle>
      <CodeBlock filename="BookingForm.tsx" language="tsx" code={`function BookingForm() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ checkIn: '', checkOut: '', guests: 1, name: '', email: '', card: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (field: string, value: string | number) => {
    setData(d => ({ ...d, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))  // clear error on change
  }

  // Validate current step before advancing
  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (!data.checkIn) e.checkIn = 'Check-in date is required'
      if (!data.checkOut) e.checkOut = 'Check-out date is required'
    }
    if (step === 1) {
      if (!data.name) e.name = 'Name is required'
      if (!data.email.includes('@')) e.email = 'Valid email required'
    }
    if (step === 2) {
      if (data.card.length < 16) e.card = '16-digit card number required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate()) setStep(s => s + 1) }

  return (
    <form onSubmit={e => { e.preventDefault(); if (validate()) submitBooking(data) }}>
      {step === 0 && (
        <>
          <input type="date" value={data.checkIn} onChange={e => set('checkIn', e.target.value)} />
          {errors.checkIn && <p className="error">{errors.checkIn}</p>}
          <input type="date" value={data.checkOut} onChange={e => set('checkOut', e.target.value)} />
          {errors.checkOut && <p className="error">{errors.checkOut}</p>}
        </>
      )}
      {step === 1 && (
        <>
          <input value={data.name} onChange={e => set('name', e.target.value)} placeholder="Full name" />
          {errors.name && <p className="error">{errors.name}</p>}
          <input type="email" value={data.email} onChange={e => set('email', e.target.value)} />
          {errors.email && <p className="error">{errors.email}</p>}
        </>
      )}
      <button type="button" onClick={next}>Next</button>
    </form>
  )
}`} />

      <SectionTitle><Code2 size={13} className="inline-icon" />File Upload with Preview</SectionTitle>
      <CodeBlock filename="FileUpload.tsx" language="tsx" code={`function ProfilePhotoUpload() {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    // Validate file type and size
    if (!selected.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (selected.size > 5 * 1024 * 1024) {
      alert('File must be under 5MB')
      return
    }

    setFile(selected)
    // Create a local URL for preview — revoke when done to free memory
    const url = URL.createObjectURL(selected)
    setPreview(url)
  }

  const handleUpload = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('photo', file)
    await fetch('/api/upload', { method: 'POST', body: formData })
    URL.revokeObjectURL(preview!)  // free memory
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleChange} />
      {preview && <img src={preview} alt="Preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />}
      {file && <button onClick={handleUpload}>Upload</button>}
    </div>
  )
}`} />

      <SectionTitle><Eye size={13} className="inline-icon" />Live Preview</SectionTitle>
      <LivePreview><Lesson7Preview /></LivePreview>

      <AssignmentCard
        goal="Build a full booking flow with cached data fetching and a validated multi-step form"
        tasks={[
          'Install @tanstack/react-query and wrap your app in QueryClientProvider',
          'Create a useListings hook using useQuery with a 5-minute staleTime',
          'Build a 4-step booking form: Dates, Personal Info, Payment, Confirmation',
          'Validate each step before allowing the user to proceed',
          'Add a file upload input for profile photo with image preview',
          'Implement an optimistic update: add a new listing to the UI before the server responds',
          'Handle loading, error, and empty states for the listings query',
        ]}
        starterCode={`// useListings.ts
export function useListings() {
  return useQuery({
    queryKey: ['listings'],
    queryFn: () => fetch('/api/listings').then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  })
}

// BookingForm.tsx
const steps = ['Dates', 'Personal Info', 'Payment', 'Confirmation']

function BookingForm() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ checkIn: '', checkOut: '', guests: 1, name: '', email: '', card: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    // TODO: validate current step fields
    // return true if valid, false if not
  }

  const next = () => {
    if (validate()) setStep(s => s + 1)
  }

  return (
    <div>
      {/* TODO: step indicators */}
      {/* TODO: step 0 — dates + guests */}
      {/* TODO: step 1 — name, email, phone, photo upload */}
      {/* TODO: step 2 — card, expiry, cvv */}
      {/* TODO: step 3 — summary + confirm button */}
    </div>
  )
}`}
        expectedOutput="Listings load with caching (instant on revisit, background refetch). Multi-step form validates each step. File upload shows image preview. Optimistic update adds listing instantly."
      />

      <button className="next-btn" onClick={onNext}>
        Next Lesson <ArrowRight size={14} className="inline-icon" />
      </button>
    </div>
  )
}
