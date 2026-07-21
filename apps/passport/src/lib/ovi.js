// Optically-variable-ink driver — the tilt signal behind the passport's
// colour-shifting stamps, like real OVI security ink.
//
// Writes two custom properties on <html>:
//   --ovi   -1..1   left/right tilt (device gamma; pointer-x fallback)
//   --ovi-y -1..1   forward/back tilt (device beta around holding pose)
//
// Perf contract: device orientation jitters at ~60Hz forever, and every
// custom-property write on the root invalidates style for the document —
// so writes are quantized to visible steps and rate-limited. Smoothing
// between steps is left to CSS transitions on the few elements that use
// the vars (only the open page's stamps), keeping repaints tiny.
//
// iOS Safari only exposes deviceorientation after an explicit permission
// request from a user gesture, so the first tap anywhere asks once. Desktop
// and permission-denied phones fall back to pointer position. Honors
// prefers-reduced-motion.

const STEP = 0.06 // quantize: ignore sub-visible tilt jitter
const MIN_MS = 90 // rate limit: ~11 writes/s worst case

export function installOvi() {
  if (typeof window === 'undefined' || window.__miraz_ovi) return
  window.__miraz_ovi = true

  const root = document.documentElement
  root.style.setProperty('--ovi', '0')
  root.style.setProperty('--ovi-y', '0')
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  let lastX = 0
  let lastY = 0
  let lastWrite = 0
  let pending = 0
  let hasOrientation = false

  const quant = (v) => Math.round(Math.max(-1, Math.min(1, v)) / STEP) * STEP

  const set = (x, y) => {
    const qx = quant(x)
    const qy = quant(y)
    if (qx === lastX && qy === lastY) return
    const now = performance.now()
    const write = () => {
      pending = 0
      lastWrite = performance.now()
      lastX = qx
      lastY = qy
      root.style.setProperty('--ovi', String(qx))
      root.style.setProperty('--ovi-y', String(qy))
    }
    if (now - lastWrite >= MIN_MS) {
      write()
    } else if (!pending) {
      pending = setTimeout(write, MIN_MS - (now - lastWrite))
    }
  }

  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null && e.beta == null) return
    hasOrientation = true
    // beta ~45° is the natural phone-in-hand pose — shift around it
    set((e.gamma ?? 0) / 32, ((e.beta ?? 45) - 45) / 32)
  })

  window.addEventListener(
    'pointermove',
    (e) => {
      if (hasOrientation) return
      set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    },
    { passive: true },
  )

  // one-time iOS permission request, piggybacked on the first tap
  const DOE = window.DeviceOrientationEvent
  if (DOE && typeof DOE.requestPermission === 'function') {
    const ask = () => DOE.requestPermission().catch(() => {})
    window.addEventListener('pointerdown', ask, { once: true, passive: true })
  }
}
