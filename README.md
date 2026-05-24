# Poop Breakout

A poop-themed Breakout arcade game. Control a paddle at the bottom of the screen and bounce a ball to destroy bricks arranged in patterns above. Bricks are represented as poop and toilet emoji. There are 100 levels; each level uses one of 20 geometric patterns, with harder bricks and a faster ball as the level number climbs.

## Live site

The game is published at [timdixon82.github.io/Poop-Breakout/](https://timdixon82.github.io/Poop-Breakout/).

## How to play

- Left and right arrow keys move the paddle.
- Press Space, click, or tap to launch the ball.
- The game supports mouse, keyboard, and touch input.
- Destroy all bricks to clear a level and advance.
- Lose all three lives and the game ends.
- High scores are saved in the browser across sessions.

## Building it locally

Install Node.js 20 or later, then:

```
npm install
npm run dev
```

This starts the Vite development server. Open a browser and go to the address shown in the terminal.

To build the production bundle:

```
npm run build
```

The output is in the `dist/` folder.

## Linting

Three linters check the source files:

```
npm run lint
```

This runs HTML validation, CSS linting, and TypeScript/ESLint in sequence.

## Accessibility

This project targets WCAG 2.2 AAA for the HTML overlay screens. The start, game-over, level-complete, and win screens are fully accessible with keyboard navigation, focus indicators, and screen-reader-friendly headings.

The canvas game area has a known accessibility gap: the gameplay is rendered entirely on an HTML5 canvas and cannot be perceived by a screen reader. This gap is documented in full, with a named roadmap for future fixes, in the project wiki at [docs/exceptions/ACC-001-canvas-game-accessibility.md](docs/exceptions/ACC-001-canvas-game-accessibility.md).

## Known accessibility gap and roadmap

The game canvas renders all gameplay visually. A screen reader user will hear "Poop Breakout game area" from the canvas label, but no gameplay feedback reaches assistive technology.

The following work would make the game meaningfully accessible to a screen reader user:

1. A hidden `aria-live` mirror: an off-screen live region that announces score changes, lives remaining, ball launch prompts, level clear, and game over. The infrastructure for this (the `#game-announcer` element) is already in the HTML; the game loop wiring is a future task.

2. Event-driven audio cues: synthesised sounds using the Web Audio API for brick hits, life loss, and level clear, giving real-time feedback without requiring sight.

3. A keyboard-only mode: a game mode in which the ball auto-targets the paddle at reduced speed, letting a player focus on timing rather than precision aim. This would make the core gameplay accessible to a player who cannot see the canvas.

These items are recorded as a roadmap in [docs/exceptions/ACC-001-canvas-game-accessibility.md](docs/exceptions/ACC-001-canvas-game-accessibility.md). They are out of scope for the current setup build.

## Security

The game uses a Content Security Policy and a Referrer Policy delivered via meta tags. All resources, including web fonts and analytics, are self-hosted and served from the same origin as the game.

GitHub Pages cannot send custom HTTP response headers. The gaps this creates (X-Frame-Options, Permissions-Policy) are recorded as an accepted exception in [docs/exceptions/SEC-001-missing-response-headers.md](docs/exceptions/SEC-001-missing-response-headers.md).

## Analytics

The game uses GoatCounter for anonymous page-view counting. No personal data is collected. No consent banner is required. Full details are in [docs/privacy.md](docs/privacy.md).

## Project wiki

Full documentation, including architecture decision records, security and code review findings, and the requirements backfill, is in the [docs/](docs/) folder.

## Licence

This project is licensed under the GNU General Public Licence version 3. See the `LICENSE` file for the full text.

The two web fonts included in this repository are licensed under the SIL Open Font Licence 1.1. See [docs/decisions/001-self-hosted-fonts.md](docs/decisions/001-self-hosted-fonts.md) for details.
