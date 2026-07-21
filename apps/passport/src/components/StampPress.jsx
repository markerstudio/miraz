import React from 'react'
import { INK } from '../data/passport'
import { Stamp } from './Stamp'

// Printed impression matches the passport slot size.
const PRINT = 74
const DIE = 100
// Tool column ≈ 46+13+12+25+(DIE+3) ≈ 199px with the die at the bottom, so
// its centre sits ~149px below the column top: anchoring at y-149 lands the
// die exactly on the slot when the press bottoms out at translateY(0).
const DIE_CENTRE_OFFSET = 149

/**
 * Rubber-stamp press — a turned-wood handle with a brass collar and a
 * mirrored rubber die drops in perspective onto the exact slot that was
 * tapped (x/y in app coordinates, rot matching the slot's tilt), bottoms
 * out with a bounce (the book jolts), leaves an impact ripple and a fresh
 * inked impression, then lifts away.
 */
export function StampPress({ c, x, y, rot = -4 }) {
  const ink = INK[c.ink]
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 45,
        pointerEvents: 'none',
        overflow: 'hidden',
        perspective: 900,
      }}
    >
      {/* fresh ink left on the page + impact ripple */}
      <div style={{ position: 'absolute', top: y, left: x, width: PRINT, height: PRINT, transform: 'translate(-50%,-50%)' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${rot}deg)` }}>
          <Stamp c={c} size={PRINT} fresh />
        </div>
        <div style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: `1.6px solid ${ink}`, opacity: 0, animation: 'impactRing 520ms 640ms ease-out' }} />
      </div>

      {/* the die's shadow, growing as it approaches */}
      <div
        style={{
          position: 'absolute',
          top: y,
          left: x,
          width: DIE + 8,
          height: DIE + 8,
          borderRadius: '50%',
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.4), transparent 70%)',
          animation: 'toolShadow 1400ms cubic-bezier(0.5,0,0.2,1) both',
        }}
      />

      {/* the stamp tool */}
      <div style={{ position: 'absolute', top: y - DIE_CENTRE_OFFSET, left: x, animation: 'toolPress 1400ms cubic-bezier(0.5,0,0.2,1) both' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', filter: 'drop-shadow(0 12px 16px rgba(0,0,0,0.35))' }}>
          {/* turned wooden knob */}
          <div
            style={{
              width: 40,
              height: 46,
              borderRadius: '50% 50% 42% 42% / 62% 62% 34% 34%',
              background:
                'radial-gradient(60% 45% at 32% 22%, rgba(190,150,105,0.5), transparent 60%), ' +
                'linear-gradient(180deg, #7d5b3d 0%, #5c412c 55%, #3f2c1e 100%)',
            }}
          />
          {/* neck */}
          <div style={{ width: 14, height: 16, background: 'linear-gradient(90deg, #4a3423, #6b4d34 45%, #3a2a1c)', borderRadius: '0 0 3px 3px', marginTop: -3 }} />
          {/* brass collar */}
          <div style={{ width: 66, height: 10, background: 'linear-gradient(180deg, #d9b87f, #a37c47 60%, #7c5c34)', borderRadius: 4, marginTop: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.4)' }} />
          {/* rubber mount */}
          <div style={{ width: 106, height: 22, background: 'linear-gradient(180deg, #2b2825, #191614)', borderRadius: '7px 7px 10px 10px', marginTop: 3 }} />
          {/* die face — mirrored, like a real rubber stamp */}
          <div
            style={{
              width: DIE,
              height: DIE,
              borderRadius: '50%',
              marginTop: 3,
              background: 'radial-gradient(70% 70% at 50% 40%, #24211d, #131110)',
              border: `2.5px solid ${ink}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.7)',
            }}
          >
            <div style={{ transform: `rotate(${rot}deg) scaleX(-1)`, opacity: 0.85, color: ink }}>
              <Stamp c={{ ...c }} size={88} press />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
