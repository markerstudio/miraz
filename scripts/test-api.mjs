// Verifies the serverless API core against an in-memory Postgres (pg-mem):
// auth, passport lifecycle, staff-only stamping, slot allocation, undo.
import { newDb } from 'pg-mem'
import { createApi } from '../api/_impl.js'

const db = newDb()
const { Pool } = db.adapters.createPg()
const pool = new Pool()
const handle = createApi((text, params) => pool.query(text, params), 'test-key')

const call = (method, url, body, key) =>
  new Promise((resolve) => {
    const req = { method, url, body, headers: key ? { 'x-admin-key': key } : {} }
    const res = {
      statusCode: 200,
      setHeader() {},
      status(c) {
        this.statusCode = c
        return this
      },
      json(d) {
        resolve({ status: this.statusCode, data: d })
      },
      end() {
        resolve({ status: this.statusCode })
      },
    }
    handle(req, res)
  })

let failures = 0
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) failures++
}

const health = await call('GET', '/api/health')
check('health', health.data?.ok === true)

const noAuth = await call('POST', '/api/admin/passports', { name: 'x' })
check('admin requires key', noAuth.status === 401)

const created = await call('POST', '/api/admin/passports', { name: 'ليان خوري', phone: '0598' }, 'test-key')
check('create passport', created.status === 201 && /^MW-[A-Z2-9]{5}$/.test(created.data.passport.code))
const code = created.data.passport.code

const guest = await call('GET', `/api/passports/${code.toLowerCase()}`)
check('guest read (case-insensitive)', guest.status === 200 && guest.data.total === 0)

const badCountry = await call('POST', `/api/admin/passports/${code}/stamps`, { country: 'mars' }, 'test-key')
check('unknown country rejected', badCountry.status === 400)

for (let i = 0; i < 6; i++) {
  await call('POST', `/api/admin/passports/${code}/stamps`, { country: 'levant', staff: 'سلمى' }, 'test-key')
}
const afterSix = await call('GET', `/api/passports/${code}`)
check('six levant stamps, slots 0..5', afterSix.data.total === 6 && [...afterSix.data.stamps.map((s) => s.slot)].sort().join('') === '012345')

const seventh = await call('POST', `/api/admin/passports/${code}/stamps`, { country: 'levant' }, 'test-key')
check('country full at 6', seventh.status === 409)

const italy = await call('POST', `/api/admin/passports/${code}/stamps`, { country: 'italy' }, 'test-key')
check('other country still stamps', italy.status === 201 && italy.data.total === 7)

const stampId = italy.data.stamps.find((s) => s.country === 'italy').id
const undo = await call('DELETE', `/api/admin/stamps/${stampId}`, null, 'test-key')
check('undo stamp', undo.status === 200)
const afterUndo = await call('GET', `/api/passports/${code}`)
check('total back to 6', afterUndo.data.total === 6)

const list = await call('GET', '/api/admin/passports?q=ليان', null, 'test-key')
check('search finds guest with total', list.data?.[0]?.code === code && list.data[0].total === 6)

const missing = await call('GET', '/api/passports/MW-ZZZZZ')
check('unknown code 404', missing.status === 404)

console.log(failures ? `\n${failures} FAILURES` : '\nALL PASS')
process.exit(failures ? 1 : 0)
