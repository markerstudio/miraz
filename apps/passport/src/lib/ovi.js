// Optically-variable-ink driver — the tilt signal behind the passport's
// colour-shifting stamps, like real OVI security ink.
//
// Writes two custom properties on <html>, smoothed every frame:
//   --ovi   -1..1   left/right tilt (device gamma; pointer-x fallback)
//   --ovi-y -1..1   forward/back tilt (device beta around holding pose)
//
// iOS Safari only exposes deviceorientation after an explicit permission
// request from a user gesture, so the first tap anywhere asks once. Desktop
// and permission-denied phones fall back to pointer position, so the ink
// always answers to something. Honors prefers-reduced-motion.

export function installOvi() {
  if (typeof window === 'undefined' || window.__miraz_ovi) return
  window.__miraz_ovi = true

  const root = document.documentElement
  root.style.setProperty('--ovi', '0')
  root.style.setProperty('--ovi-y', '0')
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  let tx = 0
  let ty = 0
  let cx = 0
  let cy = 0
  let raf = 0
  let hasOrientation = false

  const clamp = (v) => Math.max(-1, Math.min(1, v))
  const tick = () => {
    raf = 0
    cx += (tx - cx) * 0.14
    cy += (ty - cy) * 0.14
    root.style.setProperty('--ovi', cx.toFixed(4))
    root.style.setProperty('--ovi-y', cy.toFixed(4))
    if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(tick)
  }
  const set = (x, y) => {
    tx = clamp(x)
    ty = clamp(y)
    if (!raf) raf = requestAnimationFrame(tick)
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
