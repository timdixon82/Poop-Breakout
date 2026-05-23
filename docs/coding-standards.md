# Coding Standards: Poop Breakout

This page records the project-specific coding standards for Poop Breakout. They extend the global team standard at `docs/coding-standards.md` in the team wiki. The global standard applies in full unless a rule here explicitly overrides it. Read both pages before writing code.

## TypeScript file split

The source is split into five TypeScript files under `src/`, each with a single clear responsibility.

| File | Responsibility |
|---|---|
| `src/definitions.ts` | Game constants and enums (`BrickType`, `GameState`). No runtime behaviour. |
| `src/entities.ts` | TypeScript interfaces for all game objects: `Ball`, `Paddle`, `Brick`, `Particle`, `FlashMessage`, `GameData`. No runtime behaviour. |
| `src/main.ts` | Entry point. Loads persisted state, wires DOM event listeners, and defines the `onGameOver`, `onLevelClear`, and `onWin` callbacks. |
| `src/utils.ts` | Pure utility functions (`clamp`, `lerp`, `randomRange`, and so on) and the score-card rendering and sharing logic. |
| `src/libs/persistence.ts` | Asynchronous wrapper around `localStorage`. Swappable in tests via `(window as any).persistentStorage`. |

Two additional files are present but not listed above because they were generated or adopted as part of the setup: `src/game.ts` (the game loop and render logic) and `src/ui.ts` (overlay screen show and hide helpers). If a new file is added to `src/`, add a row to this table in the same commit.

## Selector ID pattern exemption

The global team coding standard requires kebab-case file names and recommends lowercase identifiers throughout. The ESLint `selector-id-pattern` rule enforces this for element IDs referenced in JavaScript and TypeScript.

This project has an exemption. The existing codebase uses camelCase element IDs throughout: `gameCanvas`, `ui-overlay`, `startBtn`, `restartBtn`, `nextLevelBtn`, `playAgainBtn`, `shareGameOverBtn`, `shareWinBtn`, `savedInfo`, `savedProgress`, `continueBtn`, `newGameBtn`, `finalScore`, `finalLevel`, `finalHigh`, `levelScore`, `nextLevelInfo`, `winScore`, `winHigh`, and `game-announcer`. Renaming them would require coordinated changes across `index.html`, `src/main.ts`, `src/ui.ts`, and `src/game.ts`, which carries a risk of regression. The rule is disabled in `.eslintrc` or the ESLint flat config for this project.

Do not introduce new camelCase IDs. Any new element ID added to this project must use kebab-case.

## Keyframe naming convention

CSS keyframe names use kebab-case: `fade-in`, `bounce`. The original codebase used `fadeIn` (camelCase). The setup build renamed it to `fade-in` to match the convention. All future keyframe names must use kebab-case.

## clip-path over deprecated clip

Use `clip-path: inset(50%)` for visually hidden elements. Do not use the deprecated `clip` property. The `.sr-only` utility class in `src/styles/index.css` was updated in the setup build. Any new visually hidden utility must follow the same pattern.

## No design-system cross-references

Poop Breakout does not use the Tim Dixon Design System. It has its own visual identity. Do not add design-system tokens, imports, or references to this project.

## Linter configuration

Three linters are pinned in `package.json`:

- ESLint with `@typescript-eslint`: TypeScript-aware linting. The `selector-id-pattern` rule is disabled; four pre-existing `no-explicit-any` warnings are acknowledged and do not block the build.
- Stylelint 17.12.0: CSS linting. Version pinned to satisfy the peer dependency of the TypeScript ESLint version in use.
- html-validate: HTML validation including ARIA and heading structure checks.

All three must exit 0 before a pull request can be merged. They run in the `lint-and-build` CI workflow.

## Build tool

The project uses Vite with the `@vitejs/plugin-legacy` plugin for TypeScript compilation and asset bundling. The build output lands in `dist/`. The entry point is `index.html` at the repository root. Do not migrate off Vite; doing so is explicitly out of scope in the brief.

## Commit and branch conventions

Follow the global team standard for commit messages (Conventional Commits) and branch names (type prefix, kebab-case description). The `chore/project-setup` branch is the setup branch. Feature work goes on its own branch. See `docs/release-process.md` for the full branching model.
