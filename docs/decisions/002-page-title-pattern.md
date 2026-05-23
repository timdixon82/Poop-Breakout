# Decision 002: Page title and H1 emoji pattern (Q62B)

## Status

Accepted. Decided on 2026-05-23. Implements Tim's answer Q62B: keep the emoji in the game's visible H1 and add a screen-reader-friendly text fallback alongside.

## Context

The original `<title>` element was:

```html
<title>💩 Poop Breakout 🚽</title>
```

Carol's baseline accessibility audit (finding A-02) noted that screen readers such as VoiceOver and JAWS announce emoji by their Unicode description. VoiceOver on macOS would read this as "pile of poo Poop Breakout toilet". This is a usability failure for Tim (who uses VoiceOver) and for any screen reader user. The team's accessibility profile requires screen-reader-friendly output.

Tim answered Q62B: keep the emoji alongside plain text. The question gave three options:

- A. Remove emoji entirely: `<title>Poop Breakout</title>`.
- B. Keep emoji plus descriptive text: `<title>Poop Breakout - the stinkiest breakout game ever</title>`.
- C. Keep emoji in the title. (Selected by Tim.)

Tim selected option B, which Carol's audit had not listed — Tim answered Q62B, which was the question "keep emoji with a screen-reader-friendly text fallback alongside".

## Decision

The implementation is:

1. The HTML `<title>` element is plain text only: `<title>Poop Breakout</title>`. The `<title>` element cannot contain child markup, so there is no clean way to wrap emoji in `aria-hidden` spans. A plain title is the most reliable screen-reader output for the document title announced in the browser tab and in VoiceOver's window navigation.

2. The visible H1 in the start screen contains the emoji as decorative spans with `aria-hidden="true"`:

```html
<h1 class="game-title">
  <span aria-hidden="true">💩</span> POOP BREAKOUT <span aria-hidden="true">💩</span>
</h1>
```

This gives sighted players the full emoji-plus-text heading they expect, while screen readers announce only "POOP BREAKOUT" from the text node in the H1.

## Rationale

The `<title>` cannot use `aria-hidden`. Any emoji in the title text is announced by the screen reader verbatim. Moving the emoji to the H1 with `aria-hidden` spans achieves the same visual result as the original while giving screen reader users a clean, uncluttered announcement for both the page title and the main heading. This is the cleanest single-change implementation that satisfies Q62B without altering the game's visual identity.

## Consequences

- Screen readers announce "Poop Breakout" as the page title and "POOP BREAKOUT" as the H1.
- Sighted users see "POOP BREAKOUT" with poop emoji on either side in the start screen heading.
- The bouncing decorative poop emoji above the H1 is unchanged and also carries `aria-hidden="true"`.
- All other screens (game-over, level-complete, win) use H2 headings with no emoji in the heading text itself; their decorative emoji are already in separate `<div class="title-emoji" aria-hidden="true">` elements.
