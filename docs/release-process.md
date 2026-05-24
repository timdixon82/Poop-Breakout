# Release Process: Poop Breakout

The canonical release process for the team is at `docs/release-process.md` in the global team wiki. That page covers branching, pull request lifecycle, the merge gate, signed commits, deployment, and rollback. Everything there applies to this project.

This page records only the notes specific to Poop Breakout.

## Deployment target

Poop Breakout deploys to GitHub Pages at `https://timdixon82.github.io/Poop-Breakout/`. The deploy step is in `.github/workflows/release.yml`. It runs `vite build` and publishes the `dist/` folder to the `gh-pages` branch using the `peaceiris/actions-gh-pages` action, or equivalent. The deploy runs automatically on a push to the main branch.

## Version file

The version string is held in the `VERSION` file at the repository root. Semantic versioning applies. The setup build establishes version `1.0.0`. Release-please reads commit messages to propose the next version. A `fix` commit triggers a patch release; a `feat` commit triggers a minor release; a breaking change triggers a major release.

## HTTP response headers

GitHub Pages cannot send custom HTTP response headers. The security exception at `docs/exceptions/SEC-001-missing-response-headers.md` records the mitigations in place and the conditions under which the exception remains valid. If a future release introduces a server-side component, a leaderboard, or authentication, the exception must be reviewed and the deployment target may need to change.

## Branch protection

The main branch has the team's standard initial branch-protection rules: a pull request is required before merging, status checks must pass, direct pushes to main are not allowed, and force-push to main is not allowed.

## CI workflows

Five workflow files are present in `.github/workflows/`:

- `lint-and-build.yml`: runs ESLint, Stylelint, and html-validate, then runs `vite build`. Must pass on every pull request.
- `accessibility.yml`: runs Pa11y against the built output. Chrome launch arguments (`--no-sandbox`, `--disable-setuid-sandbox`) are set in `pa11y.json` at the repository root under `chromeLaunchConfig.args`; Pa11y reads the file automatically. Must pass on every pull request.
- `security.yml`: runs Semgrep, Trivy, and the GitHub dependency-review action. Must pass on every pull request.
- `codeql.yml`: GitHub CodeQL analysis. Must pass on every pull request.
- `release.yml`: release-please on push to main, then deploys to GitHub Pages on a new release tag.

All five workflows must pass before Sonja merges to main.

## Rollback

Roll back by deploying the previous release tag. Do not delete the bad release. Record the incident in the project log. See the global release process for the full rollback procedure.
