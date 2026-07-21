// Builds both frontends and collects them into public/ for Vercel:
// guest passport at /, staff portal at /admin.
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' })

for (const app of ['passport', 'admin']) {
  const dir = path.join(root, 'apps', app)
  run('npm ci', dir)
  run('npm run build', dir)
}

const pub = path.join(root, 'public')
fs.rmSync(pub, { recursive: true, force: true })
fs.cpSync(path.join(root, 'apps/passport/dist'), pub, { recursive: true })
fs.cpSync(path.join(root, 'apps/admin/dist'), path.join(pub, 'admin'), { recursive: true })
console.log('static output → public/')
