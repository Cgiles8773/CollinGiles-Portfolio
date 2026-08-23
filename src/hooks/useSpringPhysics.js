import { useRef, useEffect, useCallback } from 'react'

// Asteroids-style physics: weak gravity toward home, critically damped so
// thrown shapes glide back and settle without oscillating/ringing (DRAG is
// tuned to ~2*sqrt(GRAVITY), the critical-damping point, plus a small margin)
const GRAVITY    = 6      // spring constant — weak pull toward origin
const DRAG       = 5.4    // velocity decay per second (critically damped, ζ≈1.1)
const TOSS_SCALE = 0.9
const MAX_VEL    = 5000
const FLOAT_ACC  = 36     // peak periodic force for idle drift (px/s²)
const VEL_WINDOW = 100    // ms of history used for toss velocity
const TAU        = Math.PI * 2
// How long to wait, on a shape's very first activation, before trusting a
// position measurement — the page can still be settling its layout (webfont
// swap, etc.) right after load. Bump this up if first-activation still looks
// off; it's a starting guess, not a measured minimum.
const FIRST_ACTIVATE_DELAY_MS = 1000

function makeState() {
  return {
    x: 0, y: 0,
    vx: 0, vy: 0,
    dragging: false,
    animating: false,
    rafHandle: null,
    originAbsX: 0,
    originAbsY: 0,
    halfW: 0,
    halfH: 0,
    cssTransform: '',
    isGameMode: false,
    hasActivatedOnce: false,
    velHistory: [],
    // Per-element randomised float so shapes drift independently
    floatFreqX: 0.10 + Math.random() * 0.12,
    floatFreqY: 0.08 + Math.random() * 0.12,
    floatPhaseX: Math.random() * TAU,
    floatPhaseY: Math.random() * TAU,
  }
}

export function useSpringPhysics(elRef, isGameMode) {
  const state = useRef(makeState())

  const applyTransform = useCallback((dx, dy) => {
    const el = elRef.current
    if (!el) return
    const base = state.current.cssTransform
    el.style.transform = base
      ? `translate(${dx}px,${dy}px) ${base}`
      : `translate(${dx}px,${dy}px)`
  }, [elRef])

  const startLoop = useCallback(() => {
    const s = state.current
    if (s.animating) return
    s.animating = true
    let last = null

    function tick(ts) {
      const el = elRef.current
      if (!el || !s.animating) return
      const dt = last != null ? Math.min((ts - last) / 1000, 0.033) : 0.016
      last = ts

      if (s.dragging) {
        s.rafHandle = requestAnimationFrame(tick)
        return
      }

      const W = window.innerWidth
      const H = window.innerHeight

      // Shortest-path spring displacement toward origin
      let ex = s.x % W
      if (ex > W / 2)  ex -= W
      if (ex < -W / 2) ex += W
      let ey = s.y % H
      if (ey > H / 2)  ey -= H
      if (ey < -H / 2) ey += H

      // Small periodic float force (only while game mode is on)
      const t  = ts * 0.001
      const fax = s.isGameMode ? FLOAT_ACC * Math.sin(t * s.floatFreqX * TAU + s.floatPhaseX) : 0
      const fay = s.isGameMode ? FLOAT_ACC * Math.sin(t * s.floatFreqY * TAU + s.floatPhaseY) : 0

      // Integrate: weak gravity + space drag + idle float
      s.vx += (-GRAVITY * ex - DRAG * s.vx + fax) * dt
      s.vy += (-GRAVITY * ey - DRAG * s.vy + fay) * dt
      s.x  += s.vx * dt
      s.y  += s.vy * dt

      // Stop loop when settled and game mode is off
      if (!s.isGameMode &&
          Math.abs(ex) < 0.5 && Math.abs(ey) < 0.5 &&
          Math.abs(s.vx) < 0.5 && Math.abs(s.vy) < 0.5) {
        s.x = 0; s.y = 0; s.vx = 0; s.vy = 0
        el.style.transform = ''
        el.style.zIndex = ''
        s.animating = false
        return
      }

      // Center-based wrap display
      const cx = s.originAbsX + s.halfW
      const cy = s.originAbsY + s.halfH
      const dispX = (((cx + s.x) % W) + W) % W - cx
      const dispY = (((cy + s.y) % H) + H) % H - cy
      applyTransform(dispX, dispY)

      s.rafHandle = requestAnimationFrame(tick)
    }

    s.rafHandle = requestAnimationFrame(tick)
  }, [elRef, applyTransform])

  // Measure origin + size + baseline CSS transform from the live DOM. Exposed
  // as its own function so it can be re-run whenever layout may have shifted
  // out from under a previous measurement (web-font swap reflow, resize).
  const measureOrigin = useCallback(() => {
    const el = elRef.current
    if (!el) return
    const s = state.current
    const rect = el.getBoundingClientRect()
    s.originAbsX = rect.left
    s.originAbsY = rect.top
    s.halfW = rect.width  / 2
    s.halfH = rect.height / 2
    const ct = getComputedStyle(el).transform
    s.cssTransform = ct === 'none' ? '' : ct
  }, [elRef])

  // Capture origin + size when game mode activates; start float loop immediately
  useEffect(() => {
    if (!isGameMode) return
    const el = elRef.current
    if (!el) return
    const s = state.current
    if (s.rafHandle) cancelAnimationFrame(s.rafHandle)
    s.animating = false

    const activateNow = () => {
      measureOrigin()
      s.x = 0; s.y = 0; s.vx = 0; s.vy = 0
      s.isGameMode = true
      startLoop()
    }

    // Hack: the first time this shape is ever activated, hold off actually
    // measuring/starting for a beat instead of doing it immediately on
    // click. It's not about how many times the mode gets toggled — it's
    // that a measurement taken right after page load can land before the
    // page's layout (webfont swap, etc.) has actually settled. A flat
    // delay sidesteps that regardless of how long settling actually takes.
    let activateTimer = null
    if (!s.hasActivatedOnce) {
      s.hasActivatedOnce = true
      activateTimer = setTimeout(activateNow, FIRST_ACTIVATE_DELAY_MS)
    } else {
      activateNow()
    }

    let resizeTimer = null
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(measureOrigin, 180)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)

    return () => {
      clearTimeout(activateTimer)
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [isGameMode, elRef, startLoop, measureOrigin])

  // Snap back when game mode deactivates
  useEffect(() => {
    if (isGameMode) return
    const el = elRef.current
    if (!el) return
    const s = state.current
    if (s.rafHandle) cancelAnimationFrame(s.rafHandle)
    s.animating = false; s.dragging = false
    s.isGameMode = false
    s.x = 0; s.y = 0; s.vx = 0; s.vy = 0
    el.style.zIndex = ''
    el.classList.add('physics-snapping')
    requestAnimationFrame(() => {
      el.style.transform = ''
      const onEnd = () => {
        el.classList.remove('physics-snapping')
        el.removeEventListener('transitionend', onEnd)
      }
      el.addEventListener('transitionend', onEnd)
    })
  }, [isGameMode, elRef])

  const onPointerDown = useCallback((e) => {
    const el = elRef.current
    if (!el) return
    e.preventDefault()
    el.setPointerCapture(e.pointerId)

    const s = state.current
    if (s.rafHandle) cancelAnimationFrame(s.rafHandle)
    s.animating = false; s.dragging = true
    el.style.zIndex = '20'

    const startX = e.clientX
    const startY = e.clientY
    const baseX  = s.x
    const baseY  = s.y
    s.velHistory = [{ x: e.clientX, y: e.clientY, t: e.timeStamp }]

    function onMove(e) {
      s.x = baseX + (e.clientX - startX)
      s.y = baseY + (e.clientY - startY)
      const W = window.innerWidth
      const H = window.innerHeight
      const cx = s.originAbsX + s.halfW
      const cy = s.originAbsY + s.halfH
      const dispX = (((cx + s.x) % W) + W) % W - cx
      const dispY = (((cy + s.y) % H) + H) % H - cy
      applyTransform(dispX, dispY)
      // Build velocity ring buffer
      s.velHistory.push({ x: e.clientX, y: e.clientY, t: e.timeStamp })
      while (s.velHistory.length > 1 && e.timeStamp - s.velHistory[0].t > VEL_WINDOW) {
        s.velHistory.shift()
      }
    }

    function onUp(e) {
      // Include final position then compute velocity over the window
      s.velHistory.push({ x: e.clientX, y: e.clientY, t: e.timeStamp })
      const h  = s.velHistory
      const dt = (h[h.length - 1].t - h[0].t) / 1000
      if (dt > 0.01 && h.length >= 2) {
        const clamp = v => Math.max(-MAX_VEL, Math.min(MAX_VEL, v))
        s.vx = clamp((h[h.length - 1].x - h[0].x) / dt * TOSS_SCALE)
        s.vy = clamp((h[h.length - 1].y - h[0].y) / dt * TOSS_SCALE)
      } else {
        s.vx = 0; s.vy = 0
      }
      s.dragging = false
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      startLoop()
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    startLoop()
  }, [elRef, applyTransform, startLoop])

  useEffect(() => () => {
    const s = state.current
    if (s.rafHandle) cancelAnimationFrame(s.rafHandle)
  }, [])

  return { onPointerDown }
}
