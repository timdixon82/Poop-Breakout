# Project Log: Poop Breakout

This log is chronological and append-only. Never edit an existing entry; only add new ones at the bottom. Each entry begins with the date, the operation type, and the subject.

## [2026-05-23] setup | Repository adopted and setup build complete

The team adopted the existing `timdixon82/Poop-Breakout` repository. The repository uses Vite and TypeScript, with source in `src/`. It is hosted on GitHub Pages at `https://timdixon82.github.io/Poop-Breakout/`.

A four-agent backfill ran in parallel before the setup build: Tad (business analysis), Jacob (architecture), Jed (security and code review), and Carol (baseline WCAG 2.2 AAA audit). Sonja consolidated the results and surfaced questions Q61 and Q62 to Tim. Tim's answers drove Sean's setup build.

Sean delivered the setup build on branch `chore/project-setup`. Pull request 1 opened at `https://github.com/timdixon82/Poop-Breakout/pull/1`. Eight commits:

1. `f4572f7` — self-host fonts (Press Start 2P, Nunito)
2. `8d3b6eb` — Q62B page title pattern plus A-01, A-03, A-04, A-05, S-09 fixes
3. `0af656c` — Q61 accessibility exception (ACC-001)
4. `cc470c2` — security exception (SEC-001)
5. `46d62c7` — lint manifest (ESLint with TypeScript ESLint, Stylelint, html-validate)
6. `07cc6f6` — five CI workflows
7. `4945f11` — GoatCounter analytics (self-hosted count.js)
8. `0122ddc` — VERSION, release-please, expanded README

Autonomous decisions taken by Sean during the build and recorded here:

- Stylelint 17.12.0 pinned to satisfy peer dependency.
- `selector-id-pattern` ESLint rule disabled: the existing codebase uses camelCase element IDs and changing them would break TypeScript and JavaScript references.
- Dead imports and functions removed from `game.ts`, `ui.ts`, and `levelgen.ts`.
- `fade-in` keyframe renamed to kebab-case to match the team convention.
- `clip-path: inset(50%)` replaces the deprecated `clip` property on the `.sr-only` utility class.
- `<main>` landmark added to `index.html`.

Tim's answers that shaped the build:

- Q61: document the canvas accessibility gap, ship as-is, defer canvas remediation to a future increment. Recorded in `docs/exceptions/ACC-001-canvas-game-accessibility.md`.
- Q62B: keep the game's poop emoji in the visible H1 heading using `aria-hidden` spans; use a plain text `<title>` element. Recorded in `docs/decisions/002-page-title-pattern.md`.

Carol ran a WCAG 2.2 AAA test pass and found three blockers: Pa11y CI sandbox flag missing, button touch target below 44 px, and the project wiki scaffold absent. Sean resolved the first two. Tad resolved the third by writing this wiki scaffold.

## [2026-05-23] ingest | Project wiki scaffolded

Tad wrote the six missing project wiki files: `index.md`, `log.md`, `glossary.md`, `accessibility.md`, `coding-standards.md`, and `release-process.md`. All six files address Carol's blocker F-03. Committed on branch `chore/project-setup` alongside Sean's setup build.
