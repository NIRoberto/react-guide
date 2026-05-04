import { useState, useRef } from 'react'
import { Sun, Moon, ChevronDown, ChevronRight, Check } from 'lucide-react'
import Lesson1 from './lessons/Lesson1'
import Lesson2 from './lessons/Lesson2'
import Lesson3 from './lessons/Lesson3'
import Lesson4 from './lessons/Lesson4'
import Lesson5 from './lessons/Lesson5'
import Lesson6 from './lessons/Lesson6'
import Lesson7 from './lessons/Lesson7'
import Lesson8 from './lessons/Lesson8'
import Lesson9 from './lessons/Lesson9'
import Lesson10 from './lessons/Lesson10'
import CourseComplete from './lessons/CourseComplete'
import './App.css'

const phases = [
  {
    id: 1, title: 'Phase 1 — Foundations',
    lessons: [
      { id: 1, title: 'React Basics', level: 'Beginner', duration: '~25 min' },
      { id: 2, title: 'State and Events', level: 'Beginner', duration: '~30 min' },
    ],
  },
  {
    id: 2, title: 'Phase 2 — Hooks & Styling',
    lessons: [
      { id: 3, title: 'Core Hooks', level: 'Intermediate', duration: '~40 min' },
      { id: 4, title: 'Styling Approaches', level: 'Intermediate', duration: '~25 min' },
    ],
  },
  {
    id: 3, title: 'Phase 3 — Advanced',
    lessons: [
      { id: 5, title: 'Routing', level: 'Advanced', duration: '~35 min' },
      { id: 6, title: 'State Management & Performance', level: 'Advanced', duration: '~40 min' },
    ],
  },
  {
    id: 4, title: 'Phase 4 — Real-World Skills',
    lessons: [
      { id: 7, title: 'Data Fetching & Forms', level: 'Advanced', duration: '~45 min' },
      { id: 8, title: 'Testing', level: 'Advanced', duration: '~35 min' },
    ],
  },
  {
    id: 5, title: 'Phase 5 — Patterns & TypeScript',
    lessons: [
      { id: 9, title: 'Advanced Patterns & TypeScript', level: 'Expert', duration: '~45 min' },
    ],
  },
  {
    id: 6, title: 'Phase 6 — Production',
    lessons: [
      { id: 10, title: 'Build, Deploy & Next.js', level: 'Expert', duration: '~50 min' },
    ],
  },
]

const levelColor: Record<string, string> = {
  Beginner: '#22c55e',
  Intermediate: '#3b82f6',
  Advanced: '#f97316',
  Expert: '#a855f7',
}

const totalLessons = phases.reduce((acc, p) => acc + p.lessons.length, 0)

export default function App() {
  const [currentLesson, setCurrentLesson] = useState(1)
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [collapsedPhases, setCollapsedPhases] = useState<number[]>([])
  const [dark, setDark] = useState(false)
  const [courseComplete, setCourseComplete] = useState(false)
  const contentRef = useRef<HTMLElement>(null)

  const togglePhase = (id: number) =>
    setCollapsedPhases(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )

  const goToLesson = (id: number) => {
    setCourseComplete(false)
    setCurrentLesson(id)
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNext = () => {
    if (!completedLessons.includes(currentLesson))
      setCompletedLessons(prev => [...prev, currentLesson])
    if (currentLesson < totalLessons) {
      goToLesson(currentLesson + 1)
    } else {
      setCourseComplete(true)
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleRestart = () => {
    setCurrentLesson(1)
    setCompletedLessons([])
    setCourseComplete(false)
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const progress = Math.round((completedLessons.length / totalLessons) * 100)

  const renderLesson = () => {
    if (courseComplete) return <CourseComplete onRestart={handleRestart} />
    switch (currentLesson) {
      case 1:  return <Lesson1  onNext={handleNext} />
      case 2:  return <Lesson2  onNext={handleNext} />
      case 3:  return <Lesson3  onNext={handleNext} />
      case 4:  return <Lesson4  onNext={handleNext} />
      case 5:  return <Lesson5  onNext={handleNext} />
      case 6:  return <Lesson6  onNext={handleNext} />
      case 7:  return <Lesson7  onNext={handleNext} />
      case 8:  return <Lesson8  onNext={handleNext} />
      case 9:  return <Lesson9  onNext={handleNext} />
      case 10: return <Lesson10 onNext={handleNext} />
      default: return null
    }
  }

  return (
    <div className={`app ${dark ? 'dark' : 'light'}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-title">React × Airbnb</span>
          <span className="brand-badge">Full Course</span>
          <button className="theme-toggle" onClick={() => setDark(d => !d)} title="Toggle theme">
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {phases.map(phase => {
            const collapsed = collapsedPhases.includes(phase.id)
            return (
              <div key={phase.id} className="phase-group">
                <button className="phase-header" onClick={() => togglePhase(phase.id)}>
                  <span>{phase.title}</span>
                  <span className="phase-chevron">
                    {collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  </span>
                </button>
                {!collapsed && (
                  <ul className="lesson-list">
                    {phase.lessons.map(lesson => {
                      const isActive = currentLesson === lesson.id && !courseComplete
                      const isDone = completedLessons.includes(lesson.id)
                      return (
                        <li key={lesson.id}>
                          <button
                            className={`lesson-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                            onClick={() => goToLesson(lesson.id)}
                          >
                            <span className="lesson-num">
                              {isDone ? <Check size={11} strokeWidth={3} /> : lesson.id}
                            </span>
                            <span className="lesson-info">
                              <span className="lesson-title-text">{lesson.title}</span>
                              <span className="lesson-level" style={{ color: levelColor[lesson.level] }}>
                                {lesson.level} · {lesson.duration}
                              </span>
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="progress-label">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-sub">{completedLessons.length} / {totalLessons} lessons complete</div>
        </div>
      </aside>

      <main className="content" ref={contentRef}>
        {renderLesson()}
      </main>
    </div>
  )
}
