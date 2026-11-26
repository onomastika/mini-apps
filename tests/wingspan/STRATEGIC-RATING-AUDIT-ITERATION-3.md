# Strategic rating audit — iteration 3

Baseline: df60d273ae264c43179d0ac15b77d428fb08e82b (merged #14).
PR #14 CI run 45755421106 succeeded, including byte-for-byte production verification of safety revision #13 at Cloudflare.

## Strategic opportunity models
Reproducible experiment: strategic-rating-opportunity.cjs. All candidate equations are experimental only. Features: placement utility adjusted for preparation, best alternative, egg action opportunity cost, and conditional resource/hand-goal value. Candidate scores evaluated against paired independent futures with baseline and goal-aware continuation. Models reuse existing placement plans; they are not independent oracles.

Development block 330400..330417 base / 331400..331417 Oceania: 144 positions and 2592 paired rollouts per policy. Relative model reduced regret from 1.029 to .710 (greedy) and .835 to .573 (goal-aware); critical regret from 5.17% to 1.72% and 3.45% to 1.72%. These are exploratory findings.

Validation block 334400..334409 / 335400..335409: 80 positions and 1236 paired rollouts per policy. Blend max(deep,.6*quick) achieved regret .396 vs 1.063 and .193 vs .935; critical regret 0 vs 7.14% in both reference policies. Relative/adaptive candidate regret confidence intervals crossed zero. An oversized earlier invocation timed out and was excluded.

Holdout block 338400..338411 / 339400..339411: 96 positions and 2280 paired rollouts per policy. Same positions/seeds reused between reference policies, not independent samples.
| Metric | Deep greedy | Blend greedy | Deep goal-aware | Blend goal-aware |
|---|---:|---:|---:|---:|
| Spearman | .1641 | .2620 | .1571 | .2597 |
| Kendall | .1257 | .1468 | .1327 | .1821 |
| Clear worst card | 8/13 | 8/13 | 9/13 | 10/13 |
| Mean discard regret | .8721 | .7810 | .8372 | .6725 |
| Critical regret | 4.65% | 4.65% | 4.65% | 4.65% |
| Low-score large losses | 0/103 | 0/79 | 1/103 | 0/79 |

Paired 95% game-cluster bootstrap delta in Spearman: [.0198,.1699] greedy, [.0357,.1631] goal-aware. Regret delta intervals [-.5625,.2343] and [-.6282,.1599] cross zero; worst card improvement not established. Adaptive/relative models raised critical regret to 6.98% on this block. No numerical candidate passes release targets.

## Actual game outcomes — isolated discard tournament
strategic-rating-tournament.cjs changes only discard/tuck choice for the evaluated player; setup and all other action choices use independent baseline policy. Five agents: printed, static, quick, existing deep, blend. Not the full six-agent advisor tournament; no oracle agent, no alternative tray acquisition selection, no strong-advisor opponent. A snapshot may be captured during a partial action, with remaining-turn counter still including that action; this is an acknowledged limitation. Scores are independent simulated outcomes, not real games.
36 paired seeds (18 base, 18 Oceania) x five agents = 180 full games.
| Block | Printed | Static | Quick | Deep | Blend |
|---|---:|---:|---:|---:|---:|
| 342400..342405 base | 64.50 | 64.50 | 64.50 | 64.50 | 64.50 |
| 343400..343405 Oceania | 84.33 | 80.50 | 78.83 | 81.83 | 78.67 |
| 346400..346411 base | 63.50 | 63.83 | 63.67 | 63.08 | 63.92 |
| 347400..347411 Oceania | 78.83 | 78.25 | 78.83 | 79.33 | 79.08 |

Blend minus deep paired mean -0.333 points; bootstrap 95% interval [-1.833,.889] (5000 resamples, seed 76493). Nonzero deltas -19,+10,-9,-2,+8; other 31 seed outcomes unchanged. Win rate delta -1/36. No evidence of gameplay improvement. Retain existing numerical formula.

## Accepted candidate: performance only
Memoize stable sorted alternative-hand plans within valueContext; every state-key change still invalidates context. Single-card plan and scoring formulas unchanged. Candidate cache-equivalence test uses pinned baseline, all 707 catalog birds, four rounds, hand sizes 1/5/10, both base and Oceania, repeated cache hits, resource change and hand removal. 8548 initial cold rating results (plus invalidation checks) identical. Deterministic plan-card evaluations 53060 -> 8452 (-84.07%). Representative JS runtime 1217ms -> 451ms, warm 91ms -> 90ms; another run 1243ms -> 479ms. Runtime measures the whole synthetic batch, not real iPhone Safari latency. No UI styling, art, icons, card sizes, scroll, save schema or strategic formula changes.

CI must pass before integration. Full original acceptance requirements remain unmet: robust Spearman >=.85, clear worst >=90%, critical <=2%, statistically confirmed gameplay gain, full expansions and strong opponent/real device acceptance. Next research priority: legal intervention-aware action search and opponent-independent alternative value, with direct tournament as acceptance gate.
