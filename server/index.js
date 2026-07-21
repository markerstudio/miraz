// Miraz World — Flavor Passport API.
// Stamps are issued by STAFF only (admin key); customers read their passport.
// SQLite keeps v1 dependency-free of managed services; swap DB_PATH to a
// mounted volume in production (Render/Railway/Fly).

import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 8787
const ADMIN_KEY = process.env.ADMIN_KEY || 'miraz-dev-key'
const VALIDITY_MONTHS = 6

const COUNTRIES = ['eastasia', 'levant', 'greece', 'usa', 'italy', 'morocco']
const SLOTS_PER_COUNTRY = 6

const db = new Database(process.env.DB_PATH || path.join(__dirname, 'miraz.db'))
db.pragma('journal_mode = WAL')
db.exec(`
  CREATE TABLE IF NOT EXISTS passports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    dob TEXT DEFAULT '',
    issued_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS stamps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passport_id INTEGER NOT NULL REFERENCES passports(id) ON DELETE CASCADE,
    country TEXT NOT NULL,
    slot INTEGER NOT NULL,
    staff TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    UNIQUE (passport_id, country, slot)
  );
`)

const app = express()
app.use(cors({ origin: true, allowedHeaders: ['Content-Type', 'x-admin-key'] }))
app.use(express.json())

const adminOnly = (req, res, next) => {
  if (req.get('x-admin-key') !== ADMIN_KEY) return res.status(401).json({ error: 'unauthorized' })
  next()
}

// unambiguous code alphabet (no O/0, I/1)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const newCode = () => {
  for (;;) {
    let c = 'MW-'
    for (let i = 0; i < 5; i++) c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
    if (!db.prepare('SELECT 1 FROM passports WHERE code = ?').get(c)) return c
  }
}

const serialize = (p) => {
  const stamps = db
    .prepare('SELECT id, country, slot, staff, created_at FROM stamps WHERE passport_id = ? ORDER BY created_at')
    .all(p.id)
  return {
    passport: { code: p.code, name: p.name, phone: p.phone, dob: p.dob, issued_at: p.issued_at, expires_at: p.expires_at },
    stamps,
    total: stamps.length,
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// ---- customer (read-only) ----
app.get('/api/passports/:code', (req, res) => {
  const p = db.prepare('SELECT * FROM passports WHERE code = ?').get(req.params.code.toUpperCase())
  if (!p) return res.status(404).json({ error: 'not found' })
  res.json(serialize(p))
})

// ---- staff ----
app.post('/api/admin/passports', adminOnly, (req, res) => {
  const { name, phone = '', dob = '' } = req.body || {}
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'name required' })
  const issued = new Date()
  const expires = new Date(issued)
  expires.setMonth(expires.getMonth() + VALIDITY_MONTHS)
  const code = newCode()
  db.prepare('INSERT INTO passports (code, name, phone, dob, issued_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    code,
    String(name).trim(),
    String(phone).trim(),
    String(dob).trim(),
    issued.toISOString(),
    expires.toISOString(),
  )
  res.status(201).json(serialize(db.prepare('SELECT * FROM passports WHERE code = ?').get(code)))
})

app.get('/api/admin/passports', adminOnly, (req, res) => {
  const q = `%${(req.query.q || '').trim()}%`
  const rows = db
    .prepare(
      `SELECT p.*, COUNT(s.id) AS total FROM passports p
       LEFT JOIN stamps s ON s.passport_id = p.id
       WHERE p.name LIKE ? OR p.phone LIKE ? OR p.code LIKE ?
       GROUP BY p.id ORDER BY p.id DESC LIMIT 50`,
    )
    .all(q, q, q)
  res.json(rows.map((r) => ({ code: r.code, name: r.name, phone: r.phone, total: r.total, issued_at: r.issued_at, expires_at: r.expires_at })))
})

app.post('/api/admin/passports/:code/stamps', adminOnly, (req, res) => {
  const p = db.prepare('SELECT * FROM passports WHERE code = ?').get(req.params.code.toUpperCase())
  if (!p) return res.status(404).json({ error: 'not found' })
  if (new Date(p.expires_at) < new Date()) return res.status(409).json({ error: 'passport expired' })
  const { country, staff = '' } = req.body || {}
  if (!COUNTRIES.includes(country)) return res.status(400).json({ error: 'unknown country' })
  const used = db.prepare('SELECT slot FROM stamps WHERE passport_id = ? AND country = ?').all(p.id, country).map((r) => r.slot)
  if (used.length >= SLOTS_PER_COUNTRY) return res.status(409).json({ error: 'country full' })
  let slot = 0
  while (used.includes(slot)) slot++
  db.prepare('INSERT INTO stamps (passport_id, country, slot, staff, created_at) VALUES (?, ?, ?, ?, ?)').run(
    p.id,
    country,
    slot,
    String(staff).trim(),
    new Date().toISOString(),
  )
  res.status(201).json(serialize(p))
})

app.delete('/api/admin/stamps/:id', adminOnly, (req, res) => {
  const info = db.prepare('DELETE FROM stamps WHERE id = ?').run(req.params.id)
  if (!info.changes) return res.status(404).json({ error: 'not found' })
  res.json({ ok: true })
})

// ---- static hosting: one deploy serves both apps + the API ----
const passportDist = path.join(__dirname, '../apps/passport/dist')
const adminDist = path.join(__dirname, '../apps/admin/dist')
if (fs.existsSync(adminDist)) {
  app.use('/admin', express.static(adminDist))
  app.get('/admin/*', (_req, res) => res.sendFile(path.join(adminDist, 'index.html')))
}
if (fs.existsSync(passportDist)) {
  app.use('/', express.static(passportDist))
  app.get('*', (req, res, next) => (req.path.startsWith('/api') ? next() : res.sendFile(path.join(passportDist, 'index.html'))))
}

app.listen(PORT, () => console.log(`Miraz API on :${PORT}`))
