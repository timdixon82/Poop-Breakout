# Glossary: Poop Breakout

Terms defined as the team first used them on this project. Terms are listed alphabetically. For terms that apply across all team projects, see the global wiki glossary.

## brick row

A horizontal row of `Brick` objects laid out across the game canvas. The layout is defined in `src/definitions.ts`: ten columns (`BRICK_COLS`) and six rows (`BRICK_ROWS`). Each brick occupies 60 by 40 pixels with 8-pixel horizontal padding and 7-pixel vertical padding. The full layout is regenerated at the start of each level by `levelgen.ts`.

## BrickType

A TypeScript enum defined in `src/definitions.ts`. The three values are `POOP`, `TOILET`, and `EMPTY`. `POOP` bricks take between one and five hits. `TOILET` bricks take between two and ten hits. `EMPTY` bricks are transparent gaps in the layout. Scores per hit are `SCORE_POOP_PER_HIT` (10 points) and `SCORE_TOILET_PER_HIT` (20 points).

## canvas accessibility exception (ACC-001)

The formal record that the HTML5 `<canvas>` game area cannot meet the keyboard or screen-reader WCAG 2.2 criteria that apply to it. Accepted by Tim on 2026-05-23. Full text at `docs/exceptions/ACC-001-canvas-game-accessibility.md`. The exception covers criteria 1.1.1, 4.1.2, 4.1.3, 2.2.3, 2.1.3, 1.4.6, and 2.3.3 as they apply to the canvas itself. The HTML overlay screens are fully accessible and are not covered by this exception.

## chemical-style emoji branding

The project's visual identity uses the poop and toilet emoji as recurring design elements throughout the game, the HTML overlays, and the share score card. This is the project's own brand, not the Tim Dixon Design System. The emoji appear in overlay headings, the animated title decoration, brick legend entries, and the share card. Emoji in headings and decorative contexts carry `aria-hidden="true"` to avoid screen reader interruption, per the Q62B decision at `docs/decisions/002-page-title-pattern.md`.

## combo

A multiplier that increases the player's score when they destroy multiple bricks without missing a shot. Tracked in `GameData.combo` and governed by `GameData.comboTimer`. When the timer expires between hits, the combo resets to zero.

## fade-in

A CSS keyframe animation defined in `src/styles/index.css` that fades the overlay screens into view when they become active. The animation scales the screen from 0.9 to 1.0 and sets opacity from 0 to 1 over 0.4 seconds. Suppressed by the `prefers-reduced-motion: reduce` media query. The keyframe name uses kebab-case per the project's CSS convention.

## gameCanvas

The HTML `<canvas>` element with `id="gameCanvas"`. It is the surface on which all gameplay is rendered: the game background, bricks, ball, paddle, particles, flash messages, and the HUD (heads-up display). The element carries `role="application"` and `aria-label="Poop Breakout game area"` to set the correct ARIA interaction model and name. Resized dynamically by the `scaleCanvas` function in `src/main.ts` to fill the viewport while preserving the 800 by 650 pixel aspect ratio.

## game announcer

A visually hidden `<div id="game-announcer">` with `aria-live="polite"` and `aria-atomic="false"`. It is present in the HyperText Markup Language (HTML) so that the game loop can write state changes to it, which VoiceOver and JAWS then announce. In this build, the infrastructure is in place but the game loop does not yet write to the region. Wiring the announcer is the first roadmap item in `docs/exceptions/ACC-001-canvas-game-accessibility.md`.

## GameState

A TypeScript enum defined in `src/definitions.ts`. The seven states are `START`, `PLAYING`, `PAUSED`, `BALL_LAUNCH`, `GAME_OVER`, `LEVEL_CLEAR`, and `WIN`. The game loop branches on this value to decide what to render and which input events to process.

## lives counter

The number of lives remaining, stored in `GameData.lives`. The game starts with three lives (`LIVES_START = 3`). Each time the ball drops below the paddle, one life is lost. When lives reach zero, the game transitions to `GameState.GAME_OVER`. Lives are persisted between sessions in the browser's `localStorage` under the key `poopBreakout_savedLives`.

## no-failure-states design pattern

A cognitive-accessibility design choice that removes fixed "you failed" states from the overlay screens. The game-over screen is framed as a setback, not a permanent failure: it offers a share button and a "Try Again" action. The win screen celebrates a clear positive outcome. The level-complete screen shows forward progress. This pattern reduces frustration and supports players with cognitive disabilities or anxiety. It is one reason the team counts the overlay-screen accessibility as a strength of this project.

## paddle

The player-controlled horizontal bar used to keep the ball in play. Defined by the `Paddle` interface in `src/entities.ts`. Its position is tracked as `x` and `y` coordinates; `targetX` is the interpolation target used for smooth keyboard and pointer movement. Width is `PADDLE_WIDTH` (110 pixels) and height is `PADDLE_HEIGHT` (14 pixels). The paddle sits `PADDLE_Y_OFFSET` (50 pixels) above the bottom of the canvas.

## persistence

A thin asynchronous wrapper around `localStorage`, defined in `src/libs/persistence.ts`. It exposes `setItem`, `getItem`, `removeItem`, and `clear` as `Promise`-returning functions. The implementation uses `localStorage` as its backing store but can be replaced by injecting an alternative via `(window as any).persistentStorage` for testing.

## ui-overlay

The `<div id="ui-overlay">` element. It sits absolutely positioned over the canvas at `inset: 0` and contains all four overlay screens: `start-screen`, `game-over-screen`, `level-complete-screen`, and `win-screen`. The overlay has `pointer-events: none` so that pointer events pass through to the canvas during gameplay; the active screen sets its own `pointer-events: all` to capture clicks on buttons.
