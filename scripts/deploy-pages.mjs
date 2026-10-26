/**
 * Build the site for GitHub Pages and publish the static output to the
 * `gh-pages` branch.
 *
 * This is the branch-deploy path: no GitHub Actions workflow is involved.
 * In the repository settings, set Pages to:
 *
 *   Source: Deploy from a branch
 *   Branch: gh-pages / (root)
 *
 * The base path is derived from the repository name because project Pages are
 * served from https://<user>.github.io/<repo>/. Override it with DOCS_BASE for
 * a custom domain or a <user>.github.io repository:
 *
 *   DOCS_BASE=/ npm run deploy
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

const remote = git('remote', 'get-url', 'origin')
const repo = remote.replace(/\.git$/, '').split(/[/:]/).pop()
const base = process.env.DOCS_BASE || `/${repo}/`

console.log(`Publishing ${remote} with base ${base}`)

execFileSync('npm', ['run', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, DOCS_BASE: base }
})

// GitHub Pages would otherwise run the output through Jekyll. It does not
// break the current asset names, but disabling it keeps deployment predictable.
if (!existsSync('docs/.vitepress/dist/.nojekyll')) {
  console.error('Missing docs/.vitepress/dist/.nojekyll. Refusing to publish.')
  process.exit(1)
}

execFileSync(
  'npx',
  [
    '--no-install',
    'gh-pages',
    '-d',
    'docs/.vitepress/dist',
    '--dotfiles',
    '-m',
    'Publish built site'
  ],
  { stdio: 'inherit' }
)
