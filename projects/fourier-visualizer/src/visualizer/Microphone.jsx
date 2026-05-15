import { useState, useEffect, useRef, useCallback } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import FFT from 'fft.js'
import './chartSetup.js'

const FFT_SIZE = 2048
const DISPLAY_SAMPLES = 512
const SPECTRUM_MAX_HZ = 8000

const WAVE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { display: false },
    y: {
      min: -1,
      max: 1,
      grid: { color: '#21262d' },
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
      grid: { color: '#21262d' },
      ticks: { maxTicksLimit: 8 },
    },
    y: {
      min: 0,
      grid: { color: '#21262d' },
      ticks: { maxTicksLimit: 5 },
    },
  },
}

const INIT_WAVE_DATA = {
  labels: Array.from({ length: DISPLAY_SAMPLES }, (_, i) => i),
  datasets: [{
    data: new Array(DISPLAY_SAMPLES).fill(0),
    borderColor: 'rgb(0, 200, 255)',
    backgroundColor: 'rgba(0, 200, 255, 0.06)',
    borderWidth: 1.5,
    pointRadius: 0,
    fill: true,
    tension: 0,
  }],
}

const INIT_SPEC_DATA = {
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: 'rgba(255, 100, 0, 0.85)',
    borderColor: 'rgb(255, 100, 0)',
    borderWidth: 0,
    borderRadius: 2,
  }],
}

export default function Microphone() {
  const [isRunning, setIsRunning] = useState(false)
  const [sampleRate, setSampleRate] = useState(null)
  const [error, setError] = useState(null)

  const waveChartRef = useRef(null)
  const specChartRef = useRef(null)
  const audioCtxRef  = useRef(null)
  const analyserRef  = useRef(null)
  const streamRef    = useRef(null)
  const rafIdRef     = useRef(null)

  // Preallocated buffers — never reallocated inside the RAF loop
  const fftRef    = useRef(new FFT(FFT_SIZE))
  const fftOutRef = useRef(fftRef.current.createComplexArray())
  const timeBufRef = useRef(new Float32Array(FFT_SIZE))
  const magBufRef  = useRef(null) // allocated once sampleRate is known

  const animate = useCallback(() => {
    const analyser  = analyserRef.current
    const waveChart = waveChartRef.current
    const specChart = specChartRef.current
    if (!analyser || !waveChart || !specChart) return

    const timeBuf = timeBufRef.current
    const fftOut  = fftOutRef.current
    const fft     = fftRef.current

    analyser.getFloatTimeDomainData(timeBuf)
    fft.realTransform(fftOut, timeBuf)

    const magBuf = magBufRef.current
    if (magBuf) {
      for (let i = 0; i < magBuf.length; i++) {
        const re = fftOut[2 * i]
        const im = fftOut[2 * i + 1]
        magBuf[i] = (Math.sqrt(re * re + im * im) / FFT_SIZE) * 2
      }
    }

    const waveDs = waveChart.data.datasets[0].data
    for (let i = 0; i < DISPLAY_SAMPLES; i++) waveDs[i] = timeBuf[i]
    waveChart.update('none')

    if (magBuf && specChart) {
      const specDs = specChart.data.datasets[0].data
      for (let i = 0; i < magBuf.length; i++) specDs[i] = magBuf[i]
      specChart.update('none')
    }

    rafIdRef.current = requestAnimationFrame(animate)
  }, [])

  async function startMic() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream

      const ctx = new AudioContext()
      audioCtxRef.current = ctx

      const analyser = ctx.createAnalyser()
      analyser.fftSize = FFT_SIZE
      analyser.smoothingTimeConstant = 0
      analyserRef.current = analyser

      ctx.createMediaStreamSource(stream).connect(analyser)

      const sr = ctx.sampleRate
      const freqRes = sr / FFT_SIZE
      const specBins = Math.floor(SPECTRUM_MAX_HZ / freqRes)

      magBufRef.current = new Float32Array(specBins)

      // Update spectrum chart labels and data array to match actual sampleRate
      if (specChartRef.current) {
        specChartRef.current.data.labels = Array.from({ length: specBins }, (_, i) =>
          Math.round(i * freqRes),
        )
        specChartRef.current.data.datasets[0].data = new Array(specBins).fill(0)
        specChartRef.current.update('none')
      }

      setSampleRate(sr)
      setIsRunning(true)
      rafIdRef.current = requestAnimationFrame(animate)
    } catch (err) {
      setError(err.message)
    }
  }

  function stopMic() {
    cancelAnimationFrame(rafIdRef.current)
    rafIdRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    analyserRef.current = null
    setIsRunning(false)
    setSampleRate(null)
  }

  // Cleanup on unmount (no setState — component is gone)
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafIdRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      audioCtxRef.current?.close()
    }
  }, [])

  return (
    <div className="mic-tab">
      <div className="mic-controls">
        {isRunning ? (
          <button className="btn-stop" onClick={stopMic}>Stop</button>
        ) : (
          <button className="btn-start" onClick={startMic}>Start Microphone</button>
        )}
        {sampleRate && (
          <span className="mic-status">● Live · {sampleRate / 1000} kHz</span>
        )}
        {error && <span className="mic-error">{error}</span>}
      </div>

      <div className="charts-grid">
        <div className="chart-box">
          <h3>Live Waveform</h3>
          <div className="chart-container">
            <Line ref={waveChartRef} data={INIT_WAVE_DATA} options={WAVE_OPTIONS} />
          </div>
        </div>
        <div className="chart-box">
          <h3>Live Frequency Spectrum (0 – 8 kHz)</h3>
          <div className="chart-container">
            <Bar ref={specChartRef} data={INIT_SPEC_DATA} options={SPEC_OPTIONS} />
          </div>
        </div>
      </div>
    </div>
  )
}
