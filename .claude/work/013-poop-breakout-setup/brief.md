# Brief: 013-poop-breakout-setup

## Summary

Adopt and backfill `timdixon82/Poop-Breakout`, a poop-themed Breakout game. The repository uses Vite and TypeScript, with `tsconfig.json`, `vite.config.ts`, `package.json`, and source in `src/`. Hosted on GitHub Pages. This work runs the project-completeness backfill, then proceeds to wiki scaffolding and the setup build.

- Status: archived
- Branch: chore/project-setup (merged as PR 1 on 2026-05-24 as commit `786b238`)
- Priority: 5 (closed on completion)
- Blockers: None. Q61 (canvas accessibility, accepted as exception ACC-001) and Q62 (page-title pattern, decision 002) both answered. Carol signed off; PR 1 merged.

## Requirements

No formal requirements exist. Tad reverse-engineers and records the requirements and acceptance criteria during the backfill.

## Routing plan

1. Sonja clones the repository (completed) and creates this work folder.
2. Four-agent backfill in parallel: Tad (business analysis), Jacob (architecture), Jed (security and code review), Carol (baseline WCAG 2.2 AAA audit). Each writes to its own file in this work folder.
3. Sonja consolidates and surfaces any questions to Tim.
4. Tad scaffolds the project wiki and the `chore/project-setup` branch.
5. Sean adds the team's standard setup, adapted for Vite + TypeScript.
6. Carol verifies and produces the release checklist.
7. Merge gate; pull request opened; merge only on Tim's express approval.

## Out of scope

- Game-design changes (level changes, mechanic changes, art changes).
- Migration off Vite or TypeScript.

## Risk and rollback

Risk: a CSP, lint, or workflow change breaks the existing game build.

Rollback: the team setup runs on `chore/project-setup` only; main untouched until Tim's express approval.

## Definition of done

- [ ] Four-agent backfill complete and recorded in this work folder.
- [ ] Project wiki scaffolded under `docs/`.
- [ ] VERSION file, expanded README, CSP meta tag, self-hosted GoatCounter analytics.
- [ ] Pinned linter manifest (TypeScript-aware ESLint, Stylelint, HTMLHint).
- [ ] Five workflow files passing `actionlint`, adapted for the Vite + TypeScript build.
- [ ] Carol's test pass and release checklist complete.
- [ ] Pull request opened and the merge gate passes.

## Approved GitHub actions

- [x] Create a branch
- [x] Commit to a branch
- [x] Push a branch other than the main branch
- [x] Open a pull request
- [ ] Comment on a pull request or an issue
- [ ] Create an issue

## Not pre-approved

- Merging to the main branch. This always needs Tim's express approval at the time.
- Publishing to a blog or a social media account.

## Never allowed

The hard deny-list from `CLAUDE.md`.
