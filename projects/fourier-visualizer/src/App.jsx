import { BrowserRouter, Routes, Route, NavLink, Outlet } from 'react-router-dom'
import './App.css'
import Home from './home/index.jsx'
import Visualizer from './visualizer/index.jsx'
import MusicBox from './music-box/index.jsx'

function Layout() {
  return (
    <div>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/visualizer">Visualizer</NavLink>
        <NavLink to="/music-box">Music Box</NavLink>
        <a
          href="https://collin-giles-portfolio.vercel.app/"
          className="nav-portfolio-link"
        >← Portfolio</a>
        <span className="nav-byline">By Collin Giles</span>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="visualizer" element={<Visualizer />} />
          <Route path="music-box" element={<MusicBox />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
