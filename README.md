# Lunar FSW Field Guide

A VitePress study site for moving from web/software development into **lunar lander GNC and flight software**. It keeps the original three-month plan, adds a Month 4 flight-software track, and turns every topic into a build, a quiz, and a piece of evidence.

The site is content-first: Markdown lessons, MathJax equations, Mermaid diagrams, per-page completion, and a progress dashboard. No backend, no account, no tracking.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in docs/.vitepress/dist
npm run preview  # serve the built site locally
```

Requires Node 20+ (built with Node 22/24).

## What is in here

```
docs/
  index.md                  home page
  start/                    how to use, roadmap, setup, progress
  foundations/              Month 1: space, frames primer, STK, MATLAB, C++, Linux, Git, CMake, debugging
  gnc/                      Month 2: frames/time, quaternions, dynamics, control, 6DOF, Monte Carlo, nav, guidance, architecture
  test/                     Month 3: V&V, SIL/HIL, Python automation, STK Object Model
  flight/                   Month 4: real-time C++, Simulink pipeline, cFS, RTOS, CCSDS, NPR 7150.2, FDIR, sensors
  mission/                  lunar environment, orbital mechanics, LLV console bridge
  reference/                formula sheet, glossary, resources
  .vitepress/
    config.mts              nav, sidebar, math, Mermaid, base path
    theme/                  custom theme, components, topic registry, progress store
```

## The content model

Every lesson follows the same shape: why it matters, learning objectives, core notes, a flight-software lens, practice, a quiz, and resources. Pages marked **Core** in the registry are the deep dives; the rest are orientation pages.

The canonical topic list lives in `docs/.vitepress/theme/data/topics.ts`. It drives:

- the progress dashboard and totals,
- the per-page completion control injected by `Layout.vue`,
- estimated study minutes and group metadata.

If you add a lesson, add it to `topics.ts` and to the sidebar in `config.mts`, or it will not appear in progress tracking.

## Progress tracking

Progress is stored in `localStorage` under the `lunar-fsw-progress` key, per browser and per device. There is no sync and no backend. Clearing site data resets progress. This is intentional: the site is a study tool, not an LMS.

Components available in Markdown:

```md
<Quiz
  question="..."
  options="A|B|C"
  answer="1"
  explanation="..."
/>

<StudyChecklist
  id="week-1"
  title="Week 1 deliverables"
  items="First item|Second item|Third item"
/>

<ProgressDashboard compact />
```

`TopicComplete` is injected automatically on registered topic pages. You can also place it manually, but avoid duplicating it.

## Math and diagrams

- MathJax is enabled through `markdown-it-mathjax3`. Inline math uses `$...$`; display math uses `$$...$$`.
- Mermaid is enabled through `vitepress-plugin-mermaid`. Use fenced `mermaid` blocks.
- Avoid raw `{{ }}` in Markdown outside code fences; Vue treats it as an interpolation.

## Deploy to GitHub Pages

### 1. Put the site in its own repository

The workflow in `.github/workflows/deploy.yml` assumes **`rsrc` is the repository root** (where `package.json` lives). If the site lives in a subdirectory of a larger repo, move the workflow to that repo's root and set `working-directory` and the upload path accordingly.

### 2. Enable Pages

In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

### 3. Push to `main`

The workflow builds with `DOCS_BASE` set to `/<repo-name>/`, uploads `docs/.vitepress/dist`, and deploys. The base path is required because project Pages are served from `https://<user>.github.io/<repo>/`, not from the domain root.

If you use a **custom domain** or a **user/organization site** (`<user>.github.io`), set a repository variable `DOCS_BASE` to `/` (Settings → Secrets and variables → Actions → Variables). The workflow reads `vars.DOCS_BASE` first.

To test the production base path locally:

```bash
DOCS_BASE=/lunar-fsw-field-guide/ npm run build
DOCS_BASE=/lunar-fsw-field-guide/ npm run preview
```

### 4. Verify

- The home page loads and the logo resolves.
- Internal links keep the base prefix.
- Math and Mermaid render.
- The progress dashboard persists across reloads.
- A deep link such as `/gnc/navigation` loads directly.

GitHub Pages is a static host, so the site is built with extensionless routing **off**: internal links point at `.html` paths, and a deep link such as `/gnc/navigation.html` loads directly. `404.html` handles unknown paths. If you later enable `cleanUrls`, GitHub Pages needs a rewrite rule or a 404 fallback; do not switch it on without testing the deployed base path.

## Adding a lesson

1. Copy an existing page and change the frontmatter (`title`, `description`).
2. Add the path, title, group, minutes, and blurb to `topics.ts`.
3. Add a sidebar item in `config.mts`.
4. Write the lesson with the standard sections.
5. Add at least one quiz and one practice task.
6. Run `npm run build` to catch dead links and syntax errors.
7. Run `npm run dev` and check the page, math, Mermaid, and the completion control.

Component links are different from Markdown links: `withBase('/gnc/navigation')` does **not** add `.html`, and GitHub Pages will not resolve it. Use `topicHref()` from `topics.ts` for topic links in Vue components. Markdown links are converted by VitePress and are safe.

## Editing conventions

- One unit per quantity; put it in the name or the text (`altitude_m`, `rate_mps`).
- State the frame for every vector.
- Use scalar-last quaternions `[x, y, z, w]`, matching three.js.
- Prefer short paragraphs, tables, and worked examples over long derivations.
- Cite standards and NASA documents where a claim is program-specific.
- Do not claim compliance or certification. Describe evidence.

## Verification before publishing

```bash
npm run clean
npm run build
npm run check:links
npm run preview
```

`check:links` scans the built HTML for internal `href`/`src` targets, including
links generated by Vue components that VitePress does not validate. To check the
production base path, rebuild with `DOCS_BASE` set before running it:

```bash
DOCS_BASE=/lunar-fsw-field-guide/ npm run build
DOCS_BASE=/lunar-fsw-field-guide/ npm run check:links
```

Then check:

- no dead-link warnings in the build output,
- no Vue hydration or interpolation warnings in the browser console,
- the home, a core lesson, the roadmap, the dashboard, a quiz, a checklist, math, and Mermaid,
- the built site under the production base path.

## Notes and limitations

- The site is original study material, not an official mission design or a substitute for program documentation.
- Mission numbers are illustrative. Always verify against your program's ICD, SRS, flight software users' guide, and approved sources.
- `npm audit` may report advisories in the VitePress/Vite dev dependency tree. Treat them as tooling risk, not flight risk, and review before deploying to a public host.
- The LLV PDI Console lives in a separate project; the bridge page describes the seam and the upgrade path, not a guaranteed implementation.

## License

Content is original unless quoted or linked. Code snippets are provided for study. Add a license before redistributing if you publish this as a public repository.
