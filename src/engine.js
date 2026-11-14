import { UNITS, ENEMIES, HERO_ENEMIES, LEVELS } from "./data.js";
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export class Battle {
  constructor(level, upgrades = {}, seed = Date.now()) {
    this.level = level;
    this.config = LEVELS[level];
    this.upgrades = { ...upgrades };
    this.random = rng(seed);
    this.time = 0;
    this.gold = 75 + 15 * (upgrades.gold || 0);
    this.bases = [100, 100];
    this.hero = {
      id: 0,
      x: 270,
      y: 204,
      hp: 120 * (1 + 0.1 * (upgrades.health || 0)),
      maxHp: 120 * (1 + 0.1 * (upgrades.health || 0)),
      face: 0,
      attack: 0,
      attackCd: 0,
      dash: 0,
      dashCd: 0,
      invulnerable: 0,
      hurt: 0,
      walk: 0,
      dead: 0,
      dx: 1,
      dy: 0,
    };
    this.units = [];
    this.enemies = [];
    this.effects = [];
    this.projectiles = [];
    this.events = [];
    this.cooldowns = Array(6).fill(0);
    this.heroSpawn = 1;
    this.armySpawn = 13;
    this.passive = 0;
    this.id = 1;
    this.wave = 0;
    this.waveBudget = [18, 20, 22, 24, 24][level];
    this.commander = false;
    this.over = false;
    this.result = null;
    this.stats = {
      kills: 0,
      armyKills: 0,
      recruited: 0,
      lost: 0,
      goldEarned: 0,
    };
    this.shake = 0;
  }
  deployOpening() {
    const scout = this.spawnHero(0);
    scout.x = 760;
    scout.y = 215;
    const pools = [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
      [2, 1],
    ];
    pools[this.level].forEach((kind, i) => {
      const u = this.addUnit(kind, 1);
      u.x = 1060 + i * 75;
      u.y = 425 + i * 39;
    });
  }
  emit(type, data = {}) {
    this.events.push({ type, ...data });
  }
  effect(x, y, text, color = "#f4d885", kind = "text") {
    this.effects.push({
      x,
      y,
      text,
      color,
      kind,
      life: kind === "text" ? 1.1 : 0.4,
      maxLife: kind === "text" ? 1.1 : 0.4,
    });
  }
  recruit(index) {
    const d = UNITS[index];
    if (this.over || !d || this.cooldowns[index] > 0) return false;
    if (this.gold < d.cost) {
      this.emit("shortage", { index });
      return false;
    }
    this.gold -= d.cost;
    this.cooldowns[index] =
      d.cooldown * Math.pow(0.92, this.upgrades.rally || 0);
    this.addUnit(index, 0);
    this.stats.recruited++;
    this.emit("recruit", { index });
    return true;
  }
  addUnit(index, side, commander = false) {
    const d = (side ? ENEMIES : UNITS)[index];
    const strength = side ? this.config.strength : 1;
    const hp =
      d.hp *
      strength *
      (side ? 1 : 1 + 0.1 * (this.upgrades.armor || 0)) *
      (commander ? 3 : 1);
    const u = {
      ...d,
      id: this.id++,
      index,
      side,
      x: side ? 1170 : 110,
      y: 409 + Math.floor(this.random() * 3) * 39,
      hp,
      maxHp: hp,
      damage:
        d.damage *
        strength *
        (side ? 1 : 1 + 0.1 * (this.upgrades.training || 0)) *
        (commander ? 1.6 : 1),
      cd: 0.3 + this.random() * 0.4,
      anim: 0,
      hurt: 0,
      walk: 0,
      dead: 0,
      charge: 0,
      commander,
      healAnim: 0,
    };
    this.units.push(u);
    this.effect(u.x, u.y - 20, "", side ? "#e38c70" : "#89c9d2", "spawn");
    return u;
  }
  spawnHero(index) {
    const d = HERO_ENEMIES[index];
    const hp = d.hp * (1 + this.level * 0.06);
    const e = {
      ...d,
      id: this.id++,
      x: 1220,
      y: 140 + this.random() * 119,
      hp,
      maxHp: hp,
      cd: 1,
      wind: 0,
      anim: 0,
      hurt: 0,
      dead: 0,
      walk: 0,
      face: Math.PI,
      dash: 0,
      dashCd: 3,
      lockedX: 0,
      lockedY: 0,
    };
    this.enemies.push(e);
    return e;
  }
  attack() {
    const h = this.hero;
    if (this.over || h.attackCd > 0 || h.dash > 0 || h.hp <= 0) return false;
    h.attack = 0.24;
    h.attackCd = 0.34;
    this.emit("slash");
    let hits = 0;
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      const dist = distance(h, e);
      const angle = Math.atan2(e.y - h.y, e.x - h.x);
      let delta = Math.atan2(
        Math.sin(angle - h.face),
        Math.cos(angle - h.face),
      );
      if (dist < 90 && Math.abs(delta) < 1.3) {
        this.hurtHeroEnemy(e, 26 * (1 + 0.1 * (this.upgrades.attack || 0)));
        const dx = (e.x - h.x) / (dist || 1),
          dy = (e.y - h.y) / (dist || 1);
        e.x = clamp(e.x + dx * 23, 30, 1240);
        e.y = clamp(e.y + dy * 14, 130, 269);
        hits++;
      }
    }
    if (hits) this.shake = 3;
    return true;
  }
  dash(input = {}) {
    const h = this.hero;
    if (this.over || h.dashCd > 0 || h.hp <= 0) return false;
    const len = Math.hypot(input.x || 0, input.y || 0);
    h.dx = len ? input.x / len : Math.cos(h.face);
    h.dy = len ? input.y / len : Math.sin(h.face);
    h.dash = 0.18;
    h.dashCd = 1.65;
    h.invulnerable = 0.3;
    this.emit("dash");
    return true;
  }
  hurtHeroEnemy(e, amount) {
    if (e.hp <= 0) return;
    e.hp -= amount;
    e.hurt = 0.15;
    this.effect(e.x, e.y - 58, Math.round(amount), "#fff2cb");
    this.effect(e.x, e.y - 28, "", "#f4ce7a", "spark");
    this.emit("impact");
    if (e.hp <= 0) {
      e.dead = 0.55;
      this.gold += e.reward;
      this.stats.goldEarned += e.reward;
      this.stats.kills++;
      this.effect(e.x, e.y - 78, "+" + e.reward + " gold", "#f2cd72");
      this.effect(e.x, e.y - 20, "", "#e8bd54", "coin");
      this.emit("coin");
      this.emit("enemyDeath");
    }
  }
  hurtHero(amount) {
    const h = this.hero;
    if (h.invulnerable > 0 || h.hp <= 0) return;
    h.hp = Math.max(0, h.hp - amount);
    h.hurt = 0.2;
    h.invulnerable = 0.65;
    this.shake = 6;
    this.effect(h.x, h.y - 62, "−" + Math.round(amount), "#ef947f");
    this.emit("hurt");
    if (h.hp <= 0) {
      h.dead = 0.8;
      this.emit("death");
    }
  }
  damageUnit(u, amount) {
    if (u.hp <= 0) return;
    if (u.kind === "shield") amount *= 0.75;
    u.hp -= amount;
    u.hurt = 0.16;
    this.effect(
      u.x,
      u.y - 55,
      Math.round(amount),
      u.side ? "#f5cf9b" : "#f6a18d",
    );
    if (u.hp <= 0) {
      u.dead = 0.65;
      if (u.side) this.stats.armyKills++;
      else this.stats.lost++;
      this.emit("unitDeath");
    }
  }
  hurtBase(side, amount) {
    if (this.bases[side] <= 0) return;
    this.bases[side] = Math.max(0, this.bases[side] - amount);
    this.effect(side ? 1178 : 98, 352, "−" + amount.toFixed(0), "#ffc092");
    this.shake = 4;
    this.emit("baseHit");
  }
  update(dt, input = { x: 0, y: 0, attack: false, dash: false }) {
    if (this.over) return;
    dt = Math.min(dt, 0.05);
    this.time += dt;
    this.shake = Math.max(0, this.shake - dt * 25);
    const h = this.hero;
    for (const key of ["attack", "attackCd", "dashCd", "invulnerable", "hurt"])
      h[key] = Math.max(0, h[key] - dt);
    this.cooldowns = this.cooldowns.map((v) => Math.max(0, v - dt));
    if (h.hp > 0) {
      if (input.attack) this.attack();
      if (input.dash) this.dash(input);
      if (h.dash > 0) {
        h.dash -= dt;
        h.x += h.dx * 680 * dt;
        h.y += h.dy * 680 * dt;
        this.effect(h.x, h.y - 24, "", "#b6dddc", "trail");
      } else {
        const l = Math.hypot(input.x, input.y);
        if (l) {
          const x = input.x / l,
            y = input.y / l;
          h.x += x * 245 * dt;
          h.y += y * 245 * dt;
          h.face = Math.atan2(y, x);
          h.walk += dt * 12;
        } else h.walk = 0;
      }
      h.x = clamp(h.x, 43, 1237);
      h.y = clamp(h.y, 137, 269);
    } else {
      h.dead -= dt;
      if (h.dead <= 0) this.finish(false);
    }
    this.heroSpawn -= dt;
    if (
      this.heroSpawn <= 0 &&
      this.enemies.filter((e) => e.hp > 0).length < 13
    ) {
      let pool = this.config.hero;
      if (this.level === 0 && this.time < 22) pool = [0];
      else if (this.level === 0 && this.time > 75) pool = [0, 1, 1, 2, 3];
      const type = pool[Math.floor(this.random() * pool.length)];
      this.spawnHero(type);
      this.heroSpawn =
        Math.max(1.25, 2.6 - this.level * 0.17 - this.time * 0.003) +
        this.random() * 0.6;
    }
    for (const e of this.enemies) {
      e.hurt = Math.max(0, e.hurt - dt);
      e.anim = Math.max(0, e.anim - dt);
      if (e.hp <= 0) {
        e.dead -= dt;
        continue;
      }
      e.cd = Math.max(0, e.cd - dt);
      e.dashCd -= dt;
      const d = distance(h, e);
      e.face = Math.atan2(h.y - e.y, h.x - e.x);
      if (e.wind > 0) {
        e.wind -= dt;
        if (e.wind <= 0) {
          e.anim = 0.25;
          if (
            distance(h, { x: e.lockedX, y: e.lockedY }) < 43 &&
            distance(h, e) < 80
          )
            this.hurtHero(e.damage);
          e.cd = e.interval;
        }
      } else if (e.dash > 0) {
        e.dash -= dt;
        e.x += Math.cos(e.dashAngle) * 300 * dt;
        e.y = clamp(e.y + Math.sin(e.dashAngle) * 300 * dt, 137, 269);
      } else if (e.kind === "assassin" && d > 95 && d < 230 && e.dashCd <= 0) {
        e.dash = 0.32;
        e.dashAngle = e.face;
        e.dashCd = 4.5;
        this.effect(e.x, e.y - 30, "", "#9578b0", "spawn");
      } else if (d > 36) {
        e.x += Math.cos(e.face) * e.speed * dt;
        e.y += Math.sin(e.face) * e.speed * 0.75 * dt;
        e.walk += dt * 10;
      } else if (e.cd <= 0 && h.hp > 0) {
        e.wind = e.windup;
        e.lockedX = h.x;
        e.lockedY = h.y;
        e.walk = 0;
      }
      e.x = clamp(e.x, 23, 1240);
      e.y = clamp(e.y, 137, 269);
    }
    // Keep individual enemy silhouettes readable without trapping the hero.
    for (let i = 0; i < this.enemies.length; i++)
      for (let j = i + 1; j < this.enemies.length; j++) {
        const a = this.enemies[i],
          b = this.enemies[j];
        if (a.hp <= 0 || b.hp <= 0) continue;
        let dx = a.x - b.x,
          dy = a.y - b.y,
          d = Math.hypot(dx, dy);
        if (d < 27) {
          if (d < 0.01) {
            dx = 1;
            d = 1;
          }
          const push = (27 - d) * dt * 2;
          a.x += (dx / d) * push;
          b.x -= (dx / d) * push;
          a.y = clamp(a.y + (dy / d) * push, 137, 269);
          b.y = clamp(b.y - (dy / d) * push, 137, 269);
        }
      }
    this.enemies = this.enemies.filter((e) => e.hp > 0 || e.dead > 0);
    this.passive += dt;
    if (this.passive >= 2) {
      this.passive -= 2;
      this.gold++;
      this.stats.goldEarned++;
    }
    this.armySpawn -= dt;
    if (
      this.armySpawn <= 0 &&
      this.wave < this.waveBudget &&
      this.units.filter((u) => u.side && u.hp > 0).length < 42
    ) {
      const pool = this.config.army;
      const n = this.time < 25 ? Math.min(2, pool.length) : pool.length;
      this.addUnit(pool[Math.floor(this.random() * n)], 1);
      this.wave++;
      if (this.time > 65 && this.level > 1 && this.wave % 3 === 0)
        this.addUnit(pool[Math.floor(this.random() * pool.length)], 1);
      this.armySpawn =
        Math.max(4.2, this.config.spawn - this.time * 0.012) +
        this.random() * 1.2;
    }
    if (this.level === 4 && !this.commander && this.time > 70) {
      this.commander = true;
      this.addUnit(4, 1, true);
      this.emit("commander");
    }
    const live = this.units.filter((u) => u.hp > 0);
    for (const u of this.units) {
      u.anim = Math.max(0, u.anim - dt);
      u.healAnim = Math.max(0, u.healAnim - dt);
      u.hurt = Math.max(0, u.hurt - dt);
      if (u.hp <= 0) {
        u.dead -= dt;
        continue;
      }
      u.cd = Math.max(0, u.cd - dt);
      const dir = u.side ? -1 : 1;
      const opponents = live.filter((v) => v.side !== u.side && v.hp > 0);
      let target = null,
        near = Infinity;
      for (const v of opponents) {
        const d = distance(u, v);
        if (d < near) {
          near = d;
          target = v;
        }
      }
      let healed = false;
      if (u.kind === "priest" && u.cd <= 0) {
        let ally = null,
          ratio = 1;
        for (const v of live) {
          if (
            v.side === u.side &&
            v.hp > 0 &&
            distance(u, v) < 170 &&
            v.hp / v.maxHp < ratio - 0.01
          ) {
            ally = v;
            ratio = v.hp / v.maxHp;
          }
        }
        if (ally) {
          ally.hp = Math.min(ally.maxHp, ally.hp + 16);
          u.cd = u.interval;
          u.healAnim = 0.5;
          this.effect(ally.x, ally.y - 60, "+16", "#aee1b4");
          this.projectiles.push({
            x: u.x,
            y: u.y - 32,
            target: ally,
            speed: 280,
            heal: true,
            color: "#a7dbc2",
            life: 1,
          });
          this.emit("heal");
          healed = true;
        }
      }
      const baseX = u.side ? 83 : 1197;
      const baseDist = Math.abs(u.x - baseX);
      const priestRange = u.kind === "priest" ? 32 : u.range;
      if (target && near < priestRange + 12) {
        if (u.cd <= 0 && !healed) {
          u.anim = 0.3;
          u.cd = u.interval;
          let damage = u.damage;
          if (u.kind === "knight" && u.charge > 1.2) {
            damage *= 1.5;
            this.effect(u.x, u.y - 65, "CHARGE", "#cbdce4");
          }
          u.charge = 0;
          if (u.kind === "bow") {
            let intercepted = target;
            const shield = opponents.find(
              (v) =>
                v.kind === "shield" &&
                Math.abs(v.x - target.x) < 85 &&
                Math.abs(v.y - target.y) < 50 &&
                (v.x - u.x) * dir < (target.x - u.x) * dir,
            );
            if (shield) intercepted = shield;
            this.projectiles.push({
              x: u.x + dir * 18,
              y: u.y - 33,
              target: intercepted,
              speed: 420,
              damage,
              color: u.side ? "#ecb09c" : "#efdbac",
              life: 2,
            });
            this.emit("arrow");
          } else if (u.kind === "golem") {
            for (const v of opponents)
              if (distance(v, target) < 77) this.damageUnit(v, damage);
            this.effect(target.x, target.y - 15, "", "#ddbb7d", "smash");
            this.emit("impact");
          } else {
            this.damageUnit(target, damage);
            this.emit("impact");
          }
        }
      } else if (baseDist < 59 && (!target || near > 100)) {
        if (u.cd <= 0) {
          u.anim = 0.3;
          u.cd = u.interval;
          const damage =
            Math.max(
              1,
              u.damage * [0.026, 0.035, 0.055, 0.055, 0.075][this.level],
            ) * (u.kind === "golem" ? 3 : 1);
          this.hurtBase(1 - u.side, damage);
        }
      } else {
        let speed = u.speed;
        const ahead = live.find(
          (v) =>
            v.id !== u.id &&
            v.side === u.side &&
            Math.abs(v.y - u.y) < 23 &&
            (v.x - u.x) * dir > 0 &&
            (v.x - u.x) * dir < 31 + (u.kind === "golem" ? 12 : 0),
        );
        if (ahead)
          speed = Math.min(
            speed,
            Math.max(0, ((ahead.x - u.x) * dir - 29) * 3),
          );
        if (target && near < 230 && Math.abs(target.y - u.y) > 10)
          u.y +=
            Math.sign(target.y - u.y) *
            Math.min(20 * dt, Math.abs(target.y - u.y));
        u.x += dir * speed * dt;
        u.walk += dt * speed * 0.18;
        u.charge += dt;
      }
      u.y = clamp(u.y, 399, 499);
      u.x = clamp(u.x, 90, 1190);
    }
    // Three ranks spread congestion; opposing units cannot walk through each other.
    for (let i = 0; i < live.length; i++)
      for (let j = i + 1; j < live.length; j++) {
        const a = live[i],
          b = live[j];
        if (a.hp <= 0 || b.hp <= 0) continue;
        const dx = b.x - a.x,
          dy = b.y - a.y;
        if (Math.abs(dx) < 25 && Math.abs(dy) < 25) {
          if (a.side === b.side) {
            const sign = dy === 0 ? (a.id > b.id ? 1 : -1) : Math.sign(dy);
            a.y = clamp(a.y - sign * dt * 17, 399, 499);
            b.y = clamp(b.y + sign * dt * 17, 399, 499);
          } else {
            const p = (25 - Math.abs(dx)) * 0.5;
            const sign = Math.sign(dx) || 1;
            a.x -= sign * p;
            b.x += sign * p;
          }
        }
      }
    for (const p of this.projectiles) {
      p.life -= dt;
      if (p.target.hp <= 0) {
        p.life = 0;
        continue;
      }
      const tx = p.target.x,
        ty = p.target.y - 30,
        dx = tx - p.x,
        dy = ty - p.y,
        d = Math.hypot(dx, dy);
      if (d < p.speed * dt + 4) {
        if (!p.heal) this.damageUnit(p.target, p.damage);
        else this.effect(tx, ty, "", "#b8e3b5", "heal");
        p.life = 0;
      } else {
        p.x += (dx / d) * p.speed * dt;
        p.y += (dy / d) * p.speed * dt;
        p.angle = Math.atan2(dy, dx);
      }
    }
    this.projectiles = this.projectiles.filter((p) => p.life > 0);
    this.units = this.units.filter((u) => u.hp > 0 || u.dead > 0);
    for (const e of this.effects) {
      e.life -= dt;
      if (e.kind === "text") e.y -= dt * 31;
    }
    this.effects = this.effects.filter((e) => e.life > 0);
    if (this.bases[0] <= 0) this.finish(false);
    else if (this.bases[1] <= 0 && h.hp > 0) this.finish(true);
  }
  finish(victory) {
    if (this.over) return;
    this.over = true;
    const stars = victory
      ? 1 +
        (this.bases[0] >= 60 ? 1 : 0) +
        (this.hero.hp / this.hero.maxHp >= 0.45 && this.time < 240 ? 1 : 0)
      : 0;
    this.result = {
      victory,
      level: this.level,
      time: this.time,
      stars,
      ...this.stats,
      heroHp: this.hero.hp,
      baseHp: this.bases[0],
    };
    this.emit(victory ? "victory" : "defeat");
  }
}
