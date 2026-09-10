import fs from 'node:fs'
import path from 'node:path'

const source = fs.readFileSync(path.join(process.cwd(), 'src/app/components/AIChatWidget.tsx'), 'utf8')
const errors = []

for (const token of [
  'import { Alert, AlertDescription, AlertTitle } from "./ui/alert";',
  'import { Button } from "./ui/button";',
  'AI is not commercial authority',
  'privacy_acknowledged: true',
  'action="tellinex_ai_chat"',
  'const securityToken = turnstileToken;',
  'setTurnstileToken(null);',
  'turnstile_token: securityToken',
  'resetSecurityChallenge();',
  'typeof reply !== "string" || !reply.trim()',
  'role="log"',
  'aria-busy={isTyping}',
  'role="status"',
  '<Alert',
  'variant="destructive"',
  'aria-controls="tellinex-assistant-dialog"',
  'id="tellinex-assistant-dialog"',
  'aria-label={isOpen ? "Close Tellinex assistant" : "Open Tellinex assistant"}',
  'disabled={!turnstileToken}',
  'maxLength={4000}',
]) {
  if (!source.includes(token)) errors.push(`AI chat UI contract missing: ${token}`)
}

if (source.includes('data.content?.[0]?.text || "Chat is temporarily unavailable.')) {
  errors.push('Malformed successful responses must fail closed instead of becoming assistant content')
}

if (source.includes('turnstile_token: turnstileToken')) {
  errors.push('AI chat must use the captured single-attempt security token, not the mutable token state directly')
}

if (!source.includes('if (!normalized || isTyping || !privacyAccepted || !turnstileToken) return;')) {
  errors.push('AI chat send guard must require content, idle state, privacy acknowledgement and a security token')
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('Website AI chat UI contract valid: authority, security-token, fail-closed and accessibility semantics retained.')
