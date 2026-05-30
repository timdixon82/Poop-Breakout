# Baseline WCAG 2.2 AAA Accessibility Audit: Poop Breakout

Audit date: 2026-05-23
Auditor: Carol (tester and release manager)
Method: Code inspection only. No live browser run. Repository clone at `/Users/timdixon/Library/Mobile Documents/com~apple~CloudDocs/Github/Poop-Breakout` is read-only.

## UI surfaces audited

- `index.html`: the single HTML file, which holds the start screen, game-over screen, level-complete screen, and win screen.
- `src/styles/index.css`: all visual styling for the HTML surfaces.
- `src/main.ts`: event wiring, screen transitions, and callback handlers.
- `src/game.ts`: the canvas game loop, input handling, and all drawing code.
- `src/ui.ts`: the heads-up display (HUD) drawn on the canvas and the `showScreen` / `hideAllScreens` helpers.
- `src/utils.ts`: score-card rendering and share logic.
- `src/definitions.ts`, `src/entities.ts`, `src/levelgen.ts`, `src/libs/persistence.ts`: supporting modules. No HTML or ARIA. Reviewed for game-state announcements.

Surface not auditable by code inspection alone: runtime colour contrast of canvas-drawn text against canvas backgrounds (gradients and semi-transparent fills require computed pixel sampling). Contrast values below are estimated from source colour values. Automated axe-core and Pa11y runs against a built instance are required to confirm contrast numerically.

## WCAG 2.2 Level A findings

### A-01: Missing `<meta name="viewport">` (1.4.4 Resize Text, 2.5.4)

`index.html` has no viewport meta tag. Without it, mobile browsers render the page at desktop width and then scale it down. Zooming to 200 percent on mobile becomes unreliable. The canvas itself is scaled by JavaScript, but the HTML surfaces (the overlay screens) may not respond correctly.

Severity: Fail. Required fix before release.

### A-02: Page title contains emoji, no plain-language fallback (2.4.2 Page Titled)

`<title>💩 Poop Breakout 🚽</title>` — some screen readers announce emoji by their Unicode description, producing "pile of poo Poop Breakout toilet". This is not a WCAG failure in strict terms, but it is a VoiceOver and JAWS usability failure. The title should lead with plain text and place emoji after or omit them: `<title>Poop Breakout</title>`.

Severity: Fail (usability for Tim's VoiceOver and JAWS setup).

### A-03: Controls instruction uses mouse and emoji icon as information carrier (1.4.1 Use of Colour / non-text, 2.5.4 Motion Actuation, 2.1.1 Keyboard)

The start screen contains: `🖱️ Move mouse / touch to control paddle`. This instruction is mouse-first. The keyboard instruction is listed second and treats the keyboard as an alternative. Per the team standard (CLAUDE.md), instructions must be keyboard-first. The emoji `🖱️` and `⌨️` carry semantic meaning (input type) without a text equivalent alongside them; a screen reader will announce their Unicode names, which is tolerable but not ideal.

Severity: Fail. The instruction order must be reversed: keyboard-first, then pointer.

### A-04: `<canvas>` element has no accessible name or role (1.1.1 Non-text Content, 4.1.2 Name Role Value)

`<canvas id="gameCanvas"></canvas>` has no `role`, no `aria-label`, and no fallback content inside the element. Screen readers either ignore it entirely or announce it as an unlabelled image. All game state (score, lives, level, HUD, bricks, ball, paddle, combo, flash messages) is rendered exclusively onto the canvas. There is no mechanism for any of this to reach assistive technology.

Severity: Critical Fail. This is the most serious finding in the audit. See the game-specific section for full discussion.

### A-05: Buttons have no visible focus indicator (2.4.7 Focus Visible, 2.1.1 Keyboard)

The CSS sets `outline: none` on `.btn-start` with no replacement focus style. Keyboard users cannot see which button has focus. This is a Level A failure (2.4.7) and is also a Level AAA failure (2.4.13 Focus Appearance).

Severity: Critical Fail.

### A-06: `saved-progress` section hidden with `style="display:none"` in HTML, shown dynamically (4.1.2 Name Role Value)

The saved-progress section is conditionally revealed by JavaScript. The buttons inside it (`newGameBtn`, `continueBtn`) are present in the DOM but hidden. This pattern works, but focus management on reveal is absent: when the section appears, focus stays on the start button and no announcement is made. A screen reader user may not know a new choice has appeared.

Severity: Fail. An `aria-live` region or focus management is required.

### A-07: Flash messages and combo announcements have no ARIA live region (4.1.3 Status Messages)

Score increments (`+10`, `+20`, combo multipliers) are drawn on the canvas as `FlashMessage` objects. They are never exposed to the accessibility tree. A screen reader user receives no feedback when they score, when they gain a combo, or when they lose a life.

Severity: Fail (Level A under 4.1.3 and Critical under game-specific findings).

### A-08: Single-character keyboard shortcuts not configurable (2.1.4 Character Key Shortcuts)

The game uses Space to launch the ball. Space is also used by VoiceOver (activate element) and JAWS (say next word). There is no way to remap or disable the Space shortcut. This can conflict with screen reader commands.

Severity: Fail.

### A-09: Audio auto-plays with no stop control (1.4.2 Audio Control)

No audio is present in the current codebase, so this criterion does not apply yet. Recorded for future work if sound effects are added.

Severity: Not applicable at present.

## WCAG 2.2 Level AA findings

### AA-01: Contrast of HUD text on canvas background is likely insufficient (1.4.3 Contrast Minimum)

The HUD draws `"SCORE"` in `#a090cc` and the score value in `#ffd700` over a semi-transparent black bar (`rgba(0,0,0,0.45)`) laid over a dark gradient background (`#12002a` to `#0d0020`). Estimating the effective background at roughly `#0d0016`, the contrast ratios are:

- `#a090cc` on `#0d0016`: approximately 5.5 to 1. Passes AA (4.5:1) but fails AAA (7:1).
- `#ffd700` on `#0d0016`: approximately 12 to 1. Passes both.
- `#a090cc` used for "BEST", "LVL x/100", and brick-count label at 7px: extremely small text at very small size; contrast requirement for large text (4.5:1) applies only to text 18px or larger. At 7–9px these labels almost certainly fail AA minimum contrast for small text.
- Level progress bar labels in the HTML overlay: `#cbb8ff` on `rgba(10,5,30,0.96)` background, approximately `#0a051e`. Estimated contrast approximately 8 to 1. Passes both AA and AAA.
- Subtitle text `.subtitle` in `#cbb8ff` on `#0a051e`: approximately 8 to 1. Passes.
- `.controls-info` text in `#a090cc` on `#0a051e`: approximately 5.5 to 1. Passes AA, fails AAA.

Note: these are estimates. Automated tools must verify against the rendered output.

Severity: Partial Fail. Several canvas text elements likely fail AA contrast for small text. A full automated contrast audit against a live build is required.

### AA-02: No `lang` attribute on parts in a different language (3.1.2 Language of Parts)

The page `lang="en"` is correctly set. No mixed-language content observed. Pass.

### AA-03: Focus not obscured by the canvas or overlay (2.4.11 Focus Not Obscured Minimum)

The canvas sits behind the `#ui-overlay` div. During gameplay, no HTML elements hold focus — the game runs entirely on canvas. During overlay screens, the modal-style `.screen-content` divs contain the buttons. There is no sticky header that could obscure focus. Partial pass, but see A-05: focus visibility is broken because `outline: none` is set, so obscurement cannot be evaluated until focus visibility is restored.

### AA-04: Reflow — `overflow: hidden` on `body` prevents scroll (1.4.10 Reflow)

`body { overflow: hidden; }` combined with the viewport-filling canvas means the page cannot reflow to a 320 px column. At 320 px wide, users who rely on browser zoom to enlarge text will find the game canvas scaled down and the overlay screens constrained. The game canvas is responsive via JavaScript scaling, but the HTML text overlay may not wrap correctly in a narrow viewport. Fail. This requires testing with a live build at 320 px.

### AA-05: Screen transitions announce nothing to assistive technology (4.1.3 Status Messages)

When `showScreen("game-over-screen")` is called, the DOM change (removing and adding the `active` class) is not wrapped in a live region. A screen reader user may not know the screen has changed unless focus is moved explicitly. No focus management code exists in `showScreen()` or `hideAllScreens()`.

Severity: Fail.

## WCAG 2.2 Level AAA gaps

### AAA-01: Contrast Enhanced — canvas text (1.4.6 Contrast Enhanced, 7:1 for normal text)

As noted in AA-01, the `#a090cc` label colour on dark canvas backgrounds is approximately 5.5 to 1, which fails the AAA 7:1 threshold. The team standard in `docs/accessibility.md` requires 7:1 from the start of the palette. All label colours must be revised upward.

### AAA-02: No timing control — game is entirely time-limited (2.2.3 No Timing)

Breakout is an inherently real-time game. The ball moves at speed. There is no pause function in the current code (`GameState.PAUSED` is defined in `definitions.ts` but never used). A screen reader user cannot stop the game to listen to announcements without losing a life. This is a genuine tension between the game's real-time nature and the AAA timing requirement.

Recommended posture: implement a Pause key (P or Escape) that freezes the game loop. This does not fully satisfy 2.2.3 for the game's competitive mechanic, but it is a substantial mitigation. Record the residual gap as a documented exception with Tim's approval.

### AAA-03: No reduced-motion support (2.3.3 Animation from Interactions)

The game uses continuous animation: bouncing emoji on the start screen (CSS `@keyframes bounce`), the `fadeIn` animation on screen transitions, and the canvas game loop with star twinkle, particle explosions, ball trails, and brick shake animations. There is no check for `prefers-reduced-motion` in the CSS or in the game loop. Users who need reduced motion receive none.

The CSS should add:

```css
@media (prefers-reduced-motion: reduce) {
  .title-emoji { animation: none; }
  .screen { animation: none; }
}
```

The game loop should check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and skip or reduce particle effects and the ball trail.

Severity: Fail at AAA level.

### AAA-04: No keyboard-only game mode or screen-reader-friendly alternative (2.1.3 Keyboard No Exception)

The game is keyboard-operable in the narrow sense: arrow keys move the paddle and Space launches the ball. However, a screen reader user cannot play the game meaningfully because:

1. All game state is canvas-rendered with no accessible equivalent.
2. The paddle position, ball position, brick count, and collision events are never announced.
3. There is no audio-cue system to substitute for visual feedback.

2.1.3 at AAA removes the exception that 2.1.1 allows for certain keyboard limitations. While a real-time arcade game has an inherent structural tension with this criterion, the complete absence of any non-visual game-state channel is beyond what can be documented as an exception without a mitigation.

Recommended posture: see game-specific section below.

### AAA-05: No readable-level check applied to UI text (3.1.5 Reading Level)

UI copy such as "The stinkiest breakout game ever made" and "The toilet has beaten you." is simple and informal. No formal readability measurement has been run. Given the copy style, this is likely to pass grade 9. Tad should confirm with a readability check as part of the documentation pass.

### AAA-06: Focus Appearance — no focus ring defined (2.4.13 Focus Appearance)

See A-05. The `outline: none` rule eliminates the focus ring entirely. The replacement must meet AAA Focus Appearance: a focus ring at least 2 CSS pixels thick with a contrast ratio of at least 3:1 between focused and unfocused states, and the focused area must be at least as large as a 2 px perimeter around the component.

### AAA-07: 1.3.6 Identify Purpose — canvas controls have no machine-readable purpose

The canvas does not expose any ARIA roles or properties. The game controls (paddle, ball launch) cannot be identified by assistive technology in any machine-readable way. This is a documented gap inherent to the canvas approach. Record as a documented exception.

### AAA-08: 3.2.5 Change on Request — screen transitions fire without explicit user action in some paths

The game-over and level-clear screens appear after a `setTimeout` delay following an in-game event (ball lost, last brick destroyed). The user did not press a button to trigger the screen change. This violates 3.2.5. The mitigation is the same focus-management fix required for AA-05: move focus to the new screen's heading when it appears, and announce it via a live region.

### AAA-09: 2.4.8 Location — no breadcrumb or location indicator

This is a single-page application with no multi-page navigation, so 2.4.8 does not meaningfully apply. The level number is displayed in the HUD, but only on the canvas and not in the accessibility tree. Record as a note rather than a formal gap.

### AAA-10: 3.3.5 Help — no in-app help or instructions accessible to a screen reader

The start screen has a controls legend and a `.controls-info` block. These are HTML and are accessible. However, once the game starts, there is no help mechanism available. This is a minor gap for a game context.

## Game-specific accessibility findings

### G-01: Canvas-rendered game state is entirely invisible to screen readers

This is the central accessibility concern for Poop Breakout. The entire game — score, lives, level, ball, paddle, bricks, flash messages, combo announcements, launch hints — exists only on the canvas. The `<canvas>` element has no accessible fallback content, no `aria-label`, and no role.

A screen reader user using VoiceOver or JAWS will:

- Navigate to the canvas and hear nothing useful.
- Be unable to determine the current score, how many lives remain, what level they are on, or when the game state changes.
- Receive no feedback when they score points, lose a life, clear a level, or win.

This is not a marginal gap. It makes the game unplayable for a screen reader-only user.

#### Recommended accessible-alternative posture

Three approaches are available, in order of implementation cost:

**Option 1: Hidden live-region shadow DOM (recommended minimum)**

Add a visually hidden `<div aria-live="polite" aria-atomic="false" id="game-announcer" class="sr-only">` to `index.html`. The game loop updates its `textContent` at meaningful state changes: score change, life lost, level clear, game over. This does not make the game fully playable by ear, but it gives a screen reader user awareness of game state.

Key announcement points to implement:

- Ball launch ready: "Press Space to launch the ball. Level X. Lives remaining: Y."
- Life lost: "Life lost. Lives remaining: Y."
- Brick destroyed: announce score change on a throttled basis, not every brick hit (too noisy).
- Combo: "Combo times N" when combo exceeds 3.
- Level clear: "Level X complete. Score: N. Proceeding to level X+1."
- Game over: "Game over. Final score: N. High score: N."
- Win: "You win. All 100 levels cleared. Final score: N."

**Option 2: Audio cue system**

Supplement Option 1 with synthesised audio cues using the Web Audio API (no external files needed): a tone on each brick hit, a lower tone on life lost, a rising arpeggio on level clear. This gives real-time spatial feedback that Option 1 cannot. The `prefers-reduced-motion` gate should mute non-essential sounds, or a separate sound preference should be offered.

**Option 3: Keyboard-navigation game mode**

Implement an alternate game mode where the ball speed is slower and the user can step through turns. This is architecturally significant and is the most complete solution. It is outside the scope of the current backfill but is the right long-term posture for a WCAG AAA target.

The team's current recommendation is Option 1 now, Option 2 as a follow-on, Option 3 deferred pending Tim's direction.

### G-02: Launch hint is canvas text only

The "CLICK OR PRESS SPACE TO LAUNCH!" hint, rendered by `game.ts` in the `BALL_LAUNCH` state, is canvas text. A screen reader user who reaches the game area does not know they need to press Space. This is resolved by the Option 1 live-region announcement above.

### G-03: HUD displayed on canvas only

Score, high score, lives, level, and the level progress bar are all drawn on the canvas. None reach the accessibility tree. The HTML overlay screens do show score and level on game-over, level-complete, and win screens, so a screen reader user gets this information at transition points. During active gameplay they receive nothing.

### G-04: Screen shake is a potential vestibular trigger

The `shakeTimer` system applies random `translateX/Y` to the entire canvas when a life is lost or a toilet brick is destroyed. There is no `prefers-reduced-motion` check. This can trigger vestibular problems. The reduced-motion fix in AAA-03 must include suppressing `shakeX` and `shakeY` when the media query is active.

### G-05: Particle system and bouncing emoji are continuous animation

See AAA-03. The `.title-emoji` poop emoji bounces permanently on the start screen. The canvas renders a 60 fps animation loop at all times. Both require reduced-motion gates.

### G-06: `GameState.PAUSED` is defined but never implemented

The game has no pause function. This is significant: without pause, a screen reader user (or any user with a motor disability) cannot stop the game to take their time. Implement Escape or P as a pause toggle as part of the setup work.

## Recommended deferred items

The following items require a live build to audit properly. They are deferred pending the Vite build and CI pipeline being in place.

1. Precise colour contrast ratios for all canvas-drawn text — requires axe-core and Pa11y against a built instance.
2. Reflow at 320 px viewport width — requires a browser at that width.
3. Touch target sizes for the HTML buttons — require computed CSS pixel dimensions.
4. VoiceOver, JAWS, and NVDA screen reader passes — require manual testing against a live deployment.
5. Keyboard-only play session — requires the live build and a keyboard.
6. Automated HTML validation — no validator run possible from code inspection alone.
7. Reading-level check on all UI copy — requires Tad's pass.

## Open questions for Tim (proposed numbers Q59 onwards)

**Q59: Accessible-alternative posture for the canvas game**

The game is canvas-rendered, which means screen reader users receive no game state. The team recommends implementing a hidden live-region announcer (Option 1 above) as the minimum fix. Option 2 adds Web Audio cues. Option 3 creates a keyboard-navigation game mode. Which approach would you like the team to build?

A. Option 1 only — live-region announcements for score, lives, level changes, and game-over.
B. Option 1 plus Option 2 — live-region announcements and Web Audio cues.
C. All three options — live-region, audio cues, and a slower keyboard-navigation game mode.
D. Note the gap as a documented exception and defer all three options. (Carol's note: this would leave the game unplayable for a screen reader user and is not consistent with the team's WCAG AAA target.)

Team recommendation: Option A or B. Option A is achievable within the current backfill scope. Option B adds useful real-time feedback.

**Q60: Pause functionality**

The `GameState.PAUSED` state is defined but never used. Should the team implement a pause key (Escape or P) as part of the setup work?

A. Yes — implement pause with Escape key.
B. Yes — implement pause with P key.
C. Yes — implement pause with both Escape and P keys.
D. Defer pause to a future work item.

Team recommendation: Option C. Pause costs little and substantially improves accessibility and general usability.

**Q61: Canvas element accessible name**

The canvas needs an accessible name and either `role="img"` (treating it as a static visual) or `role="application"` (treating it as an interactive region). For an arcade game, `role="application"` with `aria-label="Poop Breakout game area"` is the standard posture. Do you want the team to apply this now?

A. Yes — `role="application"` with `aria-label="Poop Breakout game area"`.
B. Yes — `role="img"` with `aria-label` and a fallback description inside the canvas element.
C. Defer until the live-region system is built, so the role choice is informed by what is being announced.

Team recommendation: Option A now, as it costs one line of HTML and immediately removes the "unlabelled canvas" failure.

**Q62: Title emoji**

The `<title>` currently contains emoji. Should the team replace it with plain text?

A. Yes — change to `<title>Poop Breakout</title>`.
B. Yes — change to `<title>Poop Breakout - the stinkiest breakout game ever</title>`.
C. Keep emoji in the title.

Team recommendation: Option A. Plain title is more reliable across screen readers.
