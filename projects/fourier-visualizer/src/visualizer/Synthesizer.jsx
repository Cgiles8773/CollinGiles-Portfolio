import { useState, useMemo } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import FFT from 'fft.js'
import './chartSetup.js'

const FFT_SIZE = 2048
const SAMPLE_RATE = 44100
const DISPLAY_SAMPLES = 512
const SPECTRUM_MAX_HZ = 5000
const FREQ_RES = SAMPLE_RATE / FFT_SIZE
const SPECTRUM_BINS = Math.floor(SPECTRUM_MAX_HZ / FREQ_RES)

const WAVE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { display: false },
    y: {
      min: -3,
      max: 3,
      grid: { color: '#332e27' },
      ticks: { maxTicksLimit: 5 },
    },
  },
}

const SPEC_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { color: '#332e27' },
      ticks: { maxTicksLimit: 10 },
    },
    y: {
      min: 0,
      grid: { color: '#332e27' },
      ticks: { maxTicksLimit: 5 },
    },
  },
}

const WAVE_LABELS = Array.from({ length: DISPLAY_SAMPLES }, (_, i) => i)
const SPEC_LABELS = Array.from({ length: SPECTRUM_BINS }, (_, i) =>
  Math.round(i * FREQ_RES),
)

const fftInstance = new FFT(FFT_SIZE)

// Fixed time window: 3 cycles of 440 Hz = ~6.8 ms.
// Higher frequencies show more cycles; lower frequencies show fewer.
const PREVIEW_DURATION = 3 / 440

function sinePreviewPath(frequency, amplitude, phase, w, h) {
  const cycles = frequency * PREVIEW_DURATION
  const amp    = Math.min(amplitude / 2, 1)  // normalise: amp=2 fills full height, larger waves clip gently
  const pts    = 120
  const parts  = []
  for (let i = 0; i < pts; i++) {
    const t = i / (pts - 1)
    const s = amp * Math.sin(t * cycles * 2 * Math.PI + phase)
    const x = (t * w).toFixed(2)
    const y = (h / 2 - s * (h / 2 - 3)).toFixed(2)
    parts.push(`${i === 0 ? 'M' : 'L'}${x},${y}`)
  }
  return parts.join(' ')
}

export default function Synthesizer() {
  const [waves, setWaves] = useState([
    { id: 1, frequency: 440, amplitude: 1, phase: 0 },
  ])
  const [freqInput, setFreqInput] = useState(880)
  const [ampInput, setAmpInput] = useState(0.5)
  const [phaseInput, setPhaseInput] = useState(0)

  const signal = useMemo(() => {
    const buf = new Array(FFT_SIZE).fill(0)
    for (const w of waves) {
      for (let n = 0; n < FFT_SIZE; n++) {
        buf[n] += w.amplitude * Math.sin(2 * Math.PI * w.frequency * (n / SAMPLE_RATE) + w.phase)
      }
    }
    return buf
  }, [waves])

  const spectrum = useMemo(() => {
    const out = fftInstance.createComplexArray()
    fftInstance.realTransform(out, signal)
    const mags = new Array(SPECTRUM_BINS)
    for (let i = 0; i < SPECTRUM_BINS; i++) {
      const re = out[2 * i]
      const im = out[2 * i + 1]
      mags[i] = (Math.sqrt(re * re + im * im) / FFT_SIZE) * 2
    }
    return mags
  }, [signal])

  const waveformData = useMemo(() => ({
    labels: WAVE_LABELS,
    datasets: [{
      data: signal.slice(0, DISPLAY_SAMPLES),
      borderColor: 'rgb(81, 170, 219)',
      backgroundColor: 'rgba(81, 170, 219, 0.06)',
      borderWidth: 1.5,
      pointRadius: 0,
      fill: true,
      tension: 0,
    }],
  }), [signal])

  const spectrumData = useMemo(() => ({
    labels: SPEC_LABELS,
    datasets: [{
      data: spectrum,
      backgroundColor: 'rgba(219, 138, 35, 0.85)',
      borderColor: 'rgb(219, 138, 35)',
      borderWidth: 0,
      borderRadius: 2,
    }],
  }), [spectrum])

  function addWave() {
    const f = Number(freqInput)
    const a = Number(ampInput)
    const p = Number(phaseInput)
    if (f <= 0 || a <= 0) return
    setWaves(prev => [...prev, { id: Date.now(), frequency: f, amplitude: a, phase: p }])
  }

  function removeWave(id) {
    setWaves(prev => prev.filter(w => w.id !== id))
  }

  return (
    <div className="synth-tab">
      <div className="charts-grid">
        <div className="chart-box">
          <h3>Composite Waveform</h3>
          <div className="chart-container">
            <Line data={waveformData} options={WAVE_OPTIONS} />
          </div>
        </div>
        <div className="chart-box">
          <h3>Frequency Spectrum (0 – 5 kHz)</h3>
          <div className="chart-container">
            <Bar data={spectrumData} options={SPEC_OPTIONS} />
          </div>
        </div>
      </div>

      <div className="synth-controls">
        <div className="control-panel">
          <h3>Add Sine Wave</h3>
          <div className="wave-form">
            <label className="field">
              Frequency (Hz)
              <input
                type="number"
                value={freqInput}
                min={1}
                max={20000}
                onChange={e => setFreqInput(e.target.value)}
              />
            </label>
            <label className="field">
              Amplitude
              <input
                type="number"
                value={ampInput}
                min={0.01}
                max={10}
                step={0.1}
                onChange={e => setAmpInput(e.target.value)}
              />
            </label>
            <label className="field">
              Phase (radians)
              <input
                type="number"
                value={phaseInput}
                step={0.1}
                onChange={e => setPhaseInput(e.target.value)}
              />
            </label>
            <button className="btn-primary" onClick={addWave}>Add Wave</button>
          </div>
        </div>

        <div className="control-panel">
          <h3>Active Waves</h3>
          <div className="wave-list">
            {waves.length === 0 && (
              <p className="wave-empty">No waves. Add one above.</p>
            )}
            {waves.map(w => (
              <div key={w.id} className="wave-item">
                <svg
                  className="wave-item-preview"
                  viewBox="0 0 80 36"
                  width="80"
                  height="36"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d={sinePreviewPath(w.frequency, w.amplitude, w.phase, 80, 36)} />
                </svg>
                <span>{w.frequency} Hz · A={w.amplitude} · φ={w.phase}</span>
                <button className="btn-remove" onClick={() => removeWave(w.id)} title="Remove">×</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
