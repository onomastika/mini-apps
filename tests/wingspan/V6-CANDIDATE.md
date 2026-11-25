# Wingspan V6 composition candidate

Baseline 209 executable powers, 492 manual, 6 without powers. All 492 joined to pinned source by id/name; 426 normalized templates. Added 49 guided rules by exact match; 443 manual remain. Families: {"hand-convert":4,"egg-target":17,"egg-count":5,"food-convert":7,"observedFeeder":3,"sharedGain":4,"shared":2,"pinkGain":3,"sharedEgg":2,"alternative":2}.

New bonus formulas: 4 static, 14 direct. Added 24 round-goal metrics (conditional ledger where needed); projected egg allocation is heuristic. No hummingbird/duet mechanic added. V5 regression: 14 passing in DOM mock. Browser acceptance and new rule-specific tests required.

- American Flamingo — hand-convert
- Baya Weaver — hand-convert
- Black Swan — egg-target
- Common Goldeneye — egg-count
- Common Iora — egg-target
- Common Swift — food-convert
- Coppersmith Barbet — observedFeeder
- Count Raggi's Bird-of-Paradise — sharedGain
- Crested Pigeon — food-convert
- Dartford Warbler — egg-target
- Desert Finch — egg-count
- Eastern Meadowlark — shared
- Eastern Whipbird — sharedGain
- Eurasian Blackcap — egg-target
- Eurasian Blue Tit — pinkGain
- Eurasian Curlew — egg-count
- European Stonechat — food-convert
- Fire-Fronted Serin — egg-count
- Great Spotted Woodpecker — observedFeeder
- Green Pheasant — sharedEgg
- House Sparrow — food-convert
- Iberian Magpie — egg-target
- King Vulture — egg-target
- Least Seedsnipe — egg-count
- Lewin's Honeyeater — sharedGain
- Long-Wattled Umbrellabird — egg-target
- Maned Duck — hand-convert
- Meadow Pipit — egg-target
- Mistletoebird — alternative
- Monk Parakeet — egg-target
- New Holland Honeyeater — observedFeeder
- Ocellated Turkey — egg-target
- Princess Stephanie's Astrapia — sharedEgg
- Pūkeko — egg-target
- Red-Backed Fairywren — egg-target
- Red-Legged Partridge — egg-target
- Regent Bowerbird — sharedGain
- Rosy Starling — hand-convert
- Scaly-Breasted Munia — alternative
- Song Thrush — pinkGain
- Spangled Drongo — pinkGain
- Splendid Fairywren — egg-target
- Spotless Crake — egg-target
- Spotted Nothura — egg-target
- Squirrel Cuckoo — food-convert
- Stubble Quail — food-convert
- Tomtit — food-convert
- Tree Pipit — shared
- White-Breasted Woodswallow — egg-target

## Second cycle

Added 37 rules: {"deckObserve":7,"resetFeeder":18,"nestBonusChoice":2,"drawSelect":4,"program":4,"drawKeepTuck":1,"bonusChoice":1}. Corrected orthogonal adjacency and die faces; flightless birds handled in wingspan conditions. Observed deck effects use catalog identity instead of free numeric score input. Remaining manual: 406.

- Acadian Flycatcher — deckObserve
- Amazon Kingfisher — resetFeeder
- Blue-Headed Parrot — deckObserve
- Boat-Billed Heron — resetFeeder
- Brazilian Merganser — nestBonusChoice
- Bullfinch — resetFeeder
- Cocoi Heron — resetFeeder
- Common Green Magpie — resetFeeder
- Demoiselle Crane — drawSelect
- European Bee-Eater — resetFeeder
- European Honey Buzzard — resetFeeder
- Great Grey Owl — deckObserve
- Great Tit — resetFeeder
- Greater Rhea — program
- Hawfinch — resetFeeder
- Hooded Siskin — deckObserve
- Jabiru — resetFeeder
- Laughing Kookaburra — resetFeeder
- Little Blue Heron — resetFeeder
- Little Egret — drawSelect
- Little Penguin — deckObserve
- Mandarin Duck — drawKeepTuck
- New Zealand Dabchick — drawSelect
- New Zealand Scaup — deckObserve
- Orinoco Goose — program
- Peruvian Sierra-Finch — program
- Plumbeous Redstart — drawSelect
- Roadside Hawk — resetFeeder
- Ruddy Turnstone — deckObserve
- Rufescent Tiger-Heron — resetFeeder
- Smooth-Billed Ani — program
- Spectacled Owl — resetFeeder
- Tawny Frogmouth — resetFeeder
- Western Capercaillie — bonusChoice
- White-Bellied Sea-Eagle — resetFeeder
- White-Browed Tit-Spinetail — nestBonusChoice
- Willow Tit — resetFeeder

## Third cycle

Ruddy Shelduck added. Corrected recommendation routing for new mechanics, one-click confirmed matching feeder gain, prefilled single-target eggs, finite-population variance for observed deck outcomes. Coverage: 296/707, 405 manual, 6 no power. Seven dedicated V6 tests plus 14 V5 regression checks passed in DOM mock. Baseline replay comparison is model output, not actual win-rate evidence. Browser acceptance pending.
