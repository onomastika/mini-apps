# V9 candidate — not accepted or released
Baseline main: 1202d2ffe81f092a8a6a12061cacbe9abb69c63d.
- 707 cards; 495 guided, 25 deterministic, 100 projected, 81 manual, 6 none. The guided/deterministic labels do not prove full forecast fidelity. Seven added models are conditional/expected-value models, not claims of exact full rule execution.
- Optimal stopping for 3 draw-and-tuck powers, Philippine Eagle dice probability, two observed-tray conditions, two-player Eurasian Siskin lower-information projection (does not model exchanged food).
- Catalog sort computes fit once per bird per sort. Opening evaluation adds affordable engine and follow-up; forecast memo includes clock/knowledge flags; feeder takes remove only consumed dice; explanation exposes surviving alternative first actions.
- Independent base/Europe fixture: 172 birds (38 new). Existing two-player simulator still excludes optional board upgrades, full expansion mechanics, several bonus powers; some decisions (including which of two drawn cards to tuck) are simplified fixed policies. Pink predator success uses observed tucked change and does not cover all success types. No external win-rate claim.
- In-memory focused checks: four passed. Smoke seed 19370617: V7 89, V8 90, V9 90; all 26 decisions, no fallback. This seed was inspected before full evaluation, so holdout suite has one inspected smoke seed; use a different holdout base for final independent evaluation.
- Browser checks and 200 paired seeds per version configured; no claim of completed CI or improved performance until evidence is recorded.

## Cycle 2 — completed first comparison; V9 candidate rejected as definitive improvement
CI https://github.com/onomastika/mini-apps/actions/runs/45728248073: 22/22 success, 200 paired seeds per version, browser acceptance passed. Development V7 71.40/65%, V8 77.30/76%, V9 78.31/82%. Holdout V7 72.43/63.5%, V8 77.65/80%, V9 76.96/77%. Paired V9 minus V8 development +1.01 (approx 95% CI +0.22 to +1.80), holdout -0.69 (-1.91 to +0.53). No confirmed independent gain.
## Cycle 3 — wider beam candidate
Development-only ten matched seed ablation 20261136–20261145: previous candidate 74.1 / 7 wins; beam width 36 with one score evaluation per expanded state 80.3 / 10 wins; width 28 diverse first-action beam 77.8 / 8 wins. Selected width 36 for new test, not an acceptance claim. Runner runtime is not an iPhone measurement. New holdout base 19591213 was not used in tuning. New 200 paired seeds per version configured.
