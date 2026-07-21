import React from 'react'
import QRCode from 'qrcode'
import markCharcoal from './assets/miraz-mark-charcoal.svg'
import wordmarkBrass from './assets/miraz-wordmark-brass.svg'

/**
 * Miraz World — staff portal (بوابة الطاقم).
 * Staff issue passports and stamp visits here; guests can only watch their
 * passport fill up. Auth is a shared staff key sent as x-admin-key.
 */

const API = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '')
const LS_KEY = 'miraz.adminKey'

const COUNTRIES = [
  { id: 'eastasia', ar: 'شرق آسيا', en: 'EAST ASIA' },
  { id: 'levant', ar: 'بلاد الشام', en: 'THE LEVANT' },
  { id: 'greece', ar: 'اليونان', en: 'GREECE' },
  { id: 'usa', ar: 'الولايات المتحدة', en: 'UNITED STATES' },
  { id: 'italy', ar: 'إيطاليا', en: 'ITALY' },
  { id: 'morocco', ar: 'المغرب', en: 'MOROCCO' },
]
const REWARD_TIERS = [
  { n: 3, ar: 'مقبلات من اختيار الشيف' },
  { n: 6, ar: 'حلوى بتقديم مميز' },
  { n: 9, ar: 'طبق جانبي مميز من الشيف' },
  { n: 12, ar: 'دعوة لسهرة موسيقية' },
  { n: 18, ar: 'وجبة خاصة من تقديم الشيف' },
  { n: 24, ar: 'تجربة إفطار مميزة لشخصين' },
  { n: 36, ar: 'جوائز عالم ميراز' },
]

const card = {
  background: 'var(--surface-raised, #FBF9F4)',
  border: '1px solid var(--line-soft)',
  borderRadius: 'var(--radius-md)',
  padding: 18,
}
const btn = {
  background: 'var(--charcoal)',
  color: 'var(--ivory)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 22px',
  fontSize: 12,
  letterSpacing: '0.12em',
  cursor: 'pointer',
}
const input = {
  border: '1px solid var(--line-medium)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 12px',
  fontSize: 14,
  background: '#fff',
  fontFamily: 'var(--font-sans)',
  width: '100%',
}
const eyebrow = {
  fontFamily: 'var(--font-sans)',
  fontSize: 10,
  letterSpacing: '0.26em',
  textTransform: 'uppercase',
  color: 'var(--brass-deep)',
}

export default function App() {
  const [key, setKey] = React.useState(localStorage.getItem(LS_KEY) || '')
  const [authed, setAuthed] = React.useState(false)
  const [view, setView] = React.useState('list') // 'list' | 'guest'
  const [guests, setGuests] = React.useState([])
  const [q, setQ] = React.useState('')
  const [current, setCurrent] = React.useState(null) // serialized passport
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const [toast, setToast] = React.useState(null) // reached reward tier

  const call = React.useCallback(
    async (path, opts = {}) => {
      const res = await fetch(`${API}${path}`, {
        ...opts,
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key, ...(opts.headers || {}) },
      })
      if (res.status === 401) {
        setAuthed(false)
        throw new Error('مفتاح الطاقم غير صحيح')
      }
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `خطأ ${res.status}`)
      return res.json()
    },
    [key],
  )

  const refreshList = React.useCallback(
    async (query = '') => {
      const rows = await call(`/api/admin/passports?q=${encodeURIComponent(query)}`)
      setGuests(rows)
    },
    [call],
  )

  const login = async (e) => {
    e?.preventDefault()
    setError('')
    setBusy(true)
    try {
      await refreshList()
      localStorage.setItem(LS_KEY, key)
      setAuthed(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // auto-login with a remembered key
  React.useEffect(() => {
    if (key && !authed) login()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openGuest = async (code) => {
    const data = await call(`/api/passports/${code}`)
    setCurrent(data)
    setView('guest')
  }

  const createGuest = async (name, phone) => {
    setBusy(true)
    setError('')
    try {
      const data = await call('/api/admin/passports', { method: 'POST', body: JSON.stringify({ name, phone }) })
      await refreshList(q)
      setCurrent(data)
      setView('guest')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const stamp = async (country) => {
    if (!current) return
    setBusy(true)
    setError('')
    try {
      const before = current.total
      const data = await call(`/api/admin/passports/${current.passport.code}/stamps`, {
        method: 'POST',
        body: JSON.stringify({ country }),
      })
      setCurrent(data)
      const tier = REWARD_TIERS.find((t) => before < t.n && data.total >= t.n)
      if (tier) setToast(tier)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const unstamp = async (id) => {
    setBusy(true)
    try {
      await call(`/api/admin/stamps/${id}`, { method: 'DELETE' })
      await openGuest(current.passport.code)
    } finally {
      setBusy(false)
    }
  }

  /* ---------------- screens ---------------- */

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <form onSubmit={login} style={{ ...card, width: 360, textAlign: 'center', padding: 32 }}>
          <img src={markCharcoal} alt="" style={{ height: 40, marginBottom: 12 }} />
          <div style={eyebrow}>Miraz World · Staff</div>
          <h1 lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 24, margin: '10px 0 18px' }}>
            بوابة الطاقم
          </h1>
          <input
            style={{ ...input, textAlign: 'center', letterSpacing: '0.2em' }}
            type="password"
            placeholder="مفتاح الطاقم"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoFocus
          />
          {error && <div style={{ color: '#8a3b2e', fontSize: 12, marginTop: 10 }}>{error}</div>}
          <button style={{ ...btn, width: '100%', marginTop: 16 }} disabled={busy || !key}>
            دخول
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px 60px' }}>
      {/* header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={markCharcoal} alt="" style={{ height: 30 }} />
          <div>
            <img src={wordmarkBrass} alt="MIRAZ" style={{ height: 10, display: 'block' }} />
            <div lang="ar" style={{ fontFamily: 'var(--font-sans-ar)', fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
              بوابة الطاقم — جواز سفر النكهات
            </div>
          </div>
        </div>
        {view === 'guest' ? (
          <button style={{ ...btn, background: 'transparent', color: 'var(--charcoal)', border: '1px solid var(--line-strong)' }} onClick={() => setView('list')}>
            ← جميع الضيوف
          </button>
        ) : (
          <button
            style={{ ...btn, background: 'transparent', color: 'var(--text-muted)', border: 'none', fontSize: 11 }}
            onClick={() => {
              localStorage.removeItem(LS_KEY)
              setAuthed(false)
            }}
          >
            خروج
          </button>
        )}
      </header>

      {error && authed && (
        <div style={{ ...card, borderColor: '#c8a08f', color: '#8a3b2e', marginBottom: 16, padding: 12, fontSize: 13 }}>{error}</div>
      )}

      {view === 'list' ? (
        <GuestList guests={guests} q={q} setQ={setQ} onSearch={refreshList} onOpen={openGuest} onCreate={createGuest} busy={busy} />
      ) : (
        current && <GuestDetail data={current} onStamp={stamp} onUnstamp={unstamp} busy={busy} />
      )}

      {toast && (
        <div
          onClick={() => setToast(null)}
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--charcoal)',
            color: 'var(--ivory)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 26px',
            boxShadow: '0 18px 40px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          <div style={{ ...eyebrow, color: 'var(--brass)' }}>{toast.n} STAMPS · مكافأة مستحقة</div>
          <div lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 17, marginTop: 4 }}>
            قدّم للضيف: {toast.ar}
          </div>
        </div>
      )}
    </div>
  )
}

function GuestList({ guests, q, setQ, onSearch, onOpen, onCreate, busy }) {
  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  return (
    <>
      {/* new passport */}
      <div style={{ ...card, marginBottom: 18 }}>
        <div style={eyebrow}>جواز جديد</div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (name.trim()) {
              onCreate(name, phone)
              setName('')
              setPhone('')
            }
          }}
          style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}
        >
          <input style={{ ...input, flex: 2, minWidth: 160 }} placeholder="اسم الضيف" value={name} onChange={(e) => setName(e.target.value)} />
          <input style={{ ...input, flex: 1, minWidth: 130 }} placeholder="رقم الهاتف" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button style={btn} disabled={busy || !name.trim()}>
            إصدار جواز
          </button>
        </form>
      </div>

      {/* search + list */}
      <div style={card}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input
            style={{ ...input, flex: 1 }}
            placeholder="ابحث بالاسم أو الهاتف أو رقم الجواز…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              onSearch(e.target.value)
            }}
          />
        </div>
        {guests.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '18px 4px' }}>لا يوجد ضيوف بعد — أصدر أول جواز أعلاه.</div>
        ) : (
          guests.map((g) => (
            <div
              key={g.code}
              onClick={() => onOpen(g.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 6px',
                borderBottom: '1px solid var(--line-soft)',
                cursor: 'pointer',
              }}
            >
              <div style={{ flex: 2 }}>
                <div lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 16 }}>{g.name}</div>
                <div dir="ltr" style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'end' }}>{g.phone || '—'}</div>
              </div>
              <div dir="ltr" style={{ fontFamily: 'var(--font-sans)', fontSize: 12, letterSpacing: '0.12em', color: 'var(--brass-deep)' }}>{g.code}</div>
              <div style={{ width: 90 }}>
                <div style={{ height: 4, background: 'var(--travertine)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${(g.total / 36) * 100}%`, height: '100%', background: 'var(--brass)' }} />
                </div>
                <div dir="ltr" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, textAlign: 'center' }}>{g.total} / 36</div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}

function GuestDetail({ data, onStamp, onUnstamp, busy }) {
  const { passport, stamps, total } = data
  const [qr, setQr] = React.useState('')
  const link = `${API}/?code=${passport.code}`
  React.useEffect(() => {
    QRCode.toDataURL(link, { width: 220, margin: 1 }).then(setQr).catch(() => {})
  }, [link])
  const next = REWARD_TIERS.find((t) => total < t.n)
  const byCountry = (id) => stamps.filter((s) => s.country === id)
  const recent = [...stamps].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 5)
  const copy = () => navigator.clipboard?.writeText(link)

  return (
    <>
      {/* identity */}
      <div style={{ ...card, display: 'flex', gap: 20, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: 220 }}>
          <div style={eyebrow}>الضيف</div>
          <div lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 26, margin: '6px 0 2px' }}>{passport.name}</div>
          <div dir="ltr" style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'end' }}>
            {passport.phone || '—'} · {passport.code}
          </div>
          <div lang="ar" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            صالح حتى {passport.expires_at?.slice(0, 10)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
            <div style={{ flex: 1, height: 6, background: 'var(--travertine)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${(total / 36) * 100}%`, height: '100%', background: 'var(--brass)', transition: 'width 400ms' }} />
            </div>
            <div dir="ltr" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--brass-deep)' }}>{total} / 36</div>
          </div>
          {next && (
            <div lang="ar" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
              المكافأة القادمة عند {next.n} أختام: <span style={{ color: 'var(--brass-deep)' }}>{next.ar}</span>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center' }}>
          {qr && <img src={qr} alt="" style={{ width: 130, height: 130, border: '1px solid var(--line-soft)', borderRadius: 4 }} />}
          <button onClick={copy} style={{ ...btn, display: 'block', margin: '10px auto 0', background: 'transparent', color: 'var(--charcoal)', border: '1px solid var(--line-strong)', fontSize: 10.5 }}>
            نسخ رابط جواز الضيف
          </button>
        </div>
      </div>

      {/* stamping grid — the ONLY place stamps are issued */}
      <div style={{ ...card, marginBottom: 18 }}>
        <div style={eyebrow}>ختم زيارة — وجبة رئيسية واحدة = ختم واحد</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginTop: 14 }}>
          {COUNTRIES.map((c) => {
            const got = byCountry(c.id)
            const full = got.length >= 6
            return (
              <div key={c.id} style={{ border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div lang="ar" style={{ fontFamily: 'var(--font-display-ar)', fontWeight: 500, fontSize: 16 }}>{c.ar}</div>
                  <div dir="ltr" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)' }}>{c.en}</div>
                </div>
                <div style={{ display: 'flex', gap: 5, margin: '10px 0 12px' }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        border: '1px solid var(--brass-deep)',
                        background: got.some((s) => s.slot === i) ? 'var(--brass)' : 'transparent',
                      }}
                    />
                  ))}
                </div>
                <button onClick={() => onStamp(c.id)} disabled={busy || full} style={{ ...btn, width: '100%', opacity: full ? 0.35 : 1 }}>
                  {full ? 'مكتملة' : 'ختم'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* recent stamps + undo */}
      {recent.length > 0 && (
        <div style={card}>
          <div style={eyebrow}>آخر الأختام</div>
          {recent.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 2px', borderBottom: '1px solid var(--line-soft)', fontSize: 13 }}>
              <span lang="ar" style={{ flex: 1 }}>{COUNTRIES.find((c) => c.id === s.country)?.ar}</span>
              <span dir="ltr" style={{ color: 'var(--text-muted)', fontSize: 11 }}>{s.created_at.slice(0, 16).replace('T', ' ')}</span>
              <button onClick={() => onUnstamp(s.id)} disabled={busy} style={{ ...btn, background: 'transparent', color: '#8a3b2e', border: '1px solid var(--line-soft)', padding: '5px 12px', fontSize: 10 }}>
                تراجع
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
