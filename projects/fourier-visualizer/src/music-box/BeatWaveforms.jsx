import { useMemo, useRef, forwardRef, useImperativeHandle } from 'react'

const NOTES = [
  'C6','B5','A5','G5','F5','E5','D5',
  'C5','B4','A4','G4','F4','E4','D4','C4',
]
const FREQS = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
  A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
  F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50,
}

const STEPS       = 32
const SAMPLE_RATE = 44100
const N_SAMPLES   = 1024
const N_DRAW      = 200
const SVG_W       = 120
const SVG_H       = 56

const NW_W = 80
const NW_H = 36

function noteWavePath(freq, w, h) {
  // Same time window as the composite: N_SAMPLES / SAMPLE_RATE seconds
  // so this wave shows exactly as many cycles as it contributes to the composite.
  const cycles = freq * N_SAMPLES / SAMPLE_RATE
  const pts = N_DRAW
  const parts = []
  for (let i = 0; i < pts; i++) {
    const t = i / (pts - 1)
    const x = (t * w).toFixed(2)
    const y = (h / 2 - Math.sin(t * cycles * 2 * Math.PI) * (h / 2 - 2)).toFixed(2)
    parts.push(`${i === 0 ? 'M' : 'L'}${x},${y}`)
  }
  return parts.join(' ')
}

function computeSignal(freqs) {
  const signal = new Float32Array(N_SAMPLES)
  for (const freq of freqs) {
    for (let i = 0; i < N_SAMPLES; i++) {
      signal[i] += Math.sin(2 * Math.PI * freq * (i / SAMPLE_RATE))
    }
  }
  let peak = 0
  for (let i = 0; i < N_SAMPLES; i++) if (Math.abs(signal[i]) > peak) peak = Math.abs(signal[i])
  if (peak > 0) for (let i = 0; i < N_SAMPLES; i++) signal[i] /= peak
  return signal
}

function toSVGPath(signal) {
  const stride = Math.max(1, Math.floor(N_SAMPLES / N_DRAW))
  const pts = []
  for (let i = 0; i < N_DRAW; i++) {
    const s = signal[Math.min(i * stride, N_SAMPLES - 1)]
    const x = (i / (N_DRAW - 1) * SVG_W).toFixed(2)
    const y = (SVG_H / 2 - s * (SVG_H / 2 - 2)).toFixed(2)
    pts.push(`${i === 0 ? 'M' : 'L'}${x},${y}`)
  }
  return pts.join(' ')
}

const EMPTY_PATH = toSVGPath(new Float32Array(N_SAMPLES))

const BeatWaveforms = forwardRef(function BeatWaveforms({ grid }, ref) {
  const rowRef  = useRef(null)
  const colRefs = useRef([])

  useImperativeHandle(ref, () => ({
    scrollTo(col) {
      const container = rowRef.current
      const card      = colRefs.current[col]
      if (!container || !card) return
      const { scrollLeft, clientWidth } = container
      const cardLeft  = card.offsetLeft
      const cardRight = cardLeft + card.offsetWidth
      if (cardLeft < scrollLeft) {
        container.scrollTo({ left: cardLeft - 16, behavior: 'smooth' })
      } else if (cardRight > scrollLeft + clientWidth) {
        container.scrollTo({ left: cardRight - clientWidth + 16, behavior: 'smooth' })
      }
    }
  }), [])

  const steps = useMemo(() => (
    Array.from({ length: STEPS }, (_, col) => {
      const freqs = []
      const notes = []
      for (let row = 0; row < NOTES.length; row++) {
        if (grid[row][col]) {
          const note = NOTES[row]
          const freq = FREQS[note]
          freqs.push(freq)
          notes.push({ note, freq, wavePath: noteWavePath(freq, NW_W, NW_H) })
        }
      }
      const isMeasure = col === 0 || col === 16
      const isBeat    = col % 4 === 0 && !isMeasure
      const label     = isMeasure
        ? (col === 0 ? 'M1' : 'M2')
        : isBeat
          ? String(Math.floor((col % 16) / 4) + 1)
          : ''
      return {
        col,
        path:      freqs.length > 0 ? toSVGPath(computeSignal(freqs)) : EMPTY_PATH,
        isEmpty:   freqs.length === 0,
        isMeasure,
        isBeat,
        label,
        notes,
        beatGroup: col % 8,
      }
    })
  ), [grid])

  return (
    <div className="bw-panel">
      <div className="bw-header">Step Waveforms</div>
      <div className="bw-row" ref={rowRef}>
        {steps.map(({ col, path, isEmpty, isMeasure, isBeat, label, notes, beatGroup }) => (
          <div
            key={col}
            ref={el => { colRefs.current[col] = el }}
            className={[
              'bw-col',
              `bw-beat-${beatGroup}`,
              isMeasure ? 'bw-col-measure' : '',
              isBeat    ? 'bw-col-beat'    : '',
            ].filter(Boolean).join(' ')}
          >
            {/* Composite step waveform */}
            <div className={['bw-card', isEmpty ? 'bw-empty' : ''].filter(Boolean).join(' ')}>
              <div className="bw-label">{label}</div>
              <svg
                className="bw-wave"
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d={path} vectorEffect="non-scaling-stroke" />
              </svg>
            </div>

            {/* Individual note waveforms */}
            {notes.map(n => (
              <div key={n.note} className="bw-note-card">
                <span className="bw-note-name">{n.note}</span>
                <svg
                  className="bw-note-wave"
                  viewBox={`0 0 ${NW_W} ${NW_H}`}
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d={n.wavePath} vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
})

export default BeatWaveforms
