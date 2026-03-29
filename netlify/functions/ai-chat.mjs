const SUPABASE_URL = 'https://egztpclpcnizcdtfugsv.supabase.co';

const BUSINESS_KEYWORDS = ['backbone','dark fibre','dark fiber','IRU','enterprise','wholesale','backhaul','colocation','peering','transit','SLA','dedicated','leased line','MPLS','wavelength'];

const TELLINEX_SYSTEM_PROMPT = `You are the Tellinex AI Assistant — Jamaica's first underground fibre broadband provider.

KEY FACTS ABOUT TELLINEX:
  - Jamaica's first 100% underground micro-trenched fibre network
  - Built to survive Category 5 hurricanes (our network had zero damage during Hurricane Melissa in October 2024)
  - Coming 2026, starting in New Kingston
  - Expanding to all 14 parishes across Jamaica
  - Founded by Omar Gentles (CEO, Jamaican cybersecurity expert with MSc, CRISC, CISM, CISA, CEH certifications) and Rui Santos (COO/Technical Director, 21 years building fibre networks across Europe)
  - Technology: XGS-PON fibre + Nokia 5G, Hexatronic microduct infrastructure

RESIDENTIAL PLANS:
  - Starter 100 Mbps symmetrical: US$45/month
  - Performance 500 Mbps symmetrical: US$65/month
  - Ultra 1 Gbps symmetrical: US$95/month
  - All plans include: free professional installation, Wi-Fi 6E router included, no data caps, no throttling, 24/7 support

BUSINESS PLANS:
  - Business Fibre 500 Mbps: US$150/month (static IP, SLA)
  - Business Fibre 1 Gbps: US$250/month (static IP, SLA)
  - Enterprise 10 Gbps: Custom pricing
  - Wholesale/Backhaul: Custom pricing

RULES:
- Be enthusiastic but professional about Tellinex
- If asked about coverage, say "We're launching in New Kingston first, then expanding across all 14 parishes"
- For residential quotes: collect name, email, phone, address, desired plan
- For business/enterprise: collect company name, contact person, email, phone, address, bandwidth needs
- Always mention hurricane resilience — it's our biggest differentiator
- When a customer provides an address, include it in your response with <!--ADDRESS:their address--> tag
- Never reveal internal pricing structures or competitor analysis`;

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

function extractCustomerFromMessages(messages) {
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length === 0) return null;
  const allText = userMessages.map(m => m.content).join(' ');

  const emailMatch = allText.match(/[\w.-]+@[\w.-]+\.[a-z]{2,}/i);
  const phoneMatch = allText.match(/\b(\+?1?[-.]?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4})\b/) || allText.match(/\b(876[-.]?\d{3}[-.]?\d{4})\b/);
  const nameMatch = allText.match(/(?:my name is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i);
  const addrMatch = allText.match(/(?:I live at|my address is|located at|address is|at)\s+(.+?)(?:\.|,\s*(?:Jamaica|kingston)|$)/i);

  let name = nameMatch?.[1] || null;
  if (!name) {
    const formalMatch = allText.match(/(?:name:\s*|name\s+is\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i);
    if (formalMatch) name = formalMatch[1];
  }

  const speedMatch = allText.match(/\b(100\s*(?:mb|mbps)|500\s*(?:mb|mbps)|1\s*(?:gb|gbps)|1000\s*(?:mb|mbps)|starter|performance|ultra)\b/i);
  const serviceType = allText.match(/\b(residential|business|enterprise|wholesale|dark\s*fibre|dark\s*fiber)\b/i);

  return { customer_name: name || 'Unknown', customer_email: emailMatch?.[0] || '', customer_phone: phoneMatch?.[0] || '', location: addrMatch?.[1]?.trim() || '', quote_type: 'residential', source: 'chatbot', status: 'new', bandwidth_required: speedMatch?.[1] || null, service_requested: serviceType?.[1]?.toLowerCase() || null };
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

      // UNIFIED WRITE: customer + geocode + one row to Supabase
      const SUPA_KEY = Netlify.env.get('SUPABASE_ANON_KEY');
      const MAPS_KEY = Netlify.env.get('GOOGLE_MAPS_API_KEY');
      if (SUPA_KEY) {
        const cd = extractCustomerFromMessages(messages);
        const addr = cd?.location || null;
        const hasContactData = cd && ((cd.customer_name && cd.customer_name !== 'Unknown') || cd.customer_email || cd.customer_phone || addr);
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
                data.content[0].text = data.content[0].text.replace(/<!--ADDRESS:.*?-->/, '');
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
