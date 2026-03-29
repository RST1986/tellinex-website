const SUPABASE_URL = 'https://egztpclpcnizcdtfugsv.supabase.co';

const BUSINESS_KEYWORDS = ['backbone','dark fibre','dark fiber','IRU','enterprise','wholesale','backhaul','dedicated circuit','SLA','tower','5G backhaul','lease','corporate','data centre','data center','colocation','B2B','quote','pricing for business','business plan','business pricing','ethernet','MPLS','point to point','p2p','dedicated line','carrier','transit','peering','wavelength','CWDM','DWDM'];

const TELLINEX_SYSTEM_PROMPT = `You are the Tellinex AI Assistant — Jamaica's first underground fibre broadband provider. You are friendly, knowledgeable, and proud of what Tellinex offers. You speak naturally and can understand Jamaican Patois as well as English.

KEY FACTS ABOUT TELLINEX:
- Jamaica's first 100% underground micro-trenched fibre network
- Built to survive Category 5 hurricanes (our network had zero damage during Hurricane Melissa in October 2025)
- Coming 2026, starting in New Kingston
- Expanding to all 14 parishes across Jamaica
- Founded by Omar Gentles (CEO, Jamaican cybersecurity expert with MSc, CRISC, CISM, CISA, CEH certifications) and Rui Santos (Technical Director, 21 years telecoms experience, built Portugal's first FTTH network)
- Technology: XGS-PON fibre + Nokia 5G, Hexatronic microduct infrastructure

RESIDENTIAL PLANS:
- Starter 100 Mbps symmetrical: US$45/month
- Performance 500 Mbps symmetrical: US$65/month
- Ultra 1 Gbps symmetrical: US$95/month
- All plans include: free professional installation, Wi-Fi 6E router included, no data caps, no throttling, 24/7 Jamaican-based support, underground hurricane-proof connection

BUSINESS PLANS:
- Business Fibre from US$99/month: up to 2 Gbps, 99.9% SLA, static IPs, 4-hour priority fault response
- Enterprise Solutions: 10 Gbps+ dedicated circuits, dark fibre, 99.99% SLA, dual-path redundancy
- Wholesale & Backhaul: 5G small cell backhaul, tower connectivity, IRU/dark fibre leasing, international carrier-grade transit

COVERAGE (Phase 1 — coming 2026):
- New Kingston, Half Way Tree, Liguanea, Hope Pastures, Mona, Papine, Cross Roads, Constant Spring
- Phase 2 (2027): Portmore, Spanish Town, Mandeville, Montego Bay
- Phase 3 (2028-2030): All 14 parishes island-wide

COMPETITORS:
- Flow (Liberty Latin America): aerial copper/coax network, vulnerable to hurricanes, speeds up to 150 Mbps
- Digicel: primarily mobile, limited fixed broadband, aerial infrastructure also vulnerable
- Tellinex advantage: underground fibre = hurricane proof, symmetrical speeds, newer technology, better service

RULES:
- Always be helpful, warm, and professional
- If someone asks about coverage in an area not in Phase 1, tell them the phase and encourage registration
- Never make up information — if unsure, say "Let me connect you with our team"
- Encourage registration at every opportunity
- Keep responses concise — 2-3 sentences max unless they ask for details
- You can understand and respond to Jamaican Patois naturally

ADDRESS VERIFICATION:
When a customer mentions their address or location, include: <!--ADDRESS:{"address":"15 Knutsford Boulevard, New Kingston"}-->
The system will geocode it and show satellite + street view images. Always ask "Is this your property?" after showing images.
If customer says no: ask for building name, unit number, or nearby landmark. Suggest sharing a Google Maps link.
If customer shares a Google Maps URL: the system extracts coordinates automatically.

QUOTE COLLECTION:
When a customer asks about ANY service including Residential, Business Fibre, Enterprise, Wholesale, or Dark Fibre, collect their details naturally: name, email, company, location, bandwidth needs, contract preference. Once you have at minimum name, email, and requirements, include a hidden block at the end: <!--QUOTE:{"type":"business_fibre","name":"...","email":"...","company":"...","location":"...","bandwidth":"...","contract":"...","requirements":"...","summary":"..."}-->

For RESIDENTIAL quotes, when you have name, email, phone, and address, include: <!--QUOTE:{"type":"residential","name":"...","email":"...","phone":"...","address":"...","service":"residential","plan":"...","source":"chatbot","status":"new"}-->
The type must be: residential, business_fibre, enterprise, wholesale_backhaul, or dark_fibre. Your visible response should confirm their details were sent to the business team.`;


function isBusinessQuery(messages) {
  const lastFew = messages.slice(-3).map(m => m.content.toLowerCase()).join(' ');
  return BUSINESS_KEYWORDS.some(kw => lastFew.includes(kw.toLowerCase()));
}


// SERVER-SIDE: Extract customer details from conversation (doesn't rely on AI generating hidden blocks)
function extractCustomerFromMessages(messages) {
  const userText = messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
  const emailMatch = userText.match(/[\w.-]+@[\w.-]+\.[a-z]{2,}/i);
  const phoneMatch = userText.match(/\b(\+?1?[-.]?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4})\b/) || userText.match(/\b(876[-.]?\d{3}[-.]?\d{4})\b/);
  const namePatterns = [/(?:my name is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i, /(?:name:?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i];
  let name = null;
  for (const p of namePatterns) { const m = userText.match(p); if (m) { name = m[1].trim(); break; } }
  const addrMatch = userText.match(/\b(\d+\s+[A-Z][\w\s]+(?:Road|Street|Avenue|Drive|Lane|Way|Crescent|Close|Place|Boulevard)[\w\s,]*(?:Kingston|Montego Bay|Spanish Town|Portmore|Mandeville|May Pen|Half Way Tree)[\s\d]*)/i);
  if (emailMatch || phoneMatch) {
    return { customer_name: name || 'Unknown', customer_email: emailMatch?.[0] || '', customer_phone: phoneMatch?.[0] || '', location: addrMatch?.[1]?.trim() || '', quote_type: 'residential', source: 'chatbot', status: 'new' };
  }
  return null;
}

function extractQuote(text) {
  const match = text.match(/<!--QUOTE:(.*?)-->/s);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

function cleanResponse(text) {
  return text.replace(/<!--QUOTE:.*?-->/s, '').replace(/<!--ADDRESS:.*?-->/s, '').trim();
}

async function writeQuoteToSupabase(quote, supabaseKey) {
  try {
    const payload = {
      quote_type: quote.quote_type || quote.type || quote.service_type || 'residential',
      customer_name: quote.customer_name || quote.name || null,
      customer_email: quote.customer_email || quote.email || null,
      customer_phone: quote.customer_phone || quote.phone || null,
      location: quote.location || quote.address || null,
      source: quote.source || 'chatbot',
      status: quote.status || 'new'
    };
    console.log('TELLINEX: Writing quote to Supabase:', JSON.stringify(payload));
    const res = await fetch(SUPABASE_URL + '/rest/v1/quote_requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey, 'Authorization': 'Bearer ' + supabaseKey, 'Prefer': 'return=minimal' },
      body: JSON.stringify(payload)
    });
    console.log('TELLINEX: Supabase response:', res.status);
  } catch (e) { console.error('TELLINEX: Quote save error:', e.message); }
}


function extractAddress(text) {
  const match = text.match(/<!--ADDRESS:(.*?)-->/s);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

function extractGoogleMapsCoords(text) {
  const patterns = [/@(-?\d+\.\d+),(-?\d+\.\d+)/, /q=(-?\d+\.\d+),(-?\d+\.\d+)/, /ll=(-?\d+\.\d+),(-?\d+\.\d+)/];
  for (const p of patterns) { const m = text.match(p); if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) }; }
  return null;
}

async function geocodeAddress(address, apiKey) {
  try {
    const res = await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(address + ', Jamaica') + '&region=jm&key=' + apiKey);
    const data = await res.json();
    if (data.results && data.results[0]) { const loc = data.results[0].geometry.location; return { lat: loc.lat, lng: loc.lng, formatted: data.results[0].formatted_address }; }
    return null;
  } catch (e) { return null; }
}

function generateMapUrls(lat, lng, apiKey) {
  return {
    satellite: 'https://maps.googleapis.com/maps/api/staticmap?center=' + lat + ',' + lng + '&zoom=19&size=600x400&maptype=satellite&markers=color:green|' + lat + ',' + lng + '&key=' + apiKey,
    streetView: 'https://maps.googleapis.com/maps/api/streetview?location=' + lat + ',' + lng + '&size=600x400&fov=90&heading=0&pitch=10&key=' + apiKey
  };
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ANTHROPIC_API_KEY = Netlify.env.get("ANTHROPIC_API_KEY");
    const MAPS_KEY = Netlify.env.get("GOOGLE_MAPS_API_KEY");

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          content: [{ type: "text", text: "Our AI assistant is being set up. Please email us at info@tellinex.com and we'll help you right away!" }],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: isBusinessQuery(messages) ? "claude-sonnet-4-20250514" : "claude-haiku-4-5-20251001",
        max_tokens: isBusinessQuery(messages) ? 1024 : 512,
        system: TELLINEX_SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    const data = await response.json();

    // Extract and save quote if present
    if (data.content && data.content[0] && data.content[0].text) {
      const rawText = data.content[0].text;
      const quote = extractQuote(rawText);
      if (quote) {
        const SUPA_KEY = Netlify.env.get("SUPABASE_ANON_KEY");
        if (SUPA_KEY) writeQuoteToSupabase(quote, SUPA_KEY);
        data.content[0].text = cleanResponse(rawText);
      }
    // Customer details now extracted in address verification block

    }

    
    // Handle address verification
    if (data.content && data.content[0] && data.content[0].text) {
      const addrData = extractAddress(data.content[0].text);
      if (addrData && MAPS_KEY) {
        const geo = await geocodeAddress(addrData.address, MAPS_KEY);
        if (geo) {
          const urls = generateMapUrls(geo.lat, geo.lng, MAPS_KEY);
          data.content[0].text = data.content[0].text.replace(/<!--ADDRESS:.*?-->/s, '') +
            '\n\n![Satellite view](' + urls.satellite + ')\n![Street view](' + urls.streetView + ')\n\nIs this your property?';
          // Write address verification to Supabase immediately
          const SUPA_KEY_ADDR = Netlify.env.get("SUPABASE_ANON_KEY");
          if (SUPA_KEY_ADDR) {
            try {
              const supaRes = await fetch(SUPABASE_URL + '/rest/v1/quote_requests', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': SUPA_KEY_ADDR,
                  'Authorization': 'Bearer ' + SUPA_KEY_ADDR,
                  'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                  quote_type: 'residential',
                  customer_name: (() => { const cd = extractCustomerFromMessages(messages); return cd?.customer_name || null; })(),
                  customer_email: (() => { const cd = extractCustomerFromMessages(messages); return cd?.customer_email || null; })(),
                  customer_phone: (() => { const cd = extractCustomerFromMessages(messages); return cd?.customer_phone || null; })(),
                  location: geo.formatted || addrData.address,
                  latitude: geo.lat,
                  longitude: geo.lng,
                  satellite_image_url: urls.satellite,
                  street_view_url: urls.streetView,
                  address_confirmed: false,
                  source: 'ai_chatbot',
                  status: 'new'
                })
              });
              if (!supaRes.ok) console.error('Supabase address write failed:', supaRes.status, await supaRes.text());
            } catch(e) { console.error('Supabase address write error:', e); }
          }
        }
      }
      // Check if customer shared Google Maps link
      const lastUserMsg = messages[messages.length - 1];
      if (lastUserMsg && lastUserMsg.role === 'user') {
        const coords = extractGoogleMapsCoords(lastUserMsg.content);
        if (coords && MAPS_KEY && !data.content[0].text.includes('![')) {
          const urls = generateMapUrls(coords.lat, coords.lng, MAPS_KEY);
          data.content[0].text += '\n\n![Satellite view](' + urls.satellite + ')\n![Street view](' + urls.streetView + ')';
        }
      }
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        content: [{ type: "text", text: "I'm having a brief connection issue. Please try again, or email info@tellinex.com!" }],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  }
};

export const config = {
  path: "/.netlify/functions/ai-chat",
};
