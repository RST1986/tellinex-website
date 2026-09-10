import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const manifestPath = path.join(root, 'docs/UI_REGISTRY_ADOPTION.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const networkStatus = fs.readFileSync(path.join(root, 'src/app/components/NetworkBuildStatus.tsx'), 'utf8')
const layout = fs.readFileSync(path.join(root, 'src/app/components/Layout.tsx'), 'utf8')

const errors = []

function consumersFor(adoption) {
  const consumers = []
  if (typeof adoption.consumer === 'string') consumers.push(adoption.consumer)
  if (Array.isArray(adoption.consumers)) consumers.push(...adoption.consumers)
  return [...new Set(consumers)]
}

if (manifest.authority !== 'TXS / Quiet Instrument') errors.push('Unexpected UI authority')
if (manifest.mode !== 'NORMALIZE_EXISTING') errors.push('Website adoption mode must remain NORMALIZE_EXISTING')
if (manifest.direct21stImportsAllowed !== false) errors.push('Direct 21st.dev imports must remain disabled')
if (manifest.productionDeploymentChanged !== false) errors.push('UI adoption must not claim a production deployment change')

const expected = new Map([
  ['tlx-surface-card', {
    localEquivalent: 'src/app/components/ui/card.tsx',
    registrySourceBlob: '3e563423718ccc5158efb34ed8a4bc503c969b9f',
  }],
  ['tlx-status-badge', {
    localEquivalent: 'src/app/components/ui/badge.tsx',
    registrySourceBlob: '6e5d838766d4316d2b04e3fd955d326fa40b0c44',
  }],
  ['tlx-navigation', {
    localEquivalent: 'src/app/components/Layout.tsx',
    registrySourceBlob: '35da63babf8c9cd8e290aa55ee3a61bd0ed6ed00',
  }],
  ['tlx-button', {
    localEquivalent: 'src/app/components/ui/button.tsx',
    registrySourceBlob: '6482e2f7db8e1d62ca6172bee1b344bef0929605',
  }],
  ['tlx-alert-banner', {
    localEquivalent: 'src/app/components/ui/alert.tsx',
    registrySourceBlob: '53723643e7ac7afb1a57ebea4e250f1c2bdae00c',
  }],
])

for (const adoption of manifest.adoptions ?? []) {
  const contract = expected.get(adoption.registryComponent)
  if (!contract) {
    errors.push(`${adoption.registryComponent}: unexpected adoption entry`)
    continue
  }
  if (adoption.state !== 'CONSUMED') errors.push(`${adoption.registryComponent}: state must be CONSUMED`)
  if (contract.localEquivalent !== adoption.localEquivalent) {
    errors.push(`${adoption.registryComponent}: unexpected local equivalent`)
  }
  if (contract.registrySourceBlob !== adoption.registrySourceBlob) {
    errors.push(`${adoption.registryComponent}: unexpected registry source blob`)
  }
  if (!fs.existsSync(path.join(root, adoption.localEquivalent))) {
    errors.push(`${adoption.registryComponent}: local equivalent missing`)
  }

  const consumers = consumersFor(adoption)
  if (consumers.length === 0) errors.push(`${adoption.registryComponent}: at least one consumer is required`)
  for (const consumer of consumers) {
    if (!fs.existsSync(path.join(root, consumer))) {
      errors.push(`${adoption.registryComponent}: consumer missing: ${consumer}`)
    }
  }
}

for (const name of expected.keys()) {
  if (!(manifest.adoptions ?? []).some((item) => item.registryComponent === name)) {
    errors.push(`Missing adoption: ${name}`)
  }
}

for (const token of [
  'import { Badge } from "./ui/badge";',
  'import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";',
  '<Card ',
  '<Badge',
  'COMMERCIAL_LIVE=NO',
  'CURRENT_COVERAGE.value',
  'PILOT_CORRIDOR.value',
  'PUBLIC_LAUNCH_DATE',
]) {
  if (!networkStatus.includes(token)) errors.push(`NetworkBuildStatus missing contract token: ${token}`)
}

if (networkStatus.includes('background: "rgba(0,199,177,0.04)"')) {
  errors.push('NetworkBuildStatus still contains the retired bespoke surface implementation')
}

for (const token of [
  'import { Button } from "./ui/button";',
  'aria-label="Primary"',
  'aria-current={active ? "page" : undefined}',
  'type="button"',
  'aria-expanded={menuOpen}',
  'aria-controls="mobile-primary-navigation"',
  'id="mobile-primary-navigation"',
  'aria-label="Footer navigation"',
  'aria-current={location.pathname === n.to ? "page" : undefined}',
  'setMenuOpen(false);',
]) {
  if (!layout.includes(token)) errors.push(`Public navigation missing contract token: ${token}`)
}

if (/<button\b/.test(layout)) {
  errors.push('Governed Website navigation must not regress to a raw native button')
}

const navigationAdoption = (manifest.adoptions ?? []).find((item) => item.registryComponent === 'tlx-navigation')
if (navigationAdoption?.implementation !== 'native-react-router-navigation') {
  errors.push('Website navigation must remain a native React Router normalisation')
}

const buttonAdoption = (manifest.adoptions ?? []).find((item) => item.registryComponent === 'tlx-button')
const buttonConsumers = new Set(consumersFor(buttonAdoption ?? {}))
if (buttonAdoption?.semanticScope !== 'shared-public-controls') {
  errors.push('Website Button adoption must remain scoped to shared public controls')
}
for (const consumer of ['src/app/components/AIChatWidget.tsx', 'src/app/components/Layout.tsx']) {
  if (!buttonConsumers.has(consumer)) errors.push(`Website Button adoption missing consumer: ${consumer}`)
}

const alertAdoption = (manifest.adoptions ?? []).find((item) => item.registryComponent === 'tlx-alert-banner')
if (alertAdoption?.semanticScope !== 'ai-chat-error-only') {
  errors.push('Website alert adoption must remain scoped to AI chat errors in this wave')
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('Website UI registry adoption contract valid: Card + Badge + Navigation + shared Button + AI Alert normalised and public truth retained.')
