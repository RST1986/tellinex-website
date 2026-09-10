import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const manifestPath = path.join(root, 'docs/UI_REGISTRY_ADOPTION.json')
const targetPath = path.join(root, 'src/app/components/NetworkBuildStatus.tsx')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const target = fs.readFileSync(targetPath, 'utf8')

const errors = []

if (manifest.authority !== 'TXS / Quiet Instrument') errors.push('Unexpected UI authority')
if (manifest.mode !== 'NORMALIZE_EXISTING') errors.push('Website adoption mode must remain NORMALIZE_EXISTING')
if (manifest.direct21stImportsAllowed !== false) errors.push('Direct 21st.dev imports must remain disabled')
if (manifest.productionDeploymentChanged !== false) errors.push('UI adoption must not claim a production deployment change')

const expected = new Map([
  ['tlx-surface-card', 'src/app/components/ui/card.tsx'],
  ['tlx-status-badge', 'src/app/components/ui/badge.tsx'],
])

for (const adoption of manifest.adoptions ?? []) {
  if (adoption.state !== 'CONSUMED') errors.push(`${adoption.registryComponent}: state must be CONSUMED`)
  if (expected.get(adoption.registryComponent) !== adoption.localEquivalent) {
    errors.push(`${adoption.registryComponent}: unexpected local equivalent`)
  }
  if (!fs.existsSync(path.join(root, adoption.localEquivalent))) {
    errors.push(`${adoption.registryComponent}: local equivalent missing`)
  }
  if (!fs.existsSync(path.join(root, adoption.consumer))) {
    errors.push(`${adoption.registryComponent}: consumer missing`)
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
  if (!target.includes(token)) errors.push(`NetworkBuildStatus missing contract token: ${token}`)
}

if (target.includes('background: "rgba(0,199,177,0.04)"')) {
  errors.push('NetworkBuildStatus still contains the retired bespoke surface implementation')
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('Website UI registry adoption contract valid: Card + Badge normalised and commercial truth retained.')
