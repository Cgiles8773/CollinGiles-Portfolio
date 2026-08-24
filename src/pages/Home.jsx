import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import DraggableShape from '../components/DraggableShape'
import GameModeButton from '../components/GameModeButton'
import WiggleModeButton from '../components/WiggleModeButton'
import WiggleLayer from '../components/WiggleLayer'
import ModeHint from '../components/ModeHint'
import './Home.css'

function HomeDeco({ isGameMode }) {
  return (
    <div className="home-deco" aria-hidden="true">
      <DraggableShape tagName="div" className="deco deco--pink-circle-tr" isGameMode={isGameMode} />
      <DraggableShape tagName="div" className="deco deco--orange-rect-bl" isGameMode={isGameMode} />
      <DraggableShape tagName="div" className="deco deco--orange-circle-ml" isGameMode={isGameMode} />
      <DraggableShape tagName="div" className="deco deco--pink-bar-mr" isGameMode={isGameMode} />
      <DraggableShape tagName="div" className="deco deco--blue-circle-br" isGameMode={isGameMode} />

      <DraggableShape
        tagName="svg"
        className="deco deco--blue-arc"
        viewBox="0 -25 160 650"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        isGameMode={isGameMode}
      >
        <path d="M 130 20 Q 10 300 130 580" stroke="#48A4E6" strokeWidth="48" strokeLinecap="round" />
      </DraggableShape>

      <DraggableShape
        tagName="svg"
        className="deco deco--triangle-tl"
        viewBox="0 0 76 114"
        xmlns="http://www.w3.org/2000/svg"
        isGameMode={isGameMode}
      >
        <defs>
          <polygon id="tri" points="0,0 38,0 0,38" />
        </defs>
        <use href="#tri" x="0"  y="0"  fill="#FFBD49" />
        <use href="#tri" x="38" y="0"  fill="#FFBD49" />
        <use href="#tri" x="0"  y="38" fill="#FFBD49" />
        <use href="#tri" x="38" y="38" fill="#FFBD49" />
        <use href="#tri" x="0"  y="76" fill="#FFBD49" />
      </DraggableShape>

      <DraggableShape
        tagName="svg"
        className="deco deco--quarter-circle-rm"
        viewBox="-22 -22 175 175"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        isGameMode={isGameMode}
      >
        <path d="M 130,0 A 130,130 0 0,1 0,130" stroke="#4FD6FF" strokeWidth="42" strokeLinecap="round" />
      </DraggableShape>

      <DraggableShape
        tagName="svg"
        className="deco deco--squiggle"
        viewBox="-12 -12 504 124"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        isGameMode={isGameMode}
      >
        <path
          d="M 0,50 C 40,0 80,0 120,50 C 160,100 200,100 240,50 C 280,0 320,0 360,50 C 400,100 440,100 480,50"
          stroke="#FFBD49" strokeWidth="22" strokeLinecap="round"
        />
      </DraggableShape>
    </div>
  )
}

export default function Home() {
  const [gameMode,   setGameMode]   = useState(false)
  const [wiggleMode, setWiggleMode] = useState(false)

  const toggleGame   = () => { setGameMode(g => !g);   setWiggleMode(false) }
  const toggleWiggle = () => { setWiggleMode(w => !w); setGameMode(false) }

  return (
    <main className={`home-page${gameMode ? ' game-mode' : ''}`}>
      <HomeDeco isGameMode={gameMode} />
      <div className="home-content">
        <div className="home-hero">
          <DraggableShape tagName="p" className="home-greeting" isGameMode={gameMode}>
            Hello, my name is
          </DraggableShape>
          <DraggableShape tagName="h1" className="home-name" isGameMode={gameMode}>
            Collin Giles
          </DraggableShape>
          <DraggableShape tagName="p" className="home-blurb" isGameMode={gameMode}>
            I am a computer scientist, math lover, professional unicyclist,
            climber, and would definitely volunteer to go to Mars.🚀
          </DraggableShape>
          <DraggableShape tagName="p" isGameMode={gameMode}>
            This website acts as my portfolio, check out my <NavLink to='/projects'>Projects</NavLink> to see some of the things I've made!
          </DraggableShape>
        </div>
      </div>
      <WiggleLayer isActive={wiggleMode} />
      <ModeHint active={gameMode}>Try clicking and dragging the shapes!</ModeHint>
      <ModeHint active={wiggleMode}>Try moving your mouse around!</ModeHint>
      <WiggleModeButton active={wiggleMode} onToggle={toggleWiggle} />
      <GameModeButton active={gameMode} onToggle={toggleGame} />
    </main>
  )
}
