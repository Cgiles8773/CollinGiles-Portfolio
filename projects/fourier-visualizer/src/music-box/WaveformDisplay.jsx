import { useEffect, useRef } from 'react'

export default function WaveformDisplay({ analyserRef }) {
  const canvasRef = useRef(null)

  // Resize canvas buffer to match CSS dimensions (with DPR for sharpness)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr    = window.devicePixelRatio || 1
      const rect   = canvas.getBoundingClientRect()
      canvas.width  = Math.round(rect.width  * dpr)
      canvas.height = Math.round(rect.height * dpr)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  // RAF draw loop — runs continuously; draws flat dim line when analyser is null
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let rafId

    const tick = () => {
      const analyser = analyserRef.current
      const ctx      = canvas.getContext('2d')
      const W        = canvas.width
      const H        = canvas.height
      const dpr      = window.devicePixelRatio || 1

      const buf = new Float32Array(analyser ? analyser.fftSize : 2048)
      if (analyser) analyser.getFloatTimeDomainData(buf)

      ctx.clearRect(0, 0, W, H)

      const active        = analyser !== null
      ctx.shadowBlur      = active ? 16 * dpr : 0
      ctx.shadowColor     = 'rgba(81, 170, 219, 0.65)'
      ctx.strokeStyle     = active ? 'rgb(81, 170, 219)' : 'rgba(81, 170, 219, 0.18)'
      ctx.lineWidth       = 1.5 * dpr
      ctx.lineJoin        = 'round'
      ctx.lineCap         = 'round'

      const mid   = H / 2
      const range = mid - 6 * dpr

      // Zero-crossing trigger: find first upward crossing in the first half of
      // the buffer, then draw exactly half the buffer from that point.
      // This keeps both edges anchored near the centre line.
      const half   = Math.floor(buf.length / 2)
      let trigger  = 0
      for (let i = 1; i < half; i++) {
        if (buf[i - 1] <= 0 && buf[i] > 0) { trigger = i; break }
      }
      const end  = trigger + half
      const step = W / (half - 1)

      ctx.beginPath()
      for (let i = trigger; i < end; i++) {
        const x = (i - trigger) * step
        const y = mid + buf[i] * range
        i === trigger ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [analyserRef])

  return <canvas ref={canvasRef} className="mb-wave-canvas" />
}
