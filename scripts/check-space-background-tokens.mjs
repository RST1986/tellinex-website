import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const tokenSource = fs.readFileSync(path.join(root, 'src/styles/tellinex-tokens.css'), 'utf8')
const source = fs.readFileSync(path.join(root, 'src/app/components/SpaceBackground.tsx'), 'utf8')
const errors = []

const canvasTokens = [
  '--tlx-canvas-stream-primary',
  '--tlx-canvas-stream-accent',
  '--tlx-canvas-stream-primary-light',
  '--tlx-canvas-stream-accent-light',
  '--tlx-canvas-stream-accent-dark',
  '--tlx-canvas-bg-near',
  '--tlx-canvas-bg-mid',
  '--tlx-canvas-bg-far',
  '--tlx-canvas-transparent',
  '--tlx-canvas-primary-glow',
  '--tlx-canvas-primary-glow-soft',
  '--tlx-canvas-accent-glow',
  '--tlx-canvas-accent-glow-soft',
  '--tlx-canvas-star',
  '--tlx-canvas-atmosphere-inner',
  '--tlx-canvas-atmosphere-edge',
  '--tlx-canvas-globe-rim',
  '--tlx-canvas-globe-body',
  '--tlx-canvas-globe-core',
  '--tlx-canvas-wireframe',
  '--tlx-canvas-grid',
]

function declaration(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return tokenSource.match(new RegExp(`${escaped}\\s*:\\s*([^;]+);`))?.[1]?.trim() ?? null
}

for (const name of canvasTokens) {
  const value = declaration(name)
  if (!value) errors.push(`TXS canvas token missing: ${name}`)
  if (!source.includes(`token('${name}')`)) errors.push(`SpaceBackground does not resolve TXS canvas token: ${name}`)
}

for (const name of [
  '--tlx-canvas-stream-primary',
  '--tlx-canvas-stream-accent',
  '--tlx-canvas-stream-primary-light',
  '--tlx-canvas-stream-accent-light',
  '--tlx-canvas-stream-accent-dark',
]) {
  const value = declaration(name)
  if (value && !/^#[0-9a-fA-F]{6}$/.test(value)) {
    errors.push(`${name} must remain six-digit hex because the Canvas stream renderer appends alpha bytes`)
  }
}

for (const invariant of [
  'getComputedStyle(document.documentElement)',
  'return Object.values(palette).every(Boolean) ? palette : null;',
  'if (!palette) return;',
  'buildStreams(W: number, H: number, palette: CanvasPalette)',
  'const BUNDLE1 = 8;',
  'const BUNDLE2 = 5;',
  'const BUNDLE3 = 4;',
  'Array.from({ length: 160 }',
  'requestAnimationFrame(draw)',
  "window.addEventListener('resize', onResize)",
  'className="pointer-events-none fixed inset-0 z-0 h-full w-full"',
]) {
  if (!source.includes(invariant)) errors.push(`SpaceBackground rendering invariant missing: ${invariant}`)
}

if (source.includes('style={{')) {
  errors.push('SpaceBackground canvas presentation must remain in utility classes, not inline style objects')
}

if (/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(source)) {
  errors.push('SpaceBackground must source rendered colours from TXS canvas tokens instead of direct colour literals')
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('Website TXS Canvas contract valid: decorative rendering consumes governed tokens and preserves visual-flow invariants.')
