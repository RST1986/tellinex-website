import { useState, useEffect, useRef } from "react";

const TELLINEX_SYSTEM_PROMPT = `You are the Tellinex AI Assistant — Jamaica's first underground fibre broadband provider. You are friendly, knowledgeable, and proud of what Tellinex offers. You speak naturally and can understand Jamaican Patois as well as English.

KEY FACTS ABOUT TELLINEX:
- Jamaica's first 100% underground micro-trenched fibre network
- Built to survive Category 5 hurricanes (our network had zero damage during Hurricane Melissa in October 2025)
- Launching April 2026, starting in New Kingston
- Expanding to all 14 parishes across Jamaica
- Founded by Omar Gentles (CEO, Jamaican cybersecurity expert with MSc, CRISC, CISM, CISA, CEH certifications) and Rui Santos (Technical Director, 21 years telecoms experience, built Portugal's first FTTH network at Cabovisão)
- Technology: XGS-PON fibre + Nokia 5G, Hexatronic microduct infrastructure

RESIDENTIAL PLANS:
- Starter 100 Mbps symmetrical: US$45/month — perfect for small households, streaming, browsing
- Performance 500 Mbps symmetrical: US$65/month — ideal for families, multiple devices, gaming, remote work
- Ultra 1 Gbps symmetrical: US$95/month — maximum speed, heavy usage, content creators, home offices
- All plans include: free professional installation, Wi-Fi 6E router included, no data caps, no throttling, 24/7 Jamaican-based support, underground hurricane-proof connection

BUSINESS PLANS:
- Business Fibre from US$99/month: up to 2 Gbps, 99.9% SLA, static IPs, 4-hour priority fault response, dedicated account manager
- Enterprise Solutions: 10 Gbps+ dedicated circuits, dark fibre, 99.99% SLA, dual-path redundancy, MPLS/SD-WAN
- Wholesale & Backhaul: 5G small cell backhaul, tower connectivity, IRU/dark fibre leasing, international transit via TAM-1

COVERAGE (Phase 1 — launching April 2026):
- New Kingston, Half Way Tree, Liguanea, Hope Pastures, Mona, Papine, Cross Roads, Constant Spring
- Phase 2 (2027): Portmore, Spanish Town, Mandeville, Montego Bay
- Phase 3 (2028-2030): All 14 parishes island-wide

COMPETITORS:
- Flow (Liberty Latin America): aerial copper/coax network, vulnerable to hurricanes, speeds up to 150 Mbps. After Hurricane Melissa their network was down for weeks in many areas.
- Digicel: primarily mobile, limited fixed broadband, aerial infrastructure also vulnerable to storms.
- Tellinex advantage: underground fibre = hurricane proof, symmetrical speeds (same upload and download), newer technology, better customer service

IMPORTANT RULES:
- Always be helpful, warm, and professional
- If someone asks about coverage in an area not in Phase 1, tell them the phase and encourage them to register so they'll be notified
- Never make up information — if you don't know, say "Let me connect you with our team" 
- Encourage registration at every opportunity
- Keep responses concise — 2-3 sentences max unless they ask for details
- You can understand and respond to Jamaican Patois naturally
- If asked about faults or technical issues, offer to create a support ticket
- For business enquiries, offer to arrange a consultation with Omar Gentles directly`;

const QUICK_REPLIES = [
  "What plans do you offer?",
  "Check my area",
  "Business pricing",
  "Why underground fibre?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

function OrbitalIcon({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 44 44" width={size} height={size}>
      <circle cx="22" cy="22" r="20" fill="#040d14" stroke="#00C7B1" strokeWidth="1.2" />
      <circle cx="22" cy="22" r="4" fill="#00C7B1">
        <animate attributeName="fill" values="#00C7B1;#A3E635;#00C7B1" dur="4s" repeatCount="indefinite" />
      </circle>
      <ellipse cx="22" cy="22" rx="13" ry="6" fill="none" stroke="#00C7B1" strokeWidth="0.7" opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" from="0 22 22" to="360 22 22" dur="6s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="22" cy="22" rx="13" ry="6" fill="none" stroke="#A3E635" strokeWidth="0.5" opacity="0.35">
        <animateTransform attributeName="transform" type="rotate" from="60 22 22" to="420 22 22" dur="8s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="22" cy="22" rx="13" ry="6" fill="none" stroke="#00C7B1" strokeWidth="0.5" opacity="0.25">
        <animateTransform attributeName="transform" type="rotate" from="120 22 22" to="480 22 22" dur="10s" repeatCount="indefinite" />
      </ellipse>
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: "4px", padding: "8px 0" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#00C7B1",
            animation: `typingBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to Tellinex! \ud83c\uddef\ud83c\uddf2 Our underground fibre network survived Hurricane Melissa with zero damage. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  // Hide tooltip after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setShowTooltip(false);
    const userMsg: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          system: TELLINEX_SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const reply = data.content?.[0]?.text || "I'm having trouble connecting right now. Please email us at info@tellinex.com and we'll get back to you shortly.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having a brief connection issue. Please try again in a moment, or email us at info@tellinex.com — we'd love to help!",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* ─── CHAT WINDOW ─── */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "min(380px, calc(100vw - 40px))",
            maxHeight: "min(560px, calc(100vh - 120px))",
            background: "rgba(4,13,20,0.97)",
            border: "1px solid rgba(0,199,177,0.25)",
            borderRadius: "16px",
            overflow: "hidden",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(0,199,177,0.1)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(0,199,177,0.12), rgba(163,230,53,0.06))",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(0,199,177,0.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <OrbitalIcon size={32} />
              <div>
                <div style={{ fontFamily: '"Poppins", sans-serif', fontSize: "13px", fontWeight: 600, color: "#fff" }}>
                  Tellinex AI
                </div>
                <div style={{ fontSize: "10px", color: "#A3E635", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      background: "#A3E635",
                      borderRadius: "50%",
                      display: "inline-block",
                    }}
                  />
                  Online 24/7
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              minHeight: "300px",
              maxHeight: "380px",
            }}
          >
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.role === "assistant" && (
                  <div style={{ display: "flex", gap: "8px", maxWidth: "88%", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        background: "rgba(0,199,177,0.15)",
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: "2px",
                      }}
                    >
                      <div style={{ width: "8px", height: "8px", background: "#00C7B1", borderRadius: "50%" }} />
                    </div>
                    <div
                      style={{
                        background: "rgba(0,199,177,0.07)",
                        border: "1px solid rgba(0,199,177,0.1)",
                        borderRadius: "2px 12px 12px 12px",
                        padding: "10px 14px",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: '"Nunito", sans-serif',
                          fontSize: "13px",
                          color: "rgba(255,255,255,0.85)",
                          margin: 0,
                          lineHeight: 1.55,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {msg.content}
                      </p>
                    </div>
                  </div>
                )}
                {msg.role === "user" && (
                  <div
                    style={{
                      background: "rgba(163,230,53,0.12)",
                      border: "1px solid rgba(163,230,53,0.15)",
                      borderRadius: "12px 12px 2px 12px",
                      padding: "10px 14px",
                      maxWidth: "82%",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: '"Nunito", sans-serif',
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.9)",
                        margin: 0,
                        lineHeight: 1.55,
                      }}
                    >
                      {msg.content}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    background: "rgba(0,199,177,0.15)",
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ width: "8px", height: "8px", background: "#00C7B1", borderRadius: "50%" }} />
                </div>
                <div
                  style={{
                    background: "rgba(0,199,177,0.07)",
                    border: "1px solid rgba(0,199,177,0.1)",
                    borderRadius: "2px 12px 12px 12px",
                    padding: "10px 14px",
                  }}
                >
                  <TypingIndicator />
                </div>
              </div>
            )}

            {/* Quick replies — show only at start */}
            {messages.length === 1 && !isTyping && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", paddingLeft: "30px" }}>
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => sendMessage(qr)}
                    style={{
                      fontFamily: '"Nunito", sans-serif',
                      fontSize: "11px",
                      color: "#00C7B1",
                      border: "1px solid rgba(0,199,177,0.2)",
                      padding: "6px 12px",
                      borderRadius: "14px",
                      cursor: "pointer",
                      background: "rgba(0,199,177,0.04)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0,199,177,0.12)";
                      e.currentTarget.style.borderColor = "rgba(0,199,177,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(0,199,177,0.04)";
                      e.currentTarget.style.borderColor = "rgba(0,199,177,0.2)";
                    }}
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: "10px 12px",
              borderTop: "1px solid rgba(0,199,177,0.1)",
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isTyping}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(0,199,177,0.12)",
                borderRadius: "20px",
                padding: "10px 16px",
                fontFamily: '"Nunito", sans-serif',
                fontSize: "13px",
                color: "#fff",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,199,177,0.4)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,199,177,0.12)")}
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: input.trim() ? "#A3E635" : "rgba(163,230,53,0.2)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: input.trim() ? "pointer" : "default",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "#040d14", fontSize: "16px", fontWeight: 700, marginTop: "-1px" }}>↑</span>
            </button>
          </form>

          {/* Powered by */}
          <div
            style={{
              padding: "4px 12px 8px",
              textAlign: "center",
              fontSize: "9px",
              color: "rgba(255,255,255,0.15)",
              fontFamily: "monospace",
              letterSpacing: "0.1em",
            }}
          >
            POWERED BY AI · TELLINEX LIMITED
          </div>
        </div>
      )}

      {/* ─── FLOATING BUTTON (Version 4 — card) ─── */}
      {!isOpen && showTooltip && (
        <div
          style={{
            position: "fixed",
            bottom: "82px",
            right: "20px",
            background: "rgba(4,13,20,0.92)",
            border: "1px solid rgba(0,199,177,0.2)",
            borderRadius: "12px",
            padding: "8px 14px",
            zIndex: 9998,
            animation: "tooltipFadeIn 0.5s ease-out",
          }}
        >
          <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: 0 }}>
            Ask me anything about Tellinex
          </p>
          <style>{`
            @keyframes tooltipFadeIn {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          cursor: "pointer",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isOpen ? (
          /* Minimised state — just the orbital */
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <OrbitalIcon size={56} />
          </div>
        ) : (
          /* Expanded state — Version 4 floating card */
          <div
            style={{
              background: "rgba(0,199,177,0.06)",
              border: "1px solid rgba(0,199,177,0.2)",
              borderRadius: "28px 12px 12px 28px",
              padding: "8px 16px 8px 8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3), 0 0 12px rgba(0,199,177,0.1)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,199,177,0.4)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(0,199,177,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,199,177,0.2)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3), 0 0 12px rgba(0,199,177,0.1)";
            }}
          >
            <OrbitalIcon size={44} />
            <div>
              <div
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                AI assistant
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: "#A3E635",
                  letterSpacing: "0.05em",
                  fontFamily: '"Nunito", sans-serif',
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    background: "#A3E635",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
                online 24/7
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
