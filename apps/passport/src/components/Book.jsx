import React from 'react'
import QRCode from 'qrcode'
import { COUNTRIES, PAGE_BG, HOLDER, GRAND_REWARDS, REWARD_TIERS, RULES, SLOTS_PER_COUNTRY, SLOT_ROTS, TOTAL_STAMPS } from '../data/passport'
import { FRIEZE } from '../assets'
import { MARK_CHARCOAL, MARK_GOLD } from '../assets'
import { NOISE } from '../data/textures'
import { WorldMapWatermark, RewardIcon } from './Watermarks'
import { PageArt } from './LandmarkArt'
import { Slot } from './Stamp'

const EASE_BOOK = 'cubic-bezier(0.6, 0.05, 0.22, 1)'

// A short haptic tick on page landings — silently absent on iOS Safari.
const buzz = (ms = 8) => {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* not available */
  }
}

// Tapping the outer edges of the screen turns the page (RTL: left = forward).
const EDGE_TAP_FRAC = 0.2

// ---- page physics (degrees / seconds) ----
const GRAVITY = 2400 // angular pull toward the resting pose
const AIR_DRAG = 1.4 // paper flutter losses
const BOUNCE = 0.24 // restitution when the leaf hits the pile
const FLICK_V = 260 // release velocity that throws a page over
const MAX_DRAG_ANGLE = 175
const SWEEP = 230 // degrees of turn per full-page-width drag (higher = easier)

// Turned pages don't vanish — they rest in a visible fan on the open cover.
// The most recent page lies on top (most upright), older ones settle flatter.
const REST_TOP = 146
const FAN = 3
const REST_MAX = 163
const restAngle = (i, p) => Math.min(REST_TOP + (p - 1 - i) * FAN, REST_MAX)

// The passport's ONE physical size — identical closed and open.
const BOOK = { width: 296, height: 432 }
const PAGE_W = BOOK.width - 9 // leaf width inside the spine inset
const COVER_ANGLE = 166 // the cover rests slightly proud of flat — always visible

// Olive-green leather with a warm key light — the brief's premium زيتي cover.
const LEATHER = {
  background:
    'radial-gradient(120% 90% at 30% 12%, rgba(255,240,200,0.07), transparent 55%), ' +
    'linear-gradient(118deg, #333A2B 0%, #3D4533 38%, #242A1D 78%, #181D13 100%)',
}
const COVER_RADIUS = '16px 5px 5px 16px' // rounded fore-edge (left), tight spine (right)
const PAGE_RADIUS = '10px 2px 2px 10px'

// Engraved gold foil (highlight below, shadow above).
const ENGRAVE = { textShadow: '0 -1px 1px rgba(0,0,0,0.75), 0 1px 1px rgba(255,228,170,0.16)' }

function Grain({ opacity, size = 200, radius }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: radius,
        backgroundImage: `url("${NOISE}")`,
        backgroundSize: size,
        opacity,
        pointerEvents: 'none',
      }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Page contents — sized for a real passport leaf (287×422)            */
/* ------------------------------------------------------------------ */

const eyebrow = {
  fontFamily: 'var(--font-sans)',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--brass-deep)',
}

/** Fixed page canvas: watermark behind, content column. */
function PageShell({ wm, children, justify = 'center', style = {} }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {wm}
      <div
        style={{
          position: 'absolute',
          inset: '0 0 22px 0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: justify,
          padding: '16px 16px 0',
          boxSizing: 'border-box',
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/** Inside cover — world map + looping plane + the journey sentence. */
function WelcomePage() {
  return (
    <PageShell wm={<WorldMapWatermark opacity={0.08} plane />}>
      <div style={{ textAlign: 'center' }}>
        <img src={MARK_CHARCOAL} alt="" style={{ height: 24, opacity: 0.75, margin: '0 auto 16px' }} />
        <div dir="ltr" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-primary)' }}>
          Here you can begin your journey
          <br />
          into the world of flavors
        </div>
        <div lang="ar" style={{ fontFamily: 'var(--font-sans-ar)', fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 8 }}>
          هنا يمكنك أن تبدأ رحلتك في عالم النكهات
        </div>
      </div>
    </PageShell>
  )
}

/** Holder data page — real guest identity in live mode, a scannable QR of
 *  the passport code (staff scan it to stamp), and the MRZ strip. */
function HolderPage({ holder, code }) {
  const [qr, setQr] = React.useState('')
  const theCode = code || HOLDER.no.replace('‑', '-')
  React.useEffect(() => {
    QRCode.toDataURL(theCode, { width: 160, margin: 0, color: { dark: '#2C2A28', light: '#0000' } })
      .then(setQr)
      .catch(() => {})
  }, [theCode])
  const fmt = (iso) => (iso ? iso.slice(0, 10).split('-').reverse().join(' · ') : '')
  const fields = holder
    ? [
        ['Name / الاسم', holder.name || 'ضيف ميراز'],
        ['Date of birth / تاريخ الميلاد', holder.dob || '— / — / —'],
        ['Phone / رقم الهاتف', holder.phone || '—'],
        ['Issued / تاريخ الإصدار', fmt(holder.issued_at)],
        ['Expires / تاريخ الانتهاء', fmt(holder.expires_at)],
      ]
    : HOLDER.fields
  return (
    <PageShell justify="center">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div dir="ltr" style={{ ...eyebrow, fontSize: 7.5 }}>Miraz World · Flavor Passport</div>
          <div lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 15, color: 'var(--text-primary)', marginTop: 3 }}>
            بيانات المسافر
          </div>
          <div dir="ltr" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: 10 }}>Holder information</div>
        </div>
        <img src={MARK_CHARCOAL} alt="" style={{ height: 22, opacity: 0.9 }} />
      </div>

      <div style={{ display: 'flex', gap: 11, marginTop: 12 }}>
        {/* the guest's QR — staff scan this to stamp the visit */}
        <div style={{ width: 62, flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ width: 62, height: 62, background: 'rgba(251,249,244,0.85)', border: '1px solid var(--line-medium)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {qr ? <img src={qr} alt="" style={{ width: 50, height: 50 }} draggable={false} /> : <img src={MARK_CHARCOAL} alt="" style={{ height: 26, opacity: 0.35 }} />}
          </div>
          <div dir="ltr" style={{ fontFamily: 'var(--font-sans)', fontSize: 6.8, letterSpacing: '0.14em', color: 'var(--brass-deep)' }}>{theCode}</div>
          <div lang="ar" style={{ fontFamily: 'var(--font-sans-ar)', fontSize: 6.5, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            يمسحه الطاقم لختم زيارتك
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {fields.map(([k, v]) => (
            <div key={k} style={{ borderBottom: '1px solid var(--line-soft)', paddingBottom: 2.5 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 6.2, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{k}</div>
              <div lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 10.5, color: 'var(--text-primary)', lineHeight: 1.3 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        dir="ltr"
        style={{
          marginTop: 11,
          padding: '5px 7px',
          background: 'rgba(44,42,40,0.05)',
          borderTop: '1px solid var(--line-medium)',
          borderBottom: '1px solid var(--line-medium)',
          fontFamily: 'var(--font-sans)',
          fontSize: 7.5,
          letterSpacing: '0.14em',
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        P&lt;MIRAZWORLD&lt;GUEST&lt;&lt;EPICUREAN&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
        <br />
        {theCode.replace('-', '')}&lt;7PSE&lt;&lt;FLAVOR&lt;PASSPORT&lt;&lt;&lt;&lt;36
      </div>
    </PageShell>
  )
}

/** One country: EN name at the page head, the story, then six stamp slots. */
function CountryPage({ c, collected, onPick, canStamp, active = false }) {
  const stamped = (i) => collected.includes(`${c.id}-${i}`)
  const count = Array.from({ length: SLOTS_PER_COUNTRY }).filter((_, i) => stamped(i)).length
  return (
    <PageShell wm={<PageArt id={c.id} />} justify="center" style={{ padding: '14px 14px 0' }}>
      <div style={{ textAlign: 'center' }}>
        <div dir="ltr" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, letterSpacing: '0.17em', color: 'var(--text-primary)' }}>{c.en}</div>
        <div lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 11.5, color: 'var(--brass-deep)', marginTop: 1 }}>{c.ar}</div>
        <div style={{ width: 32, height: 1, background: 'var(--brass)', opacity: 0.55, margin: '7px auto 0' }} />
      </div>
      <p lang="ar" dir="rtl" style={{ fontFamily: 'var(--font-sans-ar)', fontSize: 9.5, lineHeight: 1.62, color: 'var(--text-secondary)', textAlign: 'center', margin: '8px auto 0', maxWidth: 245 }}>
        {c.story}
      </p>
      <div dir="ltr" style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 7.5, letterSpacing: '0.18em', color: 'var(--brass-deep)', margin: '6px 0 0' }}>
        {count} / {SLOTS_PER_COUNTRY}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '9px 6px', padding: '6px 4px 0' }}>
        {Array.from({ length: SLOTS_PER_COUNTRY }).map((_, i) => (
          <Slot key={i} c={c} slotId={`${c.id}-${i}`} has={stamped(i)} rot={SLOT_ROTS[i]} onPick={onPick} size={74} interactive={canStamp} ovi={active} />
        ))}
      </div>
    </PageShell>
  )
}

/** Miraz World — the three grand rewards + the photo moment. */
function MirazWorldPage({ done, onClaim }) {
  return (
    <PageShell wm={<WorldMapWatermark opacity={0.07} />} justify="center" style={{ textAlign: 'center', padding: '14px 16px 0' }}>
      <div dir="ltr" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, letterSpacing: '0.19em', color: 'var(--text-primary)' }}>MIRAZ WORLD</div>
      <div lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 11, color: 'var(--brass-deep)', marginTop: 1 }}>عالم ميراز</div>
      <img src={MARK_GOLD} alt="" style={{ height: 26, margin: '8px auto 0' }} />
      <p lang="ar" style={{ fontFamily: 'var(--font-sans-ar)', fontSize: 9.5, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '6px 0 8px' }}>
        أكمل أختام الدول الست لتدخل عالم ميراز وتربح:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'start' }}>
        {GRAND_REWARDS.map((r) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 9, border: '1px solid var(--line-medium)', borderRadius: 'var(--radius-md)', padding: '6px 9px', background: 'rgba(251,249,244,0.6)' }}>
            <RewardIcon kind={r.icon} size={17} />
            <div>
              <div lang="ar" style={{ fontFamily: 'var(--font-sans-ar)', fontSize: 9.5, color: 'var(--text-primary)' }}>{r.ar}</div>
              <div dir="ltr" style={{ fontFamily: 'var(--font-sans)', fontSize: 6, letterSpacing: '0.15em', color: 'var(--text-muted)', marginTop: 1 }}>{r.en}</div>
            </div>
          </div>
        ))}
      </div>
      {done ? (
        <div
          onClick={onClaim}
          style={{ marginTop: 8, padding: '8px 11px', background: 'var(--charcoal)', color: 'var(--ivory)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'start' }}
        >
          <div>
            <div lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 11.5 }}>اكتملت رحلتك حول العالم!</div>
            <div lang="ar" style={{ fontFamily: 'var(--font-sans-ar)', fontSize: 8.5, color: 'var(--brass-soft)', marginTop: 1 }}>اضغط لاستلام جوائز عالم ميراز</div>
          </div>
          <span style={{ color: 'var(--brass)', fontSize: 14 }}>←</span>
        </div>
      ) : (
        <div style={{ marginTop: 8, border: '1px dashed var(--line-strong)', borderRadius: 'var(--radius-md)', padding: '7px 9px', opacity: 0.8 }}>
          <RewardIcon kind="camera" size={15} color="var(--text-muted)" />
          <div lang="ar" style={{ fontFamily: 'var(--font-sans-ar)', fontSize: 8.5, color: 'var(--text-muted)', marginTop: 3 }}>
            لحظتك التذكارية مع طاقم ميراز — والختم الذهبي
          </div>
        </div>
      )}
    </PageShell>
  )
}

/** Memories page — ruled lines under a faint world map. */
function NotesPage() {
  return (
    <PageShell wm={<WorldMapWatermark opacity={0.045} />} justify="flex-start" style={{ textAlign: 'center', padding: '20px 18px 0' }}>
      <div lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 13.5, color: 'var(--text-primary)' }}>
        حيث تتحول النكهات إلى ذكريات
      </div>
      <div lang="ar" style={{ fontFamily: 'var(--font-sans-ar)', fontSize: 9.5, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.7 }}>
        كل طبق تذوقته أصبح جزءًا من قصة يمكن مشاركتها هنا
      </div>
      <div
        style={{
          margin: '12px 2px',
          flex: 1,
          minHeight: 90,
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 21px, var(--line-medium) 21px 22px)',
        }}
      />
      <div lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 9.5, color: 'var(--brass-deep)', lineHeight: 1.9, paddingBottom: 4 }}>
        شكرًا لكونك جزءًا من عالم ميراز
        <br />
        عد مجددًا، واصنع ذكريات جديدة مع من تحب
      </div>
    </PageShell>
  )
}

/** Last page — the rewards ladder and the passport rules. */
function RewardsPage({ total }) {
  return (
    <PageShell justify="flex-start" style={{ padding: '14px 16px 0' }}>
      <div dir="ltr" style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12.5, letterSpacing: '0.11em', color: 'var(--text-primary)' }}>
        Miraz Passport – Rewards
      </div>
      <div style={{ width: 32, height: 1, background: 'var(--brass)', opacity: 0.55, margin: '6px auto 4px' }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {REWARD_TIERS.map((t) => {
          const hit = total >= t.n
          return (
            <div key={t.n} style={{ display: 'flex', alignItems: 'baseline', gap: 7, padding: '3.6px 0', borderBottom: '1px solid var(--line-soft)', opacity: hit ? 1 : 0.85 }}>
              <span dir="ltr" style={{ fontFamily: 'var(--font-sans)', fontSize: 7.5, letterSpacing: '0.12em', color: hit ? 'var(--brass-deep)' : 'var(--text-muted)', whiteSpace: 'nowrap', minWidth: 76 }}>
                {t.n} STAMPS · {hit ? '◆' : '◇'}
              </span>
              <span style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                <span dir="ltr" style={{ fontFamily: 'var(--font-sans)', fontSize: 6.8, letterSpacing: '0.1em', color: 'var(--text-primary)' }}>{t.en}</span>
                <span lang="ar" style={{ fontFamily: 'var(--font-sans-ar)', fontSize: 8.5, color: 'var(--text-secondary)' }}>{t.ar}</span>
              </span>
            </div>
          )
        })}
      </div>
      <div lang="ar" style={{ marginTop: 7 }}>
        {RULES.map((r) => (
          <div key={r} style={{ display: 'flex', gap: 5, fontFamily: 'var(--font-sans-ar)', fontSize: 7.8, color: 'var(--text-muted)', lineHeight: 1.75 }}>
            <span style={{ color: 'var(--brass-deep)' }}>·</span>
            <span>{r}</span>
          </div>
        ))}
      </div>
    </PageShell>
  )
}

/* ------------------------------------------------------------------ */
/* The book — all hot-path motion writes straight to the DOM (refs),   */
/* like a native flip card: React renders structure, never frames      */
/* ------------------------------------------------------------------ */

export function Book({ opened, onOpen, onClose, collected, holder, code, canStamp = true, onPick, onClaim, shake }) {
  const total = collected.length
  const done = total >= TOTAL_STAMPS

  const [page, setPage] = React.useState(0)
  const [flying, setFlying] = React.useState(null) // leaf in gesture/flight (2 renders per turn)
  const [coverBehind, setCoverBehind] = React.useState(false)
  const [backView, setBackView] = React.useState(false) // closed book flipped to its back

  const leafEls = React.useRef({}) // i -> leaf node
  const liftEls = React.useRef({}) // i -> recto shading node
  const shadeEl = React.useRef(null) // shade cast on the page beneath
  const carryEl = React.useRef(null) // closed-book carry wrapper
  const floatEl = React.useRef(null) // idle-float wrapper
  const shadowEl = React.useRef(null) // table contact shadow

  const gesture = React.useRef(null) // {leaf, dir, k, startAngle, samples, angle}
  const startRef = React.useRef(null)
  const holdRef = React.useRef(null)
  const flightRaf = React.useRef(0)
  const coverTimer = React.useRef(0)
  const swipedRef = React.useRef(false)
  const pageSt = React.useRef(page)
  pageSt.current = page
  const flyingSt = React.useRef(flying)
  flyingSt.current = flying

  const pages = [
    { id: 'welcome', el: <WelcomePage /> },
    { id: 'holder', el: <HolderPage holder={holder} code={code} /> },
    ...COUNTRIES.map((c, i) => ({ id: c.id, el: <CountryPage c={c} index={i} collected={collected} onPick={onPick} canStamp={canStamp} active={page === i + 2} /> })),
    { id: 'world', el: <MirazWorldPage done={done} onClaim={onClaim} /> },
    { id: 'notes', el: <NotesPage /> },
    { id: 'rewards', el: <RewardsPage total={total} /> },
  ]
  const N = pages.length

  /* ---- imperative frame writer (never touches React state) ---- */
  const applyFrame = (i, angle, k) => {
    const el = leafEls.current[i]
    if (!el) return
    const rad = (angle * Math.PI) / 180
    const dist = Math.min(angle, Math.abs(REST_TOP - angle))
    const peel = Math.sin(rad) * k * 16 * Math.min(1, dist / 45)
    el.style.transform = `rotateY(${angle}deg) rotateX(${peel}deg)`
    const lift = liftEls.current[i]
    if (lift) lift.style.opacity = String(Math.min(1, angle / 110))
    if (shadeEl.current) shadeEl.current.style.opacity = String(Math.sin(rad) * 0.9)
  }

  const beginFlight = (i) => {
    const el = leafEls.current[i]
    if (el) {
      el.style.transition = 'none'
      el.style.willChange = 'transform'
      el.style.zIndex = '1000'
    }
    const lift = liftEls.current[i]
    if (lift) lift.style.transition = 'none'
    if (shadeEl.current) shadeEl.current.style.transition = 'none'
    setFlying(i)
  }

  const finishFlight = () => {
    cancelAnimationFrame(flightRaf.current)
    const i = flyingSt.current
    const el = i != null ? leafEls.current[i] : null
    if (el) el.style.willChange = ''
    if (shadeEl.current) {
      shadeEl.current.style.transition = 'opacity 200ms ease'
      shadeEl.current.style.opacity = '0'
    }
    setFlying(null)
  }

  // The imperative layer owns transform, transition AND z-index for every
  // leaf; React only renders structure. Resting poses re-fan gently after
  // each landing; the in-flight leaf is never touched here.
  React.useLayoutEffect(() => {
    for (let i = 0; i < N; i++) {
      if (flying === i) continue
      const el = leafEls.current[i]
      if (!el) continue
      const flipped = i < page
      // staggered, slightly uneven settle so the pile re-fans like paper
      el.style.transition = `transform ${280 + (i % 3) * 45}ms cubic-bezier(0.33, 0.66, 0.3, 1)`
      el.style.zIndex = String(flipped ? i + 1 : N - i)
      el.style.transform = `rotateY(${flipped ? restAngle(i, page) : 0}deg)`
      const lift = liftEls.current[i]
      if (lift) {
        lift.style.transition = 'opacity 300ms ease'
        lift.style.opacity = flipped ? '1' : '0'
      }
    }
  }, [page, flying, N])

  /* ---- physics: gravity, air drag, restitution — pure DOM writes ---- */
  const startPhysics = (leaf, angle0, v0, rest, k) => {
    cancelAnimationFrame(flightRaf.current)
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      applyFrame(leaf, rest, 0)
      finishFlight()
      return
    }
    let angle = angle0
    let v = Math.max(-900, Math.min(900, v0))
    let last = performance.now()
    const dir = rest >= angle0 ? 1 : -1
    const step = (now) => {
      const dt = Math.min(0.032, Math.max(0.001, (now - last) / 1000))
      last = now
      v += dir * GRAVITY * dt
      v *= Math.max(0, 1 - AIR_DRAG * dt)
      angle += v * dt
      const hit = dir > 0 ? angle >= rest : angle <= rest
      if (hit) {
        angle = rest
        if (Math.abs(v) > 90) {
          v = -v * BOUNCE // the pile gives — the paper skips once or twice
        } else {
          applyFrame(leaf, rest, k)
          finishFlight()
          return
        }
      }
      applyFrame(leaf, angle, k)
      flightRaf.current = requestAnimationFrame(step)
    }
    flightRaf.current = requestAnimationFrame(step)
  }

  const goTo = React.useCallback(
    (next) => {
      if (!opened || flyingSt.current !== null || gesture.current) return
      const p = pageSt.current
      const clamped = Math.max(0, Math.min(N - 1, next))
      if (clamped === p) return
      buzz()
      // every non-gesture turn grabs the leaf a little differently — a
      // random corner peel and launch speed so no two turns look identical
      const k = (Math.random() - 0.5) * 0.56
      const v0 = 150 + Math.random() * 90
      if (clamped > p) {
        const leaf = p
        beginFlight(leaf)
        applyFrame(leaf, 0, k)
        setPage(clamped)
        startPhysics(leaf, 0, v0, restAngle(leaf, clamped), k)
      } else {
        const leaf = clamped
        beginFlight(leaf)
        applyFrame(leaf, restAngle(leaf, p), k)
        setPage(clamped)
        startPhysics(leaf, restAngle(leaf, p), -v0, 0, k)
      }
    },
    [opened, N],
  )

  React.useEffect(
    () => () => {
      clearTimeout(coverTimer.current)
      cancelAnimationFrame(flightRaf.current)
    },
    [],
  )

  React.useEffect(() => {
    if (!opened) setPage(0)
  }, [opened])

  // while the cover swings it stays above the pages; once landed it tucks
  // BEHIND the book so turned leaves pile on top of it
  React.useEffect(() => {
    clearTimeout(coverTimer.current)
    if (opened) {
      coverTimer.current = setTimeout(() => setCoverBehind(true), 1230)
    } else {
      setCoverBehind(false)
    }
  }, [opened])

  // arrow keys (RTL: forward is ArrowLeft)
  React.useEffect(() => {
    if (!opened) return
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goTo(pageSt.current + 1)
      if (e.key === 'ArrowRight') goTo(pageSt.current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [opened, goTo])

  /* ---- pick up the CLOSED passport and carry it (pure DOM writes) ---- */
  const coverDown = (e) => {
    if (opened) return
    holdRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const coverMove = (e) => {
    const s = holdRef.current
    if (!s) return
    const dx = Math.max(-80, Math.min(80, e.clientX - s.x))
    const dy = Math.max(-80, Math.min(80, e.clientY - s.y))
    if (!s.moved && Math.hypot(dx, dy) < 6) return
    s.moved = true
    s.dx = dx
    s.dy = dy
    if (floatEl.current) floatEl.current.style.animationPlayState = 'paused'
    if (carryEl.current) {
      carryEl.current.style.transition = 'none'
      carryEl.current.style.transform = `translate3d(${dx * 0.9}px, ${dy * 0.9}px, 24px) rotateX(${-dy * 0.1}deg) rotateY(${dx * 0.12}deg)`
    }
    if (shadowEl.current) {
      shadowEl.current.style.transition = 'none'
      shadowEl.current.style.transform = `translate(${dx * 0.55}px, ${dy * 0.35}px) scale(${1 - Math.abs(dy) * 0.002})`
    }
  }
  const coverUp = () => {
    const s = holdRef.current
    holdRef.current = null
    if (!s) return
    if (!s.moved) {
      // a clean tap: from the back, flip to the front; from the front, open
      buzz()
      if (backView) setBackView(false)
      else onOpen()
      return
    }
    const spring = 'transform 650ms cubic-bezier(0.22, 1.2, 0.34, 1)'
    if (carryEl.current) {
      carryEl.current.style.transition = spring
      carryEl.current.style.transform = ''
    }
    if (shadowEl.current) {
      shadowEl.current.style.transition = spring
      shadowEl.current.style.transform = ''
    }
    setTimeout(() => {
      if (floatEl.current) floatEl.current.style.animationPlayState = ''
    }, 660)
    // a clearly horizontal swipe flips the closed passport over
    const dx = s.dx || 0
    const dy = s.dy || 0
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      setBackView((v) => !v)
    }
  }

  /* ---- hold a LEAF and peel it from the corner you grabbed ---- */
  const onPointerDown = (e) => {
    if (!opened || flyingSt.current !== null) return
    startRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
  }
  const onPointerMove = (e) => {
    const start = startRef.current
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y

    if (!gesture.current) {
      if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy) * 1.05) return
      const p = pageSt.current
      const dir = dx > 0 ? 'fwd' : 'back'
      const leaf = dir === 'fwd' ? p : p - 1
      // pulling back past the first page closes the passport
      if (dir === 'back' && p <= 0) {
        swipedRef.current = true
        startRef.current = null
        onClose?.()
        return
      }
      if (dir === 'fwd' && p >= N - 1) return
      // which corner was grabbed decides the peel axis (top / middle / bottom)
      const rect = e.currentTarget.getBoundingClientRect()
      const k = Math.max(-0.5, Math.min(0.5, (start.y - rect.top) / rect.height - 0.5))
      const startAngle = dir === 'fwd' ? 0 : restAngle(leaf, p)
      gesture.current = { leaf, dir, k, startAngle, samples: [], angle: startAngle }
      swipedRef.current = true
      beginFlight(leaf)
      e.currentTarget.setPointerCapture?.(start.id)
    }
    const g = gesture.current
    const sweep = (Math.abs(dx) / PAGE_W) * SWEEP
    const angle =
      g.dir === 'fwd'
        ? Math.min(MAX_DRAG_ANGLE, sweep)
        : Math.max(0, Math.min(MAX_DRAG_ANGLE, g.startAngle - sweep))
    g.angle = angle
    g.samples.push({ t: performance.now(), a: angle })
    if (g.samples.length > 6) g.samples.shift()
    applyFrame(g.leaf, angle, g.k)
  }
  const endDrag = () => {
    const g = gesture.current
    gesture.current = null
    startRef.current = null
    if (!g) return
    const angle = g.angle
    // release velocity (deg/s) from the last ~90ms of motion — a flick counts
    let v = 0
    const s = g.samples
    if (s.length >= 2) {
      const a1 = s[s.length - 1]
      let a0 = s[0]
      for (const smp of s) if (a1.t - smp.t <= 90) { a0 = smp; break }
      const dt = (a1.t - a0.t) / 1000
      if (dt > 0.004) v = (a1.a - a0.a) / dt
    }
    if (g.dir === 'fwd') {
      const committed = v <= -FLICK_V ? false : angle > 90 || v >= FLICK_V
      if (committed) {
        buzz()
        setPage(g.leaf + 1)
        startPhysics(g.leaf, angle, v, restAngle(g.leaf, g.leaf + 1), g.k)
      } else {
        startPhysics(g.leaf, angle, v, 0, g.k)
      }
    } else {
      const committed = v >= FLICK_V ? false : angle < 90 || v <= -FLICK_V
      if (committed) {
        buzz()
        setPage(g.leaf)
        startPhysics(g.leaf, angle, v, 0, g.k)
      } else {
        startPhysics(g.leaf, angle, v, restAngle(g.leaf, g.leaf + 1), g.k)
      }
    }
  }

  /* ---- release on the page stack: finish a drag, or treat a clean tap on
     the outer edges as a page turn (big, forgiving touch targets) ---- */
  const onRelease = (e) => {
    const start = startRef.current
    const hadGesture = !!gesture.current
    endDrag()
    if (hadGesture || !start) return
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 9) return
    // don't steal taps meant for the foot-bar buttons, or for stamp slots
    // while slots are tappable (demo). Live-mode slots are read-only, so
    // edge taps over them still turn the page.
    if (e.target.closest?.('button')) return
    if (canStamp && e.target.closest?.('[data-slot]')) return
    const rect = e.currentTarget.getBoundingClientRect()
    const fx = (e.clientX - rect.left) / rect.width
    if (fx <= EDGE_TAP_FRAC) {
      goTo(pageSt.current + 1) // RTL: left edge reads forward
    } else if (fx >= 1 - EDGE_TAP_FRAC && pageSt.current > 0) {
      goTo(pageSt.current - 1)
    }
  }
  const onClickCapture = (e) => {
    if (swipedRef.current) {
      e.stopPropagation()
      swipedRef.current = false
    }
  }

  // one spot on the table; the open book shifts left so the folded-out
  // cover and turned pages show along the right edge
  const pos = {
    left: `calc(50% - ${BOOK.width / 2 + (opened ? 40 : 0)}px)`,
    top: `calc(50% - ${BOOK.height / 2 + 26}px)`,
    width: BOOK.width,
    height: BOOK.height,
  }

  return (
    <div
      // the WHOLE stage is the gesture surface — swipe or edge-tap anywhere,
      // not just on the book (handlers no-op while the passport is closed)
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onRelease}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
      onDragStart={(e) => e.preventDefault()}
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(130% 100% at 50% 12%, #3b342b 0%, #241f19 48%, #120f0b 100%)',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <Grain opacity={0.05} size={280} />

      {/* caption under the book */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center', pointerEvents: 'none' }}>
        {opened ? (
          <div lang="ar" style={{ fontFamily: 'var(--font-sans-ar)', fontSize: 11, color: 'var(--text-on-ink-dim)', opacity: 0.85 }}>
            امسك الصفحة من أي زاوية واقلبها نحوك — كورقة حقيقية.
          </div>
        ) : backView ? (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, letterSpacing: '0.34em', textTransform: 'uppercase', color: 'var(--brass)' }}>
            المس للعودة · ظهر الجواز
          </div>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, letterSpacing: '0.34em', textTransform: 'uppercase', color: 'var(--brass)', animation: 'captionPulse 2.8s ease-in-out infinite' }}>
              أمسكه وحرّكه · اسحبه جانبًا لقلبه · المسه ليُفتح
            </div>
            <div lang="ar" style={{ fontFamily: 'var(--font-sans-ar)', fontSize: 11.5, color: 'var(--text-on-ink-dim)', marginTop: 10 }}>
              ختم مع كل وجبة رئيسية — واجمع الأختام لتربح جوائز عالم ميراز.
            </div>
          </>
        )}
      </div>

      {/* 3D stage */}
      <div style={{ position: 'absolute', inset: 0, perspective: 1400, perspectiveOrigin: '50% 40%' }}>
        <div style={{ position: 'absolute', ...pos, transition: `left 950ms ${EASE_BOOK}` }}>
          {/* contact shadow on the table — trails the carried book */}
          <div
            ref={shadowEl}
            style={{
              position: 'absolute',
              left: '6%',
              right: '6%',
              bottom: -20,
              height: 30,
              background: 'radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.6), transparent 72%)',
              filter: 'blur(7px)',
            }}
          />

          {/* carry wrapper — written to directly while the hand holds it */}
          <div ref={carryEl} style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
            <div ref={floatEl} style={{ position: 'absolute', inset: 0, animation: opened ? 'none' : 'idleFloat 6s ease-in-out infinite' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  transformStyle: 'preserve-3d',
                  transform: opened
                    ? 'rotateX(0deg) rotateZ(0deg)'
                    : `rotateX(9deg) rotateZ(-1.6deg) rotateY(${backView ? 180 : 0}deg)`,
                  transition: `transform 950ms ${EASE_BOOK}`,
                }}
              >
                <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', animation: shake ? 'bookShake 320ms ease' : 'none' }}>
                  {/* BACK COVER slab */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: COVER_RADIUS,
                      ...LEATHER,
                      boxShadow: '0 22px 55px rgba(0,0,0,0.55), 0 4px 14px rgba(0,0,0,0.4)',
                      transform: 'translateZ(-3px)',
                    }}
                  />

                  {/* BACK COVER face — seen when the closed passport is flipped over */}
                  <div
                    onPointerDown={coverDown}
                    onPointerMove={coverMove}
                    onPointerUp={coverUp}
                    onPointerCancel={coverUp}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '5px 16px 16px 5px',
                      ...LEATHER,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg) translateZ(3.4px)',
                      boxShadow: 'inset 0 0 46px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '44px 26px 40px',
                      boxSizing: 'border-box',
                      pointerEvents: opened ? 'none' : 'auto',
                      cursor: opened ? 'default' : 'grab',
                      touchAction: 'none',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                    }}
                  >
                    <Grain opacity={0.09} size={190} radius={'5px 16px 16px 5px'} />
                    <div style={{ position: 'absolute', inset: 13, border: '1px solid rgba(181,139,76,0.5)', borderRadius: '3px 11px 11px 3px', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', inset: 17, border: '1px solid rgba(181,139,76,0.18)', borderRadius: '2px 9px 9px 2px', pointerEvents: 'none' }} />
                    <img src={MARK_GOLD} alt="" draggable={false} style={{ position: 'relative', height: 40, filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.65))' }} />
                    <div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
                      <img src={FRIEZE} alt="" draggable={false} style={{ width: '74%', opacity: 0.4, filter: 'invert(0.62) sepia(0.55) saturate(2.4) hue-rotate(-12deg) brightness(0.9)' }} />
                      <div lang="ar" style={{ fontFamily: 'var(--font-sans-ar)', fontSize: 10.5, color: 'var(--brass-soft)', marginTop: 14, lineHeight: 1.9, ...ENGRAVE }}>
                        كل ختم رحلة، وكل رحلة نكهة.
                      </div>
                    </div>
                    <div style={{ position: 'relative', textAlign: 'center' }}>
                      <div dir="ltr" style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--brass)', ...ENGRAVE }}>
                        Bethlehem
                      </div>
                      <div lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 12, color: 'var(--brass-soft)', marginTop: 5, ...ENGRAVE }}>
                        بيت لحم
                      </div>
                    </div>
                  </div>

                  {/* page-block fore-edge (left) + bottom edge */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 2,
                      top: 7,
                      bottom: 7,
                      width: 7,
                      transform: 'translateZ(-1px)',
                      borderRadius: '3px 0 0 3px',
                      background: 'repeating-linear-gradient(90deg, #f3eee2 0 1px, #d8d0bd 1px 2.2px)',
                      boxShadow: 'inset 0 6px 6px -5px rgba(0,0,0,0.35), inset 0 -6px 6px -5px rgba(0,0,0,0.35)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: 6,
                      right: 6,
                      bottom: 2,
                      height: 5,
                      transform: 'translateZ(-1px)',
                      borderRadius: '0 0 3px 3px',
                      background: 'repeating-linear-gradient(180deg, #f3eee2 0 1px, #d8d0bd 1px 2.2px)',
                      opacity: 0.9,
                    }}
                  />

                  {/* PAGE STACK — leaves peel outward and pile on the open cover */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 5,
                      bottom: 5,
                      left: 9,
                      right: 0,
                      borderRadius: PAGE_RADIUS,
                      zIndex: 10,
                      perspective: 1200,
                      perspectiveOrigin: '50% 50%',
                      ...PAGE_BG,
                      cursor: 'grab',
                    }}
                  >
                    {pages.map((p, i) => {
                      const flipped = i < page
                      return (
                        <div
                          key={p.id}
                          ref={(el) => (leafEls.current[i] = el)}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            transformOrigin: '100% 50%',
                            transformStyle: 'preserve-3d',
                            // transform/transition/z-index are owned imperatively
                            pointerEvents: i === page && flying === null ? 'auto' : 'none',
                          }}
                        >
                          {/* recto — the page itself */}
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              borderRadius: PAGE_RADIUS,
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                              transform: 'translateZ(0.8px)',
                              overflow: 'hidden',
                              ...PAGE_BG,
                            }}
                          >
                            <Grain opacity={0.035} size={220} />
                            {p.el}
                            {/* leaf shading as it lifts toward the light */}
                            <div
                              ref={(el) => (liftEls.current[i] = el)}
                              style={{
                                position: 'absolute',
                                inset: 0,
                                pointerEvents: 'none',
                                background: 'linear-gradient(to left, rgba(10,8,6,0.4), rgba(10,8,6,0.12) 55%)',
                                opacity: 0,
                              }}
                            />
                          </div>
                          {/* verso — the back of the leaf (shows once turned) */}
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              borderRadius: '2px 10px 10px 2px',
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg) translateZ(0.8px)',
                              ...PAGE_BG,
                              boxShadow: 'inset 8px 0 14px -10px rgba(44,42,40,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <img src={MARK_CHARCOAL} alt="" style={{ height: 64, opacity: 0.05 }} />
                          </div>
                        </div>
                      )
                    })}

                    {/* the moving leaf's live shade on the page beneath */}
                    <div
                      ref={shadeEl}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 999,
                        pointerEvents: 'none',
                        borderRadius: PAGE_RADIUS,
                        background: 'linear-gradient(to left, rgba(18,14,10,0.32), transparent 58%)',
                        opacity: 0,
                      }}
                    />

                    {/* spine gutter shading (right) + fore-edge highlight (left) */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1200,
                        pointerEvents: 'none',
                        borderRadius: PAGE_RADIUS,
                        background:
                          'linear-gradient(to left, rgba(34,30,26,0.28), rgba(34,30,26,0.07) 6%, transparent 13%), ' +
                          'linear-gradient(to right, rgba(255,255,255,0.5), transparent 2.5%)',
                      }}
                    />

                    {/* foot bar: next ‹ · page · › prev (forward lies left in RTL) */}
                    <div
                      dir="ltr"
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 22,
                        zIndex: 1300,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 6px',
                        opacity: opened ? 1 : 0,
                        transition: 'opacity 300ms 600ms',
                        pointerEvents: opened ? 'auto' : 'none',
                      }}
                    >
                      <button
                        onClick={() => goTo(page + 1)}
                        disabled={page >= N - 1}
                        aria-label="الصفحة التالية"
                        style={{ background: 'none', border: 'none', cursor: page >= N - 1 ? 'default' : 'pointer', color: 'var(--brass-deep)', opacity: page >= N - 1 ? 0.25 : 0.9, fontSize: 15, lineHeight: 1, padding: '16px 18px', margin: '-14px -12px', touchAction: 'manipulation', fontFamily: 'var(--font-sans)' }}
                      >
                        ‹
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-muted)' }}>
                        <span style={{ fontSize: 6, opacity: 0.7 }}>◆</span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 8, letterSpacing: '0.2em' }}>{page + 1}</span>
                        <span style={{ fontSize: 6, opacity: 0.7 }}>◆</span>
                      </div>
                      <button
                        onClick={() => (page > 0 ? goTo(page - 1) : onClose?.())}
                        aria-label={page > 0 ? 'الصفحة السابقة' : 'أغلق الجواز'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brass-deep)', opacity: 0.9, fontSize: 15, lineHeight: 1, padding: '16px 18px', margin: '-14px -12px', touchAction: 'manipulation', fontFamily: 'var(--font-sans)' }}
                      >
                        {page > 0 ? '›' : '✕'}
                      </button>
                    </div>

                    {/* the cover's cast shadow while closed / opening */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1400,
                        pointerEvents: 'none',
                        borderRadius: PAGE_RADIUS,
                        background: 'linear-gradient(to left, rgba(10,8,6,0.5), rgba(10,8,6,0.75) 60%)',
                        opacity: opened ? 0 : 1,
                        transition: 'opacity 1050ms cubic-bezier(0.6,0,0.3,1)',
                      }}
                    />
                  </div>

                  {/* FRONT COVER — swings OUTWARD and stays in view; once landed
                      it tucks behind the book so turned leaves pile over it */}
                  <div
                    onPointerDown={coverDown}
                    onPointerMove={coverMove}
                    onPointerUp={coverUp}
                    onPointerCancel={coverUp}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: coverBehind ? 5 : 30,
                      transformOrigin: '100% 50%',
                      transformStyle: 'preserve-3d',
                      transform: opened ? `rotateY(${COVER_ANGLE}deg)` : 'rotateY(0deg)',
                      transition: 'transform 1200ms cubic-bezier(0.6, 0.04, 0.2, 1.06)',
                      cursor: opened ? 'default' : 'grab',
                      pointerEvents: opened ? 'none' : 'auto',
                      touchAction: 'none',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                    }}
                  >
                    {/* outer face — olive leather, engraved gold */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: COVER_RADIUS,
                        ...LEATHER,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'translateZ(2.5px)',
                        boxShadow: 'inset 0 0 46px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '40px 26px 40px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <Grain opacity={0.09} size={190} radius={COVER_RADIUS} />
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          right: 0,
                          width: 18,
                          borderRadius: '0 5px 5px 0',
                          background:
                            'linear-gradient(90deg, transparent, rgba(0,0,0,0.55) 88%), linear-gradient(90deg, transparent 55%, rgba(255,255,255,0.05) 72%, transparent 86%)',
                        }}
                      />
                      <div style={{ position: 'absolute', inset: 13, border: '1px solid rgba(181,139,76,0.5)', borderRadius: '11px 3px 3px 11px', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', inset: 17, border: '1px solid rgba(181,139,76,0.18)', borderRadius: '9px 2px 2px 9px', pointerEvents: 'none' }} />

                      <div style={{ position: 'relative', textAlign: 'center' }}>
                        <div dir="ltr" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 21, letterSpacing: '0.24em', color: 'var(--brass)', ...ENGRAVE }}>
                          MIRAZ&nbsp;WORLD
                        </div>
                        <div lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 15, color: 'var(--brass-soft)', marginTop: 6, ...ENGRAVE }}>
                          عالم ميراز
                        </div>
                      </div>

                      <img
                        src={MARK_GOLD}
                        alt=""
                        draggable={false}
                        style={{ position: 'relative', height: 92, filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.65)) drop-shadow(0 1px 1px rgba(255,220,160,0.14))' }}
                      />

                      <div style={{ position: 'relative', textAlign: 'center' }}>
                        <div dir="ltr" style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--brass)', ...ENGRAVE }}>
                          Flavor&nbsp;Passport
                        </div>
                        <div lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 15, color: 'var(--brass-soft)', marginTop: 6, ...ENGRAVE }}>
                          جواز سفر النكهات
                        </div>
                      </div>
                    </div>

                    {/* inner face — endpaper (what shows as it swings open) */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '5px 16px 16px 5px',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg) translateZ(2.5px)',
                        ...PAGE_BG,
                        boxShadow: 'inset 0 0 30px rgba(44,42,40,0.14)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img src={MARK_CHARCOAL} alt="" draggable={false} style={{ height: 90, opacity: 0.06 }} />
                      <div style={{ position: 'absolute', inset: 12, border: '1px solid rgba(44,42,40,0.12)', borderRadius: '3px 11px 11px 3px', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
