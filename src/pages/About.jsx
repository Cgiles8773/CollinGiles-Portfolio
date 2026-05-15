import './About.css'

const skillCategories = [
  {
    label: 'Languages',
    accent: 'primary',
    items: ['Python', 'Java', 'C#', 'C', 'C++', 'JavaScript', 'Assembly'],
  },
  {
    label: 'Web & Frameworks',
    accent: 'accent',
    items: ['React', 'React Native', 'Django', 'FastAPI', '.NET', 'HTML', 'CSS', 'PHP'],
  },
  {
    label: 'Databases',
    accent: 'highlight',
    items: ['MySQL', 'Supabase', 'MongoDB', 'Firebase'],
  },
  {
    label: 'Cloud & Tools',
    accent: 'primary-light',
    items: ['AWS', 'Git', 'Linux', 'Expo', 'Vercel'],
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
    period: 'Jan 2023 – Dec 2026',
    gpa: '3.66',
    notes: [
      'Algorithms & Data Structures',
      'Database Systems',
      'Web & Mobile Development',
      'Computer Security',
      'Computer Architecture',
    ],
  },
  {
    school: 'Salt Lake Community College',
    degree: 'A.S. Computer Science & Information Systems',
    period: 'Aug 2021 – Aug 2023',
    gpa: '4.0',
    notes: [
      "President's List — High Honors",
      'Certificate: Web Programming & Development',
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
  return (
    <div className="about-page">
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
          University of Utah (3.66 GPA), with hands-on experience across the full stack — from
          Django backends on AWS to React Native frontends with Supabase. Outside of code, I've
          spent five-plus years leading teams of 20+ in high-volume environments, which shapes how
          I think about systems, communication, and accountability.
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
    </div>
  )
}
