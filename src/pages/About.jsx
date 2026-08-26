import { useEffect, useState } from 'react'
import './About.css'
import BoidsBackground from '../components/BoidsBackground'
import BoidsControls from '../components/BoidsControls'
import { getHighScore, setHighScore } from '../lib/highScore.js'

const skillCategories = [
  {
    label: 'Languages',
    accent: 'primary',
    items: ['Python', 'Java', 'C#', 'C', 'C++', 'JavaScript', 'Assembly'],
  },
  {
    label: 'Web & Frameworks',
    accent: 'accent',
    items: ['React', 'React Native', 'Expo', 'Flutter', 'Django', 'FastAPI', '.NET', 'Tailwind', 'Bootstrap', 'HTML', 'CSS', 'PHP'],
  },
  {
    label: 'Databases',
    accent: 'highlight',
    items: ['MySQL', 'PostgreSQL', 'Supabase', 'MongoDB', 'Firebase'],
  },
  {
    label: 'Cloud & Tools',
    accent: 'primary-light',
    items: ['AWS', 'Git', 'Linux', 'Vercel', 'Visual Studio', 'Android Studio', '.NET MAUI'],
  },
  {
    label: 'Cybersecurity',
    accent: 'highlight',
    items: ['Cryptography', 'Network Protocols', 'Attack / Defense', 'Secure App Design'],
  },
  {
    label: 'Concepts',
    accent: 'accent',
    items: ['REST APIs', 'MVVM / MVC', 'OOP', 'ACID', 'Database Design', 'Normalization'],
  },
]

const education = [
  {
    school: 'University of Utah',
    degree: 'B.S. Computer Science, Math Minor',
    period: 'Jan 2023 – Anticipated Dec 2026',
    gpa: '3.69',
    notes: [
      'Senior Capstone',
      'Software Development',
      'Mobile App Development',
      'Web Development',
      'Database Systems',
      'Computer Organization',
      'Algorithms & Data Structures',
    ],
  },
  {
    school: 'Salt Lake Community College',
    degree: 'A.S. Computer Science',
    period: 'Aug 2021 – Aug 2023',
    gpa: '4.0',
    notes: [
      "President's List",
      'Summa Cum Laude',
    ],
  },
]

const experience = [
  {
    company: 'Old Spaghetti Factory',
    role: 'Supervisor',
    location: 'Taylorsville, UT',
    period: 'Jul 2019 – Present',
    notes: [
      'Ensured a quality guest experience during high-volume hours',
      'Operated the restaurant floor, assisting team members and troubleshooting in real time',
      'Led and coached team members, with a focus on conflict resolution',
    ],
  },
]

const focusAreas = [
  {
    title: 'Full-Stack Web',
    desc: 'Django, FastAPI, React — end-to-end application development with REST APIs and clean data models.',
  },
  {
    title: 'Mobile Development',
    desc: 'React Native + Expo for cross-platform apps, with Supabase for auth and real-time data.',
  },
  {
    title: 'Cloud Infrastructure',
    desc: 'AWS deployments, Vercel, and Linux environments — building apps that run reliably.',
  },
  {
    title: 'Secure Design',
    desc: 'Cryptography, network protocols, and attack/defense principles applied throughout the SDLC.',
  },
]

export default function About() {
  const [gameActive, setGameActive] = useState(false)
  const [highScore, setHighScoreValue] = useState(() => getHighScore())

  useEffect(() => {
    if (!gameActive) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setGameActive(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [gameActive])

  useEffect(() => {
    document.body.classList.toggle('no-select', gameActive)
    return () => document.body.classList.remove('no-select')
  }, [gameActive])

  function handleGameEnd(finalScore) {
    setGameActive(false)
    setHighScoreValue(hs => {
      if (finalScore > hs) {
        setHighScore(finalScore)
        return finalScore
      }
      return hs
    })
  }

  return (
    <div className="about-page">
      <BoidsBackground gameActive={gameActive} onGameEnd={handleGameEnd} />
      <BoidsControls
        highScore={highScore}
        gameActive={gameActive}
        onPlayClick={() => setGameActive(a => !a)}
      />
      {!gameActive && (
      <>
      <header className="about-header">
        <h1 className="about-title">About</h1>
        <p className="about-tagline">
          Full-stack CS student at the University of Utah — building real systems across web, mobile, and cloud.
        </p>
      </header>

      <section className="about-section">
        <h2 className="section-heading">Profile</h2>
        <p className="about-bio">
          I build full-stack, mobile, and cloud-deployed applications with a focus on clean
          architecture and secure design. Currently pursuing a B.S. in Computer Science at the
          University of Utah (3.69 GPA), with hands-on experience across the full stack — from
          FastAPI and Django backends to React and Expo/React Native frontends with Supabase.
          Outside of code, I've spent seven-plus years as a restaurant supervisor, which shapes how
          I think about systems, communication, and accountability under pressure.
        </p>
      </section>

      <section className="about-section">
        <h2 className="section-heading">Technical Skills</h2>
        <div className="skills-grid">
          {skillCategories.map(({ label, accent, items }) => (
            <div key={label} className={`skill-category skill-category--${accent}`}>
              <h3 className="skill-category-label">{label}</h3>
              <ul className="skill-chips">
                {items.map(item => (
                  <li key={item} className="skill-chip">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2 className="section-heading">Education</h2>
        <div className="education-list">
          {education.map(({ school, degree, period, gpa, notes }) => (
            <div key={school} className="education-entry">
              <div className="education-meta">
                <span className="education-period">{period}</span>
                <span className="education-gpa">GPA {gpa}</span>
              </div>
              <div className="education-body">
                <h3 className="education-school">{school}</h3>
                <p className="education-degree">{degree}</p>
                <ul className="education-notes">
                  {notes.map(n => <li key={n}>{n}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2 className="section-heading">Experience</h2>
        <div className="experience-list">
          {experience.map(({ company, role, location, period, notes }) => (
            <div key={company} className="experience-entry">
              <div className="education-meta">
                <span className="education-period">{period}</span>
                <span className="education-gpa">{location}</span>
              </div>
              <div className="education-body">
                <h3 className="education-school">{company}</h3>
                <p className="education-degree">{role}</p>
                <ul className="experience-notes">
                  {notes.map(n => <li key={n}>{n}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2 className="section-heading">Focus Areas</h2>
        <div className="focus-grid">
          {focusAreas.map(({ title, desc }) => (
            <div key={title} className="focus-card">
              <h3 className="focus-title">{title}</h3>
              <p className="focus-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>
      </>
      )}
    </div>
  )
}
