import React from 'react'
import { INK } from '../data/passport'
import { INK_MASK } from '../data/textures'
import { MARK } from '../assets'

/**
 * Border-stamp silhouettes — each country stamps in its own shape, like real
 * entry stamps: seal-square (East Asia), circle (Levant), oval (Greece),
 * rectangle (USA), hexagon (Italy), horseshoe arch (Morocco).
 * Drawn as an outer + inner outline in the stamp's ink; `dashed` renders the
 * empty slot's silhouette.
 */
export function ShapeOutline({ shape = 'circle', dashed = false }) {
  const outer = { fill: 'none', stroke: 'currentColor', strokeWidth: dashed ? 1.6 : 3.2, strokeDasharray: dashed ? '3 4.5' : 'none' }
  const inner = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, opacity: 0.65 }
  const geom = (props, key) => {
    switch (shape) {
      case 'seal':
        return <rect key={key} x="6" y="6" width="88" height="88" rx="17" {...props} />
      case 'oval':
        return <ellipse key={key} cx="50" cy="50" rx="47" ry="34" {...props} />
      case 'rect':
        return <rect key={key} x="3" y="18" width="94" height="64" rx="7" {...props} />
      case 'hex':
        return <path key={key} d="M8 50 L27 16 H73 L92 50 L73 84 H27 Z" {...props} />
      case 'arch':
        return <path key={key} d="M21 91 V47 C21 32 29 20 40 15 C46 12 54 12 60 15 C71 20 79 32 79 47 V91 Z" {...props} />
      default:
        return <circle key={key} cx="50" cy="50" r="47" {...props} />
    }
  }
  return (
    <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {geom(outer, 'o')}
      {!dashed && <g transform="translate(50 50) scale(0.85) translate(-50 -50)">{geom(inner, 'i')}</g>}
    </svg>
  )
}

/**
 * Ink stamp face — the impression left in the passport: the country's own
 * stamp silhouette, its name (EN), the folded-map mark, the Arabic name, and
 * MIRAZ. On the page the ink is speckle-masked and multiply-blended so it
 * soaks into the guilloché like a real impression. `press` renders the clean
 * relief version for the rubber die face. `fresh` plays the ink-drop
 * keyframe (squish and settle) when a new stamp lands.
 */
export function Stamp({ c, size = 120, fresh = false, press = false }) {
  const ink = INK[c.ink]
  const shape = c.shape || 'circle'
  // wide/low shapes get slightly smaller innards so nothing kisses the frame
  const k = shape === 'oval' || shape === 'rect' ? 0.84 : shape === 'hex' ? 0.9 : 1
  const inkTexture = press
    ? {}
    : {
        WebkitMaskImage: `url("${INK_MASK}")`,
        maskImage: `url("${INK_MASK}")`,
        WebkitMaskSize: '210px',
        maskSize: '210px',
        mixBlendMode: 'multiply',
      }
  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        color: ink,
        filter: 'contrast(1.05)',
        animation: fresh ? 'inkStamp 520ms 700ms both' : 'none',
        opacity: fresh ? 0 : 0.92,
        ...inkTexture,
      }}
    >
      <ShapeOutline shape={shape} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          // wide/low silhouettes need extra headroom so type clears the frame
          padding: `${size * (shape === 'rect' || shape === 'oval' ? 0.23 : 0.14)}px ${size * 0.12}px`,
          boxSizing: 'border-box',
        }}
      >
        <span dir="ltr" style={{ fontFamily: 'var(--font-sans)', fontSize: size * 0.062 * k, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.85, whiteSpace: 'nowrap' }}>
          {c.en}
        </span>
        <img src={MARK[c.ink]} alt="" style={{ height: size * 0.22 * k, margin: `${size * 0.025}px 0`, opacity: 0.92 }} />
        <span lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: size * 0.13 * k, lineHeight: 1.1 }}>
          {c.ar}
        </span>
        <span dir="ltr" style={{ fontFamily: 'var(--font-sans)', fontSize: size * 0.05 * k, letterSpacing: '0.22em', opacity: 0.7, marginTop: size * 0.015 }}>
          MIRAZ
        </span>
      </div>
    </div>
  )
}

/**
 * A stamp slot — a collected Stamp, or the country's empty silhouette
 * (dashed, with the faint house-logo watermark the brief asks for).
 * Tap an empty one to stamp your visit.
 */
export function Slot({ c, slotId, has, rot, onPick, size = 104, interactive = true }) {
  return (
    <div
      data-slot={slotId}
      data-stamped={has ? 'true' : 'false'}
      onClick={(e) => interactive && !has && onPick(c, slotId, e.currentTarget.getBoundingClientRect(), rot)}
      style={{
        position: 'relative',
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: interactive && !has ? 'pointer' : 'default',
        transform: `rotate(${rot}deg)`,
      }}
    >
      {has ? (
        <Stamp c={c} size={size} />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.8,
            color: 'rgba(44,42,40,0.4)',
          }}
        >
          <ShapeOutline shape={c.shape || 'circle'} dashed />
          {/* faint house-logo watermark inside every empty slot */}
          <img src={MARK.charcoal} alt="" style={{ height: size * 0.3, opacity: 0.1 }} />
        </div>
      )}
    </div>
  )
}
