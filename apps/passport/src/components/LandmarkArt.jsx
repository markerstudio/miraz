import React from 'react'

/**
 * Full-page landmark engravings — dense line-and-hatch compositions in the
 * style of the brand's engraved landmark plates, rendered soft behind each
 * country's stamp page.
 *
 * Raster override: drop the brand's real artwork at
 *   src/assets/pages/<countryId>.png   (eastasia, levant, greece, usa, italy, morocco)
 * and it is used instead of the SVG automatically — no code change needed.
 */

const RASTER = import.meta.glob('../assets/pages/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
})
// `<id>.ink.webp` — preprocessed ink-on-transparent plates (fade baked into
// alpha; see scripts/bake-page-art note in assets/pages/README). These render
// with plain cheap compositing. A raw `<id>.png` drop still works and falls
// back to live multiply blending.
const rasterFor = (id) => {
  let raw = null
  for (const [path, url] of Object.entries(RASTER)) {
    const file = path.split('/').pop()
    if (file.replace(/\.ink\.[^.]+$/, '') === id) return { url, ink: true }
    if (file.replace(/\.[^.]+$/, '') === id) raw = { url, ink: false }
  }
  return raw
}

const S = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' }
const LINE = { ...S, strokeWidth: 0.9 }
const FINE = { ...S, strokeWidth: 0.55 }

/** Engraving hatch fills — each svg carries its own defs (ids must be unique per document). */
function Hatch({ prefix }) {
  return (
    <defs>
      <pattern id={`${prefix}-h1`} patternUnits="userSpaceOnUse" width="3.2" height="3.2" patternTransform="rotate(38)">
        <line x1="0" y1="0" x2="0" y2="3.2" stroke="currentColor" strokeWidth="0.5" />
      </pattern>
      <pattern id={`${prefix}-h2`} patternUnits="userSpaceOnUse" width="2.4" height="2.4" patternTransform="rotate(-32)">
        <line x1="0" y1="0" x2="0" y2="2.4" stroke="currentColor" strokeWidth="0.5" />
      </pattern>
      <pattern id={`${prefix}-x`} patternUnits="userSpaceOnUse" width="3" height="3">
        <line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" strokeWidth="0.4" transform="rotate(40 1.5 1.5)" />
        <line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" strokeWidth="0.4" transform="rotate(-40 1.5 1.5)" />
      </pattern>
      <pattern id={`${prefix}-dot`} patternUnits="userSpaceOnUse" width="4" height="4">
        <circle cx="1" cy="1" r="0.5" fill="currentColor" />
      </pattern>
    </defs>
  )
}
const h1 = (p) => `url(#${p}-h1)`
const h2 = (p) => `url(#${p}-h2)`
const hx = (p) => `url(#${p}-x)`
const hd = (p) => `url(#${p}-dot)`

/* ---------------- East Asia — five-storey pagoda ---------------- */
function Pagoda() {
  const p = 'ea'
  // five roofs: [ridge-y, half-width]; bodies between them
  const tiers = [
    [72, 46],
    [110, 56],
    [148, 66],
    [186, 76],
    [224, 86],
  ]
  const roof = ([y, w]) =>
    `M ${120 - w} ${y + 15} Q ${120 - w + 6} ${y + 9} ${120 - w * 0.5} ${y + 3} Q 120 ${y - 5} ${120 + w * 0.5} ${y + 3} Q ${120 + w - 6} ${y + 9} ${120 + w} ${y + 15} L ${120 + w - 4} ${y + 17} Q 120 ${y + 6} ${120 - w + 4} ${y + 17} Z`
  return (
    <svg viewBox="0 0 240 300" style={{ width: '100%', display: 'block' }}>
      <Hatch prefix={p} />
      {/* finial */}
      <g {...LINE}>
        <line x1="120" y1="22" x2="120" y2="66" />
        <circle cx="120" cy="18" r="2.6" fill={h1(p)} />
        {[30, 37, 44, 51, 58].map((y, i) => (
          <ellipse key={y} cx="120" cy={y} rx={5 + i * 1.4} ry="2.2" />
        ))}
      </g>
      {tiers.map(([y, w], i) => (
        <g key={y}>
          {/* body below this roof (skip below last — platform instead) */}
          {i < 4 && (
            <g {...FINE}>
              <rect x={120 - (26 + i * 6)} y={y + 17} width={(26 + i * 6) * 2} height={tiers[i + 1][0] - y - 22} fill={h1(p)} />
              {/* arched window */}
              <path
                d={`M ${114} ${y + 26} a 6 6 0 0 1 12 0 v 7 h -12 z`}
                fill={hx(p)}
                transform={`translate(0 ${i * 0})`}
              />
              {/* railing */}
              <line x1={120 - (26 + i * 6) - 7} y1={tiers[i + 1][0] - 6} x2={120 + (26 + i * 6) + 7} y2={tiers[i + 1][0] - 6} />
            </g>
          )}
          {/* the roof itself, eave curl ticks and under-shadow */}
          <path d={roof([y, w])} {...LINE} fill={h2(p)} />
          <g {...FINE}>
            <path d={`M ${120 - w} ${y + 15} q -4 -1 -6 -5`} />
            <path d={`M ${120 + w} ${y + 15} q 4 -1 6 -5`} />
            {/* eave bells */}
            <line x1={120 - w + 2} y1={y + 17} x2={120 - w + 2} y2={y + 22} />
            <line x1={120 + w - 2} y1={y + 17} x2={120 + w - 2} y2={y + 22} />
          </g>
        </g>
      ))}
      {/* ground storey + platform */}
      <g {...FINE}>
        <rect x="76" y="241" width="88" height="26" fill={h1(p)} />
        <path d="M 112 267 v -16 a 8 8 0 0 1 16 0 v 16 z" fill={hx(p)} {...LINE} />
        <rect x="64" y="267" width="112" height="6" fill={h2(p)} />
        <rect x="56" y="273" width="128" height="6" fill={h1(p)} />
        {/* stone lanterns */}
        <path d="M 40 279 v -10 h 8 v 10 M 39 269 h 10 M 41 265 h 6 v 4 h -6 z M 44 259 v 6" />
        <path d="M 192 279 v -10 h 8 v 10 M 191 269 h 10 M 193 265 h 6 v 4 h -6 z M 196 259 v 6" />
      </g>
      {/* foliage clouds + ground */}
      <g {...FINE}>
        <path d="M 18 262 q 8 -14 22 -12 q 4 -10 16 -8 q 10 -8 18 0" fill={hd(p)} />
        <path d="M 168 258 q 10 -12 22 -9 q 6 -9 18 -5 q 8 -4 12 2" fill={hd(p)} />
        <path d="M 12 286 h 92 M 118 286 h 44 M 172 286 h 56" opacity="0.7" />
        <path d="M 26 292 h 60 M 150 292 h 64" opacity="0.4" />
      </g>
    </svg>
  )
}

/* ---------------- The Levant — Dome of the Rock ---------------- */
function DomeOfTheRock() {
  const p = 'lv'
  return (
    <svg viewBox="0 0 240 300" style={{ width: '100%', display: 'block' }}>
      <Hatch prefix={p} />
      {/* crescent finial */}
      <g {...LINE}>
        <line x1="120" y1="46" x2="120" y2="66" />
        <circle cx="120" cy="42" r="1.8" />
        <path d="M 117 36 a 4.5 4.5 0 1 0 6 0 a 3.6 3.6 0 1 1 -6 0" />
      </g>
      {/* dome with meridian engraving */}
      <path d="M 66 128 C 66 84 92 62 120 62 C 148 62 174 84 174 128 Z" {...LINE} fill={h1('lv')} />
      <g {...FINE} opacity="0.9">
        <path d="M 120 62 C 108 80 102 102 102 128 M 120 62 C 132 80 138 102 138 128" />
        <path d="M 120 62 C 96 76 84 100 82 128 M 120 62 C 144 76 156 100 158 128" />
        <path d="M 74 106 C 88 98 152 98 166 106 M 70 118 C 86 111 154 111 170 118" />
      </g>
      {/* drum — arched window band */}
      <g {...LINE}>
        <rect x="72" y="128" width="96" height="24" fill={h2('lv')} />
        {[82, 98, 114, 130, 146].map((x) => (
          <path key={x} d={`M ${x} 148 v -8 a 5 5 0 0 1 10 0 v 8 z`} fill="var(--ivory)" />
        ))}
      </g>
      {/* octagonal body — upper band with horseshoe arcade */}
      <g {...LINE}>
        <path d="M 58 152 L 182 152 L 196 168 L 44 168 Z" fill={h1('lv')} />
        <rect x="44" y="168" width="152" height="56" fill={hx('lv')} />
        {[54, 76, 98, 120, 142, 164].map((x) => (
          <path key={x} d={`M ${x} 220 v -30 a 11 11 0 0 1 22 0 v 30 z`} fill="var(--ivory)" {...FINE} />
        ))}
        {[54, 76, 98, 120, 142, 164].map((x) => (
          <path key={x} d={`M ${x + 3} 220 v -27 a 8 8 0 0 1 16 0 v 27`} fill={h2('lv')} {...FINE} />
        ))}
      </g>
      {/* lower body + corner piers */}
      <g {...LINE}>
        <rect x="38" y="224" width="164" height="46" fill={h1('lv')} />
        <rect x="38" y="224" width="10" height="46" fill={hx('lv')} />
        <rect x="192" y="224" width="10" height="46" fill={hx('lv')} />
        <path d="M 104 270 v -26 a 16 16 0 0 1 32 0 v 26 z" fill={hx('lv')} />
        <path d="M 108 270 v -23 a 12 12 0 0 1 24 0 v 23" fill="var(--ivory)" {...FINE} />
        {[58, 78, 162, 182].map((x) => (
          <path key={x} d={`M ${x - 7} 262 v -14 a 7 7 0 0 1 14 0 v 14 z`} fill="var(--ivory)" {...FINE} />
        ))}
      </g>
      {/* plaza + distant old city */}
      <g {...FINE}>
        <path d="M 12 278 H 228" opacity="0.75" />
        <path d="M 20 285 h 74 M 108 285 h 58 M 178 285 h 46" opacity="0.5" />
        <path d="M 14 270 v -12 h 8 v 12 M 220 270 v -16 h 8 v 16 M 224 254 l 4 -5" opacity="0.7" />
        <path d="M 26 292 h 70 M 140 292 h 76" opacity="0.3" />
      </g>
    </svg>
  )
}

/* ---------------- Greece — the Parthenon on the rock ---------------- */
function Parthenon() {
  const p = 'gr'
  const cols = Array.from({ length: 8 }, (_, i) => 44 + i * 22)
  return (
    <svg viewBox="0 0 240 300" style={{ width: '100%', display: 'block' }}>
      <Hatch prefix={p} />
      {/* pediment with sculpted-frieze hint */}
      <g {...LINE}>
        <path d="M 30 138 L 120 102 L 210 138 Z" fill={h1(p)} />
        <path d="M 44 134 L 120 108 L 196 134 Z" fill={hd(p)} {...FINE} />
        <rect x="30" y="138" width="180" height="8" fill={h2(p)} />
        {/* triglyph band */}
        <rect x="30" y="146" width="180" height="9" fill="var(--ivory)" />
        {cols.map((x) => (
          <g key={x} {...FINE}>
            <line x1={x - 3} y1="147" x2={x - 3} y2="154" />
            <line x1={x} y1="147" x2={x} y2="154" />
            <line x1={x + 3} y1="147" x2={x + 3} y2="154" />
          </g>
        ))}
      </g>
      {/* colonnade */}
      {cols.map((x) => (
        <g key={x} {...FINE}>
          <rect x={x - 5} y="158" width="10" height="52" fill={h1(p)} />
          <line x1={x - 1.6} y1="159" x2={x - 1.6} y2="209" opacity="0.8" />
          <line x1={x + 1.6} y1="159" x2={x + 1.6} y2="209" opacity="0.8" />
          <rect x={x - 7} y="155" width="14" height="3.5" {...LINE} />
          <rect x={x - 6.5} y="210" width="13" height="3" {...LINE} />
        </g>
      ))}
      {/* inner cella shadow between middle columns */}
      <rect x="86" y="160" width="68" height="49" fill={hx(p)} opacity="0.55" />
      {/* stepped stylobate */}
      <g {...LINE}>
        <rect x="26" y="213" width="188" height="6" fill={h2(p)} />
        <rect x="20" y="219" width="200" height="6" fill={h1(p)} />
        <rect x="14" y="225" width="212" height="6" fill={h2(p)} />
      </g>
      {/* acropolis rock — contours + dense hatch */}
      <g {...FINE}>
        <path
          d="M 8 292 C 20 268 20 250 34 240 C 60 234 84 238 104 234 C 136 238 168 234 196 240 C 214 248 222 268 232 292 Z"
          fill={h1(p)}
          {...LINE}
        />
        <path d="M 30 262 q 20 -10 44 -6 M 96 258 q 26 -8 52 -2 M 160 264 q 24 -8 44 2" opacity="0.8" />
        <path d="M 22 276 q 30 -10 62 -6 M 118 274 q 34 -8 68 0" opacity="0.6" />
        <path d="M 46 250 l 8 6 M 150 248 l 10 5 M 198 256 l 8 7" opacity="0.7" />
        {/* olive scrub */}
        <path d="M 26 240 q 6 -8 14 -5 q 5 -6 12 -2" fill={hd(p)} />
        <path d="M 196 246 q 7 -8 15 -4" fill={hd(p)} />
      </g>
    </svg>
  )
}

/* ---------------- United States — Statue of Liberty ---------------- */
function Liberty() {
  const p = 'us'
  return (
    <svg viewBox="0 0 240 300" style={{ width: '100%', display: 'block' }}>
      <Hatch prefix={p} />
      {/* torch */}
      <g {...LINE}>
        <path d="M 157 34 C 153 26 159 18 163 16 C 161 22 169 24 166 32 C 164 37 159 38 157 34 Z" fill={h2(p)} />
        <rect x="158" y="38" width="7" height="6" fill={h1(p)} />
        <line x1="161" y1="44" x2="155" y2="78" />
        <line x1="166" y1="44" x2="160" y2="80" />
      </g>
      {/* head + 7-ray crown */}
      <g {...LINE}>
        <circle cx="118" cy="92" r="9" fill={h1(p)} />
        <path d="M 110 86 l -8 -8 M 114 83 l -4 -10 M 118 82 l 0 -11 M 122 83 l 4 -10 M 126 86 l 8 -8" {...FINE} />
        <path d="M 109 92 a 9 9 0 0 0 4 8" {...FINE} />
      </g>
      {/* body — robe with fold engraving */}
      <g {...LINE}>
        <path
          d="M 118 101 C 104 106 100 118 100 132 C 96 156 92 176 84 198 L 152 198 C 144 172 142 150 144 128 C 152 118 154 96 160 82 L 148 88 C 140 96 132 100 118 101 Z"
          fill={h1(p)}
        />
        <g {...FINE} opacity="0.9">
          <path d="M 108 118 C 106 142 100 168 94 194 M 118 112 C 116 140 112 168 108 194 M 128 112 C 128 140 126 168 124 194" />
          <path d="M 136 116 C 136 142 136 168 138 194" />
        </g>
        {/* tablet arm */}
        <path d="M 100 132 C 92 128 86 122 84 114" {...LINE} />
        <rect x="72" y="98" width="14" height="20" transform="rotate(-14 79 108)" fill={hx(p)} {...LINE} />
      </g>
      {/* pedestal */}
      <g {...LINE}>
        <rect x="92" y="198" width="52" height="10" fill={h2(p)} />
        <path d="M 96 208 L 92 252 H 144 L 140 208 Z" fill={h1(p)} />
        <rect x="84" y="252" width="68" height="10" fill={h2(p)} />
        <rect x="74" y="262" width="88" height="12" fill={hx(p)} />
        <g {...FINE}>
          <path d="M 104 216 h 28 M 102 226 h 32 M 100 236 h 36" opacity="0.7" />
          <path d="M 112 246 v -18 a 6 6 0 0 1 12 0 v 18" fill="var(--ivory)" />
        </g>
      </g>
      {/* star-fort points + water */}
      <g {...FINE}>
        <path d="M 74 274 l -20 6 h 132 l -24 -6" opacity="0.8" />
        <path d="M 14 288 q 10 -5 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0" opacity="0.55" />
        <path d="M 30 295 q 10 -4 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0" opacity="0.35" />
      </g>
    </svg>
  )
}

/* ---------------- Italy — the Colosseum ---------------- */
function Colosseum() {
  const p = 'it'
  // front-wall arches along the curve, three tiers
  const arch = (x, y, w, h) => `M ${x - w / 2} ${y} v ${-h + w / 2} a ${w / 2} ${w / 2} 0 0 1 ${w} 0 v ${h - w / 2} z`
  const bows = (y, r) => `M 22 ${y} Q 120 ${y + r} 218 ${y}` // wall course following the ellipse
  return (
    <svg viewBox="0 0 240 300" style={{ width: '100%', display: 'block' }}>
      <Hatch prefix={p} />
      {/* inner bowl seen over the broken rim */}
      <g {...LINE}>
        <path d="M 30 132 C 62 112 178 112 210 132 C 196 122 44 122 30 132 Z" fill={h2(p)} />
        <path d="M 44 130 C 84 116 156 116 196 130" {...FINE} />
        <path d="M 56 126 C 92 115 148 115 184 126" {...FINE} opacity="0.7" />
      </g>
      {/* outer wall — tall on the right, broken stepping down to the left */}
      <path
        d="M 22 146 C 22 210 42 262 120 262 C 198 262 218 210 218 146 C 218 120 206 98 188 92 L 188 118 L 166 112 L 166 96 L 144 92 L 144 110 L 122 108 L 96 112 L 72 120 L 50 132 C 34 138 22 132 22 146 Z"
        {...LINE}
        fill={h1(p)}
      />
      {/* tier courses bending with the ellipse */}
      <g {...FINE}>
        <path d={bows(148, 26)} />
        <path d={bows(184, 24)} />
        <path d={bows(218, 20)} />
      </g>
      {/* arches: three tiers, sized/foreshortened toward the edges */}
      <g {...FINE}>
        {[
          { y: 178, h: 22 },
          { y: 214, h: 24 },
          { y: 252, h: 28 },
        ].map(({ y, h }, t) =>
          [-3, -2, -1, 0, 1, 2, 3].map((i) => {
            const x = 120 + i * (30 - t * 2)
            const w = (13 + t * 2) * (1 - Math.abs(i) * 0.11)
            const yy = y + Math.round(Math.cos((i / 3.4) * Math.PI * 0.5) * (8 + t * 2)) - 8
            return <path key={`${t}${i}`} d={arch(x, yy, w, h)} fill={hx(p)} />
          }),
        )}
        {/* attic windows on the surviving high wall */}
        {[176, 194, 208].map((x) => (
          <rect key={x} x={x} y="112" width="7" height="10" fill={hx(p)} />
        ))}
      </g>
      {/* rubble + ground */}
      <g {...FINE}>
        <path d="M 26 268 q 8 -8 18 -4 l 6 6 M 196 270 q 6 -9 16 -6" opacity="0.8" />
        <path d="M 10 280 h 92 M 116 280 h 114" opacity="0.7" />
        <path d="M 24 289 h 74 M 132 289 h 76" opacity="0.4" />
        <path d="M 44 296 h 152" opacity="0.25" />
      </g>
    </svg>
  )
}

/* ---------------- Morocco — Koutoubia minaret ---------------- */
function Koutoubia() {
  const p = 'ma'
  return (
    <svg viewBox="0 0 240 300" style={{ width: '100%', display: 'block' }}>
      <Hatch prefix={p} />
      {/* finial rod with three balls */}
      <g {...LINE}>
        <line x1="120" y1="10" x2="120" y2="34" />
        <circle cx="120" cy="14" r="2.8" fill={h1(p)} />
        <circle cx="120" cy="21" r="3.6" fill={h1(p)} />
        <circle cx="120" cy="29" r="4.4" fill={h1(p)} />
      </g>
      {/* lantern turret with small dome */}
      <g {...LINE}>
        <path d="M 106 52 C 106 42 134 42 134 52 Z" fill={h2(p)} />
        <rect x="104" y="52" width="32" height="26" fill={h1(p)} />
        <path d="M 112 78 v -12 a 8 8 0 0 1 16 0 v 12" fill="var(--ivory)" {...FINE} />
        <path d="M 100 78 h 40" />
        {/* stepped merlons on the main shaft's parapet */}
        <path d="M 84 92 v -8 h 6 v 4 h 6 v -4 h 6 v 4 h 6 v -4 h 6 v 4 h 6 v -4 h 6 v 4 h 6 v -4 h 6 v 4 h 6 v -4 h 6 v 8" {...FINE} />
      </g>
      {/* main shaft */}
      <g {...LINE}>
        <rect x="84" y="92" width="72" height="168" fill={h1(p)} />
        {/* sebka interlace panel */}
        <rect x="92" y="100" width="56" height="42" fill={hx(p)} {...FINE} />
        <g {...FINE} opacity="0.9">
          <path d="M 92 121 l 14 -14 l 14 14 l 14 -14 l 14 14 M 92 121 l 14 14 l 14 -14 l 14 14 l 14 -14" />
        </g>
        {/* paired horseshoe niches, three storeys */}
        {[152, 192, 228].map((y) => (
          <g key={y} {...FINE}>
            <path d={`M 96 ${y + 22} v -14 a 10 10 0 0 1 8 -10 a 10 10 0 0 1 8 10 v 14 z`} fill={hx(p)} />
            <path d={`M 128 ${y + 22} v -14 a 10 10 0 0 1 8 -10 a 10 10 0 0 1 8 10 v 14 z`} fill={hx(p)} />
            <path d={`M 92 ${y + 26} h 56`} opacity="0.7" />
          </g>
        ))}
      </g>
      {/* ramparts with gate + palm */}
      <g {...LINE}>
        <path d="M 20 278 v -14 h 6 v 5 h 8 v -5 h 6 v 5 h 8 v -5 h 6 v 5 h 8 v -5 h 6 v 14" {...FINE} fill={h2(p)} />
        <path d="M 156 278 v -14 h 6 v 5 h 8 v -5 h 6 v 5 h 8 v -5 h 6 v 5 h 8 v -5 h 6 v 14" {...FINE} fill={h2(p)} />
        <path d="M 44 278 v -18 a 12 12 0 0 1 24 0 v 18" fill={hx(p)} {...FINE} />
        {/* palm */}
        <path d="M 196 278 C 194 262 194 250 198 240" {...FINE} />
        <g {...FINE}>
          <path d="M 198 240 C 190 234 183 234 177 238 M 198 240 C 193 229 187 225 180 226 M 198 240 C 200 229 206 223 213 225 M 198 240 C 206 233 212 235 216 242 M 198 240 C 204 242 208 248 209 255" />
        </g>
      </g>
      {/* ground */}
      <g {...FINE}>
        <path d="M 12 284 H 228" opacity="0.7" />
        <path d="M 24 291 h 84 M 124 291 h 92" opacity="0.4" />
      </g>
    </svg>
  )
}

const ENGRAVINGS = {
  eastasia: <Pagoda />,
  levant: <DomeOfTheRock />,
  greece: <Parthenon />,
  usa: <Liberty />,
  italy: <Colosseum />,
  morocco: <Koutoubia />,
}

// Art fades out toward the page head so the country title and story stay crisp.
const FADE =
  'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 58%, rgba(0,0,0,0.3) 84%, transparent 98%)'

/** Full-page engraved landmark behind a country page's content.
 *  Multiply-blended onto the guilloché so the line work soaks into the
 *  paper like printed intaglio instead of sitting on top of it. */
export function PageArt({ id }) {
  const raster = rasterFor(id)
  const mask = { maskImage: FADE, WebkitMaskImage: FADE }
  if (raster) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${raster.url})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center bottom',
          pointerEvents: 'none',
          // ink plates composite plainly (fast); raw drops blend live
          ...(raster.ink
            ? { opacity: 0.5 }
            : { filter: 'grayscale(1)', mixBlendMode: 'multiply', opacity: 0.42, ...mask }),
        }}
      />
    )
  }
  return (
    <div
      style={{
        position: 'absolute',
        inset: '0 0 14px 0',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 10px',
        color: 'var(--charcoal)',
        mixBlendMode: 'multiply',
        opacity: 0.16,
        pointerEvents: 'none',
        ...mask,
      }}
    >
      {ENGRAVINGS[id] || null}
    </div>
  )
}
