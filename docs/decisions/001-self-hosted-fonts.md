# Decision 001: Self-hosted web fonts

## Status

Accepted. Decided on 2026-05-23 as part of the setup build.

## Context

The original `src/styles/index.css` imported two typefaces from the Google Fonts content delivery network:

- `Press Start 2P`: the retro pixel font used for headings, game titles, and the HUD.
- `Nunito` (weights 400, 700, 900): the body copy font for the overlay screens.

Loading fonts from `fonts.googleapis.com` at runtime has two consequences. First, it sends each visitor's Internet Protocol (IP) address to Google's servers, which is a data disclosure that the team avoids where practical. Second, it creates an external script and style origin that the Content Security Policy must explicitly allow. The team's standing standard for adopted static projects (global wiki `docs/decisions/006-adopted-static-project-standards.md`, standard 2) requires self-hosting external fonts.

## Decision

Both typefaces are self-hosted in `public/assets/fonts/`. The CSS `@font-face` declarations replace the Google Fonts `@import` and point to the locally served files.

Files committed:

- `public/assets/fonts/press-start-2p-v16-latin-regular.ttf` — Press Start 2P, version 16, regular weight.
- `public/assets/fonts/nunito-v32-latin-400.ttf` — Nunito, version 32, weight 400.
- `public/assets/fonts/nunito-v32-latin-700.ttf` — Nunito, version 32, weight 700.
- `public/assets/fonts/nunito-v32-latin-900.ttf` — Nunito, version 32, weight 900.

The Vite `public/` directory is copied verbatim to `dist/` at build time. The font files are served from the same origin as the game, under the `/Poop-Breakout/assets/fonts/` path.

## Licence

Both typefaces are licensed under the SIL Open Font Licence 1.1. That licence explicitly permits redistribution and embedding. The full licence text is at `https://openfontlicense.org/`.

Versions self-hosted in this build:

- Press Start 2P v16: copyright 2012 CodeMan38. SIL OFL 1.1.
- Nunito v32: copyright 2022 The Nunito Project Authors. SIL OFL 1.1.

## Maintenance cadence

The font files should be reviewed once a year against the upstream versions on Google Fonts. If a new version has been released and the update is cosmetically neutral (no character set change, no weight changes), the files may be replaced in a chore commit. If the update changes the look of the game, Tim reviews it first.

## Consequences

- The `Content-Security-Policy` meta tag no longer needs to allow `fonts.googleapis.com` or `fonts.gstatic.com`. The `font-src` directive can be `'self'`.
- No visitor IP address is sent to Google for font delivery.
- The total size of the repository increases by approximately 490 KB for the four font files. The font files are binary and are not linted.
- The deploy workflow copies them unchanged; no build step is needed.
