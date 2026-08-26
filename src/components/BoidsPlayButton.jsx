import './BoidsPlayButton.css'

export default function BoidsPlayButton({ active, onClick }) {
  return (
    <button
      className={`boids-play-btn${active ? ' boids-play-btn--active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? 'Stop boid herding game' : 'Start boid herding game'}
    >
      {active ? '✕' : '▶'}
    </button>
  )
}
