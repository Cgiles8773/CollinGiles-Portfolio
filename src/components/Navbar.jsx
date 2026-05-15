import { NavLink } from 'react-router-dom'
import './Navbar.css'

const navLinks = [
  { label: 'Home',     to: '/',         end: true },
  { label: 'About',    to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Reading',  to: '/reading' },
]

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-brand">Collin Giles</NavLink>

      <ul className="nav-links">
        {navLinks.map(({ label, to, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => isActive ? 'active' : ''}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
