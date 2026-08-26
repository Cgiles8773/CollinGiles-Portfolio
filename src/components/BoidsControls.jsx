import BoidsHighScore from './BoidsHighScore'
import BoidsPlayButton from './BoidsPlayButton'
import BoidsHint from './BoidsHint'
import './BoidsControls.css'

export default function BoidsControls({ highScore, gameActive, onPlayClick }) {
  return (
    <div className="boids-controls">
      <BoidsHighScore value={highScore} />
      <BoidsPlayButton active={gameActive} onClick={onPlayClick} />
      <BoidsHint />
    </div>
  )
}
