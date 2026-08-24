import './ModeHint.css'

export default function ModeHint({ active, children }) {
  if (!active) return null

  return (
    <div className="mode-hint" role="status">
      {children}
    </div>
  )
}
