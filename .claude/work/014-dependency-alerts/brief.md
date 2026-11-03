# Brief: 014-dependency-alerts

## Summary

Clear the open Dependabot alerts in the root `package-lock.json` (24 open: 10 high, 11 medium, 3 low; all development scope). Affected packages: vite, @vitest/mocker, minimatch, js-yaml, fast-uri, brace-expansion, postcss-selector-parser, source-map-js. Approved by Tim (Q323C).

Method: targeted `npm update` within existing ranges. The one exception is minimatch: the patched release (11.0.1 or later) is outside the `^10` range that eslint and typescript-eslint declare, so a documented `overrides` entry (`minimatch` `^11.0.4`) is added. No `npm audit fix --force`. TypeScript is not bumped and the Dependabot ignore rule is untouched.

- Status: active
- Branch: fix/dependency-alerts

## Out of scope

- Feature changes, game changes, workflow changes.
- Open Dependabot pull request 57 (grouped bump including vitest 5.0.5); not duplicated or closed here.
- TypeScript upgrades.

## Risk and rollback

- Risk is low: development dependencies only, nothing ships in the built game bundle. The minimatch override moves two consumers (eslint, typescript-estree) across a major version; lint is run to confirm they still work. Remove the override once eslint and typescript-eslint release versions that accept minimatch 11.
- Rollback: revert the pull request; `npm ci` restores the previous lock file.

## Definition of done

- `npm ci`, lint, tests, and build all pass.
- `npm audit` reports no vulnerabilities.
- Open Dependabot alerts for the listed packages close after merge.
- Pull request opened against main; merged only with Tim's approval.
