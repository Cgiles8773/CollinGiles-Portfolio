import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

const SAMPLE_RATE = 44100
const N          = 8192   // samples used for integral accuracy
const DISP_WAVE  = 512    // samples shown in composite/probe panels
const DISP_PROD  = 1024   // samples shown in product panel
const DRAW_WAVE  = 150    // SVG points per wave panel
const DRAW_PROD  = 200    // SVG points in product panel

const SIG_FREQS = [262, 330, 392]   // C4, E4, G4
const F_MIN     = 80
const F_MAX     = 480
const STEPS     = 200

const PROBE_FREQS = Array.from({ length: STEPS }, (_, i) =>
  F_MIN + (F_MAX - F_MIN) * (i / (STEPS - 1))
)

// Composite signal (normalized peak = 1)
const SIGNAL = (() => {
  const s = new Float32Array(N)
  for (const f of SIG_FREQS)
    for (let i = 0; i < N; i++) s[i] += Math.sin(2 * Math.PI * f * i / SAMPLE_RATE)
  let peak = 0
  for (let i = 0; i < N; i++) if (Math.abs(s[i]) > peak) peak = Math.abs(s[i])
  if (peak > 0) for (let i = 0; i < N; i++) s[i] /= peak
  return s
})()

// Precompute spectrum max for y-axis normalisation
const SPEC_MAX = (() => {
  let max = 0
  for (const freq of PROBE_FREQS) {
    let sum = 0
    for (let i = 0; i < N; i++) sum += SIGNAL[i] * Math.sin(2 * Math.PI * freq * i / SAMPLE_RATE)
    const v = Math.abs(sum / N)
    if (v > max) max = v
  }
  return max || 1
})()

// SVG dimensions
const WW = 350   // wave panel width
const HW = 80
const WP = 718   // product panel width
const HP = 88
const WS = 718   // spectrum panel width
const HS = 130   // spectrum panel height (bottom 18px = tick labels)
const SPEC_BL = HS - 18  // baseline y within spectrum SVG

function toPath(data, w, h, displayLen, drawPts) {
  const parts = []
  for (let i = 0; i < drawPts; i++) {
    const di = Math.round((i / (drawPts - 1)) * (displayLen - 1))
    const v  = data[di] ?? 0
    const x  = (i / (drawPts - 1)) * w
    const y  = h / 2 - v * (h / 2 - 4)
    parts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return parts.join(' ')
}

function closedArea(wavePath, w, h) {
  const mid = (h / 2).toFixed(1)
  return `${wavePath} L${w},${mid} L0,${mid} Z`
}

function buildSpecPaths(spectrum, upTo, w) {
  const pts = []
  for (let i = 0; i <= upTo; i++) {
    if (spectrum[i] == null) continue
    const x = ((PROBE_FREQS[i] - F_MIN) / (F_MAX - F_MIN)) * w
    const y = SPEC_BL - (spectrum[i] / SPEC_MAX) * (SPEC_BL - 4)
    pts.push([x, y])
  }
  if (pts.length === 0) return { line: '', area: '' }
  const segs = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
  return {
    line: segs.join(' '),
    area: `M${pts[0][0].toFixed(1)},${SPEC_BL} ${segs.join(' ')} L${pts[pts.length - 1][0].toFixed(1)},${SPEC_BL} Z`,
  }
}

const SIGNAL_PATH = toPath(SIGNAL, WW, HW, DISP_WAVE, DRAW_WAVE)

const FREQ_TICKS = [100, 150, 200, 250, 300, 350, 400, 450]

export default function FourierSweep() {
  const [freqIdx, setFreqIdx]     = useState(0)
  const [spectrum, setSpectrum]   = useState(() => new Array(STEPS).fill(null))
  const [isPlaying, setIsPlaying] = useState(false)
  const [sliderVal, setSliderVal] = useState(100)   // 15–150; inverted: right = fast

  const speed = 165 - sliderVal   // ms per step: slider right → small delay → fast

  const rafRef  = useRef(null)
  const lastRef = useRef(0)

  const probeFreq = PROBE_FREQS[freqIdx]

  const { probePath, productPath, productFill, integralVal } = useMemo(() => {
    const pw   = new Float32Array(DISP_WAVE)
    const prod = new Float32Array(DISP_PROD)
    for (let i = 0; i < DISP_WAVE; i++)
      pw[i] = Math.sin(2 * Math.PI * probeFreq * i / SAMPLE_RATE)
    for (let i = 0; i < DISP_PROD; i++)
      prod[i] = SIGNAL[i] * Math.sin(2 * Math.PI * probeFreq * i / SAMPLE_RATE)
    let sum = 0
    for (let i = 0; i < N; i++)
      sum += SIGNAL[i] * Math.sin(2 * Math.PI * probeFreq * i / SAMPLE_RATE)
    const iv  = sum / N
    const pp  = toPath(pw,   WW, HW, DISP_WAVE, DRAW_WAVE)
    const prp = toPath(prod, WP, HP, DISP_PROD, DRAW_PROD)
    return { probePath: pp, productPath: prp, productFill: closedArea(prp, WP, HP), integralVal: iv }
  }, [probeFreq])

  // Accumulate spectrum
  useEffect(() => {
    setSpectrum(prev => {
      const next = [...prev]
      next[freqIdx] = Math.abs(integralVal)
      return next
    })
  }, [freqIdx, integralVal])

  // Animation loop
  useEffect(() => {
    if (!isPlaying) { cancelAnimationFrame(rafRef.current); return }
    const tick = (now) => {
      if (now - lastRef.current >= speed) {
        lastRef.current = now
        setFreqIdx(idx => {
          if (idx >= STEPS - 1) { setIsPlaying(false); return idx }
          return idx + 1
        })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, speed])

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setIsPlaying(false)
    setFreqIdx(0)
    setSpectrum(new Array(STEPS).fill(null))
  }, [])

  const handlePlay = useCallback(() => {
    if (!isPlaying && freqIdx >= STEPS - 1) {
      setSpectrum(new Array(STEPS).fill(null))
      setFreqIdx(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(p => !p)
    }
  }, [isPlaying, freqIdx])

  const { line: specLine, area: specArea } = useMemo(
    () => buildSpecPaths(spectrum, freqIdx, WS),
    [spectrum, freqIdx]
  )

  const cursorX  = ((probeFreq - F_MIN) / (F_MAX - F_MIN)) * WS
  const resonance = Math.abs(integralVal) > SPEC_MAX * 0.25
  const pct = Math.round(Math.abs(integralVal) / SPEC_MAX * 100)

  return (
    <div className="fs-panel">
      <h2>Watch the Fourier transform happen</h2>
      <p className="fs-subtitle">
        A probe sine wave sweeps from {F_MIN} to {F_MAX} Hz. At each frequency the composite signal is multiplied by the probe and integrated. When the probe matches a frequency in the signal, the product stays positive and the integral grows — revealing a peak in the spectrum.
      </p>

      <div className="fs-controls">
        <button className={`fs-btn ${isPlaying ? 'fs-btn-pause' : 'fs-btn-play'}`} onClick={handlePlay}>
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button className="fs-btn fs-btn-reset" onClick={reset}>↺ Reset</button>
        <div className="fs-speed-ctrl">
          <span className="fs-speed-label">Slow</span>
          <input type="range" min={15} max={150} step={5} value={sliderVal}
            className="fs-speed-slider"
            onChange={e => setSliderVal(Number(e.target.value))} />
          <span className="fs-speed-label">Fast</span>
        </div>
        <span className="fs-info">
          <span className="fs-info-key">Probe </span>{Math.round(probeFreq)} Hz
          &ensp;
          <span className="fs-info-key">Integral </span>
          <span className={resonance ? 'fs-resonance' : 'fs-silence'}>{pct}%</span>
          {resonance && <span className="fs-match"> ← match</span>}
        </span>
      </div>

      {/* Composite + Probe side by side */}
      <div className="fs-row">
        <figure className="fs-figure">
          <svg viewBox={`0 0 ${WW} ${HW}`} width={WW} height={HW} className="fs-svg" xmlns="http://www.w3.org/2000/svg">
            <line x1={0} y1={HW/2} x2={WW} y2={HW/2} stroke="#332e27" strokeWidth="1" />
            <path d={SIGNAL_PATH} fill="none" stroke="#51aadb" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          <figcaption className="fs-label">Composite signal — C4 + E4 + G4</figcaption>
        </figure>

        <figure className="fs-figure">
          <svg viewBox={`0 0 ${WW} ${HW}`} width={WW} height={HW} className="fs-svg" xmlns="http://www.w3.org/2000/svg">
            <line x1={0} y1={HW/2} x2={WW} y2={HW/2} stroke="#332e27" strokeWidth="1" />
            <path d={probePath} fill="none" stroke="#db8a23" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          <figcaption className="fs-label">Probe: sin({Math.round(probeFreq)} Hz)</figcaption>
        </figure>
      </div>

      {/* Product */}
      <figure className="fs-figure fs-wide">
        <svg viewBox={`0 0 ${WP} ${HP}`} width={WP} height={HP} className="fs-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="fsp"><rect x={0} y={0} width={WP} height={HP/2} /></clipPath>
            <clipPath id="fsn"><rect x={0} y={HP/2} width={WP} height={HP/2} /></clipPath>
          </defs>
          <line x1={0} y1={HP/2} x2={WP} y2={HP/2} stroke="#332e27" strokeWidth="1" />
          <path d={productFill} fill="rgba(81,170,219,0.22)"  clipPath="url(#fsp)" />
          <path d={productFill} fill="rgba(219,138,35,0.22)"  clipPath="url(#fsn)" />
          <path d={productPath} fill="none" stroke="#e8d8be" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <figcaption className="fs-label">
          Product — {resonance
            ? 'areas mostly positive: this frequency is present in the signal'
            : 'positive and negative areas cancel: frequency not present'}
        </figcaption>
      </figure>

      {/* Spectrum */}
      <figure className="fs-figure fs-wide">
        <svg viewBox={`0 0 ${WS} ${HS}`} width={WS} height={HS} className="fs-svg" xmlns="http://www.w3.org/2000/svg">
          {/* Signal frequency guide lines */}
          {SIG_FREQS.map((f, i) => {
            const x = ((f - F_MIN) / (F_MAX - F_MIN)) * WS
            return (
              <g key={f}>
                <line x1={x} y1={0} x2={x} y2={SPEC_BL} stroke="rgba(81,170,219,0.18)" strokeWidth="1" strokeDasharray="3 3" />
                <text x={x} y={SPEC_BL - 4} textAnchor="middle" fontSize="9" fill="rgba(81,170,219,0.6)">
                  {['C4','E4','G4'][i]}
                </text>
              </g>
            )
          })}
          {/* Baseline */}
          <line x1={0} y1={SPEC_BL} x2={WS} y2={SPEC_BL} stroke="#332e27" strokeWidth="1" />
          {/* Spectrum */}
          {specArea && <path d={specArea} fill="rgba(81,170,219,0.15)" />}
          {specLine && <path d={specLine} fill="none" stroke="#51aadb" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />}
          {/* Probe cursor */}
          <line x1={cursorX} y1={0} x2={cursorX} y2={SPEC_BL} stroke="#db8a23" strokeWidth="1.5" />
          {/* Frequency ticks */}
          {FREQ_TICKS.map(f => {
            const x = ((f - F_MIN) / (F_MAX - F_MIN)) * WS
            return (
              <g key={f}>
                <line x1={x} y1={SPEC_BL} x2={x} y2={SPEC_BL + 4} stroke="#50585c" strokeWidth="1" />
                <text x={x} y={HS - 3} textAnchor="middle" fontSize="8" fill="#50585c">{f}</text>
              </g>
            )
          })}
        </svg>
        <figcaption className="fs-label">Integral magnitude vs frequency — peaks emerge at C4, E4, G4</figcaption>
      </figure>
    </div>
  )
}
