# Accessibility: Poop Breakout

The team's accessibility floor is the Web Content Accessibility Guidelines (WCAG) 2.2 at conformance level AAA. This page records how that standard applies to Poop Breakout and which parts of the game are in scope, which are out of scope, and why.

Read this page alongside `docs/coding-standards.md`. Together they form the project's definition of done for accessibility.

## Scope

Poop Breakout has two distinct zones.

The first zone is the HTML overlay screens: the start screen, the game-over screen, the level-complete screen, and the win screen. These screens are standard HyperText Markup Language (HTML) with buttons, headings, and text. All WCAG 2.2 AAA criteria apply to them, and the setup build brings them to conformance.

The second zone is the canvas game area: the `<canvas id="gameCanvas">` element and everything drawn inside it. The canvas API does not expose semantic structure or ARIA roles for in-game entities, and cannot reliably communicate state changes to assistive technology. A documented exception (ACC-001) applies to this zone.

## Canvas exception

The canvas game area cannot meet several WCAG 2.2 criteria. The exception is accepted, documented, and scoped. It does not affect the HTML overlay screens.

Full detail at [canvas game accessibility exception ACC-001](exceptions/ACC-001-canvas-game-accessibility.md).

The exception covers:

- 1.1.1 Non-text Content (Level A): the canvas has no text alternative describing live gameplay.
- 4.1.2 Name, Role, Value (Level A): in-game entities have no machine-readable role or value.
- 4.1.3 Status Messages (Level A): in-game events are not announced to assistive technology.
- 2.2.3 No Timing (Level AAA): the game is real-time with no full pause.
- 2.1.3 Keyboard No Exception (Level AAA): a screen reader user cannot play the canvas gameplay meaningfully.
- 1.4.6 Contrast Enhanced (Level AAA): some canvas-drawn HUD text achieves approximately 5.5:1, below the 7:1 AAA threshold.
- 2.3.3 Animation from Interactions (Level AAA): canvas particle effects and animations are partially mitigated; full canvas gating is a roadmap item.

This exception was accepted by Tim on 2026-05-23 via Q61. The full rationale and the future roadmap are in `docs/exceptions/ACC-001-canvas-game-accessibility.md`.

## Keyboard parity

The HTML overlay screens are fully keyboard-navigable. Every button has a visible focus ring that meets WCAG 2.4.13 Focus Appearance (Level AAA): a 3-pixel solid white outline with at least 3:1 contrast against both its focused and unfocused states.

The canvas game area is controlled by keyboard (left and right arrow keys, space bar) during gameplay. The canvas exception applies to the gameplay experience itself.

The controls instruction on the start screen lists keyboard controls first, as required by the team standard in `CLAUDE.md`.

## Focus management

Each overlay screen is shown and hidden by adding and removing the `.active` class. Focus is not programmatically moved between screens in the current build. A future improvement would move focus to the first heading or primary button when a screen becomes active, which would satisfy WCAG 2.4.3 Focus Order (Level A) more completely.

## Contrast

The HTML overlay screens use a colour scheme of white text (`#ffffff`) on a near-black background (`rgb(10 5 30 / 0.96)`). This achieves a contrast ratio above 15:1, well above the WCAG 1.4.6 Contrast Enhanced (Level AAA) threshold of 7:1 for normal text.

Score and high-score values use gold (`#ffd700`) on the same near-black background, achieving approximately 14:1.

Button text is white on a purple gradient. The darkest point of the gradient is approximately `#4a0080`, which gives white text a ratio of approximately 11:1.

The CSS colour values for the overlay screens are defined in `src/styles/index.css`. There are no separate CSS design tokens for this project. The canvas HUD uses colours defined in `src/game.ts` and is subject to the canvas exception above.

## No-failure-states design as a cognitive-accessibility feature

The overlay screens use what the team calls the no-failure-states design pattern. The game-over screen does not call the player a failure; it offers a share action and a retry. The win screen gives unambiguous positive feedback. The level-complete screen shows progress.

This design reduces cognitive load and frustration, and it is particularly relevant for players with anxiety or cognitive disabilities. It is a genuine accessibility strength of this project and should be preserved in future iterations.

See the [no-failure-states entry in the glossary](glossary.md) for the full description.

## Page title pattern (Q62B)

Tim answered Q62B: keep the game's emoji branding in the visible H1 heading, but use a plain text `<title>` element.

The implementation wraps the H1 emoji in `aria-hidden="true"` spans so that screen readers announce the text node "POOP BREAKOUT" only. The `<title>` element reads `Poop Breakout` without emoji. This avoids VoiceOver announcing "pile of poo Poop Breakout toilet" as the page title.

Full decision record at [decision 002: page title and H1 emoji pattern](decisions/002-page-title-pattern.md).

## Reduced motion

CSS animations on the overlay screens (the bouncing title emoji, the screen fade-in) are suppressed by the `prefers-reduced-motion: reduce` media query in `src/styles/index.css`. Canvas animations are a roadmap item in the canvas exception.

## Screen-reader live region

A visually hidden `<div id="game-announcer" aria-live="polite" aria-atomic="false">` is present in the HTML. The infrastructure is in place for the game loop to write state changes to it. Wiring the announcer to the game loop is the first item on the accessibility roadmap in `docs/exceptions/ACC-001-canvas-game-accessibility.md`.
