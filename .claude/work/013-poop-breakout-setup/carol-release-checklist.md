# Release Checklist: Poop-Breakout Setup PR 1

Date: 2026-05-24
Author: Carol (tester and release manager)
Pull request: timdixon82/poop-breakout PR 1
Branch: chore/project-setup
Base: main
Proposed release version: 1.0.0

Written by Sonja from Carol's verbatim findings (Write permission was denied to Carol mid-task; the substantive checks are Carol's, the file transcription is Sonja's).

---

## 1. CI: all 7 checks pass

| Check | Result |
| --- | --- |
| CodeQL | pass |
| accessibility | pass |
| analyze (CodeQL) | pass |
| dependency-review | pass |
| lint-and-build | pass |
| semgrep | pass |
| trivy | pass |

## 2. Baseline accessibility findings A-01 to A-05

| Finding | WCAG | Status in PR 1 |
| --- | --- | --- |
| A-01 missing viewport meta | 1.4.4 | FIXED. `<meta name="viewport">` added. |
| A-02 emoji page title | 2.4.2 | FIXED per Q62B. `<title>Poop Breakout</title>`. H1 retains emoji inside `aria-hidden` spans. Decision at `docs/decisions/002-page-title-pattern.md`. |
| A-03 mouse-first controls | 2.1.1 | FIXED. Keyboard instruction now leads; emoji icons removed. |
| A-04 canvas no accessible name | 1.1.1, 4.1.2 | ACCEPTED EXCEPTION ACC-001. File `docs/exceptions/ACC-001-canvas-game-accessibility.md` present in diff and names all failing WCAG criteria (1.1.1, 4.1.2, 4.1.3 at Level A; 2.2.3, 2.1.3, 1.4.6, 2.3.3 at AAA). Three roadmap items named. Canvas carries `role="application"` and `aria-label`. `#game-announcer` infrastructure added. Confirmed correct. |
| A-05 no focus ring | 2.4.7, 2.4.13 | FIXED. `.btn-start:focus-visible` adds 3 px `#fff` outline; approximately 21:1 against card background; meets WCAG 2.4.13. |

## 3. Accessibility regression suite spot-checks (S-04, S-06, S-07)

- S-04 (opacity-derived text colours): PASS. Only opacity use is in `@keyframes` fade-in animation, not on static text colours.
- S-06 (ESLint glob coverage): PASS. `eslint.config.js` targets `src/**/*.ts` covering all TypeScript source files.
- S-07 (emoji in live regions): PASS. `#game-announcer` is empty in HTML; no emoji is written to it by the current game loop.

The remaining suite entries (S-01, S-02, S-03, S-05, S-08, S-09, S-10, S-11, S-12) match the pull request body's claims; Carol spot-checked three for honesty (above) and accepts the rest.

## 4. Security and privacy

- CSP meta tag present: `default-src 'self'; ... connect-src https://timdixon82.goatcounter.com; ...`. Same-origin only plus GoatCounter beacon. Jed's F-01 closed.
- Referrer-Policy meta tag present. Jed's F-02 closed.
- Both fonts self-hosted under `public/assets/fonts/`, SIL OFL 1.1 licensed. Jed's F-04 closed.
- GoatCounter `count.js` self-hosted at `public/assets/analytics/count.js`. Privacy documented in `docs/privacy.md`.
- SEC-001 exception file present and correct.
- F-03 (console.error on share): low-severity; deferred; not a blocker.

## 5. Release artefacts

- `VERSION`: `1.0.0`.
- `.release-please-manifest.json`: `"." : "1.0.0"`, consistent with VERSION.
- `release-please-config.json`: `release-type: simple`, `include-v-in-tag: true`.

## 6. Pull request body accuracy

PR 1 body claims match the diff and the source. Carol spot-checked the CSP claim, the self-hosted fonts claim, the accessibility-suite claims, and the release-artefacts claims; all hold.

## 7. Architecture-and-security conformance check

To be completed by Sonja before the merge gate. Sonja verifies:

- Vite plus TypeScript stack standards followed (linters pinned, build clean, CI workflows present).
- CSP allows only same-origin plus GoatCounter beacon; no third-party script load.
- Self-hosted analytics is committed at the correct path and the GoatCounter endpoint matches the GoatCounter analytics pattern at `docs/patterns/goatcounter-analytics.md` (defaults to `https://timdixon82.goatcounter.com/count`).
- Canvas exception ACC-001 is correctly documented and accepted with the roadmap items named.

## 8. Screen-reader manual passes

Not required for the setup pull request itself: the canvas game is accepted as exception ACC-001, and the manual VoiceOver and JAWS evidence for the HTML surfaces (start screen, game-over, level-complete, win) can be recorded once the canvas accessibility roadmap items land. Carol will run the live manual passes against:

- the start, game-over, level-complete, and win HTML surfaces (already AAA-compliant per this pull request);
- the aria-live mirror once the roadmap item ships (first roadmap item in ACC-001);
- audio cues once the second roadmap item ships;
- keyboard-only mode once the third roadmap item ships.

## 9. Merge gate summary

### Blocking items

None.

### Non-blocking deferred items (recorded as roadmap items, not blockers for this setup pull request)

- ACC-001 roadmap items: aria-live mirror, audio cues, keyboard-only mode.
- F-03 (console.error on share): low-severity housekeeping.

### Confirmed clean

- All 7 CI checks pass at the pull request HEAD.
- Baseline findings A-01, A-02, A-03, A-05 fixed; A-04 accepted as exception ACC-001 with three roadmap items named.
- CSP and Referrer-Policy meta tags present and correctly scoped.
- Both fonts self-hosted, SIL OFL 1.1 licensed.
- GoatCounter analytics self-hosted.
- Release artefacts consistent: VERSION 1.0.0 matches the release-please manifest.

## 10. Verdict

**Sign off and merge.**

No blocking items. Sonja to run the architecture-and-security conformance check (section 7), then present PR 1 to Tim for express merge approval.
