// Vercel serverless entry — all /api/* routes (single entry, routed via vercel.json). Postgres via DATABASE_URL
// (Neon: add it from the Vercel dashboard → Storage → Neon).
import pg from 'pg'
import { createApi } from './_impl.js'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 1, // serverless: one connection per instance, Neon pools upstream
})

const handle = createApi((text, params) => pool.query(text, params), process.env.ADMIN_KEY || 'miraz-dev-key')

export default function handler(req, res) {
  return handle(req, res)
}
