# Session handoff: Poop-Breakout onboarding

Date: 2026-05-30
Branch at exit: main (pushed to origin)

## Tim-facing tasks open

No Tim-facing tasks open. (Task substrate scripts are not present in this project repository.)

---

## What happened this session

This session completed the two-part template onboarding for Poop-Breakout and merged and pushed all work to main.

**Part 1 — Isolation (commit 6fb4bd6)**

The project received its own `.claude/` configuration: agents (all eight), commands, hooks (pre-tool-use safety gate, post-tool-use telemetry, session-start sync check, stop, subagent-stop task router), settings.json, output-styles, template-version, and template-master. Work folder 013-poop-breakout-setup (with brief, requirements, architecture review, security review, accessibility baseline, and release checklist) was committed.

**Part 2 — Reconciliation (commit 910bda6)**

A read-only bidirectional reconciliation report was produced at `/Users/timdixon/Code/AgentTeam/.claude/work/028-per-project-claude-isolation/Poop-Breakout-reconciliation.md`. Tim approved all 15 recommended actions. Changes applied:

- Added: CLAUDE.md, .editorconfig, .github/dependabot.yml, .github/pull_request_template.md, .github/accessibility-tools/ (pa11y + axe Dependabot-tracked), docs/code-review.md, docs/requirements.md, docs/security-review.md, docs/patterns/.gitkeep
- Updated: pa11y.json (_comment block + ignore: []), .gitignore (comprehensive replacement including pa11y.ci.json), docs/index.md (new stub rows)
- Fixed security.yml: semgrep ci replaced with semgrep scan --config p/default --error (no paid token)
- Fixed deploy.yml: four action tags replaced with SHA pins, configure-pages step added, workflow_dispatch added
- Fixed codeql.yml: actions: read permission added
- Updated accessibility.yml: CDN-based ChromeDriver detection, Dependabot-tracked tools, pa11y reads pa11y.ci.json — Vite adaptations preserved

**PR #6 integration (commit 7b3a52b)**

Remote main had one commit ahead (PR #6: Chrome version drift fix) that used the same CDN ChromeDriver approach but with globally installed tools (no Dependabot tracking). Our reconciliation is a strict superset: the merge was resolved preferring our version on both affected files (accessibility.yml, .gitignore). The integration is recorded in a merge commit.

**Pushed to GitHub.** All commits are on origin/main.

---

## What still needs doing

**Dependabot alerts.** GitHub surfaced 2 moderate npm vulnerability alerts when the push landed. These are pre-existing vulnerabilities in the project's npm dependencies, now visible because dependabot.yml was added. Review and address in the next session via the GitHub security tab.

**CI has not been observed yet.** The updated workflows (security.yml, deploy.yml, codeql.yml, accessibility.yml) will run on the next pull request. The accessibility workflow in particular has changed substantially; check the Actions tab after the next PR is raised.

**Work folder 013-poop-breakout-setup.** The brief should have its Status field reviewed and updated to `done` if all setup work is complete.

**No backport candidates.** The reconciliation report found no Poop-Breakout improvements that generalise to the team template.

---

## Key file locations

- Reconciliation report: `/Users/timdixon/Code/AgentTeam/.claude/work/028-per-project-claude-isolation/Poop-Breakout-reconciliation.md`
- Work folder: `.claude/work/013-poop-breakout-setup/`
- Template master: `/Users/timdixon/Code/AgentTeam` (recorded in `.claude/template-master`)
- Template version at isolation: 1.1.0 (see `.claude/template-version`)
- Dependabot alerts: https://github.com/timdixon82/Poop-Breakout/security/dependabot
