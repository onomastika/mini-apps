# V8 snapshot-first candidate

Preserves V7 internal action engine and localStorage key. Existing pending wizard is archived without reverting any recorded state; resource and ledger confidence invalidated. Direct state edits never charge costs. Personal turn input allows entry into arbitrary round. Preliminary forecast accepts unconfirmed resources and unknown round (12-turn assumption).

## Cycle 2

Added 74 projection-specific rules to the catalog (separate `projected` mode). They execute state transitions rather than guided prompts. Opponent-dependent branches require observed opponent data; random mechanisms use explicit feasible outcomes or expected points; not all models are complete under expansion rules. Added feeder and movement projection to existing sequences. Two focused pure-rule checks passed.

- American Oystercatcher — draftTwo
- Australian Ibis — discardChoice
- Australian Magpie — crossEggCache
- Black Noddy — resetGainCache
- Black-Shouldered Kite — resetRodentEgg
- Blue Duck — resetNoRodent
- Blue-Winged Teal — resetDraw
- Blyth's Hornbill — nestEggTuck
- Boat-Tailed Grackle — pinkCacheFood
- Brown Thrasher — copyTray
- Cactus Wren — matchingNest
- Chinese Copper Pheasant — filledEgg
- Common Crane — discardFood
- Common Myna — copyOpponent
- Common Sandpiper — filteredDraw
- Common Snipe — actionDraw
- Common Tailorbird — contiguousNest
- Common Wood Pigeon — duplicateFeeder
- Dunnock — oppCubes
- Emu — feederHalf
- Eurasian Hoopoe — stealNeighbors
- Eurasian Magpie — oppCubes
- Eurasian Treecreeper — eggFoodCache
- Eurasian Wryneck — compareFood
- European Herring Gull — tuckDiscardDraw
- Grandala — laidThisTurn
- Great Crested Grebe — emptyDraw
- Great Hornbill — sharedForest
- Greater Flamingo — oppCubes
- Greater Racket-Tailed Drongo — copyHand
- Greater Scaup — drawOrTuck
- Greater Spotted Eagle — spanTrayTuck
- Grey Shrikethrush — resetGainCache
- Harlequin Duck — paidTrayTuck
- Hooded Crow — oppCubes
- Hooded Merganser — copy
- House Crow — distributedCache
- Limpkin — discardPrinted
- Little Grebe — filteredDraw
- Marsh Tit — opponentFoodTypes
- Marsh Warbler — copyOpponent
- Northern Pintail — tuckDrawRedraw
- Oriental Bay-Owl — copy
- Oriental Magpie-Robin — eggFoodCache
- Parrot Crossbill — removeFeeder
- Phainopepla — copy
- Prairie Falcon — trayOrFeeder
- Purple Sunbird — resetOne
- Pyrrhuloxia — resetSeedTuck
- Red-Headed Barbet — opponentFoodTypes
- Rose-Ringed Parakeet — copyOpponent
- Rufous-Naped Wren — emptyFoodCache
- Savanna Hawk — resetCacheShared
- Scarlet Ibis — tuckDrawTray
- Southern Lapwing — emptyEggDraw
- Sri Lanka Blue-Magpie — distributedCache
- Stork-Billed Kingfisher — rollRowCache
- Sunbittern — drawPlusTuck
- Superb Lyrebird — copyOpponent
- Surfbird — drawTrade
- Toco Toucan — copy
- Tufted Puffin — outsideRepeated
- Tūī — copyOpponent
- Variable Seedeater — neighborEgg
- Verditer Flycatcher — gainedThisTurn
- Wattled Jacana — tradeTray
- Western House Martin — opponentFoodTypes
- Western Screech-Owl — rollFeederCache
- White-Faced Heron — resetGainCache
- Willow Warbler — oppCubes
- Wilson's Storm Petrel — emptyDraw
- Yellow Warbler — draftTwo
- Yellow-Headed Caracara — pinkResetCache
- Yellowhead — resetRepeated

## Cycle 3

Added 19 further forecast model entries, fixed known-hand tuck activation, extra placement, bonus expectation, copied-power recursion, forecast explanations, direct catalog-to-habitat entry, resource-aware fit. Model entries are not a claim of full rule execution under all expansion contexts.

## Cycle 4

Full printed power text attached by pinned source identity. Snapshot migration, uncertain-input forecast, direct state entry, known-card consumption, observed feeder and conditional opponent model validated. Round double-count implemented for supported bird-count goals. 93 forecast-specific entries separate from the V7 guided count. 11 new focused test groups.

## Cycle 5

Independent competitive fixture with 134 cards selected by printed rule text, shared deck/feeder, hidden hands, green round goals, independent costs/scoring, fixed opponent and randomized starting seat. Smoke test one common seed passed. Full comparison pending parallel CI. Optional board upgrades and unsupported expansion rules excluded.

## Acceptance results

- Candidate application commit: bb4d606e969c21275453bb478849adf0d77ceeb0
- CI: https://github.com/onomastika/mini-apps/actions/runs/45727234654 — all ten benchmark shards, aggregate and browser passed.
- Browser: Chromium, widths 320, 390, 1280; direct placement without payment, arbitrary personal clock, token editing, reload, legacy in-flight migration, no guided action buttons, catalog and forecast.
- Independent 134-card core/Europe fixture: 100 matched seeds per version, 300 two-player games, 7800 advisor decisions. Hidden hands, shared feeder and deck, independent rules, bonus and green goal scoring. Fixed opponent policy; optional board action upgrades are not chosen. No claim of full Wingspan rules or external win rate.
- V6: 72.62 mean, 72.5% win credit; V7: 73.48, 74%; V8: 78.18, 82%. Win credit = win 1, tie after food tiebreak 0.5. See JSON for metrics. Runtime measured on GitHub runners including starter decision time, not physical iPhone.
- Coverage: 495 guided, 25 deterministic, 93 projection-specific models (some conditional or expected-value approximations), 88 manual, 6 no power. The 90% fully faithful modeling target has not been demonstrated. Some retained guided rules lack complete projection; some opponent rules require optional state unavailable in normal snapshot. Special placements, typed cached food, hummingbirds and several expansion effects remain. No inflated claim of 613 fully verified powers.
- Reproduce: node tests/wingspan/strategy-v8.cjs; node tests/wingspan/competitive-v8.cjs SHARD 10 (shards 0–9), or run the referenced acceptance workflow. Browser: playwright-core 1.55.0, CHROME_PATH, local server at 8765; node tests/wingspan/browser-v8.cjs.
