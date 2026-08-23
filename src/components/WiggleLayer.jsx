import { useEffect } from 'react'

const RADIUS             = 240   // px — cursor influence falloff radius
const PUSH_ACCEL         = 3.2   // how strongly cursor velocity accelerates offset (per second)
const SPRING_K           = 90    // spring constant pulling offset back to rest
const DAMPING            = 12    // velocity damping
const ROT_ACCEL          = 1.0   // how strongly lateral cursor velocity accelerates rotation (per second)
const ROT_SPRING_K       = 60
const ROT_DAMPING        = 9
const MAX_OFFSET         = 34    // px
const MAX_ROT            = 14    // deg
const VEL_SMOOTH         = 0.25  // EMA smoothing for raw cursor velocity
const VEL_DECAY          = 0.85  // per-frame decay of smoothed velocity when cursor stops
const RESIZE_DEBOUNCE_MS = 180

function clamp(v, min, max) { return v < min ? min : v > max ? max : v }

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

export default function WiggleLayer({ isActive }) {
  useEffect(() => {
    if (!isActive) return

    const targets = [...document.querySelectorAll('[data-wobble]')]
    if (!targets.length) return

    // Some shapes carry their own baseline transform from CSS (e.g. the blue
    // arc's translateY(-50%), the orange rect's rotate(-10deg), the squiggle's
    // translateX(-50%)). Capture it once, before we ever touch inline style,
    // so it can be composed back in every frame instead of being clobbered.
    const states = targets.map(el => {
      const computed = getComputedStyle(el).transform
      return {
        el,
        baseTransform: computed === 'none' ? '' : computed,
        restCenterX: 0, restCenterY: 0,
        measuredScrollX: 0, measuredScrollY: 0,
        offsetX: 0, offsetY: 0,
        velX: 0, velY: 0,
        rot: 0, angVel: 0,
      }
    })

    // Measure each element's rest-position center with any wiggle-applied
    // inline transform cleared (falling back to its CSS baseline transform,
    // not stripping transform entirely), so we capture true layout position
    // rather than a currently-applied wiggle offset. Re-run on resize so
    // geometry never goes stale.
    function measureAll() {
      const scrollX = window.scrollX
      const scrollY = window.scrollY
      for (const s of states) {
        const prevTransform = s.el.style.transform
        s.el.style.transform = ''
        const rect = s.el.getBoundingClientRect()
        s.el.style.transform = prevTransform
        s.restCenterX = rect.left + rect.width / 2
        s.restCenterY = rect.top + rect.height / 2
        s.measuredScrollX = scrollX
        s.measuredScrollY = scrollY
      }
    }
    measureAll()

    let resizeTimer = null
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(measureAll, RESIZE_DEBOUNCE_MS)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)

    // ── Cursor tracking ──────────────────────────────────────────────
    const pending = []
    let lastPos  = null
    let smoothVx = 0
    let smoothVy = 0
    let cursorX  = -Infinity
    let cursorY  = -Infinity

    const onPointerMove = e => {
      const events = (e.getCoalescedEvents ? e.getCoalescedEvents() : null) || [e]
      for (const ev of events) {
        pending.push({ x: ev.clientX, y: ev.clientY, t: ev.timeStamp })
      }
    }
    window.addEventListener('pointermove', onPointerMove)

    let raf = null
    let lastTs = null

    function tick(ts) {
      const dt = lastTs != null ? Math.min((ts - lastTs) / 1000, 0.033) : 0.016
      lastTs = ts

      const batch = pending.splice(0)
      for (const pt of batch) {
        const prev = lastPos || pt
        const sdt  = Math.max((pt.t - prev.t) / 1000, 0.001)
        const rawVx = (pt.x - prev.x) / sdt
        const rawVy = (pt.y - prev.y) / sdt
        smoothVx += (rawVx - smoothVx) * VEL_SMOOTH
        smoothVy += (rawVy - smoothVy) * VEL_SMOOTH
        lastPos = pt
        cursorX = pt.x
        cursorY = pt.y
      }
      if (!batch.length) {
        smoothVx *= VEL_DECAY
        smoothVy *= VEL_DECAY
      }

      const scrollDX = window.scrollX
      const scrollDY = window.scrollY

      for (const s of states) {
        const liveCenterX = s.restCenterX - (scrollDX - s.measuredScrollX)
        const liveCenterY = s.restCenterY - (scrollDY - s.measuredScrollY)

        const dx   = liveCenterX - cursorX
        const dy   = liveCenterY - cursorY
        const dist = Math.hypot(dx, dy)
        const influence = 1 - smoothstep(0, RADIUS, dist)

        if (influence > 0) {
          s.velX += smoothVx * influence * PUSH_ACCEL * dt
          s.velY += smoothVy * influence * PUSH_ACCEL * dt
          s.angVel += smoothVx * influence * ROT_ACCEL * dt
        }

        s.velX += (-SPRING_K * s.offsetX - DAMPING * s.velX) * dt
        s.velY += (-SPRING_K * s.offsetY - DAMPING * s.velY) * dt
        s.offsetX = clamp(s.offsetX + s.velX * dt, -MAX_OFFSET, MAX_OFFSET)
        s.offsetY = clamp(s.offsetY + s.velY * dt, -MAX_OFFSET, MAX_OFFSET)

        s.angVel += (-ROT_SPRING_K * s.rot - ROT_DAMPING * s.angVel) * dt
        s.rot = clamp(s.rot + s.angVel * dt, -MAX_ROT, MAX_ROT)

        s.el.style.transform = `translate(${s.offsetX.toFixed(2)}px,${s.offsetY.toFixed(2)}px) rotate(${s.rot.toFixed(2)}deg) ${s.baseTransform}`
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)

      for (const s of states) {
        s.el.classList.add('wiggle-snapping')
        s.el.style.transform = ''
        const onEnd = () => {
          s.el.classList.remove('wiggle-snapping')
          s.el.removeEventListener('transitionend', onEnd)
        }
        s.el.addEventListener('transitionend', onEnd)
      }
    }
  }, [isActive])

  return null
}
