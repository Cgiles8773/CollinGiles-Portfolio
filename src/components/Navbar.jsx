import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'

const navLinks = [
  { label: 'Home',     to: '/',         end: true },
  { label: 'About',    to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Reading',  to: '/reading' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-brand" onClick={() => setIsOpen(false)}>Collin Giles</NavLink>

      <button
        type="button"
        className="nav-toggle"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(o => !o)}
      >
        <span />
        <span />
        <span />
      </button>

      <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
        {navLinks.map(({ label, to, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => setIsOpen(false)}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
