// Cloudflare Pages Function — served at /opus-diagnose
// Ported from netlify/functions/opus-diagnose.mjs.
// Env vars (Pages project settings): SUPABASE_ANON_KEY, ANTHROPIC_API_KEY, WHATSAPP_TOKEN
//   and (legacy, see TODO) OPUS_NETLIFY_TOKEN, NETLIFY_SITE_ID_*
//
// TODO (Cloudflare migration): the auto-heal actions below still call the Netlify
// Build API to redeploy Netlify sites. After the move to Cloudflare Pages these are
// obsolete — replace triggerNetlifyRedeploy() with a Cloudflare Pages deploy-hook
// POST (https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/<hook>)
// and update the health-check URLs to the Pages domain. Left as-is for now because
// the CF deploy-hook URLs / project IDs are not available in-repo.
const SUPABASE_URL = 'https://egztpclpcnizcdtfugsv.supabase.co';

// Request-scoped env, populated at the top of onRequest(). This endpoint is a
// low-frequency internal ops tool, so a module-scoped handle is acceptable here.
let ENV = {};
const env = (k) => ENV[k];
const supaKey = () => ENV.SUPABASE_ANON_KEY;

async function logOpusEvent(severity, message, metadata) {
  const SUPA_KEY = supaKey();
  if (!SUPA_KEY) return;
  try {
    await fetch(SUPABASE_URL + '/rest/v1/opus_events', {
      method: 'POST',
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ platform: 'opus_guardian', event_type: 'auto_heal', severity, message: (message||'').substring(0,1000), metadata: metadata || {} })
    });
  } catch(e) {}
}

// ─── AUTO-FIX ACTIONS ──────────────────────────────────────
async function triggerNetlifyRedeploy(siteId) {
  const token = env('OPUS_NETLIFY_TOKEN');
  if (!token) return { success: false, reason: 'NETLIFY_TOKEN not set' };
  try {
    const r = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/builds`, {
      method: 'POST', headers: { 'Authorization': 'Bearer ' + token }
    });
    return r.ok ? { success: true, action: 'Netlify redeploy triggered' } : { success: false, reason: 'HTTP ' + r.status };
  } catch(e) { return { success: false, reason: e.message }; }
}

async function sendWhatsAppAlert(message) {
  const phone = '+351911793045';
  try {
    const r = await fetch('https://graph.facebook.com/v18.0/me/messages', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + env('WHATSAPP_TOKEN'), 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: message } })
    });
    return r.ok;
  } catch(e) { return false; }
}

async function checkAndFixSupabaseTable(table) {
  const SUPA_KEY = supaKey();
  try {
    const r = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?select=*&limit=1', {
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
    });
    if (r.ok) return { success: true, action: table + ' table is accessible' };
    return { success: false, reason: table + ' returned HTTP ' + r.status };
  } catch(e) { return { success: false, reason: e.message }; }
}

async function checkEndpointHealth(url) {
  try {
    const r = await fetch(url, { method: 'GET' });
    return r.ok || r.status < 500;
  } catch(e) { return false; }
}

// ─── AUTO-HEAL LOGIC ───────────────────────────────────────
// TODO (Cloudflare migration): URLs + triggerNetlifyRedeploy targets are Netlify-specific.
const HEAL_MAP = {
  'chatbot': async () => {
    const ok = await checkEndpointHealth('https://tellinex-preview.netlify.app/.netlify/functions/ai-chat');
    if (ok) return { success: true, action: 'Chatbot is responding — may have been transient' };
    const r = await triggerNetlifyRedeploy(env('NETLIFY_SITE_ID_WEBSITE'));
    await logOpusEvent('warning', 'Auto-heal: redeploying website for chatbot fix', r);
    return r;
  },
  'landing': async () => {
    const ok = await checkEndpointHealth('https://tellinex-landing.netlify.app/');
    if (ok) return { success: true, action: 'Landing page is up — transient issue' };
    const r = await triggerNetlifyRedeploy(env('NETLIFY_SITE_ID_LANDING'));
    return r;
  },
  'website': async () => {
    const ok = await checkEndpointHealth('https://tellinex-preview.netlify.app/');
    if (ok) return { success: true, action: 'Website is up — transient issue' };
    const r = await triggerNetlifyRedeploy(env('NETLIFY_SITE_ID_WEBSITE'));
    return r;
  },
  'command': async () => {
    const ok = await checkEndpointHealth('https://app.tellinex.com/');
    if (ok) return { success: true, action: 'Command Centre is up — transient issue' };
    const r = await triggerNetlifyRedeploy(env('NETLIFY_SITE_ID_TCC'));
    return r;
  },
  'supabase': async () => await checkAndFixSupabaseTable('quote_requests'),
  'fieldpack': async () => await checkAndFixSupabaseTable('rst_sync'),
  'quotes': async () => await checkAndFixSupabaseTable('quote_requests'),
  'registrations': async () => await checkAndFixSupabaseTable('registrations'),
};

// ─── MAIN HANDLER ──────────────────────────────────────────
export async function onRequest(context) {
  ENV = context.env || {};
  const request = context.request;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (request.method === 'OPTIONS') return new Response('', { status: 204, headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({error:'POST only'}), { status: 405, headers });

  try {
    const body = await request.json();
    const { failing = [], healthy = [], autoHeal = true } = body;
    if (!failing.length) return new Response(JSON.stringify({diagnosis:'All systems healthy.',fixes:[],source:'guardian'}), { headers });

    // ── STEP 1: AUTO-FIX (before diagnosis) ────────────────
    const fixes = [];
    if (autoHeal) {
      for (const f of failing) {
        const healer = HEAL_MAP[f.id];
        if (healer) {
          try {
            const result = await healer();
            fixes.push({ service: f.name, id: f.id, ...result });
            await logOpusEvent(result.success ? 'info' : 'warning',
              `Auto-heal ${f.name}: ${result.success ? result.action : result.reason}`,
              { service: f.id, result });
          } catch(e) {
            fixes.push({ service: f.name, id: f.id, success: false, reason: e.message });
          }
        }
      }
    }

    // ── STEP 2: OPUS 4 DIAGNOSIS ─────────────────────────────
    const API_KEY = env('ANTHROPIC_API_KEY');
    let diagnosis = '';
    let source = 'fallback';

    const unfixed = fixes.filter(f => !f.success);
    const fixed = fixes.filter(f => f.success);

    if (API_KEY && unfixed.length > 0) {
      const prompt = `You are Opus Guardian, autonomous AI brain of Tellinex Command Centre.

AUTO-FIX RESULTS (already attempted):
${fixes.map(f => `- ${f.service}: ${f.success ? '✅ FIXED — ' + f.action : '❌ FAILED — ' + f.reason}`).join('\n')}

STILL FAILING:
${unfixed.map(f => `- ${f.service}`).join('\n') || 'None — all fixed!'}

HEALTHY SERVICES:
${healthy.map(f => `- ${f.name}`).join('\n')}

For any still-failing services:
1. ROOT CAUSE — why auto-fix failed
2. MANUAL FIX — exact steps for the engineer
3. SEVERITY — critical/warning/info

Be concise. 5 lines max per service.`;

      try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 800, messages: [{ role: 'user', content: prompt }] })
        });
        if (r.ok) {
          const data = await r.json();
          diagnosis = data.content?.map(c => c.text || '').join('\n') || '';
          source = 'opus4';
        }
      } catch(e) { diagnosis = 'Opus 4 API error: ' + e.message; }
    } else if (!API_KEY) {
      diagnosis = 'ANTHROPIC_API_KEY not set — add to Pages env vars.';
    } else {
      diagnosis = 'All failing services auto-fixed successfully.';
      source = 'auto_healed';
    }

    // ── STEP 3: WHATSAPP ALERT (if critical unfixed) ────────
    if (unfixed.length > 0 && env('WHATSAPP_TOKEN')) {
      const msg = `⚠️ OPUS GUARDIAN ALERT\n\n${unfixed.length} service(s) still failing after auto-fix:\n${unfixed.map(f => '• ' + f.service + ': ' + f.reason).join('\n')}\n\n${fixed.length} service(s) auto-fixed:\n${fixed.map(f => '✅ ' + f.service).join('\n')}\n\nCheck TCC: app.tellinex.com`;
      await sendWhatsAppAlert(msg);
      await logOpusEvent('critical', 'WhatsApp alert sent — ' + unfixed.length + ' unfixed', { unfixed: unfixed.map(f=>f.id) });
    }

    // ── STEP 4: SUMMARY ────────────────────────────────────
    const summary = {
      diagnosis,
      source,
      fixes,
      stats: { total: failing.length, fixed: fixed.length, unfixed: unfixed.length },
      timestamp: new Date().toISOString()
    };

    await logOpusEvent(unfixed.length > 0 ? 'warning' : 'info',
      `Guardian cycle: ${fixed.length}/${failing.length} auto-fixed` + (unfixed.length > 0 ? `, ${unfixed.length} need attention` : ' — all clear'),
      summary);

    return new Response(JSON.stringify(summary), { headers });

  } catch (err) {
    await logOpusEvent('error', 'opus-diagnose error: ' + (err.message||''), {});
    return new Response(JSON.stringify({ diagnosis: 'Function error: ' + (err.message||''), fixes: [], source: 'error' }), { status: 500, headers });
  }
}
