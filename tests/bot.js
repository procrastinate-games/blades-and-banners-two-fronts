import { Battle, distance } from "../src/engine.js";
export function playBattle(
  level,
  seed = 17,
  policy = "balanced",
  upgrades = {},
) {
  const b = new Battle(level, upgrades, seed);
  b.deployOpening();
  const dt = 1 / 30;
  let buyAt = 0,
    seq = 0;
  const roster = [2, 1, 0, 3, 1, 4, 0, 1, 2, 5, 3, 1, 4];
  for (let t = 0; t < 300 && !b.over; t += dt) {
    const h = b.hero;
    const enemies = b.enemies
      .filter((e) => e.hp > 0)
      .sort((a, c) => distance(a, h) - distance(c, h));
    let x = 0,
      y = 0;
    const e = enemies[0];
    if (e) {
      const d = distance(h, e);
      if (d > 64) {
        x = (e.x - h.x) / d;
        y = (e.y - h.y) / d;
      } else if (d < 44 || e.wind > 0) {
        x = (h.x - e.x) / (d || 1);
        y = (h.y - e.y) / (d || 1);
      }
      h.face = Math.atan2(e.y - h.y, e.x - h.x);
      if (d < 87) b.attack();
    }
    b.update(dt, { x, y });
    if (t > buyAt) {
      const target = policy === "swords" ? 0 : roster[seq % roster.length];
      if (b.recruit(target)) {
        seq++;
        buyAt = t + 0.4;
      }
    }
  }
  return b;
}
if (process.argv[1]?.endsWith("/bot.js"))
  for (let i = 0; i < 5; i++) {
    const b = playBattle(i);
    console.log(
      JSON.stringify({
        level: i + 1,
        time: Math.round(b.time),
        victory: b.result?.victory,
        hero: Math.round(b.hero.hp),
        bases: b.bases.map(Math.round),
        gold: b.gold,
        units: b.units.length,
        ...b.stats,
      }),
    );
  }
