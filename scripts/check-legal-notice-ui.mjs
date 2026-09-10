import fs from 'node:fs'
import path from 'node:path'

const source = fs.readFileSync(path.join(process.cwd(), 'src/app/components/LegalNoticeLinks.tsx'), 'utf8')
const errors = []

for (const token of [
  'href="/privacy"',
  'href="/terms"',
  'Draft — legal review required',
  'var(--tlx-font-sans)',
  'var(--tlx-text-low)',
  'var(--tlx-primary)',
  'className="mx-2"',
]) {
  if (!source.includes(token)) errors.push(`LegalNoticeLinks contract missing: ${token}`)
}

if (source.includes('style={{')) {
  errors.push('LegalNoticeLinks must keep static presentation in TXS/Tailwind utilities rather than inline style objects')
}

if (/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(source)) {
  errors.push('LegalNoticeLinks must not contain direct colour literals after TXS token normalisation')
}

for (const forbidden of ['legal approved', 'legal-approved', 'final legal', 'approved terms', 'approved privacy']) {
  if (source.toLowerCase().includes(forbidden)) errors.push(`LegalNoticeLinks must not imply completed legal approval: ${forbidden}`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('Website legal notice UI contract valid: draft truth, destinations and TXS presentation retained.')
