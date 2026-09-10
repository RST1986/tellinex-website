import { useCallback, useEffect, useRef, useState } from "react";
import TurnstileWidget, { type TurnstileWidgetHandle } from "./TurnstileWidget";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { POSITIONING, RESILIENCE_PUBLIC_WORDING } from "../content/commercialFacts";

const QUICK_REPLIES = [
  "What is Tellinex building?",
  "Is service live?",
  "How do I register interest?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME = `${POSITIONING.value} ${RESILIENCE_PUBLIC_WORDING.value} I am an assistant, not an authority on coverage, pricing, dates, or operations.`;

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && privacyAccepted && inputRef.current) inputRef.current.focus();
  }, [isOpen, privacyAccepted]);

  const handleTurnstileToken = useCallback((token: string | null) => {
    setTurnstileToken(token);
    if (token) setError(null);
  }, []);

  const resetSecurityChallenge = useCallback(() => {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  }, []);

  const sendMessage = async (text: string) => {
    const normalized = text.trim();
    if (!normalized || isTyping || !privacyAccepted || !turnstileToken) return;

    const securityToken = turnstileToken;
    setTurnstileToken(null);

    const userMsg: Message = { role: "user", content: normalized };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((message) => ({ role: message.role, content: message.content })),
          turnstile_token: securityToken,
          privacy_acknowledged: true,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.message === "string" ? data.message : "Chat is temporarily unavailable.");
      }

      const reply = data.content?.[0]?.text;
      if (typeof reply !== "string" || !reply.trim()) {
        throw new Error("Chat is temporarily unavailable. Email info@tellinex.com.");
      }

      setMessages((current) => [...current, { role: "assistant", content: reply.trim() }]);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Chat is temporarily unavailable.");
    } finally {
      resetSecurityChallenge();
      setIsTyping(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          id="tellinex-assistant-dialog"
          role="dialog"
          aria-label="Tellinex assistant"
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
          }}
        >
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(0,199,177,0.12)", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: '"Poppins", sans-serif', fontSize: "13px", fontWeight: 600, color: "#fff" }}>Tellinex assistant</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>AI is not commercial authority</div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
              style={{ background: "transparent", color: "#fff", cursor: "pointer" }}
            >
              ✕
            </Button>
          </div>

          <div
            role="log"
            aria-label="Tellinex assistant conversation"
            aria-live="polite"
            aria-relevant="additions text"
            aria-busy={isTyping}
            style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "240px" }}
          >
            {messages.map((message, index) => (
              <p
                key={`${message.role}-${index}`}
                style={{
                  fontFamily: '"Nunito", sans-serif',
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.85)",
                  margin: 0,
                  lineHeight: 1.55,
                  alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "88%",
                  background: message.role === "user" ? "rgba(163,230,53,0.12)" : "rgba(0,199,177,0.07)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                }}
              >
                {message.content}
              </p>
            ))}
            {isTyping && <p role="status" style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>Thinking…</p>}
            {messages.length === 1 && !isTyping && privacyAccepted && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {QUICK_REPLIES.map((reply) => (
                  <Button
                    key={reply}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!turnstileToken}
                    onClick={() => void sendMessage(reply)}
                    style={{ fontFamily: '"Nunito", sans-serif', fontSize: "11px", color: "#00C7B1", border: "1px solid rgba(0,199,177,0.2)", padding: "6px 12px", borderRadius: "14px", cursor: turnstileToken ? "pointer" : "default", background: "rgba(0,199,177,0.04)" }}
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(0,199,177,0.1)" }}>
            <label style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontFamily: '"Nunito", sans-serif', fontSize: "11px", color: "rgba(255,255,255,0.55)", marginBottom: "10px" }}>
              <input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} />
              I understand this conversation may be processed by an AI assistant and that I should not send unnecessary personal data.
            </label>
            <TurnstileWidget
              ref={turnstileRef}
              action="tellinex_ai_chat"
              onTokenChange={handleTurnstileToken}
              onUnavailable={() => {
                setTurnstileToken(null);
                setError("Security check unavailable. Chat is closed.");
              }}
            />
            {error && (
              <Alert variant="destructive" style={{ margin: "10px 0" }}>
                <AlertTitle>Assistant unavailable</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form
              aria-label="Send a message to Tellinex assistant"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage(input);
              }}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                ref={inputRef}
                type="text"
                aria-label="Message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={privacyAccepted ? "Ask about Tellinex…" : "Accept the privacy notice first"}
                disabled={isTyping || !privacyAccepted}
                maxLength={4000}
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,199,177,0.12)", borderRadius: "20px", padding: "10px 16px", color: "#fff", fontFamily: '"Nunito", sans-serif', fontSize: "13px" }}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isTyping || !input.trim() || !privacyAccepted || !turnstileToken}
                style={{ border: "none", borderRadius: "20px", padding: "0 12px", background: "#A3E635", color: "#040d14", cursor: isTyping || !input.trim() || !privacyAccepted || !turnstileToken ? "default" : "pointer" }}
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="tellinex-assistant-dialog"
        aria-label={isOpen ? "Close Tellinex assistant" : "Open Tellinex assistant"}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          background: "rgba(0,199,177,0.08)",
          border: "1px solid rgba(0,199,177,0.25)",
          borderRadius: "28px",
          padding: "10px 16px",
          color: "#fff",
          cursor: "pointer",
          fontFamily: '"Poppins", sans-serif',
          fontSize: "12px",
        }}
      >
        Assistant
      </Button>
    </>
  );
}
