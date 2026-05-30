# Requirements: Poop Breakout

## What good looks like

The game loads instantly on any modern browser, plays smoothly on desktop and touch screens, persists progress across sessions without requiring an account, and meets the team's standard for repository health: a VERSION file, an expanded README, security response headers, a typed linter, and GitHub Actions workflows that all pass.

The game itself is complete as a piece of entertainment. These requirements cover only the setup backfill: the tooling, documentation, and repository hygiene the team adds to every project. No game-design changes are in scope.

---

## Project description

Poop Breakout is a browser-based arcade game in the Breakout style. The player controls a paddle at the bottom of the screen and bounces a ball to destroy bricks arranged in patterns above. Bricks are represented as poop or toilet emoji. There are 100 levels. Each level has a different brick layout from a set of 20 rotating geometric patterns. Brick density and hit points increase as the player progresses. The ball also speeds up over the 100-level span.

The player starts with three lives. Losing all lives ends the game. Clearing all bricks in a level advances to the next. Clearing all 100 levels triggers a win state.

Scoring rewards every hit. Destroying a brick earns more points than merely hitting it. A combo multiplier applies when the player destroys bricks in quick succession. A high score is persisted across sessions using the browser's local storage.

The game supports mouse, touch, and keyboard (arrow keys and Space bar) as input. The canvas scales to fit any viewport. A share button lets players export a score card as an image or use the Web Share Application Programming Interface (API) to share their result.

The stack is Vite and TypeScript, deployed to GitHub Pages via a single GitHub Actions workflow. There are no runtime dependencies; Vite and TypeScript are development dependencies only.

---

## Functional requirements

### FR-01: Start screen

The player is presented with a start screen on load. The screen shows the game title, a brief description, a legend explaining brick types and their hit-point ranges at level one, and the available input controls.

If saved progress exists (a level above one, a valid score, and at least one life remaining), the screen shows the saved state and offers two options: continue, or start a new game. If no saved progress exists, only the start button is shown.

### FR-02: Core game loop

The player controls a paddle at the bottom of the canvas. Moving the mouse, dragging a finger, or pressing the left or right arrow keys moves the paddle. A ball sits on the paddle at the start of each life. The player launches the ball by pressing Space, clicking, or tapping.

The ball bounces off the left wall, right wall, and top boundary. It bounces off the paddle. When the ball hits the paddle, the angle of deflection is proportional to how far from the paddle's centre the ball lands. When the ball falls below the bottom of the canvas, the player loses a life.

### FR-03: Brick grid

Each level contains a six-row by ten-column grid. Each cell holds a poop brick, a toilet brick, or an empty cell. Two brick types exist: poop and toilet. Poop bricks require 1 to 5 hits to destroy, scaling linearly from level 1 to level 100. Toilet bricks require 2 to 10 hits, on the same scale.

When a brick is hit but not destroyed, it shows a visual damage state (colour shift, crack lines, and a shake animation) and displays the remaining hit count. When a brick is destroyed, it plays a particle burst and fades out with a scale animation.

### FR-04: Level progression

The game contains exactly 100 levels. Each level uses one of 20 named layout patterns, cycling as the level number increments. The patterns include: full grid, checkerboard, diamond, X shape, border, zigzag, wave, spiral, columns, heart, triangle, plus sign, hourglass, fortress, diagonal stripes, pyramid, ring, two diagonal bands, dense random, and quadrant composite.

Higher levels enforce a minimum brick density between 40 percent at level 1 and 90 percent at level 100. The ratio of toilet bricks to poop bricks increases from 0 percent toilet at level 1 to 90 percent toilet at level 100.

Clearing all bricks in a level shows the level-complete screen and advances to the next level. If the cleared level is level 100, the win screen is shown instead.

### FR-05: Ball speed scaling

Ball base speed scales linearly from 1.0 times the base constant at level 1 to 2.0 times at level 100. A per-level maximum speed caps the ball, and a separate absolute maximum speed of 18 units per frame applies to all levels. An active combo also increases the effective maximum speed slightly.

### FR-06: Scoring and combo

Each hit on a poop brick scores 10 points. Each hit on a toilet brick scores 20 points. Destroying a brick (reducing hits to zero) earns those per-hit points plus a combo bonus. The combo bonus equals the base points multiplied by the combo count multiplied by 0.15, rounded down. The combo counter increments on each destruction and resets after a set idle period or when the player loses a life.

The current score and the session high score are displayed in the heads-up display (HUD) at all times during play. The high score is the highest score achieved across all sessions, persisted in local storage.

### FR-07: Lives

The player starts each game with three lives. Losing a life triggers a screen-shake animation and resets the ball to the paddle. The HUD shows remaining lives as poop emoji icons. When the last life is lost, the game-over screen is displayed.

### FR-08: HUD

The HUD is rendered on the canvas at the top of the screen. It shows: current score (left), high score (centre), level progress bar (centre below high score), level number and total (right), and remaining lives as emoji icons (right). When the combo count exceeds one, a combo indicator appears below the HUD.

The current level's hit-point values for each brick type are shown in small text below the HUD.

When the ball is waiting to be launched, a pulsing instruction text appears at the bottom of the canvas.

### FR-09: Screens and overlays

Four overlay screens exist, each displayed over the canvas. They do not use the canvas; they use HTML elements.

- Start screen: shown on load and after a game ends or is restarted.
- Game-over screen: shows the final score, the level reached, and the high score. Offers a share button and a retry button.
- Level-complete screen: shows the score and the next level number. Offers a next-level button.
- Win screen: shown when level 100 is cleared. Shows final score and best score. Offers a share button and a play-again button.

### FR-10: Save and restore progress

Progress is written to storage after each level is started and after a game ends. The saved state consists of: current level, current score, and current lives. High score is saved separately and persists independently of progress saves. When a new game starts or a game ends, the progress keys (level, score, lives) are cleared. The high score key is never cleared.

The persistence abstraction checks for a `window.persistentStorage` injection before falling back to `localStorage`. This pattern allows a host application to substitute its own storage.

### FR-11: Share score

At game over and on win, the player can share their score. Sharing renders a 600 by 420 pixel score card as a PNG image, then attempts to share it using the Web Share API with a pre-composed text string. If the API does not support files, sharing falls back to text only. If the API is not available at all, the image is downloaded to the player's device.

### FR-12: Canvas scaling

The canvas logical size is fixed at 800 by 650 pixels. On load and on every resize event, the canvas is scaled to fit the viewport while maintaining the 800 by 650 aspect ratio, using CSS `width` and `height` style properties. Mouse and touch coordinates are corrected for the CSS scale factor so paddle control remains accurate.

### FR-13: Background and visual effects

The game renders a dark purple gradient background with 80 animated twinkling stars. The ball has a trail of up to 14 fading segments with a colour gradient from purple to violet. The paddle has a rounded, gradient appearance. Flash messages showing score increments float upward from destroyed bricks and fade out.

Screen-shake is triggered by losing a life and by destroying toilet bricks.

Particle bursts are triggered on brick destruction (brick-type emoji and sparkles) and on losing a life (splash emoji).

### FR-14: Emoji rendering via offscreen canvas

Brick and particle emoji are rendered by drawing onto small offscreen canvases, then drawing those canvases onto the main canvas. The results are cached by emoji string and size to avoid redundant draw calls.

---

## Acceptance criteria

### AC-01: Start screen

- [ ] The start screen is visible on page load before any interaction.
- [ ] If no saved progress exists, only the start button is shown and no saved-progress panel is displayed.
- [ ] If saved progress exists (level greater than one, score zero or above, lives above zero), the saved-progress panel is shown with the saved level, score, and lives, and the plain start button is hidden.
- [ ] Clicking "Continue" restores the saved level, score, and lives and starts the game loop.
- [ ] Clicking "New Game" (when a save exists) clears progress and starts from level one.

### AC-02: Core game loop

- [ ] The paddle follows mouse position in real time when the game is active.
- [ ] The paddle follows touch position on a touch device.
- [ ] The left and right arrow keys move the paddle at a consistent speed regardless of frame rate.
- [ ] Input has no effect on the paddle when any overlay screen is visible.
- [ ] Pressing Space or clicking the canvas launches the ball when it is in the ball-launch state.
- [ ] The ball deflects off left and right walls and the top boundary.
- [ ] The ball deflects off the paddle; the angle depends on where on the paddle it lands.
- [ ] The ball falling below the canvas bottom reduces lives by one.

### AC-03: Brick grid

- [ ] Level one shows a grid with poop bricks requiring one hit and toilet bricks requiring two hits.
- [ ] Level 100 shows a grid with poop bricks requiring five hits and toilet bricks requiring ten hits.
- [ ] A hit-but-not-destroyed brick shows a changed colour, visible crack lines, and a shake animation.
- [ ] A destroyed brick plays a particle burst and fades out with a grow-then-fade animation.
- [ ] The remaining hit count is visible on bricks with more than one maximum hit.

### AC-04: Level progression

- [ ] Each level renders the correct layout for its position in the 20-pattern cycle.
- [ ] Higher levels show visibly more toilet bricks than lower levels.
- [ ] Clearing all alive bricks triggers the level-complete or win screen as appropriate.

### AC-05: Ball speed

- [ ] The ball moves noticeably faster at level 50 than at level one.
- [ ] The ball moves noticeably faster at level 100 than at level 50.
- [ ] The ball never exceeds 18 units per frame regardless of level or combo.

### AC-06: Scoring

- [ ] Hitting a poop brick without destroying it adds 10 to the score.
- [ ] Hitting a toilet brick without destroying it adds 20 to the score.
- [ ] Destroying a brick adds the base hit points plus a combo bonus based on the current combo count.
- [ ] The combo counter increments on each destruction and resets after the idle window expires or on losing a life.
- [ ] Score and high score are updated in the HUD in real time.
- [ ] A new high score is immediately written to storage.

### AC-07: Lives

- [ ] The HUD shows three poop emoji icons at the start of a game.
- [ ] Losing a life reduces the icon count and triggers screen-shake.
- [ ] When lives reach zero, the game-over screen appears after a short delay.

### AC-08: HUD

- [ ] Score, high score, level progress bar, level number, and lives are all visible during play.
- [ ] The combo indicator appears when the combo count exceeds one and fades when the timer expires.
- [ ] The launch hint pulses at the bottom of the canvas when the ball is waiting to be launched.

### AC-09: Screens

- [ ] Only one overlay screen is visible at a time.
- [ ] Each overlay screen displays the correct data for the event that triggered it.
- [ ] The game-over screen shows a share button and a try-again button.
- [ ] The level-complete screen shows the current score and the correct next-level number.
- [ ] The win screen appears only after level 100 is cleared.

### AC-10: Save and restore

- [ ] Progress (level, score, lives) is written to storage when a level starts.
- [ ] Progress is cleared when a new game starts or a game ends.
- [ ] High score persists across browser sessions.
- [ ] A page reload after quitting mid-game shows the continue option with the correct saved values.

### AC-11: Share

- [ ] Activating share renders a 600 by 420 pixel PNG score card with the correct score, level, and high-score values.
- [ ] On a device that supports the Web Share API with files, the native share sheet opens.
- [ ] On a device where the Web Share API does not support files, the text-only share is used.
- [ ] On a device with no Web Share API, the PNG is downloaded to the device.

### AC-12: Canvas scaling

- [ ] The canvas fills the viewport without distortion on a 1920 by 1080 desktop display.
- [ ] The canvas fills the viewport without distortion on a 375 by 667 mobile display.
- [ ] Mouse and touch paddle control is accurate at any scale factor.

### AC-13: Visual effects

- [ ] The background shows animated twinkling stars throughout gameplay.
- [ ] The ball leaves a fading trail when in motion.
- [ ] Particle bursts appear on brick destruction and on losing a life.
- [ ] Screen-shake triggers on losing a life and on destroying a toilet brick.

---

## Out of scope

The following items are explicitly out of scope for this backfill. They may be addressed in future work with Tim's direction.

- Changes to level design, game mechanics, brick types, scoring constants, or visual art.
- Migrating from Vite or TypeScript to any other build tool or language.
- Adding a pause feature (the GameState enum defines a PAUSED state, but no code currently triggers it).
- Sound effects or music.
- WCAG 2.2 AAA conformance for the game canvas itself. The canvas is a non-text, interactive visual medium. The team will flag the specific gaps found by Carol's parallel audit and ask Tim how he wants to proceed. See open questions below.
- Analytics integration (GoatCounter). This is listed in the brief's definition of done and will be delivered by Sean.
- A backend, user accounts, or a global leaderboard.

---

## Open questions

Note to Sonja: questions for this project start at Q59. The parallel SMACE dispatch (013-smace) should use Q-numbers starting after the last question here. If only Q59 is raised in this file, the SMACE dispatch should start at Q60.

**Q59.** The game canvas is purely visual. It has no semantic HTML structure for the gameplay itself, no ARIA live regions announcing score changes, and no alternative path for a player who cannot use a pointer or see the canvas. The team's standard is WCAG 2.2 AAA for all user-facing work. For this game, three options are available:

- A. Apply a documented accessibility exception for the canvas gameplay, accepting that the game is not accessible to all users and recording the exception in the project wiki. The surrounding HTML (screens, buttons) would still be brought to AAA.
- B. Add basic enhancements: ARIA live regions for score and level, keyboard-only play confirmation (already present via arrow keys and Space), and a plain-language description of the current game state. This would not make the canvas fully accessible but would reduce the gap.
- C. Treat full AAA conformance as a future milestone. Record it as a known issue in the project wiki and leave it out of the current setup branch scope.

Sonja's recommendation: A, with a recorded exception, since this is a recreational game where the visual canvas experience is intrinsic to the design. The exception would note which WCAG criteria are not met and why.

---

## Q-number coordination note

This file raises Q59. The next available Q-number for other parallel dispatches in this work folder is Q60.
