// Customer-side API client. The passport is READ-ONLY for guests: stamps are
// issued by staff in the admin portal and appear here via polling.
//
// Config comes from the URL (?code=MW-XXXXX&api=https://…) and is remembered
// in localStorage, so a guest can open their passport link once and keep it.
// Without a code+api the app runs in DEMO mode (tap-to-stamp, for previews).

const LS_CODE = 'miraz.code'
const LS_API = 'miraz.api'

export function getConfig() {
  const params = new URLSearchParams(window.location.search)
  const demo = params.get('demo') === '1'
  let code = params.get('code') || ''
  let api = params.get('api') || ''
  if (code) localStorage.setItem(LS_CODE, code)
  if (api) localStorage.setItem(LS_API, api)
  if (!code) code = localStorage.getItem(LS_CODE) || ''
  if (!api) api = localStorage.getItem(LS_API) || window.location.origin
  code = code.toUpperCase()
  const live = !demo && !!code && code.startsWith('MW-')
  return { live, code, api: api.replace(/\/$/, '') }
}

export async function fetchPassport({ api, code }) {
  const res = await fetch(`${api}/api/passports/${encodeURIComponent(code)}`)
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`)
  return res.json()
}

export const POLL_MS = 4000
