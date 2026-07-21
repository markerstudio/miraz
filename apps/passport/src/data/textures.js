// Procedural SVG textures (data URIs) — leather / paper grain and an ink
// speckle mask, so the passport reads as a physical object without shipping
// any raster assets.
const svg = (s) =>
  `data:image/svg+xml;utf8,${s
    .replace(/#/g, '%23')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/"/g, "'")}`

// Grey fractal noise — overlay at low opacity for leather grain / paper tooth.
export const NOISE = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>` +
    `<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/>` +
    `<feColorMatrix type='saturate' values='0'/></filter>` +
    `<rect width='240' height='240' filter='url(#n)'/></svg>`,
)

// Mostly-opaque alpha speckle — used as a mask on stamped ink so the
// impression is slightly uneven, like a real rubber stamp.
export const INK_MASK = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='210' height='210'>` +
    `<filter id='m'><feTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/>` +
    `<feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.7 -0.12'/></filter>` +
    `<rect width='210' height='210' filter='url(#m)'/></svg>`,
)
