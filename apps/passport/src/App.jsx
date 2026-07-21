import React from 'react'
import { IOSDevice } from './components/IOSFrame'
import { Book } from './components/Book'
import { StampPress } from './components/StampPress'
import { Reward } from './components/Reward'
import { MilestoneSheet } from './components/MilestoneSheet'
import { REWARD_TIERS, COUNTRIES, SLOT_ROTS } from './data/passport'
import { getConfig, fetchPassport, POLL_MS } from './api'

/**
 * Miraz World — Flavor Passport (customer app).
 *
 * LIVE mode (?code=MW-XXXXX&api=…): the passport is READ-ONLY. Stamps are
 * issued by staff in the admin portal and appear here by polling — when the
 * stamped country's page is open, the rubber press plays on the guest's
 * phone the moment staff stamps it.
 *
 * DEMO mode (no code, or ?demo=1): tap-to-stamp stays enabled for previews.
 */
export default function App() {
  const cfg = React.useMemo(getConfig, [])
  const [opened, setOpened] = React.useState(false)
  const [screen, setScreen] = React.useState('book') // 'book' | 'reward'
  const [collected, setCollected] = React.useState([])
  const [pressing, setPressing] = React.useState(null) // { c, slotId, x, y, rot }
  const [milestone, setMilestone] = React.useState(null)
  const [holder, setHolder] = React.useState(null) // live passport identity
  const [shake, setShake] = React.useState(false)

  const containerRef = React.useRef(null)
  const collectedRef = React.useRef(collected)
  collectedRef.current = collected
  const pressingRef = React.useRef(pressing)
  pressingRef.current = pressing

  const [isPhone, setIsPhone] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 500px)').matches,
  )
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 500px)')
    const onChange = (e) => setIsPhone(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const timers = React.useRef([])
  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // milestone detection on any total-count crossing
  const checkMilestone = (prevTotal, nextTotal) => {
    const crossed = REWARD_TIERS.filter((t) => prevTotal < t.n && nextTotal >= t.n)
    if (crossed.length) {
      const tier = crossed[crossed.length - 1]
      timers.current.push(setTimeout(() => setMilestone(tier), 420))
    }
  }

  // play the press ceremony at a slot, then commit the stamp
  const pressAt = (c, slotId, rect, rot) => {
    const box = containerRef.current?.getBoundingClientRect()
    const x = rect.x + rect.width / 2 - (box?.x ?? 0)
    const y = rect.y + rect.height / 2 - (box?.y ?? 0)
    setPressing({ c, slotId, x, y, rot })
    timers.current.push(
      setTimeout(() => setShake(true), 620),
      setTimeout(() => setShake(false), 960),
      setTimeout(() => {
        setCollected((prev) => {
          if (prev.includes(slotId)) return prev
          const next = [...prev, slotId]
          checkMilestone(prev.length, next.length)
          return next
        })
        setPressing(null)
      }, 1420),
    )
  }

  // DEMO mode only — guests cannot stamp their own passport in live mode
  const pick = (c, slotId, rect, rot) => {
    if (cfg.live || pressingRef.current) return
    pressAt(c, slotId, rect, rot)
  }

  /* ---- live mode: poll the API; staff stamps land on the guest's phone ---- */
  React.useEffect(() => {
    if (!cfg.live) return
    let stop = false
    const tick = async () => {
      try {
        const data = await fetchPassport(cfg)
        if (stop) return
        setHolder(data.passport)
        const ids = data.stamps.map((s) => `${s.country}-${s.slot}`)
        const prev = collectedRef.current
        const fresh = ids.filter((id) => !prev.includes(id))
        if (!fresh.length) return
        // if a freshly-stamped slot is on-screen, play the press on it live
        const visible =
          !pressingRef.current &&
          fresh
            .map((id) => ({ id, el: document.querySelector(`[data-slot="${id}"][data-stamped="false"]`) }))
            .find((f) => f.el && f.el.getBoundingClientRect().width > 0)
        const withoutVisible = visible ? ids.filter((id) => id !== visible.id) : ids
        setCollected((p) => {
          checkMilestone(p.length, withoutVisible.length)
          return withoutVisible
        })
        if (visible) {
          const [countryId, slotStr] = visible.id.split(/-(?=\d+$)/)
          const c = COUNTRIES.find((x) => x.id === countryId)
          const rot = SLOT_ROTS[Number(slotStr)] ?? -4
          if (c) pressAt(c, visible.id, visible.el.getBoundingClientRect(), rot)
        }
      } catch {
        /* offline blip — the next poll retries */
      }
    }
    tick()
    const iv = setInterval(tick, POLL_MS)
    return () => {
      stop = true
      clearInterval(iv)
    }
  }, [cfg])

  const reset = () => {
    if (!cfg.live) setCollected([])
    setOpened(false)
    setMilestone(null)
    setScreen('book')
  }

  const content = (
    <div ref={containerRef} style={{ position: 'relative', height: '100%' }}>
      {screen === 'reward' ? (
        <div className="screen" style={{ height: '100%' }}>
          <Reward onReset={reset} />
        </div>
      ) : (
        <Book
          opened={opened}
          shake={shake}
          collected={collected}
          holder={holder}
          code={cfg.live ? cfg.code : ''}
          canStamp={!cfg.live}
          onOpen={() => setOpened(true)}
          onClose={() => setOpened(false)}
          onPick={pick}
          onClaim={() => setScreen('reward')}
        />
      )}
      {pressing && <StampPress c={pressing.c} x={pressing.x} y={pressing.y} rot={pressing.rot} />}
      {milestone && screen === 'book' && (
        <MilestoneSheet
          tier={milestone}
          onClose={() => setMilestone(null)}
          onClaim={() => {
            setMilestone(null)
            setScreen('reward')
          }}
        />
      )}
      {!cfg.live && (
        <div
          dir="ltr"
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            zIndex: 80,
            fontFamily: 'var(--font-sans)',
            fontSize: 9,
            letterSpacing: '0.22em',
            color: 'var(--brass)',
            border: '1px solid rgba(181,139,76,0.45)',
            borderRadius: 999,
            padding: '4px 10px',
            opacity: 0.85,
            pointerEvents: 'none',
          }}
        >
          DEMO · تجريبي
        </div>
      )}
    </div>
  )

  if (isPhone) {
    return <div style={{ position: 'fixed', inset: 0, background: '#120f0b', overflow: 'hidden' }}>{content}</div>
  }

  const dark = screen !== 'reward'
  return <IOSDevice dark={dark}>{content}</IOSDevice>
}
