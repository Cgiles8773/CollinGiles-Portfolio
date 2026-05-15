import { useMemo } from 'react'

const NOTES = [
  'C6','B5','A5','G5','F5','E5','D5',
  'C5','B4','A4','G4','F4','E4','D4','C4',
]
const FREQS = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
  A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
  F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50,
}

const STEPS = 32
const LOG_MIN = Math.log(FREQS['C4'])
const LOG_MAX = Math.log(FREQS['C6'])

function displayCycles(freq) {
  const ratio = (Math.log(freq) - LOG_MIN) / (LOG_MAX - LOG_MIN)
  return 1 + ratio * 3
}

function sineWavePath(cycles, w, h) {
  const pts = 80
  const parts = []
  for (let i = 0; i < pts; i++) {
    const t = i / (pts - 1)
    const x = (t * w).toFixed(2)
    const y = (h / 2 - Math.sin(t * cycles * 2 * Math.PI) * (h / 2 - 2)).toFixed(2)
    parts.push(`${i === 0 ? 'M' : 'L'}${x},${y}`)
  }
  return parts.join(' ')
}

export default function NoteWaveforms({ grid }) {
  // Group active notes by column, preserving row order (high→low pitch)
  const groups = useMemo(() => {
    const map = new Map()
    for (let col = 0; col < STEPS; col++) {
      for (let row = 0; row < NOTES.length; row++) {
        if (grid[row][col]) {
          if (!map.has(col)) map.set(col, [])
          map.get(col).push({ note: NOTES[row], freq: FREQS[NOTES[row]], row })
        }
      }
    }
    return Array.from(map.entries()) // [[col, notes[]], ...] already sorted
  }, [grid])

  return (
    <div className="nw-panel">
      <div className="nw-header">Note Sequence</div>

      {groups.length === 0 ? (
        <p className="nw-empty">Place notes on the grid to see their waveforms here.</p>
      ) : (
        <div className="nw-scroll">
          {groups.map(([col, notes], idx) => {
            const prevCol    = idx > 0 ? groups[idx - 1][0] : null
            const newMeasure = prevCol !== null && Math.floor(col / 16) !== Math.floor(prevCol / 16)
            const newBeat    = !newMeasure && prevCol !== null && Math.floor(col / 4)  !== Math.floor(prevCol / 4)

            return (
              <div
                key={col}
                className={[
                  'nw-group',
                  newMeasure ? 'nw-measure-sep' : newBeat ? 'nw-beat-sep' : '',
                ].filter(Boolean).join(' ')}
              >
                {notes.map(n => (
                  <div key={n.row} className="nw-card">
                    <span className="nw-note-label">{n.note}</span>
                    <svg
                      className="nw-wave"
                      viewBox="0 0 48 36"
                      width="48"
                      height="36"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d={sineWavePath(displayCycles(n.freq), 48, 36)} />
                    </svg>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
