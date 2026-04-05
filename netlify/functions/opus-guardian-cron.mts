// Opus Guardian Autonomous Cron — runs every 5 minutes on Netlify
// No browser needed. Checks all platforms, auto-heals, alerts via WhatsApp.
// Netlify scheduled function: /.netlify/functions/opus-guardian-cron

import { schedule } from '@netlify/functions'

const SUPABASE_URL = 'https://egztpclpcnizcdtfugsv.supabase.co'
const env = (k) => process.env[k] || (typeof Netlify !== 'undefined' ? Netlify.env.get(k) : null)
const SUPA_KEY = env('SUPABASE_ANON_KEY')

async function log(severity, message, metadata) {
  try {
    await fetch(SUPABASE_URL + '/rest/v1/opus_events', {
      method: 'POST',
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ platform: 'opus_cron', event_type: 'auto_monitor', severity, message: (message||'').substring(0,1000), metadata: metadata || {} })
    })
  } catch(e) {}
}

// ─── HEALTH CHECKS ─────────────────────────────────────────
async function checkUrl(url, timeout = 8000) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    const r = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    return r.ok || r.status < 500
  } catch { return false }
}

async function checkSupabase(table) {
  try {
    const r = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?select=*&limit=1', {
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
    })
    return r.ok
  } catch { return false }
}

const CHECKS = [
  { id: 'website', name: 'Main Website', check: () => checkUrl('https://tellinex-preview.netlify.app/') },
  { id: 'landing', name: 'Landing Page', check: () => checkUrl('https://tellinex-landing.netlify.app/') },
  { id: 'tcc', name: 'Command Centre', check: () => checkUrl('https://app.tellinex.com/') },
  { id: 'chatbot', name: 'AI Chatbot', check: () => checkUrl('https://tellinex-preview.netlify.app/.netlify/functions/ai-chat') },
  { id: 'supabase', name: 'Supabase', check: () => checkSupabase('quote_requests') },
  { id: 'fieldpack', name: 'FieldPack Sync', check: () => checkSupabase('rst_sync') },
  { id: 'opus_events', name: 'Opus Events', check: () => checkSupabase('opus_events') },
]

// ─── AUTO-HEAL ─────────────────────────────────────────────
async function triggerRedeploy(siteId) {
  const token = env('OPUS_NETLIFY_TOKEN')
  if (!token || !siteId) return { success: false, reason: 'Missing token or site ID' }
  try {
    const r = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/builds`, {
      method: 'POST', headers: { 'Authorization': 'Bearer ' + token }
    })
    return r.ok ? { success: true, action: 'Redeploy triggered' } : { success: false, reason: 'HTTP ' + r.status }
  } catch(e) { return { success: false, reason: e.message } }
}

const HEAL_MAP = {
  website: () => triggerRedeploy(env('NETLIFY_SITE_ID_WEBSITE')),
  landing: () => triggerRedeploy(env('NETLIFY_SITE_ID_LANDING')),
  tcc: () => triggerRedeploy(env('NETLIFY_SITE_ID_TCC')),
  chatbot: () => triggerRedeploy(env('NETLIFY_SITE_ID_WEBSITE')),
}

async function sendWhatsApp(message) {
  const token = env('WHATSAPP_TOKEN')
  if (!token) return false
  try {
    await fetch('https://graph.facebook.com/v18.0/me/messages', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: '351911793045', type: 'text', text: { body: message } })
    })
    return true
  } catch { return false }
}

// ─── OPUS 4 DIAGNOSIS ──────────────────────────────────────
async function diagnoseWithOpus4(failing, healthy) {
  const key = env('ANTHROPIC_API_KEY')
  if (!key || failing.length === 0) return null
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 600,
        messages: [{ role: 'user', content: `Opus Guardian cron: ${failing.map(f=>f.name).join(', ')} failing. ${healthy.map(h=>h.name).join(', ')} healthy. Root cause + fix in 3 lines per service.` }]
      })
    })
    if (!r.ok) return null
    const data = await r.json()
    return data.content?.map(c => c.text || '').join('\n') || null
  } catch { return null }
}

// ─── MAIN CRON HANDLER (every 5 min) ───────────────────────
const handler = schedule('*/5 * * * *', async () => {
  const results = {}
  const failing = []
  const healthy = []

  // Step 1: Check all endpoints
  for (const c of CHECKS) {
    const ok = await c.check()
    results[c.id] = ok
    if (ok) healthy.push(c)
    else failing.push(c)
  }

  // Step 2: If all healthy, log and exit
  if (failing.length === 0) {
    await log('info', `Cron: ${CHECKS.length}/${CHECKS.length} healthy`, { results })
    return { statusCode: 200 }
  }

  // Step 3: Auto-heal failing services
  const fixes = []
  for (const f of failing) {
    const healer = HEAL_MAP[f.id]
    if (healer) {
      const result = await healer()
      fixes.push({ id: f.id, name: f.name, ...result })
      await log(result.success ? 'info' : 'warning', `Auto-heal ${f.name}: ${result.success ? result.action : result.reason}`, result)
    } else {
      fixes.push({ id: f.id, name: f.name, success: false, reason: 'No auto-heal available' })
    }
  }

  // Step 4: Opus 4 diagnosis for unfixed services
  const unfixed = fixes.filter(f => !f.success)
  let diagnosis = null
  if (unfixed.length > 0) {
    diagnosis = await diagnoseWithOpus4(unfixed, healthy)
    if (diagnosis) {
      await log('warning', 'Opus 4 cron diagnosis: ' + diagnosis.substring(0, 500), { unfixed: unfixed.map(f => f.id) })
    }
  }

  // Step 5: WhatsApp alert if critical services still failing
  const criticalIds = ['website', 'tcc', 'supabase', 'chatbot']
  const criticalFailing = unfixed.filter(f => criticalIds.includes(f.id))
  if (criticalFailing.length > 0) {
    const msg = `⚠️ OPUS GUARDIAN (auto)\n\n${criticalFailing.length} critical service(s) down:\n${criticalFailing.map(f => '• ' + f.name).join('\n')}\n\n${fixes.filter(f=>f.success).length} auto-fixed.\n\n${diagnosis ? 'Opus 4: ' + diagnosis.substring(0, 200) : ''}\n\napp.tellinex.com`
    await sendWhatsApp(msg)
    await log('critical', 'WhatsApp alert sent — critical services failing', { critical: criticalFailing.map(f => f.id) })
  }

  // Step 6: Final summary log
  await log(unfixed.length > 0 ? 'warning' : 'info',
    `Cron complete: ${healthy.length + fixes.filter(f=>f.success).length}/${CHECKS.length} healthy, ${unfixed.length} need attention`,
    { results, fixes, diagnosis: diagnosis?.substring(0, 300) })

  return { statusCode: 200 }
})

export { handler }
