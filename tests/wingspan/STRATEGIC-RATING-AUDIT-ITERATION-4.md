# Strategic rating audit — iteration 4

Baseline: 1dfe06a7c3351b7bc60166b2c64946ce16d2ad0d (merged PR #15).
PR #15 passed CI 45761307740 including pinned cache equivalence and browser scroll tests. Production cache revision still requires byte verification.

## Actual-choice intervention audit
New strategic-rating-intervention.cjs replays the identical prefix up to an actual card-selection call (discard or tuck), forces each eligible card in turn, and completes the action and game using the independent simulator. Unlike removal at a generic turn boundary, the discarded card enters the appropriate discard/tuck destination and the associated power proceeds. Cards may be recycled where the simulator allows. The action already in progress is excluded from personal-turn horizon. The current action dice sequence is retained; future deck, bonus deck and dice are seeded identically across compared alternatives. First four multi-card choices per seed are sampled, so these results are conditional on baseline policy reaching such choices and do not represent all possible choices. No optional activation/skip counterfactual, optimal-play oracle, or full official rules coverage is claimed.

Pilot: seeds 354400..354405 (base), 355400..355405 (Oceania), 20 positions, 294 candidate continuation rollouts, six futures per candidate. Holdout: 358400..358413, 359400..359413, 38 positions in 14 game clusters, 7 discards and 31 tucks, 1224 candidate continuation rollouts (12 futures per candidate). Unselected games are not counted as intervention positions.

| Policy | Holdout mean regret | Critical >=5 | Best observed choice |
|---|---:|---:|---:|
| Printed points | 1.5482 | 5.26% | 42.11% |
| Static | .9715 | 2.63% | 47.37% |
| Quick | 1.0724 | 5.26% | 50% |
| Current deep | 1.5461 | 7.89% | 50% |
| Blend | 1.2544 | 5.26% | 50% |
| Legal placement heuristic | .8816 | 2.63% | 50% |

Best observed option is estimated from the same finite futures and is an optimistic noisy reference, not an oracle. The more reliable direct paired policy comparison avoids this selection: legal minus deep +.6645 own points, 95% game-cluster bootstrap interval [-.3104,2.0417], margin +.4890 [-.3092,1.4089]; blend +.2917 own points [-.1820,.9625]; quick +.4737 [-.5813,1.9412]. None proves superiority. Bootstrap 1000 replicates seed 76493, between-game variability only.

Targeted 24-future replay of severe failures: seed 359413, tucking Anna's Hummingbird (deep 6.7) gives 73.125 points vs tucking American Kestrel (7.4) 87.167; 359404, Carolina Chickadee (0) 82.333 vs Eastern Bluebird (0) 91.125; 359412, Eurasian Hoopoe (6) 79.208 vs American Flamingo (9.7) 85.042. Not evidence of optimal play, but reproducible counterexamples under baseline continuation.

## Six-policy full-game discard tournament
Extended existing harness with legal placement policy, correct in-action remaining-turn horizon, optional advisor opponent. Six agents differ only in discard/tuck card selection; the evaluated player still uses independent baseline for all other choices. Advisor opponent is the current app advisor, not independently calibrated strength. All runs completed 26 actions. Fresh seeds:
| Block | Printed | Static | Quick | Deep | Blend | Legal |
|---|---:|---:|---:|---:|---:|---:|
| 362400..362407 base | 69.375 | 68.25 | 68.375 | 69.25 | 67.875 | 65.125 |
| 363400..363407 Oceania | 75.875 | 75.875 | 75.875 | 75.625 | 75.625 | 75.875 |
| 364400 base advisor | 63 | 63 | 63 | 63 | 63 | 63 |
| 359413,359404 Oceania advisor | 88 | 86.5 | 84.5 | 88.5 | 86 | 81 |

19 seeds x six agents = 114 complete games; only 3 advisor-opponent seeds and one of those had no multi-card decision. Legal heuristic fails game-level release gate despite promising local decisions. Neither blend nor legal is released. Existing numeric formula and app files unchanged. This is a focused discard-policy tournament, not the full originally requested broader strategy tournament.

## Release decision
Audit-only changes; preserve runtime, styling, images, saves and scroll. CI verifies actual-choice audit on known nonempty seed and exact production bytes of already merged cache revision. Do not claim success before workflow observation. Remaining gaps: broader rules and expansions, richer continuation policies, optional activation / skip, exact terminal goal scoring under known state, independent holdouts, adequate opponent sample, physical iPhone. No numerical improvement confirmed. Next candidate should account for action-conditioned continuation, including card-driven engine opportunity and competing action choices rather than just legal immediate placement.
