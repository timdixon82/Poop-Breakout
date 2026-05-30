# Project Wiki Index: Poop Breakout

This page catalogues every wiki page in the Poop Breakout project wiki. It is organised by category. If you add a page to the wiki, add it here at the same time.

## Core

| Page | Purpose |
|---|---|
| [Project log](log.md) | Chronological, append-only record of every significant operation. |
| [Glossary](glossary.md) | Project-specific terms defined as the team first used them. |
| [Accessibility](accessibility.md) | The project's WCAG 2.2 AAA interpretation and what is and is not in scope. |
| [Coding standards](coding-standards.md) | Project-specific coding standards. Builds on the global team standard. |
| [Release process](release-process.md) | Branching, pull request lifecycle, merge gate, and deployment. |
| [Privacy](privacy.md) | Analytics and data retention policy. |
| [Requirements](requirements.md) | Functional and non-functional requirements for this project. |
| [Security review](security-review.md) | OWASP Top 10 assessment, findings, and release condition. |
| [Code review](code-review.md) | Jed's penetration test and code review record. |

## Decisions

| File | Subject | Date |
|---|---|---|
| [001-self-hosted-fonts.md](decisions/001-self-hosted-fonts.md) | Self-host Press Start 2P and Nunito instead of loading from Google Fonts CDN. | 2026-05-23 |
| [002-page-title-pattern.md](decisions/002-page-title-pattern.md) | Plain page title; emoji confined to aria-hidden spans in the H1 (Q62B). | 2026-05-23 |

## Exceptions

| File | Subject | Status |
|---|---|---|
| [ACC-001-canvas-game-accessibility.md](exceptions/ACC-001-canvas-game-accessibility.md) | Canvas game area cannot meet keyboard or screen-reader WCAG criteria. Accepted with roadmap. | Accepted |
| [SEC-001-missing-response-headers.md](exceptions/SEC-001-missing-response-headers.md) | GitHub Pages cannot deliver custom HTTP response headers. Compensating controls applied. | Accepted |

## Visual identity

Poop Breakout does not follow the Tim Dixon Design System. It keeps its own visual identity: a deep purple and black colour scheme, the Press Start 2P retro pixel font for headings and HUD text, Nunito for body copy, and chemical-style emoji branding throughout. No design-system cross-references apply to this project.
