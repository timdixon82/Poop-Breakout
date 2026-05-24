# Privacy

## Analytics

Poop Breakout uses GoatCounter for page-view analytics. GoatCounter is a privacy-first analytics tool.

Tracker URL: `https://timdixon82.goatcounter.com/count` (the team's shared default account).

What is collected:

- The page path visited (for example `/Poop-Breakout/`).
- The referring page, if any.
- A coarse browser and screen-size profile.
- An approximate country, derived briefly from the visitor's Internet Protocol (IP) address and then discarded. The IP address is not stored.

What is not collected:

- No user content of any kind (no game scores, no share images, no device identifiers).
- No persistent tracking cookie.
- No cross-site identifier.

GoatCounter does not set persistent identifying cookies. No consent banner is required under the United Kingdom General Data Protection Regulation (UK GDPR) for aggregate, anonymised analytics that do not set persistent identifying cookies.

A Data Processing Agreement (DPA) is in place between Tim Dixon and GoatCounter. The agreement is held on the `timdixon82.goatcounter.com` account.

The GoatCounter JavaScript file is self-hosted at `assets/analytics/count.js`, per the team pattern at `docs/patterns/goatcounter-analytics.md` in the global wiki. Self-hosting means no third-party script is loaded from an external origin.

## Game progress

Game progress (current level, score, lives) and the session high score are stored in the browser's `localStorage`. This data is held locally in the player's browser and is never sent to any server. It is not personal data under UK GDPR because it is not associated with an identified or identifiable person in any way the game controls.

The data is cleared when a new game starts or a game ends. The high score key persists indefinitely unless the player clears their browser storage.
