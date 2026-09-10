import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const root = process.cwd()
const componentRoot = path.join(root, 'src/app/components')
const adoptionPath = path.join(root, 'docs/UI_REGISTRY_ADOPTION.json')
const reportPath = path.join(root, 'reports/ui-bespoke-report.json')
const adoption = JSON.parse(fs.readFileSync(adoptionPath, 'utf8'))
const errors = []

function walk(directory) {
  const files = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'ui') continue
      files.push(...walk(fullPath))
      continue
    }
    if (/\.(jsx|tsx)$/.test(entry.name)) files.push(fullPath)
  }
  return files
}

function count(source, pattern) {
  return source.match(pattern)?.length ?? 0
}

function metricsFor(source) {
  const inlineStyles = count(source, /style=\{\{/g)
  const rawButtons = count(source, /<button\b/g)
  const hardcodedColors = count(source, /#[0-9a-fA-F]{3,8}\b|rgba?\(/g)
  const localUiImports = count(source, /from\s+["'][.]{1,2}\/[^"']*ui\/[^"']+["']/g)
  return {
    inlineStyles,
    rawButtons,
    hardcodedColors,
    localUiImports,
    heuristicScore: inlineStyles * 2 + rawButtons * 5 + hardcodedColors,
  }
}

function relative(filePath) {
  return path.relative(root, filePath).split(path.sep).join('/')
}

function consumersFor(adoptionItem) {
  const consumers = []
  if (typeof adoptionItem.consumer === 'string') consumers.push(adoptionItem.consumer)
  if (Array.isArray(adoptionItem.consumers)) consumers.push(...adoptionItem.consumers)
  return consumers
}

function readBaseFile(baseRef, filePath) {
  try {
    return execFileSync('git', ['show', `origin/${baseRef}:${filePath}`], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    return null
  }
}

const files = walk(componentRoot)
const entries = files.map((filePath) => {
  const file = relative(filePath)
  return { file, ...metricsFor(fs.readFileSync(filePath, 'utf8')) }
})

const totals = entries.reduce((sum, entry) => ({
  files: sum.files + 1,
  inlineStyles: sum.inlineStyles + entry.inlineStyles,
  rawButtons: sum.rawButtons + entry.rawButtons,
  hardcodedColors: sum.hardcodedColors + entry.hardcodedColors,
  localUiImports: sum.localUiImports + entry.localUiImports,
  heuristicScore: sum.heuristicScore + entry.heuristicScore,
}), { files: 0, inlineStyles: 0, rawButtons: 0, hardcodedColors: 0, localUiImports: 0, heuristicScore: 0 })

const topHotspots = [...entries]
  .sort((a, b) => b.heuristicScore - a.heuristicScore || a.file.localeCompare(b.file))
  .slice(0, 12)

const governedConsumers = [...new Set((adoption.adoptions ?? []).flatMap(consumersFor).filter(Boolean))]
const baseRef = process.env.GITHUB_BASE_REF || null
const governedRegressionChecks = []

if (baseRef) {
  for (const file of governedConsumers) {
    const currentPath = path.join(root, file)
    if (!fs.existsSync(currentPath)) continue
    const baseSource = readBaseFile(baseRef, file)
    if (baseSource == null) continue

    const base = metricsFor(baseSource)
    const current = metricsFor(fs.readFileSync(currentPath, 'utf8'))
    governedRegressionChecks.push({ file, base, current })

    if (current.inlineStyles > base.inlineStyles) {
      errors.push(`${file}: governed inline-style count increased ${base.inlineStyles} -> ${current.inlineStyles}`)
    }
    if (current.rawButtons > base.rawButtons) {
      errors.push(`${file}: governed raw-button count increased ${base.rawButtons} -> ${current.rawButtons}`)
    }
  }
}

const report = {
  schemaVersion: 1,
  authority: 'TXS / Quiet Instrument',
  mode: 'MEASURE_AND_PREVENT_GOVERNED_REGRESSION',
  scope: 'src/app/components excluding src/app/components/ui',
  generatedAt: new Date().toISOString(),
  baseRef,
  totals,
  topHotspots,
  governedRegressionChecks,
  interpretation: {
    inlineStyles: 'presentation authored directly in product components',
    rawButtons: 'native button controls not yet mapped to the shared UI primitive layer',
    hardcodedColors: 'direct colour literals; informational only in this gate',
    heuristicScore: 'ranking only; 2x inlineStyles + 5x rawButtons + hardcodedColors',
  },
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
