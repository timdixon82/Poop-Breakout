# Questions: 013-poop-breakout-setup

Questions migrated from outputs/questions.md. Format mirrors the per-folder questions.md contract from tad-requirements.md (work folder 020).

For the global question format rules, see docs/decisions/005-question-format.md.

### Q61: Poop-Breakout accessible-alternative posture for the canvas game

- Status: open.
- Asked: 2026-05-23, by Carol and Jacob in the Poop-Breakout backfill (work folder 013).

The entire game runs on a single canvas with no accessible name, role, or live region. The game is currently unplayable for a screen-reader user.

A. Hidden `aria-live` mirror only (announce score, lives, level, ball launch, game over).
B. A and audio cues (event-driven sound effects).
C. A, B, and a keyboard-only mode (game playable from the keyboard; ball auto-targets the paddle).
D. Document the gap as an accessibility exception and ship as-is.

Recommended option: A, with B and C as named future milestones.

### Q62: Poop-Breakout page title, emoji handling

- Status: open.
- Asked: 2026-05-23, by Carol in the Poop-Breakout backfill (work folder 013).

The HTML `<title>` is "💩 Poop Breakout 💩". The emoji is announced inconsistently by VoiceOver and JAWS.

A. Replace with "Poop Breakout" (plain).
B. Keep the emoji but add an `<abbr>` or visually hidden text fallback.

Recommended option: A.

