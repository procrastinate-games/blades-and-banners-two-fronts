# Milestone 01: Complete two-front campaign

## Status

In progress

## Objective

Deliver the user's full playable campaign as one coherent release, as explicitly requested.

## Scope

Hero combat, two simultaneously active fields, economy, six troop classes per side, five campaign battles, upgrades, persistence, illustrated art, audio, menus, desktop/touch controls and static build.

## Out of scope

Backend, monetization, multiplayer. No requested core mechanic deferred.

## Dependencies

ADR 0001; procrastinate-games/game-template publishing contract.

## Acceptance criteria

- [x] Hero moves, attacks directionally, dodges and earns gold — tests/engine.test.js.
- [x] Troop purchase, cooldowns, healing, shielding, ranged, siege and stronghold combat — tests/engine.test.js.
- [x] Both victory and defeat; five winnable levels — tests/engine.test.js and tests/balance.test.js.
- [x] Campaign unlocks, stars, upgrades and robust persistence — tests/engine.test.js.
- [ ] Keyboard/mouse and touch controls; pause and all menus — browser QA.
- [ ] Readable art, responsive combat and audio — browser inspection; subjective feel awaits user playtest.
- [x] npm test, npm run build, publisher validation and cover complete.

## Exit condition

User starts a battle → defeats upper enemies → buys troops → watches real army combat → wins or loses → retries or advances with persisted rewards.

## Test plan

Run npm test and npm run build. Check browser console, state hooks, movement, attack, recruit, pause, result, campaign and settings. Inspect desktop and 360px layouts. Preserve any failed behavior in regression tests before its fix.

## Notes

Source work began before the user identified the template, then the template's platform block and workflow were retained unchanged. No claim of test-first history is made for pre-template source. User requested immediate full implementation, overriding upstream repeated planning confirmations and single-feature session limit.

Automated checks: 24/24 pass. DOM input/menu checks and actual Canvas outputs pass. Real browser layout/audio/feel verification is blocked by managed preview infrastructure; see ../verification.md. Publication is separately blocked by the api.github.com network grant; owner approval to publish has been received.
