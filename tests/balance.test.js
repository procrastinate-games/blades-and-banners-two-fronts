import test from "node:test";
import assert from "node:assert/strict";
import { playBattle } from "./bot.js";
import { Battle } from "../src/engine.js";
for (let level = 0; level < 5; level++)
  test(`campaign battle ${level + 1} is winnable with combined arms and no upgrades`, () => {
    const b = playBattle(level, 55);
    assert.ok(
      b.result?.victory,
      `Battle ${level + 1} did not finish: ${JSON.stringify(b.bases)}`,
    );
    assert.ok(b.time < 280);
    assert.ok(b.stats.kills > 15);
    assert.ok(b.stats.recruited > 5);
  });
test("swordsmen alone do not reliably clear the later campaign", () => {
  const b = playBattle(4, 55, "swords");
  assert.ok(!b.result?.victory);
});
test("ignoring both fronts loses naturally", () => {
  const b = new Battle(0, {}, 15);
  b.deployOpening();
  for (let t = 0; t < 300 && !b.over; t += 1 / 30) b.update(1 / 30);
  assert.ok(b.over);
  assert.equal(b.result.victory, false);
});
