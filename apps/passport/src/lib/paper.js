// The passport's security paper, rasterized ONCE.
//
// The guilloché used to be three stacked repeating-CSS-gradients painted
// live on every leaf face (~25 surfaces), which mobile GPUs re-rasterize
// during 3D flips. Here the same pattern (plus the paper grain that used
// to be a separate per-leaf layer) is drawn one time into a canvas at the
// leaf's fixed size and reused everywhere as a plain cached texture.

const W = 287
const H = 422

let cached = null

export function paperTexture() {
  if (cached !== null) return cached
  if (typeof document === 'undefined') return (cached = '')
  const canvas = document.createElement('canvas')
  canvas.width = W * 2
  canvas.height = H * 2
  const g = canvas.getContext('2d')
  g.scale(2, 2)

  const rings = (cx, cy, gap, color) => {
    g.strokeStyle = color
    g.lineWidth = 1
    const maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy))
    for (let r = gap; r < maxR; r += gap) {
      g.beginPath()
      g.arc(cx, cy, r, 0, Math.PI * 2)
      g.stroke()
    }
  }
  // same geometry as the old CSS layers
  rings(W * 0.22, H * 0.18, 7, 'rgba(111,119,98,0.05)')
  rings(W * 0.82, H * 0.78, 8, 'rgba(181,139,76,0.05)')

  // 58° line screen
  g.save()
  g.translate(W / 2, H / 2)
  g.rotate((58 * Math.PI) / 180)
  g.strokeStyle = 'rgba(44,42,40,0.028)'
  g.lineWidth = 1
  const span = Math.hypot(W, H)
  for (let x = -span; x < span; x += 9) {
    g.beginPath()
    g.moveTo(x, -span)
    g.lineTo(x, span)
    g.stroke()
  }
  g.restore()

  // paper grain (replaces the per-leaf noise overlay)
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(58,50,40,${(Math.random() * 0.045).toFixed(3)})`
    g.fillRect(Math.random() * W, Math.random() * H, 1, 1)
  }

  cached = canvas.toDataURL('image/png')
  return cached
}

/** Drop-in replacement for the old gradient PAGE_BG style object. */
export function paperStyle() {
  const url = paperTexture()
  return {
    background: 'var(--ivory)',
    ...(url ? { backgroundImage: `url("${url}")`, backgroundSize: `${W}px ${H}px` } : {}),
  }
}
