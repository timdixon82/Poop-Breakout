# Security Review: Poop-Breakout

Date: 2026-05-23
Reviewer: Jed
Repository: timdixon82/Poop-Breakout (read-only clone)
Stack: Vite 5 + TypeScript, hosted on GitHub Pages

---

## Code-review findings

### F-01 — No Content Security Policy meta tag (Medium)

Severity: Medium
OWASP: A05 Security Misconfiguration

The current `index.html` has no `Content-Security-Policy` meta tag. The team's coding standard and the standing GitHub Pages security-header exception both require one as a compensating control, since HTTP headers are unavailable on the platform. Without it, there is no browser-enforced restriction on where scripts, styles, and connections may load from.

The game loads all resources from the same origin and contains no external fetch calls. The practical injection risk is therefore very low. But the CSP meta tag is a stated condition of the standing exception, so the gap should be closed before release.

Recommended fix: add a `<meta http-equiv="Content-Security-Policy">` tag. A suitable starting policy for this game is:

```
default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
```

The `font-src 'self'` directive should be confirmed once the team knows whether the "Press Start 2P" web font is self-hosted or loaded from Google Fonts. If it is loaded from Google Fonts, the CSP will need to permit that origin. See F-04 below.

### F-02 — No Referrer-Policy meta tag (Low)

Severity: Low
OWASP: A05 Security Misconfiguration

The standing exception also names a `Referrer-Policy` meta tag as a required compensating control. The `index.html` has none. Again the practical risk is low for a public game with no query strings or session state, but the control is listed as required.

Recommended fix: add `<meta name="referrer" content="strict-origin-when-cross-origin">` to the `<head>`.

### F-03 — Web Share API error exposes internal stack trace to the console (Low)

Severity: Low
OWASP: A09 Security Logging and Monitoring Failures

In `src/utils.ts` the `shareScore` function catches errors and calls `console.error("Share failed:", err)` for anything that is not an `AbortError`. In a browser, `console.error` is visible to any user who opens the developer tools. For this game the error is unlikely to contain sensitive information, but logging exception objects with `console.error` can reveal internal call paths. The logging standard says logs should help the team find problems, not expose internals.

Recommended fix: log a plain message such as `console.warn("Score share failed")` rather than forwarding the full error object.

### F-04 — "Press Start 2P" web font — origin not confirmed (Low)

Severity: Low
OWASP: A08 Software and Data Integrity Failures

The source files reference `'Press Start 2P'` as a font family throughout (for example `src/ui.ts`, `src/utils.ts`, `src/game.ts`). There is no `@font-face` declaration in `src/styles/index.css` and no font file in the repository. The HTML does not link a Google Fonts stylesheet, but the Vite build may introduce one, or the font may be expected to be available as a system font. If it is loaded at runtime from Google Fonts, that is a third-party script or style origin that would need to be declared in the CSP and evaluated against the standing exception's condition that "the site loads no external scripts or styles from third-party origins."

Recommended fix (for Sean): confirm whether "Press Start 2P" is loaded from Google Fonts or is self-hosted. If it comes from Google Fonts, self-host it (as required by decision record 006 standard 2) or record a project exception explaining why it cannot be.

### F-05 — `(window as any).persistentStorage` hook point (Low)

Severity: Low
OWASP: A05 Security Misconfiguration

In `src/libs/persistence.ts`, the code reads from `(window as any).persistentStorage` at startup. This is a deliberate extension point that lets a host page provide a custom storage back-end. Any script that runs before the module can populate `window.persistentStorage` with an arbitrary implementation. In the deployed context on GitHub Pages this is harmless, because the CSP restricts script sources to `'self'`. But without the CSP (see F-01), any injected script could substitute a malicious storage object that, for example, exfiltrates save data or injects arbitrary values back into the game.

This is a defence-in-depth concern rather than a standalone vulnerability. It disappears once F-01 is fixed.

---

## OWASP Top 10 mapping

| Category | Finding | Defence in place | Gap |
|---|---|---|---|
| A01 Broken Access Control | Not applicable. No authentication, no server, no access-controlled resource. | n/a | None. |
| A02 Cryptographic Failures | Not applicable. No personal data, no secrets, no cryptographic operations. | n/a | None. |
| A03 Injection | DOM writes in `main.ts` use `.textContent` throughout. No `innerHTML`. No `eval`. | `.textContent` only. | None detected. |
| A04 Insecure Design | No server-side logic. Game state is entirely local. | Pure client-side. | None. |
| A05 Security Misconfiguration | No CSP meta tag, no Referrer-Policy meta tag. X-Frame-Options and Permissions-Policy absent (covered by standing exception). | Standing exception covers X-Frame-Options and Permissions-Policy. CSP and Referrer-Policy not yet delivered. | F-01, F-02 to be fixed. |
| A06 Vulnerable Components | Only two devDependencies: vite 5.4.21 and typescript 5.9.3. Locked in package-lock.json. | Lock file present. | No Dependabot or workflow scanning configured yet (team setup step will add it). |
| A07 Authentication Failures | Not applicable. No sign-in. | n/a | None. |
| A08 Software and Data Integrity | No integrity attributes on script tags; Vite's build output should be assessed. Font origin not confirmed (F-04). | Vite builds to same-origin assets. | F-04 to be confirmed. |
| A09 Security Logging | `console.error` logs raw error objects on share failure. | Minimal. | F-03, low severity. |
| A10 Server-Side Request Forgery | Not applicable. No server, no server-initiated fetch. | n/a | None. |

---

## Dependency posture

Two devDependencies declared:

- `vite`: declared as `^5.4.0`, locked at `5.4.21`. This is a current patch release on a supported major. No known critical vulnerabilities at the knowledge cutoff of August 2025.
- `typescript`: declared as `^5.4.0`, locked at `5.9.3`. Current. TypeScript 5.9 is within the active support window.

Neither version is pinned to an exact version in `package.json`; both use the caret (`^`) range operator. The lock file provides reproducible installs, which mitigates the practical risk of range resolution. The team's standard setup will add Dependabot alerts and the security workflow, which will catch future vulnerabilities.

No production dependencies. No external CDN scripts in the HTML. The web font question (F-04) is the only unresolved external-origin risk.

---

## UK GDPR posture

Poop-Breakout collects no personal data. There are no user accounts, no email fields, no contact forms, no sign-in flows, and no analytics integrations in the current source.

Game state (score, level, lives, high score) is persisted to `localStorage` under four clearly named keys. This data is stored locally in the player's browser; it is never transmitted to a server. It does not constitute personal data under UK GDPR because it is not associated with an identified or identifiable natural person in any way the game controls.

The Web Share API sends data to whatever application the user chooses on their device. The data shared is score text and a generated PNG image that contains only numeric game data. No personal data is included.

GDPR conclusion: no personal data is processed. No lawful basis, consent mechanism, retention schedule, or data subject rights mechanism is required.

If GoatCounter analytics are added during the team setup phase, a `docs/privacy.md` page will need to record the analytics URL and confirm the data processing agreement, per the GoatCounter analytics pattern.

---

## Standing exception applicability

Poop-Breakout meets all the conditions of the standing GitHub Pages security-header exception approved on 2026-05-23:

- Static HTML, CSS, and TypeScript with no server-side code.
- No personal data processed.
- No login, no authenticated session, no cookie.
- No form that submits data to a server. (The Web Share API submits to a user-chosen native app, not to a server the game controls.)
- No confirmed external scripts or styles from third-party origins (pending F-04 resolution).

Once F-04 is resolved, the standing exception applies without modification.

---

## Open questions

Q59 — "Press Start 2P" font source: is the font loaded from Google Fonts at runtime, self-hosted, or expected to fall back to a monospace system font? This affects the Content Security Policy and determines whether decision record 006 standard 2 (self-host external assets) requires action.

---

## Severity counts

- Medium: 1 (F-01, no CSP meta tag)
- Low: 4 (F-02 no Referrer-Policy, F-03 console.error on share, F-04 font origin, F-05 window hook)
- Critical / High: 0
