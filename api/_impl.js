// Miraz World API — platform-agnostic core, used by the Vercel serverless
// function (Postgres/Neon). Staff are the only writers (x-admin-key);
// guests read their passport by its unguessable code.

const COUNTRIES = ['eastasia', 'levant', 'greece', 'usa', 'italy', 'morocco']
const SLOTS_PER_COUNTRY = 6
const VALIDITY_MONTHS = 6
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no O/0, I/1

const iso = (v) => (v instanceof Date ? v.toISOString() : v)
const serializePassport = (p) => ({
  code: p.code,
  name: p.name,
  phone: p.phone,
  dob: p.dob,
  issued_at: iso(p.issued_at),
  expires_at: iso(p.expires_at),
})

/**
 * @param {(text: string, params?: any[]) => Promise<{rows: any[]}>} query
 * @param {string} adminKey
 */
export function createApi(query, adminKey) {
  let ready = null
  const ensure = () => {
    ready ||= (async () => {
      await query(`CREATE TABLE IF NOT EXISTS passports (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT DEFAULT '',
        dob TEXT DEFAULT '',
        issued_at TIMESTAMPTZ NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL
      )`)
      await query(`CREATE TABLE IF NOT EXISTS stamps (
        id SERIAL PRIMARY KEY,
        passport_id INT NOT NULL REFERENCES passports(id),
        country TEXT NOT NULL,
        slot INT NOT NULL,
        staff TEXT DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL,
        UNIQUE (passport_id, country, slot)
      )`)
    })()
    return ready
  }

  const newCode = async () => {
    for (;;) {
      let c = 'MW-'
      for (let i = 0; i < 5; i++) c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
      const { rows } = await query('SELECT 1 FROM passports WHERE code = $1', [c])
      if (!rows.length) return c
    }
  }

  const serialize = async (p) => {
    const { rows: stamps } = await query(
      'SELECT id, country, slot, staff, created_at FROM stamps WHERE passport_id = $1 ORDER BY created_at',
      [p.id],
    )
    return {
      passport: serializePassport(p),
      stamps: stamps.map((s) => ({ ...s, created_at: iso(s.created_at) })),
      total: stamps.length,
    }
  }

  const byCode = async (code) => {
    const { rows } = await query('SELECT * FROM passports WHERE code = $1', [String(code).toUpperCase()])
    return rows[0]
  }

  return async function handle(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    if (req.method === 'OPTIONS') return res.status(204).end()

    await ensure()
    const url = new URL(req.url, 'http://internal')
    const parts = url.pathname.replace(/^\/?api\/?/, '').split('/').filter(Boolean)
    const isAdmin = parts[0] === 'admin'
    if (isAdmin && (req.headers['x-admin-key'] || '') !== adminKey) {
      return res.status(401).json({ error: 'unauthorized' })
    }

    try {
      // GET /api/health
      if (req.method === 'GET' && parts[0] === 'health') return res.status(200).json({ ok: true })

      // GET /api/passports/:code — guest read
      if (req.method === 'GET' && parts[0] === 'passports' && parts[1]) {
        const p = await byCode(parts[1])
        if (!p) return res.status(404).json({ error: 'not found' })
        return res.status(200).json(await serialize(p))
      }

      // POST /api/admin/passports
      if (req.method === 'POST' && isAdmin && parts[1] === 'passports' && !parts[2]) {
        const { name, phone = '', dob = '' } = req.body || {}
        if (!name || !String(name).trim()) return res.status(400).json({ error: 'name required' })
        const issued = new Date()
        const expires = new Date(issued)
        expires.setMonth(expires.getMonth() + VALIDITY_MONTHS)
        const code = await newCode()
        const { rows } = await query(
          'INSERT INTO passports (code, name, phone, dob, issued_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [code, String(name).trim(), String(phone).trim(), String(dob).trim(), issued.toISOString(), expires.toISOString()],
        )
        return res.status(201).json(await serialize(rows[0]))
      }

      // GET /api/admin/passports?q=
      if (req.method === 'GET' && isAdmin && parts[1] === 'passports' && !parts[2]) {
        const q = `%${(url.searchParams.get('q') || '').trim()}%`
        const { rows } = await query(
          `SELECT id, code, name, phone, dob, issued_at, expires_at FROM passports
           WHERE name LIKE $1 OR phone LIKE $1 OR code LIKE $1
           ORDER BY id DESC LIMIT 50`,
          [q],
        )
        const { rows: counts } = await query('SELECT passport_id, COUNT(*)::int AS total FROM stamps GROUP BY passport_id')
        const totals = new Map(counts.map((c) => [c.passport_id, c.total]))
        return res.status(200).json(rows.map((r) => ({ ...serializePassport(r), total: totals.get(r.id) || 0 })))
      }

      // POST /api/admin/passports/:code/stamps
      if (req.method === 'POST' && isAdmin && parts[1] === 'passports' && parts[2] && parts[3] === 'stamps') {
        const p = await byCode(parts[2])
        if (!p) return res.status(404).json({ error: 'not found' })
        if (new Date(iso(p.expires_at)) < new Date()) return res.status(409).json({ error: 'passport expired' })
        const { country, staff = '' } = req.body || {}
        if (!COUNTRIES.includes(country)) return res.status(400).json({ error: 'unknown country' })
        const { rows: usedRows } = await query('SELECT slot FROM stamps WHERE passport_id = $1 AND country = $2', [p.id, country])
        const used = usedRows.map((r) => r.slot)
        if (used.length >= SLOTS_PER_COUNTRY) return res.status(409).json({ error: 'country full' })
        let slot = 0
        while (used.includes(slot)) slot++
        await query('INSERT INTO stamps (passport_id, country, slot, staff, created_at) VALUES ($1, $2, $3, $4, $5)', [
          p.id,
          country,
          slot,
          String(staff).trim(),
          new Date().toISOString(),
        ])
        return res.status(201).json(await serialize(p))
      }

      // DELETE /api/admin/stamps/:id
      if (req.method === 'DELETE' && isAdmin && parts[1] === 'stamps' && parts[2]) {
        const { rows } = await query('DELETE FROM stamps WHERE id = $1 RETURNING id', [Number(parts[2])])
        if (!rows.length) return res.status(404).json({ error: 'not found' })
        return res.status(200).json({ ok: true })
      }

      return res.status(404).json({ error: 'no such route' })
    } catch (err) {
      return res.status(500).json({ error: String(err.message || err) })
    }
  }
}
