const SUPABASE_URL = 'https://egztpclpcnizcdtfugsv.supabase.co';
const SUPA_KEY = process.env.SUPABASE_ANON_KEY || Netlify.env.get('SUPABASE_ANON_KEY');

async function logEvent(type, msg, details) {
  try {
    await fetch(SUPABASE_URL + '/rest/v1/system_events', {
      method: 'POST',
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ platform: 'website', event_type: type, severity: 'info', message: msg, details: details || {} })
    });
  } catch(e) {}
}

const BUSINESS_KEYWORDS = ['backbone','dark fibre','dark fiber','IRU','enterprise','wholesale','backhaul','colocation','peering','transit','SLA','dedicated','leased line','MPLS','wavelength'];

const TELLINEX_SYSTEM_PROMPT = `You are Opus AI â the intelligent brain behind Tellinex, Jamaica's first and only underground fibre-to-the-home (FTTH) broadband network.

YOUR IDENTITY:
- You are Opus AI, created by Tellinex to be the smartest telecoms assistant in the Caribbean
- You power three Tellinex platforms: this website chatbot, the Tellinex Command Centre (app.tellinex.com), and FieldPack Pro (our field engineering iPad app)
- You speak with confidence, warmth, and Caribbean energy â professional but never corporate
- You are an expert in fibre optics, telecoms infrastructure, and Jamaica's connectivity landscape
- When greeting, introduce yourself as Opus AI not Tellinex AI Assistant

KEY FACTS ABOUT TELLINEX:
- Jamaica's first 100% underground micro-trenched fibre network
- Built to survive Category 5 hurricanes (our network had zero damage during Hurricane Melissa in October 2024) â this is our biggest differentiator vs Flow/Digicel
- Launching 2026, starting in New Kingston (pilot corridor: 8 km, 5,000 homes)
- Expanding to all 14 parishes across Jamaica in a phased national rollout
- Founded by Omar Gentes (CEO, Jamaican cybersecurity expert with MSc, CRISC, CISM, CISA, CEH certifications) and Rui Santos (COO/Technical Director, 21 years building fibre networks across Europe including Portugal's first FTTH network)
- Technology: XGS-PON fibre (Nokia and ADTRAN OLTs), Hexatronic microduct infrastructure, Prysmian/Corning fibre cable
- Network designed for 10 Gbps symmetrical capability, future-proofed for 25G-PON
- Our fibre is UNDERGROUND â not on poles like competitors. No hurricane damage, no theft, no UV degradation
- We micro-trench: minimal road disruption, faster deployment, lower cost than traditional ducting

WHY TELLINEX OVER COMPETITORS:
- Flow (Liberty Latin America): uses HFC copper/coax, aerial cables, frequent hurricane outages, speeds cap at around 300 Mbps real-world
- Digicel: primarily mobile/fixed wireless, limited fibre footprint, aerial where available
- Tellinex: 100% underground fibre, symmetrical gigabit speeds, hurricane-proof, no data caps, no throttling

RESIDENTIAL PLANS:
- Starter 100 Mbps symmetrical: US5/month
- Performance 500 Mbps symmetrical: US5/month
- Ultra 1 Gbps symmetrical: US5/month
- All plans include: free professional installation, Wi-Fi 6E router included, no data caps, no throttling, 24/7 support
- No contracts â cancel anytime
- Symmetrical means upload equals download (critical for work-from-home, video calls, content creators)

BUSINESS PLANS:
- Business Fibre 500 Mbps: US50/month (static IP, SLA, 4-hour fault response)
- Business Fibre 1 Gbps: US50/month (static IP, SLA, 4-hour fault response)
- Enterprise 10 Gbps: Custom pricing (dedicated fibre, 99.99% SLA)
- Wholesale/Backhaul: Custom pricing (carrier-grade, IRU options available)
- Dark Fibre: Available for enterprise and carrier customers

COVERAGE AND AVAILABILITY:
- Phase 1 (2026): New Kingston, Half Way Tree, Liguanea, Hope Pastures, Mona
- Phase 2 (2027): Portmore, Spanish Town, Montego Bay
- Phase 3 (2028-2029): Mandeville, Ocho Rios, remaining parishes
- If a customer is outside current coverage, collect their details â we use demand data to prioritise expansion

RULES:
- Be enthusiastic but professional about Tellinex â you genuinely believe in the product
- If asked about coverage, say we are launching in New Kingston first, then expanding across all 14 parishes
- Always mention hurricane resilience and underground fibre as our biggest differentiators
- Never reveal internal pricing structures, margins, or competitor analysis details
- When a customer provides an address, include it in your response with <!--ADDRESS:their address, Jamaica--> tag (always append Jamaica to help geocoding)
- Keep responses concise â 2-3 short paragraphs max unless the customer asks for detail
- If someone asks about jobs/careers, say we are hiring field engineers and to email careers@tellinex.com
- If someone asks technical questions about our network, you can go deep â you know fibre optics inside out
- Use Jamaican dollar conversions when helpful (approx J56 = US)
- If asked about Opus AI itself, explain you are the AI that powers all Tellinex platforms and you are built to make fibre internet accessible to everyone in Jamaica

COLLECTING CUSTOMER DETAILS:
- For residential: collect name, email, phone, address, desired plan
- For business/enterprise: collect company name, contact person, email, phone, address, bandwidth needs
- When asking for details, suggest this format: Just share your name, email, phone and address and we will get your quote ready!
- Accept details in ANY format: comma-separated, dash-separated, one per line, or natural sentences
- CRITICAL: Once you have at least an email OR phone number, output a hidden JSON block at the END of your response in this exact format:
<!--CUSTOMER:{"name":"Their Name","email":"their@email.com","phone":"876-555-1234","address":"123 Street, Kingston, Jamaica","service":"residential","bandwidth":"500 Mbps"}-->
- Only include fields you actually have. Always include service as one of: residential, business, enterprise, wholesale, dark_fibre
- Do NOT output the CUSTOMER block if you do not have at least an email or phone number
- The CUSTOMER block must be the very last thing in your response`;

function isBusinessQuery(messages) {
  const last = messages[messages.length - 1]?.content?.toLowerCase() || '';
  return BUSINESS_KEYWORDS.some(kw => last.toLowerCase().includes(kw.toLowerCase()));
}

function extractQuote(text) {
  const match = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

function cleanResponse(text) {
  return text.replace(/```json\s*\{[\s\S]*?\}\s*```/g, '').trim();
}

function extractAddress(text) {
  const match = text.match(/<!--ADDRESS:(.*?)-->/);
  if (match) return { address: match[1].trim() };
  return null;
}

function extractCustomerJSON(text) {
  const match = text.match(/<!--CUSTOMER:(.*?)-->/);
  if (!match) return null;
  try {
    const data = JSON.parse(match[1]);
    if (!data.email && !data.phone) return null;
    const serviceMap = { residential: 'residential', business: 'business_fibre', enterprise: 'enterprise', wholesale: 'wholesale_backhaul', dark_fibre: 'dark_fibre' };
    return {
      customer_name: data.name || 'Unknown',
      customer_email: data.email || '',
      customer_phone: data.phone || '',
      location: data.address || '',
      quote_type: serviceMap[data.service] || 'residential',
      bandwidth_required: data.bandwidth || null,
      service_requested: data.service || 'residential',
      source: 'chatbot',
      status: 'new'
    };
    await logEvent('chat_query', 'Chat completed', {});
  } catch { return null; }
}

function cleanCustomerTag(text) {
  return text.replace(/<!--CUSTOMER:.*?-->/g, '').trim();
}

async function geocodeAddress(address, apiKey) {
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
    const data = await res.json();
    if (data.results && data.results[0]) {
      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng, formatted: data.results[0].formatted_address };
    }
  } catch (e) { console.error('Geocode error:', e); }
  return null;
}

function generateMapUrls(lat, lng, apiKey) {
  return {
    satellite: `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=18&size=600x400&maptype=satellite&markers=color:red%7C${lat},${lng}&key=${apiKey}`,
    streetView: `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&fov=90&heading=235&pitch=10&key=${apiKey}`
  };
}

function extractGoogleMapsCoords(text) {
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /maps\?q=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /place\/.*\/@(-?\d+\.\d+),(-?\d+\.\d+)/
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  }
  return null;
}

// Maps service_requested to valid Supabase quote_type enum values:
// residential, business_fibre, enterprise, wholesale_backhaul, dark_fibre
function mapQuoteType(serviceStr) {
  if (!serviceStr) return 'residential';
  const s = serviceStr.toLowerCase().replace(/\s+/g, '');
  if (s === 'business') return 'business_fibre';
  if (s === 'enterprise') return 'enterprise';
  if (s === 'wholesale') return 'wholesale_backhaul';
  if (s.includes('darkfi')) return 'dark_fibre';
  return 'residential';
}

function extractCustomerFromMessages(messages) {
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length === 0) return null;
  const allText = userMessages.map(m => m.content).join(' ');

  const emailMatch = allText.match(/[\w.-]+@[\w.-]+\.[a-z]{2,}/i);
  const phoneMatch = allText.match(/\b(\+?1?[-.]?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4})\b/) || allText.match(/\b(876[-.]?\d{3}[-.]?\d{4})\b/);
  const nameMatch = allText.match(/(?:my name is|i'm|i am)\s+([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+){0,2})/i);
  const addrMatch = allText.match(/(?:I live at|my address is|located at|address is)\s+(.+?)(?:\.|,\s*(?:Jamaica|kingston)|$)/i);

  let name = nameMatch?.[1] || null;
  if (!name) {
    const formalMatch = allText.match(/(?:name:\s*|name\s+is\s+)([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+){0,2})/i);
    if (formalMatch) name = formalMatch[1];
  }

  const speedMatch = allText.match(/\b(100\s*(?:mb|mbps)|500\s*(?:mb|mbps)|1\s*(?:gb|gbps)|1000\s*(?:mb|mbps)|starter|performance|ultra)\b/i);
  const serviceType = allText.match(/\b(residential|business|enterprise|wholesale|dark\s*fibre|dark\s*fiber)\b/i);

  return { customer_name: name || 'Unknown', customer_email: emailMatch?.[0] || '', customer_phone: phoneMatch?.[0] || '', location: addrMatch?.[1]?.trim() || '', quote_type: mapQuoteType(serviceType?.[1]), source: 'chatbot', status: 'new', bandwidth_required: speedMatch?.[1] || null, service_requested: serviceType?.[1]?.toLowerCase() || null };
}
export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const API_KEY = Netlify.env.get('ANTHROPIC_API_KEY');
    const model = isBusinessQuery(messages) ? 'claude-sonnet-4-20250514' : 'claude-haiku-4-5-20251001';
    const maxTokens = isBusinessQuery(messages) ? 1024 : 512;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model,
        max_tokens: maxTokens,
        system: TELLINEX_SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    const data = await response.json();

    if (data.content && data.content[0] && data.content[0].text) {
      const rawText = data.content[0].text;
      const quote = extractQuote(rawText);
      if (quote) {
        data.content[0].text = cleanResponse(rawText);
      }

      // UNIFIED WRITE: AI-driven extraction first, regex fallback second
      const SUPA_KEY = Netlify.env.get('SUPABASE_ANON_KEY');
      const MAPS_KEY = Netlify.env.get('GOOGLE_MAPS_API_KEY');
      if (SUPA_KEY) {
        // Try AI structured output first (from <!--CUSTOMER:{}-->), then fall back to regex
        const cd = extractCustomerJSON(rawText) || extractCustomerFromMessages(messages);
        // Clean hidden tags from visible response
        data.content[0].text = cleanCustomerTag(data.content[0].text);
        data.content[0].text = data.content[0].text.replace(/<!--ADDRESS:.*?-->/g, '');

        const addr = cd?.location || null;
        const hasContactData = cd && (cd.customer_email || cd.customer_phone);
        let geoData = null, satUrl = null, streetUrl = null;

        if (hasContactData && addr && MAPS_KEY) {
          try {
            geoData = await geocodeAddress(addr, MAPS_KEY);
            if (geoData) {
              const urls = generateMapUrls(geoData.lat, geoData.lng, MAPS_KEY);
              satUrl = urls.satellite;
              streetUrl = urls.streetView;
              data.content[0].text += '\n\n![Satellite view](' + urls.satellite + ')\n![Street view](' + urls.streetView + ')';
            }
          } catch (e) { console.error('Geocode error:', e.message); }
        }

        if (hasContactData && !geoData && MAPS_KEY) {
          const addrData = extractAddress(rawText);
          if (addrData) {
            try {
              geoData = await geocodeAddress(addrData.address, MAPS_KEY);
              if (geoData) {
                const urls = generateMapUrls(geoData.lat, geoData.lng, MAPS_KEY);
                satUrl = urls.satellite;
                streetUrl = urls.streetView;
                data.content[0].text += '\n\n![Satellite view](' + urls.satellite + ')\n![Street view](' + urls.streetView + ')';
              }
            } catch (e) { console.error('Geocode fallback:', e.message); }
          }
        }

        if (hasContactData) {
          try {
            const supaRes = await fetch(SUPABASE_URL + '/rest/v1/quote_requests', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY, 'Prefer': 'return=minimal' },
              body: JSON.stringify({
                quote_type: cd?.quote_type || 'residential',
                customer_name: cd?.customer_name || null,
                customer_email: cd?.customer_email || null,
                customer_phone: cd?.customer_phone || null,
                location: geoData?.formatted || addr || null,
                latitude: geoData?.lat || null,
                longitude: geoData?.lng || null,
                satellite_image_url: satUrl,
                street_view_url: streetUrl,
                address_confirmed: false,
                source: 'chatbot',
                status: 'new',
                bandwidth_required: cd?.bandwidth_required || null,
                service_requested: cd?.service_requested || null
              })
            });
            console.log('TELLINEX: Supabase response:', supaRes.status);
          } catch (e) { console.error('Supabase write error:', e.message); }
        }
      }

      // Google Maps link sharing
      const lastUserMsg = messages[messages.length - 1];
      if (lastUserMsg && lastUserMsg.role === 'user') {
        const coords = extractGoogleMapsCoords(lastUserMsg.content);
        const MK = Netlify.env.get('GOOGLE_MAPS_API_KEY');
        if (coords && MK && !data.content[0].text.includes('![')) {
          const urls = generateMapUrls(coords.lat, coords.lng, MK);
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
