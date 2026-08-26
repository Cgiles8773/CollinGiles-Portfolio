import { useEffect, useRef, useState } from 'react'
import { Boid } from '../lib/boids/Boid.js'
import BoidsGameHud from './BoidsGameHud'
import './BoidsBackground.css'

const MARGIN = 100
const NAVBAR_HEIGHT = 60
const VISUAL_RANGE = 60
const PROTECTED_RANGE = 15
const BOID_COUNT = 200
const BOID_COLOR_RGB = '72, 164, 230' // --color-primary
const CENTER_ALPHA = 0.15 // opacity near the middle of the screen
const EDGE_ALPHA = 0.5 // opacity toward the screen edges

const ROUND_DURATION_MS = 30000
const GOAL_LIFETIME_MS = 4000
const GOAL_RADIUS = 45
const GOAL_FILL = 'rgba(255, 189, 73, 0.15)' // --color-accent, faint
const GOAL_STROKE = '#FFBD49' // --color-accent

function buildGrid(boids, cellSize) {
  const grid = new Map()
  for (const boid of boids) {
    const col = Math.floor(boid.x / cellSize)
    const row = Math.floor(boid.y / cellSize)
    const key = `${col},${row}`
    let cell = grid.get(key)
    if (!cell) {
      cell = []
      grid.set(key, cell)
    }
    cell.push(boid)
  }
  return grid
}

function goalRadiusAt(goal, now) {
  const t = Math.max(0, Math.min(1, (goal.expiresAt - now) / GOAL_LIFETIME_MS))
  return GOAL_RADIUS * t
}

export default function BoidsBackground({ gameActive = false, onGameEnd }) {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)

  const gameActiveRef = useRef(gameActive)
  const onGameEndRef = useRef(onGameEnd)
  useEffect(() => { gameActiveRef.current = gameActive }, [gameActive])
  useEffect(() => { onGameEndRef.current = onGameEnd }, [onGameEnd])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    let width = window.innerWidth
    let height = window.innerHeight

    function applySize() {
      const dpr = window.devicePixelRatio || 1
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    applySize()

    const blueprint = {
      turnFactor: 0.3,
      centeringFactor: 0.0008,
      avoidFactor: 0.05,
      matchingFactor: 0.05,
      maxSpeed: 6,
      minSpeed: 3,
      leftMargin: MARGIN,
      rightMargin: width - MARGIN,
      topMargin: NAVBAR_HEIGHT,
      bottomMargin: height - MARGIN,
      attractRange: 100,
      attractFactor: 0.02,
    }

    const mouse = { x: null, y: null, active: false }

    const boids = []
    for (let i = 0; i < BOID_COUNT; i++) {
      const boid = Boid.fromBlueprint(
        VISUAL_RANGE,
        PROTECTED_RANGE,
        blueprint,
        Math.random() * width,
        Math.random() * height,
        0,
        i
      )
      boid.vx = (Math.random() - 0.5) * blueprint.maxSpeed
      boid.vy = (Math.random() - 0.5) * blueprint.maxSpeed
      boids.push(boid)
    }

    function onMouseMove(e) {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    function onMouseLeave() {
      mouse.x = null
      mouse.y = null
      mouse.active = false
    }
    function onMouseDown() {
      mouse.active = true
    }
    function onMouseUp() {
      mouse.active = false
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    function onResize() {
      applySize()
      for (const boid of boids) {
        boid.rightMargin = width - MARGIN
        boid.bottomMargin = height - MARGIN
      }
    }
    window.addEventListener('resize', onResize)

    // Game mode state
    const goalRef = { current: null }
    const roundRunningRef = { current: false }
    const roundEndTimeRef = { current: 0 }
    const scoreRef = { current: 0 }
    const lastSecondRef = { current: 0 }

    function spawnGoal(now) {
      const x = MARGIN + Math.random() * Math.max(0, width - 2 * MARGIN)
      const y = NAVBAR_HEIGHT + Math.random() * Math.max(0, height - NAVBAR_HEIGHT - MARGIN)
      return { x, y, expiresAt: now + GOAL_LIFETIME_MS }
    }

    function respawnBoid(boid) {
      boid.x = Math.random() * width
      boid.y = Math.random() * height
      boid.vx = (Math.random() - 0.5) * blueprint.maxSpeed
      boid.vy = (Math.random() - 0.5) * blueprint.maxSpeed
    }

    function updateGame(now) {
      if (!gameActiveRef.current) {
        if (roundRunningRef.current) {
          // round was cancelled early (Escape key or clicking the play button again)
          roundRunningRef.current = false
          goalRef.current = null
          onGameEndRef.current && onGameEndRef.current(scoreRef.current)
        }
        return
      }

      if (!roundRunningRef.current) {
        roundRunningRef.current = true
        roundEndTimeRef.current = now + ROUND_DURATION_MS
        scoreRef.current = 0
        setScore(0)
        lastSecondRef.current = Math.ceil(ROUND_DURATION_MS / 1000)
        setTimeLeft(lastSecondRef.current)
        goalRef.current = spawnGoal(now)
      }

      if (!goalRef.current || now >= goalRef.current.expiresAt) {
        goalRef.current = spawnGoal(now)
      }

      const radius = goalRadiusAt(goalRef.current, now)
      const radiusSq = radius * radius
      for (const boid of boids) {
        const dx = boid.x - goalRef.current.x
        const dy = boid.y - goalRef.current.y
        if (dx * dx + dy * dy < radiusSq) {
          scoreRef.current += 1
          setScore(scoreRef.current)
          respawnBoid(boid)
        }
      }

      const remainingMs = roundEndTimeRef.current - now
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000))
      if (remainingSec !== lastSecondRef.current) {
        lastSecondRef.current = remainingSec
        setTimeLeft(remainingSec)
      }

      if (remainingMs <= 0) {
        roundRunningRef.current = false
        goalRef.current = null
        onGameEndRef.current && onGameEndRef.current(scoreRef.current)
      }
    }

    function draw(now) {
      ctx.clearRect(0, 0, width, height)
      const cx = width / 2
      const cy = height / 2
      const maxDist = Math.hypot(cx, cy)
      for (const boid of boids) {
        const distFromCenter = Math.hypot(boid.x - cx, boid.y - cy)
        const t = Math.min(distFromCenter / maxDist, 1)
        const alpha = CENTER_ALPHA + (EDGE_ALPHA - CENTER_ALPHA) * t

        const angle = Math.atan2(boid.vy, boid.vx)
        ctx.save()
        ctx.fillStyle = `rgba(${BOID_COLOR_RGB}, ${alpha.toFixed(3)})`
        ctx.translate(boid.x, boid.y)
        ctx.rotate(angle)
        ctx.beginPath()
        ctx.moveTo(7, 0)
        ctx.lineTo(-5, 3.5)
        ctx.lineTo(-5, -3.5)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }

      if (goalRef.current) {
        const radius = goalRadiusAt(goalRef.current, now)
        ctx.save()
        ctx.beginPath()
        ctx.arc(goalRef.current.x, goalRef.current.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = GOAL_FILL
        ctx.fill()
        ctx.lineWidth = 2
        ctx.strokeStyle = GOAL_STROKE
        ctx.stroke()
        ctx.restore()
      }
    }

    let raf = null
    function step(now) {
      updateGame(now)
      const grid = buildGrid(boids, VISUAL_RANGE)
      for (const boid of boids) {
        boid.update(grid, VISUAL_RANGE, mouse)
      }
      draw(now)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="boids-background" aria-hidden="true" />
      {gameActive && <BoidsGameHud score={score} timeLeft={timeLeft} />}
    </>
  )
}
