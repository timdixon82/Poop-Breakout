# Poop-Breakout Architecture Review and Decision Records

Author: Jacob, architect.
Date: 2026-05-23.
Repository: timdixon82/Poop-Breakout, branch main, version 1.0.0.
Status: backfill review of an adopted project. The code exists and is deployed to GitHub Pages; this review records the architecture as built.

## Purpose of this document

The team adopted Poop-Breakout on 2026-05-23 as work folder 013. Tad runs the requirements backfill, Jed the security review, and Carol the baseline accessibility audit in parallel. This document is the architecture backfill: it describes the project as built, judges each significant choice, and records the choices as Architecture Decision Records (ADRs) so any later change has a baseline to conform to.

## Architecture summary

Poop-Breakout is a single-page Breakout-style arcade game running entirely in the browser. The page bootstraps a TypeScript module that instantiates a `PoopBreakout` class. That class owns an HTML `<canvas>` element, a `requestAnimationFrame` loop, and the full mutable game state (paddle, ball, brick grid, particles, score, level). Rendering is software 2D canvas drawing; there is no Document Object Model (DOM) for in-game entities and no WebGL. A separate set of fixed HTML overlays (start, game-over, level-clear, win) are toggled by adding or removing a CSS `active` class, with button handlers wired in `src/main.ts`.

The codebase is small and tidy: eight TypeScript files in `src/`, one CSS file, one HTML entry point, plus a Vite + TypeScript build chain. The build emits a static bundle that GitHub Pages serves under the `/Poop-Breakout/` base path. State is persisted to `localStorage` via an indirection (`src/libs/persistence.ts`) that allows a hosting environment to inject its own async key-value store.

Module roles:

- `src/main.ts`: page bootstrap, overlay button wiring, persistence load and save, canvas scaling.
- `src/game.ts`: the `PoopBreakout` class, the game loop, input binding, physics, collision, rendering.
- `src/definitions.ts`: numeric constants and the `BrickType` and `GameState` enums.
- `src/entities.ts`: plain `interface` declarations for the game-state shapes.
- `src/levelgen.ts`: deterministic layout generation for 100 levels, plus per-level hit and speed scaling.
- `src/ui.ts`: heads-up display drawing on the canvas, plus the `showScreen` / `hideAllScreens` overlay helpers.
- `src/utils.ts`: maths helpers, particle spawner, and the shareable score card renderer.
- `src/libs/persistence.ts`: an async key-value adapter over `localStorage` with a hook for a host-provided override.

## Strengths

The separation of concerns is sensible for the size of the project. Constants, types, level data, rendering helpers, and persistence each live in their own module with no circular imports. The single class owning the game loop is appropriate for a 2D arcade game; a heavier entity-component architecture would be over-engineered here.

Persistence is abstracted cleanly. The shape (`getItem`, `setItem`, `removeItem`, `clear`, all async and string-keyed) is the right minimum surface, and the optional `window.persistentStorage` indirection means the same code works inside a wrapping shell (for example a packaged desktop or mobile build) without edits.

The game loop uses `requestAnimationFrame` with a clamped delta-time, which is the correct shape for a browser game. Frames longer than fifty milliseconds are clamped so a tab returning from background does not produce a single huge integration step. The physics is simple, deterministic given inputs, and free of frame-rate coupling on the speed envelope.

The brick collision routine in `checkBrickCollisions` correctly computes which edge was struck (the minimum overlap on the four sides) rather than the naive "flip dy on any hit" found in many small Breakout examples. This avoids tunnelling on corners at higher speeds.

TypeScript strict mode is on (`"strict": true` in `tsconfig.json`). The code is reasonably typed, with explicit `interface` declarations for the game state.

Level generation is deterministic on level number, with the random seed only affecting brick-type fill density. The same level number always produces the same shape but a slightly different toilet-to-poop mix. That is a deliberate and defensible choice and could be made fully deterministic with a seeded RNG if a future requirement asks for it.

The build configuration is minimal and correct: `vite.config.ts` sets only `base: '/Poop-Breakout/'`, which is what GitHub Pages needs.

## Risks and concerns

The most pressing risk is accessibility. The entire game is drawn into a `<canvas>` with no fallback content, no ARIA labels, no keyboard-accessible overlay navigation pattern, no announcement of score or lives changes, and no respect for `prefers-reduced-motion`. WCAG 2.2 at AAA is the team's baseline (`docs/coding-standards.md`), and a canvas-driven game with no text alternative does not meet even AA on Success Criterion 1.1.1 (Non-text Content). The shake effect, the bouncing title emoji, the pulsing launch hint, and the bouncing animation on the start screen all run regardless of the user's motion preference, which is a 2.3.3 (Animation from Interactions) and 2.2.2 (Pause, Stop, Hide) issue. Carol owns the detailed audit, but the architecture chosen (canvas-only rendering, no semantic representation of the game state) is what makes the gap structural rather than cosmetic. A future accessibility pass will need an off-screen live region that mirrors score, lives, level, and key events as plain text, and a keyboard-only path that does not depend on mouse coordinates. This belongs in the architecture record because it constrains future rendering decisions.

The repository violates standing standard 2 of `docs/decisions/006-adopted-static-project-standards.md`: external fonts. `src/styles/index.css` imports `Press Start 2P` and `Nunito` from `fonts.googleapis.com` at runtime, which both leaks the visitor's IP address to Google and creates a runtime origin the Content Security Policy must allow. The setup build must self-host these fonts (subject to their licences; both Google Fonts faces ship under the SIL Open Font Licence which permits redistribution).

The repository violates standing standard 4 of `docs/decisions/006-adopted-static-project-standards.md`: pinned linters. `package.json` declares only `typescript` and `vite`, with no ESLint, Stylelint, HTMLHint, or shared configs. The deploy workflow runs `npm ci && npm run build` and stops. Sean addresses this in the setup build.

The deploy workflow is a single job pair (build then publish). There is no lint job, no type-check job (Vite's build does not run `tsc --noEmit`), no test job, no CodeQL job, no actionlint job. The setup build adds these.

The Content Security Policy meta tag is not present on `index.html`. With external fonts removed, a tight policy of `default-src 'self'` with a small list of allowances becomes possible. Until the fonts move on-origin the policy would have to allow Google's font origins, which weakens the defence.

`main.ts` calls `(game as any).startLoop?.()` in two places (lines 91 and 116), reaching into a `public` method through an `any` cast. The cast is unnecessary because `startLoop` is already `public`; this is a code smell that suggests the public surface of `PoopBreakout` and the calling convention in `main.ts` drifted apart. A small refactor would tighten the API.

The `definitions.ts` `GameState` enum lists `PAUSED`, but no code transitions into or out of it. A pause feature is implied but not implemented. This is dead code per the General Principles in `docs/coding-standards.md` and should either be wired up or removed.

Continuous-running `requestAnimationFrame` after a game-over: `startLoop` is never paired with `stop()` after `GameState.GAME_OVER`, so the loop continues to draw the (now static) final frame until the next level or game starts. Battery cost is negligible on a desktop browser, but a mobile browser will keep waking the GPU. Worth a small fix.

## Proposed Architecture Decision Records

The following ADRs are proposed for the project wiki at `docs/decisions/` when Tad scaffolds it. They record the architecture as built and the choices that should not be revisited without a new decision.

### ADR 001: Static front-end on GitHub Pages, Vite + TypeScript build

Accepted. The project is a static front-end (the team's static stack, with the Vite + TypeScript variant) deployed to GitHub Pages at the `/Poop-Breakout/` base path. The deployed artefact is the `dist/` output of `vite build`, not the source. Alternatives considered: a no-build static site (rejected — TypeScript and module bundling are wanted), a server-rendered framework (rejected — there is no server, no personal data, no need). Consequences: standing standard 3 of decision 006 applies in full (GitHub Pages security-header exception, meta-tag CSP).

### ADR 002: TypeScript as the implementation language, strict mode on

Accepted. The implementation language is TypeScript with `"strict": true`, targeting `ES2020` modules. Alternatives considered: plain JavaScript (rejected — the game state has enough shape to benefit from interfaces and enums), JSDoc-typed JavaScript (rejected — the team already uses TypeScript on Status Dashboard and ICCC, and the static stack page allows it). Consequences: a development-time toolchain is required; `tsc --noEmit` should run in continuous integration alongside the build.

### ADR 003: HTML5 Canvas 2D for in-game rendering, DOM overlays for menus

Accepted with an accessibility caveat. The game world (bricks, ball, paddle, particles, heads-up display) is drawn into a single `<canvas>` element with the 2D context. The start, game-over, level-complete, and win screens are HTML elements layered above the canvas in an absolutely positioned `#ui-overlay` and toggled by an `.active` CSS class. Alternatives considered: WebGL (rejected — 600 bricks at sixty frames per second is well within the 2D context's budget; WebGL adds shader complexity and no visible benefit at this scale), DOM-only rendering with one element per brick (rejected — paint and layout cost climbs with brick count, and per-pixel collision visualisation is harder), an off-the-shelf 2D engine such as Phaser or PixiJS (rejected — the project does not need a scene graph, asset loader, tween engine, or input abstraction; a single class is simpler). Consequences: in-game content is not in the accessibility tree. A non-visual user gets nothing from the canvas. A future accessibility pass needs an off-screen live region that mirrors score, lives, level, brick count, and key events. This is the central constraint that the next architectural decision will have to address.

### ADR 004: Single-class game loop, requestAnimationFrame with clamped delta-time

Accepted. The `PoopBreakout` class owns the loop, the state, the input bindings, and the render. The loop runs through `requestAnimationFrame`, computes a delta-time clamped to fifty milliseconds, runs `update(dt)`, then `draw()`. Alternatives considered: fixed-step physics with interpolation (rejected — the game is forgiving enough that a small time-step variation is invisible; fixed-step adds complexity), an entity-component-system (rejected — over-engineered for this scale). Consequences: the loop continues to run on `GAME_OVER`; a small `stop()` call when the overlay shows would save mobile battery. Recorded as a follow-up.

### ADR 005: No third-party game library

Accepted. The project does not depend on Phaser, PixiJS, Matter.js, Babylon, or any other game framework. All physics, collision, rendering, particle, and audio code is hand-written. Alternatives considered: Phaser 3 (rejected — about 1 megabyte of code for behaviours that fit in a few hundred lines here), PixiJS plus a custom physics layer (rejected — no scene-graph benefit at this scale). Consequences: zero supply-chain surface beyond Vite and TypeScript at build time, and no runtime third-party JavaScript. The build size is roughly proportional to the game's own code.

### ADR 006: State management is mutable fields on a single `GameData` object

Accepted. Game state lives on `PoopBreakout.data`, a `GameData` object holding score, lives, level, combo, brick grid, ball, paddle, particle list, flash messages, and shake offsets. Mutation is in-place; there is no Redux, no immutable update, no observer. Alternatives considered: an immutable store with subscribers (rejected — a sixty-frames-per-second game allocating new state per frame would create garbage-collection pressure), a finite state machine library (rejected — the seven `GameState` values are small enough to be a `switch`). Consequences: state changes are easy to write but harder to test in isolation. Anyone touching the loop must respect that `data` is shared mutable state.

### ADR 007: Persistence indirection over `localStorage`

Accepted. `src/libs/persistence.ts` exposes an async key-value adapter (`getItem`, `setItem`, `removeItem`, `clear`). The default implementation wraps synchronous `localStorage` in `Promise.resolve`. A host environment can override by setting `window.persistentStorage` before bootstrap. Alternatives considered: direct `localStorage` calls (rejected — locks the game to one storage primitive), IndexedDB (rejected — overkill for four integer values). Consequences: future wrapping (a desktop shell, a mobile container, a server-synced save) can replace the storage layer without touching game code. The four storage keys (`poopBreakout_highScore`, `poopBreakout_savedLevel`, `poopBreakout_savedScore`, `poopBreakout_savedLives`) are deliberately namespaced and should not change without a migration plan.

### ADR 008: Level generation is deterministic on level number, with a stochastic fill colouring

Accepted. `generateLayout(level)` selects a shape pattern by `(level - 1) % 20`, then fills the chosen cells with a poop-to-toilet mix that depends on the level's `toiletRatio`. The cell positions are deterministic; the type fill at each position uses `Math.random()`. Alternatives considered: fully deterministic with a seeded random number generator (deferred — would give reproducible levels for screenshots and bug reports, but is not required today), hand-authored levels (rejected — 100 hand-authored levels is a content-design cost the project does not need). Consequences: a player retrying the same level sees the same shape with slightly different brick types. Acceptable today; promote to a seeded RNG if a level-replay feature ever requires byte-for-byte reproducibility.

### ADR 009: Inputs are mouse, touch, and keyboard, with no remapping

Accepted. The paddle follows mouse position and touch position (with `passive: false` so `preventDefault` can stop page scroll), and also responds to the left and right arrow keys. The ball launches on click, touch, or the space bar. Alternatives considered: gamepad support (deferred — no requirement), key remapping (deferred). Consequences: all input handlers gate on `isAnyScreenActive()` so the paddle does not track movement under a visible overlay. A future accessibility pass will need to add a fully keyboard-driven flow for the overlay buttons (the current bindings rely on click handlers; keyboard activation works because `<button>` elements are used, but tab order has not been verified).

## Cross-cutting candidates for the global wiki

Sonja decides what is promoted. My candidates:

- **Canvas game accessibility pattern.** The constraint that a canvas-rendered game must mirror its key state into an off-screen live region, and offer a keyboard-only navigation path, is a pattern the team is likely to need again the next time a game is in scope. The pattern would belong as a new page under `docs/patterns/`. It is not specific to Breakout.
- **Vite plus TypeScript variant of the static stack.** Poop-Breakout, Status Dashboard, and ICCC all use Vite plus TypeScript for what is otherwise a static front-end. The static stack page (`docs/stacks/static-front-end.md`) already names Vite as the bundler of choice but does not yet record a worked TypeScript variant with `vite.config.ts`, `tsconfig.json`, and a deploy workflow shape. The page would be sharper if it included a "TypeScript variant" subsection. This is a stack-page edit rather than a new pattern.
- **Persistence adapter for browser games.** The async key-value adapter pattern in `src/libs/persistence.ts` (with a `window.persistentStorage` hook) is a clean idiom for any browser application that may later need to swap storage backends. Worth recording in `docs/patterns/` if the team meets a second case; for now it is project-specific.

## Open questions for Tim

The proposed Q-numbers continue the engagement-wide sequence; Sonja will confirm the next free number when she batches questions. I am proposing Q59 as the starting point per the dispatch.

- **Q59. Self-hosted fonts: confirm scope.** Standing standard 2 of decision 006 requires self-hosted fonts. Both `Press Start 2P` and `Nunito` ship under the SIL Open Font Licence and may be redistributed. Sean self-hosts both during the setup build and records the licences in the project wiki. Option A: confirm, self-host both. Option B: change the typography (and accept a visual change). Option C: ask for an exception (not recommended).

- **Q60. Accessibility approach for a canvas-only game.** A canvas-rendered game does not meet WCAG 2.2 at AAA without a parallel non-visual representation. Option A: add an off-screen live region that mirrors score, lives, level, and key events, and a keyboard-only flow for the overlays; record an exception for the canvas content itself ("the visual game is decorative; the live region is the conformant representation"). Option B: defer accessibility work to a later, dedicated phase and record an exception for the whole game today. Option C: rebuild the game with a DOM and ARIA-driven representation. Recommended: option A.

- **Q61. Reduced motion.** The title emoji bounces, the launch hint pulses, the screen shakes on hits and on losing a life. Option A: respect `prefers-reduced-motion: reduce` and disable the bounce, the pulse, and the shake when the user has set it. Option B: leave the animations as they are and record an exception. Recommended: option A.

- **Q62. Continuous rendering on game-over.** The `requestAnimationFrame` loop continues after `GAME_OVER`. Option A: call `stop()` when an overlay is shown and restart the loop on dismissal. Option B: leave it (negligible desktop cost; small mobile cost). Recommended: option A.

- **Q63. Dead enum value.** `GameState.PAUSED` is declared but unused. Option A: remove it. Option B: wire a pause feature in a future increment and keep the value. Recommended: option A.

- **Q64. Seeded random number generator for level generation.** Level shape is deterministic; brick-type fill is not. Option A: leave as-is and revisit only if a level-replay feature requires full reproducibility. Option B: add a seeded random number generator now so every level is byte-for-byte identical across plays. Recommended: option A.

- **Q65. `(game as any).startLoop?.()` cast in `main.ts`.** Two `any` casts reach into a method that is already `public`. Option A: remove the casts (a one-line change). Option B: leave them and accept the smell. Recommended: option A.

- **Q66. Canvas accessibility pattern, global wiki promotion.** Whether the canvas game accessibility pattern is added now to `docs/patterns/` as a global pattern, or kept project-specific until the second canvas game arrives. Recommended: write it now in the project wiki; promote to global when a second case appears.
