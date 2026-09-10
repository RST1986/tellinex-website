import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const tokens = fs.readFileSync(path.join(root, 'src/styles/tellinex-tokens.css'), 'utf8')
const indexCss = fs.readFileSync(path.join(root, 'src/styles/index.css'), 'utf8')
const layout = fs.readFileSync(path.join(root, 'src/app/components/Layout.tsx'), 'utf8')
const aiChat = fs.readFileSync(path.join(root, 'src/app/components/AIChatWidget.tsx'), 'utf8')
const errors = []

for (const token of [
  '--tlx-bg:',
  '--tlx-bg-nav:',
  '--tlx-bg-elevated:',
  '--tlx-bg-overlay:',
  '--tlx-bg-dialog:',
  '--tlx-text:',
  '--tlx-text-high:',
  '--tlx-text-muted:',
  '--tlx-text-subtle:',
  '--tlx-primary:',
  '--tlx-primary-contrast:',
  '--tlx-accent:',
  '--tlx-surface:',
  '--tlx-surface-message:',
  '--tlx-surface-2:',
  '--tlx-accent-surface:',
  '--tlx-input-surface:',
  '--tlx-border:',
  '--tlx-border-medium:',
  '--tlx-border-interactive:',
  '--tlx-border-strong:',
  '--tlx-glow-primary:',
  '--tlx-glow-accent:',
  '--tlx-font-sans:',
  '--tlx-font-display:',
]) {
  if (!tokens.includes(token)) errors.push(`TXS public token missing: ${token}`)
}

if (!indexCss.includes("@import './tellinex-tokens.css';")) {
  errors.push('Tellinex token layer must be loaded by src/styles/index.css')
}

for (const token of [
  'var(--tlx-bg)',
  'var(--tlx-bg-nav)',
  'var(--tlx-bg-elevated)',
  'var(--tlx-bg-overlay)',
  'var(--tlx-primary)',
  'var(--tlx-primary-contrast)',
  'var(--tlx-accent)',
  'var(--tlx-text-muted)',
  'var(--tlx-font-sans)',
  'var(--tlx-font-display)',
]) {
  if (!layout.includes(token)) errors.push(`Layout is not consuming TXS token: ${token}`)
}

for (const token of [
  'var(--tlx-bg-dialog)',
  'var(--tlx-text)',
  'var(--tlx-text-high)',
  'var(--tlx-text-caption)',
  'var(--tlx-text-subtle)',
  'var(--tlx-primary)',
  'var(--tlx-primary-contrast)',
  'var(--tlx-accent)',
  'var(--tlx-surface)',
  'var(--tlx-surface-message)',
  'var(--tlx-surface-2)',
  'var(--tlx-accent-surface)',
  'var(--tlx-input-surface)',
  'var(--tlx-border)',
  'var(--tlx-border-interactive)',
  'var(--tlx-border-strong)',
  'var(--tlx-font-sans)',
  'var(--tlx-font-display)',
]) {
  if (!aiChat.includes(token)) errors.push(`AIChatWidget is not consuming TXS token: ${token}`)
}

const forbiddenIdentityLiterals = [
  '#040d14',
  '#00C7B1',
  '#A3E635',
  '#fff',
  'rgba(255,255,255',
  'rgba(0,199,177',
  'rgba(4,13,20',
]

for (const literal of forbiddenIdentityLiterals) {
  if (layout.includes(literal)) errors.push(`Layout regressed to hard-coded Tellinex literal: ${literal}`)
  if (aiChat.includes(literal)) errors.push(`AIChatWidget regressed to hard-coded Tellinex literal: ${literal}`)
}

const gsapAccentLiterals = layout.match(/rgba\(163,230,53,[^)]+\)/g) ?? []
if (gsapAccentLiterals.length > 2) {
  errors.push(`Layout may keep at most two GSAP interpolation colour literals; found ${gsapAccentLiterals.length}`)
}

if (/rgba\(163,230,53|#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(aiChat)) {
  errors.push('AIChatWidget must not contain direct colour literals after TXS token adoption')
}

if (!aiChat.includes('variant="destructive"') || !aiChat.includes('bg-[var(--tlx-bg-dialog)]')) {
  errors.push('AI error alert must retain destructive semantics on an explicit TXS dark dialog surface')
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('Website TXS public token contract valid: Layout and AI identity values are tokenised with only bounded Layout GSAP interpolation literals.')
