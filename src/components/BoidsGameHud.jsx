import './BoidsGameHud.css'

export default function BoidsGameHud({ score, timeLeft }) {
  return (
    <div className="boids-game-hud" role="status">
      <span>{timeLeft}s</span>
      <span className="boids-game-hud-score">Score: {score}</span>
    </div>
  )
}
