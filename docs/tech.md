# Tech stack

## Engine / runtime

- Engine: custom lightweight Canvas 2D simulation and renderer, browser-native APIs.
- Languages: JavaScript ES modules, HTML, CSS.
- Targets: modern desktop keyboard/mouse and mobile touch; iframe-safe static site.

## Libraries / frameworks

| Library | Version | Purpose                                               |
| ------- | ------- | ----------------------------------------------------- |
| Vite    | 6.4.x   | Development and relative-URL static production bundle |

## Tooling

- Package manager: npm, lockfile committed, npm ci supported.
- Build: npm run build → dist including game.json and cover.webp.
- Testing: Node built-in test runner for headless deterministic simulation; browser QA through cloud desktop.
- Lint: not required. No LFS. Assets stored as regular files under 25 MiB.

## Project layout

src/data.js: stat tables, campaign and persistence. src/engine.js: deterministic simulation without DOM. src/render.js: original Canvas art and animations. src/audio.js: synthesized audio. src/main.js: menus, input, persistence and HUD. src/style.css: responsive layout. tests/: simulation regression checks. public/: game catalog, cover and icon.

## Conventions

Simulation state is isolated from rendering and updates with capped delta steps. Entity IDs, filtered death lifetimes and bounded particle/projectile lifetimes prevent stale entities. Modes: home, campaign, battle, pause, results, codex, settings, upgrades. DOM is the accessible interaction layer. Save namespace: pg:blades-and-banners-two-fronts:save:v1. Mandatory inspect hooks: render_game_to_text() and advanceTime(ms), plus dev-only QA hooks.

## Out-of-scope dependencies

No game backend, telemetry, third-party runtime asset URLs or monetization SDK. The template's shared publisher is the only deployment workflow. No Sites identity is registered because template hosting overrides the default Sites deployment path.
