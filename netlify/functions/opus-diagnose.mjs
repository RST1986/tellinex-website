// Opus Guardian — Auto-diagnose via Claude Opus 4
// Called by TCC OpusGuardian when services fail
// Netlify function: /.netlify/functions/opus-diagnose

const SUPABASE_URL = 'https://egztpclpcnizcdtfugsv.supabase.co';
const SUPA_KEY = process.env.SUPABASE_ANON_KEY || Netlify.env.get('SUPABASE_ANON_KEY');

async function logOpusEvent(severity, message, metadata) {
  try {
    await fetch(SUPABASE_URL + '/rest/v1/opus_events', {
      method: 'POST',
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ platform: 'command_centre', event_type: 'auto_diagnose', severity, message: (message||'').substring(0,1000), metadata: metadata || {} })
    });
  } catch(e) {}
}

export default async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({error:'POST only'}), { status: 405, headers });

  try {
    const body = await req.json();
    const { failing = [], healthy = [] } = body;

    if (!failing.length) return new Response(JSON.stringify({diagnosis:'All systems healthy — no diagnosis needed.'}), { headers });

    const API_KEY = process.env.ANTHROPIC_API_KEY || Netlify.env.get('ANTHROPIC_API_KEY');
    if (!API_KEY) {
      await logOpusEvent('error', 'ANTHROPIC_API_KEY not set in Netlify env vars', { failing });
      return new Response(JSON.stringify({
        diagnosis: 'Opus 4 API key not configured.\n\nManual diagnosis for failing services:\n' + failing.map(f => '• ' + f.name + ': ' + f.heal).join('\n'),
        source: 'fallback'
      }), { headers });
    }

    const prompt = `You are Opus Guardian, the autonomous AI brain of Tellinex Command Centre. You monitor and auto-heal all Tellinex platforms.

FAILING SERVICES:
${failing.map(f => `- ${f.name} (${f.id}): ${f.heal}`).join('\n')}

HEALTHY SERVICES:
${healthy.map(f => `- ${f.name}`).join('\n')}

For each failing service provide:
1. ROOT CAUSE — most likely reason (be specific)
2. AUTO-FIX — exact steps to resolve (commands, config changes, or API calls)
3. SEVERITY — critical / warning / info
4. ETA — estimated fix time

Then provide an OVERALL ASSESSMENT of system health.
Be concise. Think like a senior network engineer with 21 years telecom experience.`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const err = await res.text();
      await logOpusEvent('error', 'Claude API error: ' + res.status, { error: err.substring(0,500) });
      return new Response(JSON.stringify({
        diagnosis: 'Opus 4 API returned ' + res.status + '.\n\nFallback:\n' + failing.map(f => '• ' + f.name + ': ' + f.heal).join('\n'),
        source: 'fallback'
      }), { headers });
    }

    const data = await res.json();
    const diagnosis = data.content?.map(c => c.text || '').join('\n') || 'No diagnosis returned';

    await logOpusEvent('info', 'Auto-diagnosis complete: ' + failing.length + ' service(s) analysed', {
      failing: failing.map(f => f.id),
      healthy: healthy.map(f => f.id),
      diagnosis_preview: diagnosis.substring(0, 300)
    });

    return new Response(JSON.stringify({ diagnosis, source: 'opus4' }), { headers });

  } catch (err) {
    await logOpusEvent('error', 'opus-diagnose function error: ' + (err.message||''), {});
    return new Response(JSON.stringify({
      diagnosis: 'Opus Guardian function error: ' + (err.message || 'Unknown') + '\n\nCheck Netlify function logs.',
      source: 'error'
    }), { status: 500, headers });
  }
};
