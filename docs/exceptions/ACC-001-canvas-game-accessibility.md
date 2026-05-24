# Accessibility Exception ACC-001: Canvas game area

## Status

Accepted. Approved on 2026-05-23. Implements Tim's answer Q61 (free-text extension of option D): document the canvas accessibility gap, ship as-is, and do not fix the canvas at this stage.

## What is excepted

The Poop Breakout game is rendered entirely onto an HTML5 `<canvas>` element. The canvas context exposes no semantic structure, no ARIA roles for in-game entities, and no mechanism to push in-game state changes to assistive technology. As a result, the following Web Content Accessibility Guidelines (WCAG) 2.2 criteria are not met for the canvas gameplay area:

- 1.1.1 Non-text Content (Level A): The canvas has no text alternative describing the gameplay.
- 4.1.2 Name, Role, Value (Level A): In-game entities (bricks, ball, paddle) have no machine-readable role or value.
- 4.1.3 Status Messages (Level A): Score changes, life loss, brick destruction, level clear, and game over are not exposed to assistive technology.
- 2.2.3 No Timing (Level AAA): The game is real-time; there is no way to pause the game loop entirely.
- 2.1.3 Keyboard No Exception (Level AAA): A screen reader user cannot play the game meaningfully because all game state is canvas-rendered with no accessible equivalent.
- 1.4.6 Contrast Enhanced (Level AAA): Several canvas-drawn text colours achieve approximately 5.5:1, below the AAA threshold of 7:1.
- 2.3.3 Animation from Interactions (Level AAA): Particle effects, ball trail, screen shake, and star animations run regardless of the player's reduce-motion preference (mitigated in this build for CSS animations; the canvas loop check is deferred).

## User impact

A screen reader user using VoiceOver or JAWS cannot play the game. They will hear "Poop Breakout game area" from the canvas label and receive no further gameplay feedback. The HTML overlay screens (start, game-over, level-complete, win) are fully accessible and will be announced correctly.

The game is recreational. No essential service or duty is performed by the canvas gameplay itself. The audience is general public players who wish to play an arcade game. The impact is that screen reader users cannot participate in the gameplay, which is a significant but scoped limitation.

## What this build does instead

This build delivers the following minimum-viable mitigations:

1. The canvas element carries `role="application"` and `aria-label="Poop Breakout game area"`. This removes the "unlabelled element" finding and sets the correct interaction model expectation.
2. A visually hidden `<div id="game-announcer" aria-live="polite">` live region is present in the HTML. The game loop can write state changes to this region. The announcements are not yet wired in (that is the next roadmap step), but the infrastructure is in place.
3. The HTML overlay screens (buttons, headings, text) are brought to WCAG 2.2 AAA conformance: focus rings meeting 2.4.13, keyboard-first controls text, `type` attributes on all buttons, and no `outline: none`.
4. CSS animations (bounce, fade-in) respect `prefers-reduced-motion: reduce`.

## Named future fixes that would close this gap

The following work items would make the game meaningfully playable for a screen reader user. They are recorded here so a future increment has a clear baseline.

1. Live-region announcements. Wire the `#game-announcer` live region to the game loop. Announce: ball launch ready (level and lives), score change on a throttled basis, life lost, level clear, and game over. This is Option 1 from Carol's audit recommendation.

2. Event-driven audio cues. Add a Web Audio API cue system: a tone on brick hit, a lower tone on life lost, and a rising arpeggio on level clear. This gives real-time spatial feedback that text announcements cannot. This is Option 2 from Carol's audit.

3. Keyboard-only mode with auto-targeting. Implement an alternate game mode in which the paddle auto-targets the ball at a reduced speed and the player's role is to time brick-targeting choices. This would make the core gameplay accessible without sight. This is Option 3 from Carol's audit.

4. Reduced-motion gate in the game loop. Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` in game.ts and suppress `shakeX`, `shakeY`, particle effects, and the ball trail when the preference is set.

5. Canvas contrast audit. Run a pixel-sampling contrast check against the built canvas to confirm actual contrast ratios for all HUD text, and revise colours that fall below 7:1.

## Rationale for shipping as-is

Poop Breakout is an arcade game. The visual canvas experience is intrinsic to the design. Fixing items 1 through 5 above is a meaningful body of work that is out of scope for the current setup build, whose purpose is to establish tooling, security headers, and repository health. The game is already deployed at version 1.0.0 with these gaps, and no regression is introduced by this build.

The gap is real and is not minimised here. It is documented precisely so that a future developer can pick up the roadmap items above and close them incrementally.

## Sign-off

Approved by Tim Dixon on 2026-05-23 via Q61 (free-text answer, extension of option D: document the gap, ship as-is, do not fix the canvas at this stage).
