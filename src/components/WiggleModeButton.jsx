import './WiggleModeButton.css'

export default function WiggleModeButton({ active, onToggle }) {
  return (
    <button
      className={`wiggle-mode-btn${active ? ' wiggle-mode-btn--active' : ''}`}
      onClick={onToggle}
      aria-pressed={active}
    >
      {active ? '[ Too wiggly ]' : '[ Get wiggly ]'}
    </button>
  )
}
