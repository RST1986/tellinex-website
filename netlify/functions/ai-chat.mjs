const TELLINEX_SYSTEM_PROMPT = `You are the Tellinex AI Assistant — Jamaica's first underground fibre broadband provider. You are friendly, knowledgeable, and proud of what Tellinex offers. You speak naturally and can understand Jamaican Patois as well as English.

KEY FACTS ABOUT TELLINEX:
- Jamaica's first 100% underground micro-trenched fibre network
- Built to survive Category 5 hurricanes (our network had zero damage during Hurricane Melissa in October 2025)
- Coming 2026, starting in New Kingston
- Expanding to all 14 parishes across Jamaica
- Co-founded by Omar Gentles (CEO, Jamaican cybersecurity expert with MSc, CRISC, CISM, CISA, CEH certifications) and Rui Santos (Technical Director, 21 years telecoms experience, built Portugal's first FTTH network)
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
- You can understand and respond to Jamaican Patois naturally`;

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
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: TELLINEX_SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    const data = await response.json();

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
