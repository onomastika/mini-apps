# Strategic rating audit — iteration 2

Safety-only PR #13 passed all acceptance checks (run 45751250390), merged as 101541f507030841fca8438ba9e3f043f5d9fbc4. Numeric algorithm unchanged. This follow-up changes audit/test infrastructure only.

## Why the original oracle was insufficient
The first audit used a greedy independent continuation policy. A lost card may be replaceable via a new draw, especially for round goal 2008 (cards in hand). In the original forecast this goal uses a capped 0.35-point proxy; that is not full green-board scoring. However, simply increasing its coefficient is not demonstrated to improve decision quality. Goal-aware independent continuation now considers legal placement, egg action and draw on the last personal turn of rounds 3–4, using current public opponent goal metric, actual two-player green scoring, and direct printed points/bonus changes. It remains a heuristic: does not anticipate all activations, later opponent moves or optimal strategies. Same prefix and same policy on both paired branches; optional opponent policy is independently selectable. No claim of optimal play.

Revisited prior failures (16 conditional futures, goal-aware player and opponent):
| Bird | Original greedy loss | Goal-aware loss |
|---|---:|---:|
| Tufted Titmouse | 7 | 2 |
| Blue-Gray Gnatcatcher | 7 | 1.8125 |
| Downy Woodpecker | 5 | 0.3125 |

These are comparisons of alternative policies on the same positions, not evidence of a change to the live rating.

## Numeric candidates rejected
Development comparison 315500–315507 (base), 316500–316507 (Oceania), eight futures: baseline Spearman .252, goal proxy .268, wider beam 18 .326, combined .328; wider beam worsened critical regret (0 to 4.76%) and increased measured maximum latency from 142 to 364 ms in the JS runtime. Further independent seed block 317500–317519 and 318500–318519: baseline Spearman .358; first-card hand-goal adjustment .352; broad goal adjustment .344. No release-worthy improvement. Runtime is not a physical iPhone measurement.

## Policy comparison and uncertainty
Fresh block 324400–324407 base, 325400–325407 Oceania: 64 positions, 117 card-position comparisons, 936 paired rollouts per policy (1,872 total, not independent across policies). Eight conditional futures each; sixteen game-seed clusters. Final analysis retains paired losses and computes gap SE from paired differences. Bootstrap whole game seeds (500 replicates, seed 76493); intervals reflect between-game sampling only, not model bias, uncertainty of optimal play, or full within-position Monte Carlo error.

| Metric | Greedy continuation | Goal-aware continuation |
|---|---:|---:|
| Spearman | .4254 | .3260 |
| 95% interval | [.2833,.5577] | [.1846,.4620] |
| Within-hand Kendall | .2037 | .3367 |
| Clear worst card | 6/9 | 6/8 |
| Mean discard regret | 1.2305 | .6953 |
| Critical regret | 6.25% | 3.125% |
| Critical regret 95% interval | [0,15.15%] | [0,9.09%] |

The same live numeric rating is tested against different reference policies. Lower regret under the goal-aware reference is NOT evidence of an improved rating. Paired bootstrap of blend max(deep,0.6*quick) minus existing deep Spearman: greedy [.0098,.1497], goal-aware [-.0323,.1066]. Neither establishes the requested robust superiority. No numeric candidate accepted.

## Remaining gates
Independent simulation covers 302 mapped printed birds out of 707 catalog birds and restricted base/Oceania two-player rules. Need more independent policy families, richer intervention scenarios, disjoint holdouts, competitive tournament and real device performance. No changes to app layout, saves, or numeric scoring in this PR. Production byte verification of PR #13 is included as a separate CI job; do not claim it passed until observed.
