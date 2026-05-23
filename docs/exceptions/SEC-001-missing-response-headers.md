# Security Exception SEC-001: Missing HTTP response headers on GitHub Pages

## Status

Accepted. Standing exception per decision record 006 of the global wiki (`docs/decisions/006-adopted-static-project-standards.md`), applied on 2026-05-23.

## What is excepted

GitHub Pages cannot send custom HTTP response headers. The following security headers, which the team would normally deliver on an origin the team controls, cannot be set:

- `X-Frame-Options`: cannot be sent as an HTTP header. Mitigated: `frame-ancestors 'none'` in the Content Security Policy meta tag achieves the same effect in all modern browsers.
- `Permissions-Policy`: cannot be sent. Risk is low; the game requests no sensitive browser permissions (camera, microphone, geolocation, notifications). Residual low risk accepted.
- `Strict-Transport-Security` (HSTS): cannot be set by the site owner on GitHub Pages. GitHub Pages itself delivers HTTPS and enforces it. The residual risk of a first-visit downgrade attack on a game site with no personal data is very low. Accepted.
- `X-Content-Type-Options`: not deliverable via meta tag and not sent by GitHub Pages by default. Modern browsers do not sniff MIME types for scripts loaded from the same origin with a correct Content-Type. Risk is very low for a same-origin static site. Accepted.

## Compensating controls in place

The following controls are delivered via meta tags inside `index.html` and approximate the protection of the missing headers:

- `Content-Security-Policy` meta tag: restricts scripts to `'self'`, styles to `'self'`, fonts to `'self'`, connections to the GoatCounter endpoint only, and disallows frames (`frame-ancestors 'none'`). Delivered since: this setup build (2026-05-23).
- `Referrer-Policy` meta tag: set to `strict-origin-when-cross-origin`. Delivered since: this setup build (2026-05-23).

## Conditions for this exception to remain valid

The exception remains valid only while all of the following conditions are true:

1. The site is static HTML, CSS, and TypeScript with no server-side code.
2. No personal data is processed on the page.
3. There is no login, no authenticated session, and no cookie.
4. There is no form that submits data to a server the game controls.
5. No external scripts or styles are loaded from third-party origins.

Conditions 1 through 4 are met. Condition 5 was not met on main (Google Fonts CDN import); it is met on this setup branch because both fonts are self-hosted.

## Moving to a host with full header control

If a future requirement demands the full header set (for example, if the game adds a leaderboard requiring authentication), the appropriate response is to migrate the deployment to a host that sends custom headers (for example Cloudflare Pages or Netlify). That migration would be a new decision, not a revision of this exception.

## Sign-off

Standing exception. Approved by Tim Dixon as part of the global standards decision in decision record 006 of the global wiki. Applied to Poop Breakout on 2026-05-23.
