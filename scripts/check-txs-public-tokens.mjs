import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const tokens = fs.readFileSync(path.join(root, 'src/styles/tellinex-tokens.css'), 'utf8')
const indexCss = fs.readFileSync(path.join(root, 'src/styles/index.css'), 'utf8')
const layout = fs.readFileSync(path.join(root, 'src/app/components/Layout.tsx'), 'utf8')
const errors = []

for (const token of [
  '--tlx-bg:',
  '--tlx-bg-nav:',
  '--tlx-bg-elevated:',
  '--tlx-bg-overlay:',
  '--tlx-text:',
  '--tlx-text-muted:',
  '--tlx-primary:',
  '--tlx-primary-contrast:',
  '--tlx-accent:',
  '--tlx-surface-2:',
  '--tlx-border:',
  '--tlx-border-medium:',
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

for (const literal of [
  '#040d14',
  '#00C7B1',
  '#A3E635',
  '#fff',
  'rgba(255,255,255',
  'rgba(0,199,177',
  'rgba(4,13,20',
]) {
  if (layout.includes(literal)) errors.push(`Layout regressed to hard-coded Tellinex literal: ${literal}`)
}

const gsapAccentLiterals = layout.match(/rgba\(163,230,53,[^)]+\)/g) ?? []
if (gsapAccentLiterals.length > 2) {
  errors.push(`Layout may keep at most two GSAP interpolation colour literals; found ${gsapAccentLiterals.length}`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('Website TXS public token contract valid: Layout identity values are tokenised with only bounded GSAP interpolation literals.')
