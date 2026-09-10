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
          className="fixed bottom-[90px] right-5 z-[9999] flex max-h-[min(560px,calc(100vh-120px))] w-[min(380px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-[var(--tlx-border-strong)] bg-[var(--tlx-bg-dialog)]"
        >
          <div className="flex justify-between border-b border-[var(--tlx-border)] px-4 py-[14px]">
            <div>
              <div className="[font-family:var(--tlx-font-display)] text-[13px] font-semibold text-[var(--tlx-text)]">Tellinex assistant</div>
              <div className="text-[10px] text-[var(--tlx-text-caption)]">AI is not commercial authority</div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
              className="cursor-pointer bg-transparent text-[var(--tlx-text)] hover:bg-transparent hover:text-[var(--tlx-text)]"
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
            className="flex min-h-[240px] flex-1 flex-col gap-3 overflow-y-auto p-[14px]"
          >
            {messages.map((message, index) => (
              <p
                key={`${message.role}-${index}`}
                className={`m-0 max-w-[88%] rounded-xl px-[14px] py-[10px] [font-family:var(--tlx-font-sans)] text-[13px] leading-[1.55] text-[var(--tlx-text-high)] ${
                  message.role === "user"
                    ? "self-end bg-[var(--tlx-accent-surface)]"
                    : "self-start bg-[var(--tlx-surface-message)]"
                }`}
              >
                {message.content}
              </p>
            ))}
            {isTyping && <p role="status" className="m-0 text-xs text-[var(--tlx-text-faint)]">Thinking…</p>}
            {messages.length === 1 && !isTyping && privacyAccepted && (
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((reply) => (
                  <Button
                    key={reply}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!turnstileToken}
                    onClick={() => void sendMessage(reply)}
                    className="rounded-[14px] border-[var(--tlx-border-interactive)] bg-[var(--tlx-surface)] px-3 py-1.5 [font-family:var(--tlx-font-sans)] text-[11px] text-[var(--tlx-primary)] enabled:cursor-pointer hover:bg-[var(--tlx-surface)] hover:text-[var(--tlx-primary)]"
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[var(--tlx-border-soft)] px-3 py-2.5">
            <label className="mb-2.5 flex items-start gap-2 [font-family:var(--tlx-font-sans)] text-[11px] text-[var(--tlx-text-subtle)]">
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
              <Alert variant="destructive" className="my-2.5 border-[var(--tlx-border-strong)] bg-[var(--tlx-bg-dialog)]">
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
              className="flex gap-2"
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
                className="min-w-0 flex-1 rounded-[20px] border border-[var(--tlx-border)] bg-[var(--tlx-input-surface)] px-4 py-2.5 [font-family:var(--tlx-font-sans)] text-[13px] text-[var(--tlx-text)] outline-none"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isTyping || !input.trim() || !privacyAccepted || !turnstileToken}
                className="rounded-[20px] border-0 bg-[var(--tlx-accent)] px-3 text-[var(--tlx-primary-contrast)] enabled:cursor-pointer hover:bg-[var(--tlx-accent)]"
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
        className="fixed bottom-5 right-5 z-[9999] cursor-pointer rounded-[28px] border-[var(--tlx-border-strong)] bg-[var(--tlx-surface-2)] px-4 py-2.5 [font-family:var(--tlx-font-display)] text-xs text-[var(--tlx-text)] hover:bg-[var(--tlx-surface-2)] hover:text-[var(--tlx-text)]"
      >
        Assistant
      </Button>
    </>
  );
}
