import React from 'react'
import { TOTAL_STAMPS } from '../data/passport'
import { MARK_GOLD } from '../assets'
import { Button } from './Button'

/**
 * Reward-unlocked sheet — slides up when the total stamp count crosses a
 * tier of the rewards ladder (3, 6, 9, 12, 18, 24, 36).
 */
export function MilestoneSheet({ tier, onClose, onClaim }) {
  const final = tier.n >= TOTAL_STAMPS
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 55, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(20,19,15,0.5)', animation: 'fadeIn 200ms both' }} />
      <div
        style={{
          position: 'relative',
          background: 'var(--ivory)',
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          padding: '26px 24px 34px',
          textAlign: 'center',
          animation: 'sheetUp 460ms cubic-bezier(0.24, 1.06, 0.36, 1) both',
        }}
      >
        <div style={{ width: 40, height: 4, background: 'var(--line-strong)', borderRadius: 99, margin: '0 auto 18px' }} />
        <img src={MARK_GOLD} alt="" style={{ height: 40, marginBottom: 12 }} />
        <div dir="ltr" style={{ fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '0.26em', color: 'var(--brass-deep)' }}>
          {tier.n} STAMPS · {tier.en}
        </div>
        <div lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 22, color: 'var(--text-primary)', margin: '10px 0 4px' }}>
          ربحت مكافأة جديدة!
        </div>
        <p lang="ar" style={{ fontFamily: 'var(--font-sans-ar)', fontSize: 14, lineHeight: 1.9, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
          {tier.ar}
        </p>
        {final ? (
          <Button variant="primary" onClick={onClaim} style={{ width: '100%' }}>
            استلام جوائز عالم ميراز
          </Button>
        ) : (
          <Button variant="primary" onClick={onClose} style={{ width: '100%' }}>
            متابعة الرحلة
          </Button>
        )}
      </div>
    </div>
  )
}
