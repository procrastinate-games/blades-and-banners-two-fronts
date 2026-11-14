# ADR 0001: Canvas simulation and original vector art

## Status

Accepted under user's instruction to make implementation choices independently.

## Date

2026-11-14

## Context

The supplied game-template has no game code and requires npm, static dist output, iframe embedding and mobile support. The game needs two simultaneous battlefields and many automatically fighting units.

## Decision

Use JavaScript ES modules, Vite and a browser-native Canvas 2D renderer with a DOM HUD. Keep deterministic combat independent of the renderer. Draw original articulated vector characters and landscapes, synthesize original audio, and publish only through the template's shared GitHub workflow.

## Consequences

### Positive

- Small offline-capable static bundle with no runtime services or artwork licensing dependencies.
- Entire campaign can be simulated and balanced headlessly.

### Negative

- Custom targeting, animation and separation require explicit verification.
- Vector animation has a distinct illustrated style rather than pixel spritesheets.

## Alternatives considered

- Phaser: suitable but unnecessary for this bounded two-field simulation.
- External sprite packs: inconsistent style and unnecessary licensing and network dependencies.

## Related

../gameplan.md; ../tech.md; ../milestones/01-complete-game.md
