import { NavLink } from 'react-router-dom'
import './Home.css'

function HomeDeco() {
  return (
    <div className="home-deco" aria-hidden="true">
      <div className="deco deco--pink-circle-tr" />
      <div className="deco deco--orange-rect-bl" />
      <div className="deco deco--orange-circle-ml" />
      <div className="deco deco--pink-bar-mr" />
      <div className="deco deco--blue-circle-br" />
      <svg className="deco deco--blue-arc" viewBox="0 -25 160 650" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 130 20 Q 10 300 130 580" stroke="#48A4E6" strokeWidth="48" strokeLinecap="round" />
      </svg>

      {/* Orange right triangles — 2 cols × 3 rows, offset from corner */}
      <svg className="deco deco--triangle-tl" viewBox="0 0 76 114" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <polygon id="tri" points="0,0 38,0 0,38" />
        </defs>
        <use href="#tri" x="0"  y="0"  fill="#FFBD49" />
        <use href="#tri" x="38" y="0"  fill="#FFBD49" />
        <use href="#tri" x="0"  y="38" fill="#FFBD49" />
        <use href="#tri" x="38" y="38" fill="#FFBD49" />
        <use href="#tri" x="0"  y="76" fill="#FFBD49" />
      </svg>

      {/* Pink quarter-circle arc with rounded ends — right margin */}
      <svg className="deco deco--quarter-circle-rm" viewBox="-22 -22 175 175" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 130,0 A 130,130 0 0,1 0,130" stroke="#4FD6FF" strokeWidth="42" strokeLinecap="round" />
      </svg>

      {/* Orange squiggle — bottom center */}
      <svg className="deco deco--squiggle" viewBox="-12 -12 504 124" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 0,50 C 40,0 80,0 120,50 C 160,100 200,100 240,50 C 280,0 320,0 360,50 C 400,100 440,100 480,50"
          stroke="#FFBD49" strokeWidth="22" strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

export default function Home() {
  return (
    <main className="home-page">
      <HomeDeco />
      <div className="home-content">
        <div className="home-hero">
          <p className="home-greeting">Hello, my name is</p>
          <h1 className="home-name">Collin Giles</h1>
          <p className="home-blurb">
            I am a computer scientist, math lover, professional unicyclist,
            climber, and would definitely volunteer to go to Mars.🚀
          </p>
          <p>
            This website acts as my portfolio, check out my <NavLink to='/projects'>Projects</NavLink> to get started
          </p>
        </div>
      </div>
    </main>
  )
}
