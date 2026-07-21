import React from 'react'
import { PAGE_BG, GRAND_REWARDS } from '../data/passport'
import { MARK_GOLD } from '../assets'
import { Button } from './Button'
import { Eyebrow } from './Eyebrow'
import { WorldMapWatermark, RewardIcon } from './Watermarks'

/**
 * Miraz World rewards — shown once all 36 stamps are collected: the three
 * grand rewards from the brief, over a faint world map, with a claim code.
 */
export function Reward({ onReset }) {
  return (
    <div
      style={{
        height: '100%',
        ...PAGE_BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '54px 28px 40px',
        boxSizing: 'border-box',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <WorldMapWatermark opacity={0.06} />
      <div style={{ position: 'absolute', inset: 14, border: '1px double var(--brass)', borderRadius: 6, opacity: 0.5 }} />
      <img src={MARK_GOLD} alt="" style={{ height: 64, marginBottom: 18, position: 'relative' }} />
      <Eyebrow color="accent">
        رحلتك اكتملت · <span dir="ltr">MIRAZ WORLD</span>
      </Eyebrow>
      <h2 lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 30, margin: '12px 0 0', color: 'var(--text-primary)', lineHeight: 1.25, position: 'relative' }}>
        لقد طُفت عالم النكهات
      </h2>
      <p dir="ltr" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text-muted)', margin: '6px 0 0', position: 'relative' }}>
        You've travelled the world of flavors
      </p>

      <div style={{ margin: '22px 0', width: '100%', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
        {GRAND_REWARDS.map((r) => (
          <div
            key={r.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              textAlign: 'start',
              border: '1px solid var(--brass)',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(181,139,76,0.08)',
              padding: '13px 16px',
            }}
          >
            <RewardIcon kind={r.icon} />
            <div>
              <div lang="ar" style={{ fontFamily: 'var(--font-sans-ar)', fontSize: 13.5, color: 'var(--text-primary)' }}>{r.ar}</div>
              <div dir="ltr" style={{ fontFamily: 'var(--font-sans)', fontSize: 8.5, letterSpacing: '0.16em', color: 'var(--brass-deep)', marginTop: 2 }}>{r.en}</div>
            </div>
          </div>
        ))}
      </div>

      <div dir="ltr" style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.3em', fontSize: 14, color: 'var(--brass-deep)', marginBottom: 18, position: 'relative' }}>
        MIRAZ · WORLD · 36
      </div>
      <Button variant="secondary" onClick={onReset} style={{ width: '100%', position: 'relative' }}>
        عرض الجواز في المطعم
      </Button>
    </div>
  )
}
