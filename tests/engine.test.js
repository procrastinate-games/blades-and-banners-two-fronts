import test from "node:test";
import assert from "node:assert/strict";
import { Battle } from "../src/engine.js";
import {
  UNITS,
  ENEMIES,
  HERO_ENEMIES,
  LEVELS,
  freshSave,
  loadSave,
  recordResult,
} from "../src/data.js";
const step = (b, s, input = { x: 0, y: 0 }) => {
  for (let t = 0; t < s; t += 1 / 60) b.update(1 / 60, input);
};
test("hero movement stays on upper battlefield, dash is faster and invulnerable", () => {
  const b = new Battle(0, {}, 1);
  const x = b.hero.x;
  step(b, 0.2, { x: 1, y: 1 });
  assert.ok(b.hero.x > x);
  assert.ok(b.hero.y <= 269);
  const x2 = b.hero.x;
  assert.ok(b.dash({ x: 1, y: 0 }));
  step(b, 0.1);
  assert.ok(b.hero.x - x2 > 50);
  const hp = b.hero.hp;
  b.hurtHero(20);
  assert.equal(b.hero.hp, hp);
  step(b, 5, { x: 0, y: 1 });
  assert.equal(b.hero.y, 269);
  assert.ok(b.hero.dashCd <= 0);
});
test("directional attack, cooldown, hit reaction, reward and no duplicate gold", () => {
  const b = new Battle(0, {}, 2);
  const e = b.spawnHero(0);
  e.x = b.hero.x + 50;
  e.y = b.hero.y;
  b.hero.face = Math.PI;
  b.attack();
  assert.equal(e.hp, e.maxHp);
  b.hero.attackCd = 0;
  b.hero.face = 0;
  b.attack();
  assert.ok(e.hp < e.maxHp);
  assert.ok(e.hurt > 0);
  assert.equal(b.attack(), false);
  b.hero.attackCd = 0;
  b.attack();
  assert.ok(e.hp <= 0);
  assert.equal(b.gold, 87);
  assert.equal(b.stats.kills, 1);
  b.hurtHeroEnemy(e, 100);
  assert.equal(b.gold, 87);
});
test("recruit spends shared gold, creates correct class, checks cooldown and shortage", () => {
  const b = new Battle(0, {}, 3);
  assert.ok(b.recruit(0));
  assert.equal(b.gold, 50);
  assert.equal(b.units[0].side, 0);
  assert.equal(b.units[0].kind, "sword");
  assert.equal(b.recruit(0), false);
  assert.equal(b.recruit(5), false);
  step(b, 2.1);
  assert.ok(b.recruit(0));
  assert.equal(b.stats.recruited, 2);
});
test("passive income and both enemy directors actually spawn", () => {
  const b = new Battle(0, {}, 3);
  b.hero.x = 40;
  step(b, 15);
  assert.ok(b.gold >= 82);
  assert.ok(b.enemies.some((e) => e.hp > 0));
  assert.ok(b.units.some((u) => u.side === 1));
});
test("melee units target, stop, fight and die", () => {
  const b = new Battle(0, {}, 4);
  b.heroSpawn = 999;
  b.armySpawn = 999;
  const a = b.addUnit(0, 0),
    e = b.addUnit(0, 1);
  a.x = 600;
  e.x = 629;
  a.y = e.y = 440;
  step(b, 12);
  assert.ok(e.hp <= 0 || a.hp <= 0);
  assert.ok(b.stats.armyKills + b.stats.lost >= 1);
});
test("archers launch real projectiles from range and shieldbearers intercept them", () => {
  const b = new Battle(0, {}, 4);
  b.heroSpawn = 999;
  b.armySpawn = 999;
  const archer = b.addUnit(1, 1),
    target = b.addUnit(1, 0),
    shield = b.addUnit(2, 0);
  archer.x = 800;
  target.x = 650;
  shield.x = 700;
  archer.y = target.y = shield.y = 440;
  archer.cd = 0;
  step(b, 0.05);
  assert.ok(b.projectiles.length > 0);
  assert.equal(b.projectiles[0].target.id, shield.id);
  const hp = shield.hp;
  step(b, 0.5);
  assert.ok(shield.hp < hp);
  assert.equal(target.hp, target.maxHp);
});
test("priests prioritize injured allies and restore actual HP", () => {
  const b = new Battle(0, {}, 4);
  b.heroSpawn = 999;
  b.armySpawn = 999;
  const p = b.addUnit(3, 0),
    a = b.addUnit(0, 0);
  p.x = 500;
  a.x = 540;
  p.y = a.y = 440;
  a.hp = 12;
  p.cd = 0;
  step(b, 0.1);
  assert.equal(a.hp, 28);
  assert.ok(p.healAnim > 0);
});
test("golem splash hurts several targets and stronghold attacks use actual HP", () => {
  const b = new Battle(0, {}, 4);
  b.heroSpawn = 999;
  b.armySpawn = 999;
  const g = b.addUnit(5, 0),
    a = b.addUnit(0, 1),
    e = b.addUnit(0, 1);
  g.x = 600;
  a.x = 645;
  e.x = 655;
  g.y = a.y = e.y = 440;
  g.cd = 0;
  step(b, 0.05);
  assert.ok(a.hp < a.maxHp);
  assert.ok(e.hp < e.maxHp);
  b.units = b.units.filter((u) => u.side === 0);
  g.x = 1160;
  g.cd = 0;
  step(b, 0.05);
  assert.ok(b.bases[1] < 100);
});
test("both strongholds take damage; victory and both defeat conditions", () => {
  const b = new Battle(0, {}, 4);
  b.hurtBase(0, 10);
  assert.equal(b.bases[0], 90);
  b.hurtBase(1, 100);
  step(b, 0.02);
  assert.ok(b.over);
  assert.ok(b.result.victory);
  assert.ok(b.result.stars >= 1);
  const c = new Battle(0, {}, 4);
  c.hurtBase(0, 100);
  step(c, 0.02);
  assert.equal(c.result.victory, false);
  const d = new Battle(0, {}, 4);
  d.hurtHero(1000);
  step(d, 1);
  assert.equal(d.result.victory, false);
});
test("upgrades apply to hero, army, starting gold and cooldown", () => {
  const b = new Battle(
    0,
    { attack: 2, health: 2, armor: 2, training: 2, rally: 2, gold: 2 },
    4,
  );
  assert.equal(b.gold, 105);
  assert.equal(b.hero.hp, 144);
  b.recruit(0);
  assert.equal(b.units[0].hp, UNITS[0].hp * 1.2);
  assert.equal(b.units[0].damage, UNITS[0].damage * 1.2);
  assert.ok(b.cooldowns[0] < UNITS[0].cooldown);
});
test("five complete levels, all classes and final commander are configured", () => {
  assert.equal(LEVELS.length, 5);
  assert.equal(UNITS.length, 6);
  assert.equal(ENEMIES.length, 6);
  assert.equal(HERO_ENEMIES.length, 4);
  const b = new Battle(4, {}, 4);
  b.heroSpawn = 999;
  b.armySpawn = 999;
  step(b, 71);
  assert.ok(b.commander);
  assert.ok(b.units.some((u) => u.commander));
});
test("progression rewards first win and improvements, saves roundtrip and corrupt saves recover", () => {
  const s = freshSave(),
    r = { victory: true, level: 0, stars: 2, time: 140 };
  assert.equal(recordResult(s, r), 160);
  assert.equal(s.unlocked, 2);
  assert.equal(recordResult(s, r), 0);
  assert.equal(recordResult(s, { ...r, stars: 3 }), 30);
  assert.equal(s.marks, 190);
  let stored = "";
  const storage = { getItem: () => stored };
  stored = JSON.stringify(s);
  assert.deepEqual(loadSave(storage), s);
  stored = "bad json";
  assert.deepEqual(loadSave(storage), freshSave());
});
test("effects, dead entities and projectiles are cleaned up", () => {
  const b = new Battle(0, {}, 4);
  b.heroSpawn = 999;
  b.armySpawn = 999;
  const e = b.spawnHero(0);
  b.hurtHeroEnemy(e, 1000);
  step(b, 3);
  assert.equal(b.enemies.length, 0);
  assert.equal(b.effects.length, 0);
  assert.equal(b.projectiles.length, 0);
});
