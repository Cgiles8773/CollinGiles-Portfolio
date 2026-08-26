import { useEffect, useState } from 'react'
import './BoidsHint.css'

const INTRO_DURATION_MS = 4000

export default function BoidsHint() {
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), INTRO_DURATION_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`boids-hint${showIntro ? ' boids-hint--intro' : ''}`}
      tabIndex={0}
      role="button"
      aria-label="Boid interaction hints"
    >
      ?
      <div className="boids-hint-tooltip">
        <strong>Move mouse</strong> — nearby boids fly away
        <br />
        <strong>Click &amp; hold</strong> — nearby boids flock
      </div>
    </div>
  )
}
