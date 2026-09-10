import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const srcRoot = path.join(repoRoot, 'src')
const allowedExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.mjs', '.cjs'])
const forbidden = [/@21st-dev\//i, /21st\.dev/i]
const violations = []

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full)
      continue
    }
    if (!allowedExtensions.has(path.extname(entry.name))) continue
    const text = fs.readFileSync(full, 'utf8')
    if (forbidden.some((pattern) => pattern.test(text))) {
      violations.push(path.relative(repoRoot, full))
    }
  }
}

walk(srcRoot)

if (violations.length) {
  console.error('Direct 21st.dev references are not allowed in Tellinex Website source:')
  for (const file of violations) console.error(`- ${file}`)
  console.error('External candidates must be approved in the Tellinex UI Registry before product adoption.')
  process.exit(1)
}

console.log('Website UI registry boundary valid: no direct 21st.dev references in product source.')
