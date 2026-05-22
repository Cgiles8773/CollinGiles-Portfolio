import { useEffect } from 'react'

const NS             = 'http://www.w3.org/2000/svg'
const CANVAS_SCALE   = 0.25
const DISP_SCALE     = 90
const PAINT_AMP      = 110
const PAINT_RADIUS   = 7      // canvas px (~28 viewport px)
const SPEED_SCALE    = 700
const DECAY          = 0.016  // per-frame blend toward neutral (~3 s full reform)
const VEL_SMOOTH     = 0.22   // how fast smooth velocity tracks raw (0=frozen, 1=instant)
const VEL_DECAY      = 0.80   // per-frame decay of velocity when no events arrive
const NEUTRAL        = 128
const FILTER_MARGIN  = 110    // must stay >= DISP_SCALE so displaced pixels aren't clipped

function clamp1(v) { return v < -1 ? -1 : v > 1 ? 1 : v }

export default function WiggleLayer({ isActive }) {
  useEffect(() => {
    if (!isActive) return

    const targets = [...document.querySelectorAll('[data-wobble]')]
    if (!targets.length) return

    const vw = window.innerWidth
    const vh = window.innerHeight
    const cw = Math.ceil(vw * CANVAS_SCALE)
    const ch = Math.ceil(vh * CANVAS_SCALE)

    // ── Displacement canvas ──────────────────────────────────────────
    const canvas = document.createElement('canvas')
    canvas.width  = cw
    canvas.height = ch
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = `rgb(${NEUTRAL},${NEUTRAL},0)`
    ctx.fillRect(0, 0, cw, ch)

    // ── SVG + one filter per element ────────────────────────────────
    // primitiveUnits="userSpaceOnUse" on CSS-filtered HTML elements uses
    // element-local coords (0,0 = element top-left). Each feImage is offset
    // by (-rect.left, -rect.top) so the viewport-coord canvas aligns correctly.
    const svg = document.createElementNS(NS, 'svg')
    svg.style.cssText = 'position:fixed;width:0;height:0;overflow:hidden;pointer-events:none'
    const defs = document.createElementNS(NS, 'defs')

    const feImgs = []

    targets.forEach((el, i) => {
      const rect = el.getBoundingClientRect()

      const filter = document.createElementNS(NS, 'filter')
      filter.setAttribute('id',      `wiggle-disp-${i}`)
      filter.setAttribute('filterUnits',   'userSpaceOnUse')
      filter.setAttribute('primitiveUnits','userSpaceOnUse')
      filter.setAttribute('x',      String(-FILTER_MARGIN))
      filter.setAttribute('y',      String(-FILTER_MARGIN))
      filter.setAttribute('width',  String(rect.width  + FILTER_MARGIN * 2))
      filter.setAttribute('height', String(rect.height + FILTER_MARGIN * 2))
      filter.setAttribute('color-interpolation-filters', 'sRGB')

      const feImg = document.createElementNS(NS, 'feImage')
      feImg.setAttribute('x',                   String(-rect.left))
      feImg.setAttribute('y',                   String(-rect.top))
      feImg.setAttribute('width',               String(vw))
      feImg.setAttribute('height',              String(vh))
      feImg.setAttribute('preserveAspectRatio', 'none')
      feImg.setAttribute('result',              'disp_map')

      const feDisp = document.createElementNS(NS, 'feDisplacementMap')
      feDisp.setAttribute('in',               'SourceGraphic')
      feDisp.setAttribute('in2',              'disp_map')
      feDisp.setAttribute('scale',            String(DISP_SCALE))
      feDisp.setAttribute('xChannelSelector', 'R')
      feDisp.setAttribute('yChannelSelector', 'G')
      feDisp.setAttribute('color-interpolation-filters', 'sRGB')

      filter.appendChild(feImg)
      filter.appendChild(feDisp)
      defs.appendChild(filter)
      feImgs.push(feImg)

      el.style.filter = `url(#wiggle-disp-${i})`
    })

    svg.appendChild(defs)
    document.body.appendChild(svg)

    // ── Cursor tracking ──────────────────────────────────────────────
    // getCoalescedEvents() exposes sub-frame pointer samples; raw velocity
    // between adjacent samples is noisy (tiny dt), so we smooth it via
    // an exponential moving average (smoothVx/smoothVy) before painting.
    const pending = []
    let lastPos   = null   // last processed event — used as prev for next batch
    let smoothVx  = 0
    let smoothVy  = 0
    let energy    = 0
    let raf       = null

    const onPointerMove = e => {
      const events = (e.getCoalescedEvents ? e.getCoalescedEvents() : null) || [e]
      for (const ev of events) {
        pending.push({ x: ev.clientX, y: ev.clientY, t: ev.timeStamp })
      }
    }
    window.addEventListener('pointermove', onPointerMove)

    function tick() {
      const batch = pending.splice(0)
      const moved = batch.length > 0

      if (!moved) {
        smoothVx *= VEL_DECAY
        smoothVy *= VEL_DECAY
      }
      energy *= (1 - DECAY)

      if (energy > 0.5 || moved) {
        // Blend canvas toward neutral
        ctx.save()
        ctx.globalAlpha = DECAY
        ctx.fillStyle = `rgb(${NEUTRAL},${NEUTRAL},0)`
        ctx.fillRect(0, 0, cw, ch)
        ctx.restore()

        // One stroke per coalesced sample, each updating the smoothed velocity
        for (const pt of batch) {
          const prev  = lastPos || pt
          const dt    = Math.max((pt.t - prev.t) / 1000, 0.001)
          const rawVx = (pt.x - prev.x) / dt
          const rawVy = (pt.y - prev.y) / dt

          // Low-pass filter: smooth velocity tracks raw, removes timing noise
          smoothVx += (rawVx - smoothVx) * VEL_SMOOTH
          smoothVy += (rawVy - smoothVy) * VEL_SMOOTH

          energy  = Math.min(PAINT_AMP, energy + Math.hypot(rawVx, rawVy) * 0.04)
          lastPos = pt

          const cx   = pt.x * CANVAS_SCALE
          const cy   = pt.y * CANVAS_SCALE
          const r    = Math.round(NEUTRAL - clamp1(smoothVx / SPEED_SCALE) * PAINT_AMP)
          const g    = Math.round(NEUTRAL - clamp1(smoothVy / SPEED_SCALE) * PAINT_AMP)
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, PAINT_RADIUS)
          grad.addColorStop(0,   `rgb(${r},${g},0)`)
          grad.addColorStop(0.5, `rgb(${r},${g},0)`)
          grad.addColorStop(1,   `rgb(${NEUTRAL},${NEUTRAL},0)`)
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(cx, cy, PAINT_RADIUS, 0, Math.PI * 2)
          ctx.fill()
        }

        const dataUrl = canvas.toDataURL('image/png')
        feImgs.forEach(fi => fi.setAttribute('href', dataUrl))
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointerMove)
      targets.forEach(el => { el.style.filter = '' })
      if (svg.parentNode) document.body.removeChild(svg)
    }
  }, [isActive])

  return null
}
