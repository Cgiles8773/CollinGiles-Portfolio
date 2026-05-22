import './GameModeButton.css'

export default function GameModeButton({ active, onToggle }) {
  return (
    <button
      className={`game-mode-btn${active ? ' game-mode-btn--active' : ''}`}
      onClick={onToggle}
      aria-pressed={active}
    >
      {active ? '[ Too wobbly ]' : '[ Get wobbly ]'}
    </button>
  )
}
