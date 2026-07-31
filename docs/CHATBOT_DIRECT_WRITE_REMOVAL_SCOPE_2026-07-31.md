# Scope — direct chatbot write removal

Changed runtime files:

- `functions/api/ai-chat.js`
- `package.json`
- `scripts/check-chatbot-public-form-boundary.mjs`

The change intentionally does not add a replacement database write. The final protected quote submission remains part of TCC Batch 3B2D4 and is gated by staging Turnstile configuration and live gateway proof.
