/**
 * Check every internal href/src in the built site.
 *
 * VitePress validates Markdown links, but links emitted by Vue components
 * (for example `withBase('/gnc/navigation')` without `.html`) bypass that
 * check. This script catches missing files, links outside the configured
 * base, and extensionless internal links.
 *
 * Usage:
 *   npm run build
 *   npm run check:links
 *   DOCS_BASE=/my-repo/ npm run build && DOCS_BASE=/my-repo/ npm run check:links
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const dist = 'docs/.vitepress/dist'
const base = (process.env.DOCS_BASE || '/').replace(/\/?$/, '/')

if (!existsSync(dist)) {
  console.error(`Build output not found at ${dist}. Run "npm run build" first.`)
  process.exit(1)
}

const htmlFiles = []
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path)
    else if (path.endsWith('.html')) htmlFiles.push(path)
  }
}
walk(dist)

let references = 0
const problems = []

for (const file of htmlFiles) {
  const relativePath = '/' + relative(dist, file).split(sep).join('/')
  const pagePath = relativePath.endsWith('/index.html')
    ? relativePath.slice(0, -'index.html'.length)
    : relativePath
  const pageUrl = base + pagePath.replace(/^\//, '')
  const html = readFileSync(file, 'utf8')

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = match[1]
    if (
      !raw ||
      raw.startsWith('#') ||
      raw.startsWith('http://') ||
      raw.startsWith('https://') ||
      raw.startsWith('mailto:') ||
      raw.startsWith('data:') ||
      raw.startsWith('javascript:')
    ) {
      continue
    }

    const url = new URL(raw, 'http://site' + pageUrl)
    if (!url.pathname.startsWith(base)) {
      problems.push(`${relativePath} -> ${raw} (outside base ${base})`)
      continue
    }

    let target = url.pathname.slice(base.length)
    if (target === '' || target.endsWith('/')) target += 'index.html'
    const targetPath = join(dist, decodeURIComponent(target))
    references++

    if (!existsSync(targetPath)) {
      problems.push(`${relativePath} -> ${raw} (missing ${target})`)
    }
  }
}

console.log(`Checked ${references} internal references across ${htmlFiles.length} pages (base ${base})`)

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s):`)
  for (const problem of problems.slice(0, 80)) console.error(`  ${problem}`)
  if (problems.length > 80) console.error(`  ...and ${problems.length - 80} more`)
  process.exit(1)
}

console.log('No broken internal references.')
