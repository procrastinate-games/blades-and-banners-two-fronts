# Verification — 2026-11-14

## Passed

- Clean `npm ci --offline` in the normal approved environment, matching Node 24 used by the supplied publishing workflow.
- `npm test`: 24 checks, zero failures. Deterministic simulation plus menu/input integration using Happy DOM and the actual native Canvas rendering code.
- `npm run build`: complete static `dist/`, relative URLs, no backend or external runtime assets.
- `npx --yes github:procrastinate-games/game-publisher#v1`: public and built game.json validated for the exact slug.
- Original 960×600 WebP cover generated and visually inspected. All five environment renderings produced; Borderlands and Citadel drawing outputs visually inspected.
- Five combined-arms campaign runs without permanent upgrades won. A representative seeded run cleared battles in approximately 1:36, 1:27, 2:21, 4:02 and 3:55. These are automated competent-play simulations, not human playtest measurements. Other seeds can take longer; battle duration is a target, not a forced timer.
- Swordsmen-only strategy failed to clear the final battle in the test window. Ignoring both fronts produced a real defeat.
- Hero movement, facing, directional hitboxes, dodge invulnerability, cooldowns, knockback, damage numbers, kill rewards, passive income, recruitment cooldown/shortage, army movement/targeting/death, arrows, shield interception, healing, splash/siege, both strongholds and all outcomes covered.
- Campaign unlocks and star improvements, capped upgrade effects, save roundtrip, corrupt JSON recovery and local audio settings covered.
- DOM integration checked title → campaign → battle → recruit → move → pause/resume → results → upgrade → persisted save. Touch joystick, attack and dodge dispatch actual input to simulation.

## Browser QA limitation

The managed `sites-preview` route could not open browser port 4173: relay readiness timed out twice, including after the desktop was initialized. A subsequent official CUA browser opening also failed with “Browser Use could not read requirements.” No alternate preview server or browser installation was used. Full browser layout, actual Web Audio playback, and subjective combat feel remain unverified by a real browser/human playtest. Happy DOM checks are not claimed as real browser QA.

The template's shared CI performs an actual Playwright production smoke test before deployment. Its outcome must be checked after upload; no production URL should be reported as live before the workflow succeeds.

## Publication state

The current request selects procrastinate-games/blades-and-banners-two-fronts and supersedes the personal-account destination recorded in the original archive. Network access to GitHub works. Template creation via GitHub CLI failed with CloneTemplateRepository permission denied; the REST template-generation endpoint returned HTTP 403 requiring organization admin access. The owner subsequently created the public organization repository. Repository metadata and its empty initial state have been verified. Upload attempts via git push and the GitHub Contents API failed with HTTP 403 / "Resource not accessible by integration". The owner subsequently installed ChatGPT Codex Connector for procrastinate-games (installation 181776777). The organization installation is now visible; upload is ready to retry. No source was uploaded before this installation.

## Import verification — 2026-11-14

- Clean npm ci succeeded on Node 24.22.1; all 24 existing tests passed and npm run build succeeded.
- The publishing workflow matches procrastinate-games/game-template main at 7e8f65edaf4e96a46b627dcb1a1718286dce6c97 exactly.
- Inspected the game-publisher CLI and its schema implementation, then validated both manifests using pinned commit cec1c606122705c0618c68bdec98271bc54568af. No deployment side effects occur in that CLI.
- Browser fallback could not open GitHub: "Browser Use could not read requirements." No additional real browser QA was performed.
