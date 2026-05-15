import { useState, useEffect, useRef, useCallback } from 'react'
import WaveformDisplay from './WaveformDisplay.jsx'
import BeatWaveforms from './BeatWaveforms.jsx'
import './musicbox.css'

// C major scale, two octaves, top-to-bottom (high → low)
const NOTES = [
  'C6','B5','A5','G5','F5','E5','D5',
  'C5','B4','A4','G4','F4','E4','D4','C4',
]

const FREQS = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
  A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
  F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50,
}

const ROWS = NOTES.length   // 15
const STEPS = 32            // 2 measures × 4 beats × 4 subdivisions (16th notes)

const makeGrid = () => Array.from({ length: ROWS }, () => new Array(STEPS).fill(false))

// Pre-loaded demo: gentle C-major arpeggio + melody
const DEMO = (() => {
  const g = makeGrid()
  const on = (note, col) => { g[NOTES.indexOf(note)][col] = true }
  // Measure 1
  on('C5', 0);  on('E5', 2);  on('G5', 4);  on('E5', 6)
  on('C5', 8);  on('G4', 10); on('E5', 12); on('G5', 14)
  // Measure 2
  on('C5', 16); on('E5', 18); on('G5', 20); on('E5', 22)
  on('D5', 24); on('B4', 26); on('C5', 28); on('E5', 30)
  // Bass
  on('C4', 0); on('G4', 8); on('C4', 16); on('G4', 24)
  return g
})()

function playNote(ctx, masterGain, freq, time) {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.001, time)
  gain.gain.exponentialRampToValueAtTime(0.28, time + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.9)
  osc.connect(gain)
  gain.connect(masterGain)
  osc.start(time)
  osc.stop(time + 0.95)
}

export default function MusicBox() {
  const [grid, setGrid]             = useState(DEMO)
  const [isPlaying, setIsPlaying]   = useState(false)
  const [bpm, setBpm]               = useState(120)
  const [currentStep, setCurrentStep] = useState(-1)

  // Refs so RAF/interval callbacks always see latest values without stale closures
  const gridRef        = useRef(grid)
  const bpmRef         = useRef(bpm)
  const audioCtxRef    = useRef(null)
  const masterGainRef  = useRef(null)
  const analyserRef    = useRef(null)
  const rafIdRef       = useRef(null)
  const schedulerRef   = useRef(null)
  const playStartRef   = useRef(0)
  const nextSchedRef   = useRef(0)

  const isPlayingRef = useRef(isPlaying)

  useEffect(() => { gridRef.current = grid },         [grid])
  useEffect(() => { bpmRef.current = bpm },           [bpm])
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])

  // ── Scheduling ─────────────────────────────────────────────────────────────

  const scheduleLoop = useCallback((loopStart) => {
    const ctx    = audioCtxRef.current
    const master = masterGainRef.current
    if (!ctx || !master) return
    const stepDur = 60 / bpmRef.current / 4
    const g = gridRef.current
    for (let col = 0; col < STEPS; col++) {
      const t = loopStart + col * stepDur
      for (let row = 0; row < ROWS; row++) {
        if (g[row][col]) playNote(ctx, master, FREQS[NOTES[row]], t)
      }
    }
  }, [])

  const teardown = useCallback(() => {
    clearInterval(schedulerRef.current)
    cancelAnimationFrame(rafIdRef.current)
    schedulerRef.current = null
    rafIdRef.current     = null
    // Closing the context immediately kills all scheduled oscillators.
    audioCtxRef.current?.close()
    audioCtxRef.current   = null
    masterGainRef.current = null
    analyserRef.current   = null
  }, [])

  const startPlayback = useCallback(() => {
    // Always start clean — kills any in-flight oscillators from a prior session.
    teardown()

    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    const master = ctx.createGain()
    master.gain.value = 0.8
    const comp = ctx.createDynamicsCompressor()
    master.connect(comp)
    comp.connect(ctx.destination)
    masterGainRef.current = master

    const analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.85
    comp.connect(analyser)        // capture-only tap — analyser output unconnected
    analyserRef.current = analyser

    const loopDur = () => STEPS * 60 / bpmRef.current / 4
    const start   = ctx.currentTime + 0.05
    playStartRef.current = start
    nextSchedRef.current = start + loopDur()

    scheduleLoop(start)
    scheduleLoop(nextSchedRef.current)
    nextSchedRef.current += loopDur()

    schedulerRef.current = setInterval(() => {
      const now = audioCtxRef.current?.currentTime ?? 0
      const ld  = loopDur()
      while (nextSchedRef.current < now + ld + 0.1) {
        scheduleLoop(nextSchedRef.current)
        nextSchedRef.current += ld
      }
    }, 100)

    const tick = () => {
      const now     = audioCtxRef.current?.currentTime ?? 0
      const elapsed = now - playStartRef.current
      const sd      = 60 / bpmRef.current / 4
      const ld      = STEPS * sd
      const pos     = ((elapsed % ld) + ld) % ld
      setCurrentStep(Math.floor(pos / sd) % STEPS)
      rafIdRef.current = requestAnimationFrame(tick)
    }
    rafIdRef.current = requestAnimationFrame(tick)
    setIsPlaying(true)
  }, [scheduleLoop, teardown])

  const stopPlayback = useCallback(() => {
    teardown()
    setIsPlaying(false)
    setCurrentStep(-1)
  }, [teardown])

  // Cleanup on unmount
  useEffect(() => () => { teardown() }, [teardown])

  // ── Grid interaction ────────────────────────────────────────────────────────

  const isDraggingRef    = useRef(false)
  const dragValueRef     = useRef(true)
  const lastCellRef      = useRef(null)
  const beatWaveformsRef = useRef(null)

  useEffect(() => {
    const end = () => { isDraggingRef.current = false }
    window.addEventListener('pointerup', end)
    return () => window.removeEventListener('pointerup', end)
  }, [])

  const handleCellDown = useCallback((row, col) => {
    if (isPlayingRef.current) stopPlayback()
    isDraggingRef.current = true
    lastCellRef.current   = `${row},${col}`
    const wasOn           = gridRef.current[row][col]
    dragValueRef.current  = !wasOn
    setGrid(prev => prev.map((r, ri) =>
      ri === row ? r.map((v, ci) => ci === col ? !wasOn : v) : r,
    ))
    beatWaveformsRef.current?.scrollTo(col)
  }, [stopPlayback])

  const handleCellEnter = useCallback((row, col) => {
    if (!isDraggingRef.current) return
    const key = `${row},${col}`
    if (lastCellRef.current === key) return
    lastCellRef.current  = key
    const val            = dragValueRef.current
    setGrid(prev => prev.map((r, ri) =>
      ri === row ? r.map((v, ci) => ci === col ? val : v) : r,
    ))
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="musicbox-page">
      <div className="mb-toolbar">
        <button
          className={`mb-btn ${isPlaying ? 'mb-btn-stop' : 'mb-btn-play'}`}
          onClick={isPlaying ? stopPlayback : startPlayback}
        >
          {isPlaying ? '■ Stop' : '▶ Play'}
        </button>

        <div className="bpm-control">
          <span className="bpm-label">BPM</span>
          <input
            type="range" min={40} max={240} value={bpm}
            className="bpm-slider"
            onChange={e => setBpm(Number(e.target.value))}
          />
          <span className="bpm-value">{bpm}</span>
        </div>

        <button
          className="mb-btn mb-btn-clear"
          onClick={() => setGrid(makeGrid())}
        >
          Clear
        </button>

        <span className="mb-time-sig">4/4 · 2 measures · 16th-note grid</span>
      </div>

      <div className="mb-scroll">
        <div className="mb-grid">

          {/* Beat/measure header */}
          <div className="mb-header-row">
            <div className="mb-corner" />
            {Array.from({ length: STEPS }, (_, col) => {
              const isMeasure = col === 0 || col === 16
              const isBeat    = col % 4 === 0 && !isMeasure
              const label     = isMeasure
                ? (col === 0 ? 'M1' : 'M2')
                : isBeat
                  ? String(Math.floor((col % 16) / 4) + 1)
                  : ''
              return (
                <div
                  key={col}
                  className={[
                    'mb-header-cell',
                    isMeasure ? 'hdr-measure' : '',
                    isBeat    ? 'hdr-beat'    : '',
                  ].filter(Boolean).join(' ')}
                >
                  {label}
                </div>
              )
            })}
          </div>

          {/* Note rows */}
          {NOTES.map((note, row) => {
            const isC = note.startsWith('C')
            return (
              <div key={note} className={`mb-row ${isC ? 'mb-row-c' : ''}`}>
                <div className={`mb-note-label ${isC ? 'mb-note-label-c' : ''}`}>
                  {note}
                </div>

                {Array.from({ length: STEPS }, (_, col) => {
                  const active  = grid[row][col]
                  const playing = col === currentStep
                  return (
                    <div
                      key={col}
                      className={[
                        'mb-cell',
                        `mb-beat-${col % 8}`,
                        active  ? 'mb-active'      : '',
                        playing ? 'mb-playing'     : '',
                        col % 2 === 1              ? 'mb-offbeat'    : '',
                        col === 0 || col === 16    ? 'mb-measure-sep': '',
                        col % 4 === 0 && col !== 0 && col !== 16
                                                   ? 'mb-beat-sep'  : '',
                      ].filter(Boolean).join(' ')}
                      onPointerDown={() => handleCellDown(row, col)}
                      onPointerEnter={() => handleCellEnter(row, col)}
                    />
                  )
                })}
              </div>
            )
          })}

        </div>
      </div>

      <div className="mb-wave-panel">
        <WaveformDisplay analyserRef={analyserRef} />
      </div>

      <BeatWaveforms ref={beatWaveformsRef} grid={grid} />
    </div>
  )
}
