import "./style.css";
import { Battle, clamp } from "./engine.js";
import {
  UNITS,
  ENEMIES,
  HERO_ENEMIES,
  LEVELS,
  UPGRADES,
  loadSave,
  recordResult,
} from "./data.js";
import { Renderer, portrait, character, makeBackground } from "./render.js";
import { Audio } from "./audio.js";
const $ = (s) => document.querySelector(s);
let storage;
try {
  storage = window.localStorage;
} catch {
  storage = {
    getItem: () => null,
    setItem: () => {
      throw new Error("Storage unavailable");
    },
  };
}
const save = loadSave(storage),
  audio = new Audio(save);
let mode = "home",
  returnMode = "home",
  selected = Math.min(save.unlocked - 1, 4),
  battle = null,
  paused = false,
  last = 0,
  uiClock = 0,
  resultRecorded = false,
  saveWarning = false;
const keys = new Set(),
  touch = { x: 0, y: 0, attack: false, dash: false };
const icon = {
  swords: "⚔",
  coin: "◈",
  shield: "♜",
  star: "✦",
  arrow: "→",
  sound: "♫",
};
const time = (s) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const persist = () => {
  try {
    storage.setItem(
      "pg:blades-and-banners-two-fronts:save:v1",
      JSON.stringify(save),
    );
  } catch {
    saveWarning = true;
    $("#save-state").textContent = "Saving unavailable in this browser";
  }
};
$("#app").innerHTML =
  `<div class="shell"><header class="masthead"><button class="brand" data-action="home" aria-label="Blades and Banners home"><span class="brand-seal">⚔</span><span>BLADES <i>&</i> BANNERS<small>T W O &nbsp; F R O N T S</small></span></button><nav aria-label="Main navigation"><button data-action="campaign">Campaign</button><button data-action="upgrades">Armory <span class="tiny-dot"></span></button><button data-action="codex">How to play</button></nav><div class="header-tools"><button id="mute" class="icon-button" data-action="mute" aria-label="Toggle sound">♫</button><button class="icon-button" data-action="settings" aria-label="Settings">⚙</button></div></header>
<main class="game-frame"><div class="battle-bar"><div class="battle-title"><span class="chapter" id="chapter">THE DAWNWARD CHRONICLES</span><strong id="battle-name">A realm worth fighting for.</strong></div><div class="hero-meter"><span class="small-label">♥ <span>HERO</span><b id="hero-value">120 / 120</b></span><div class="meter"><i id="hero-fill"></i></div><span class="dash-label" id="dash-label">SHIFT · DODGE READY</span></div><div class="gold-box"><span class="coin-icon">◈</span><span><small>WAR CHEST</small><b id="gold">75</b></span></div><div class="clock-box"><b id="clock">0:00</b><small id="wave">BATTLE TIME</small></div><button class="icon-button pause-button" data-action="pause" aria-label="Pause game" id="pause">Ⅱ</button></div>
<div class="stage"><canvas id="battlefield" width="1280" height="560" aria-label="Upper hero battlefield and lower army battlefield"></canvas><div id="battle-tip" class="battle-tip" hidden></div><div id="toast" class="toast" role="status" aria-live="polite"></div><div id="screen" class="screen"></div><div class="touch-controls" id="touch-controls" hidden><div class="joystick" id="joystick" aria-label="Movement joystick"><span></span></div><div class="touch-actions"><button id="dash-touch" aria-label="Dodge">↯<small>DODGE</small></button><button id="attack-touch" aria-label="Sword attack">⚔<small>ATTACK</small></button></div></div></div>
<section class="recruitment" aria-label="Recruit soldiers"><div class="recruit-heading"><span><i class="live-dot"></i> MUSTER YOUR FORCES</span><small id="army-count">Six paths to victory. One shared war chest.</small><span class="recruit-hint">CLICK OR PRESS <kbd>1</kbd> – <kbd>6</kbd></span></div><div class="unit-cards">${UNITS.map((u, i) => `<button class="unit-card" data-unit="${i}" aria-label="Recruit ${u.name}, ${u.cost} gold" title="${u.desc}"><span class="portrait"><canvas width="96" height="100" data-portrait="${i}"></canvas><kbd>${i + 1}</kbd></span><span class="unit-copy"><strong>${u.name}</strong><small>${u.role}</small><span class="unit-bottom"><b>◈ ${u.cost}</b><em class="unit-status">Ready</em></span></span><span class="cooldown-shade"></span><span class="cooldown-text"></span></button>`).join("")}</div></section></main>
<footer class="page-footer"><span>ONE HERO. <i>TWO FRONTS.</i> YOUR KINGDOM.</span><span id="save-state">◌ Progress saves on this device</span><button data-action="codex">Controls & field guide <span>↗</span></button></footer></div><div id="modal" class="modal" hidden></div>`;
const canvas = $("#battlefield"),
  renderer = new Renderer(canvas);
document
  .querySelectorAll("[data-portrait]")
  .forEach((c) => portrait(c, UNITS[+c.dataset.portrait].kind));
let demo = new Battle(0, {}, 29);
demo.hero.x = 860;
demo.hero.y = 220;
for (let i = 0; i < 7; i++) {
  const u = demo.addUnit(i % 3, 0);
  u.x = 270 + i * 49;
  u.y = 425 + (i % 3) * 31;
}
for (let i = 0; i < 7; i++) {
  const u = demo.addUnit(i % 3, 1);
  u.x = 800 + i * 40;
  u.y = 424 + (i % 3) * 31;
}
demo.spawnHero(0).x = 1060;
demo.spawnHero(1).x = 1160;
function toast(text) {
  const e = $("#toast");
  e.textContent = text;
  e.classList.add("visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => e.classList.remove("visible"), 2300);
}
function leaveBattle() {
  if (battle && !battle.over) {
    paused = true;
    showModal(
      `<span class="eyebrow">LEAVE THE BATTLE?</span><h2>Regroup at camp.</h2><p>This battle's progress will be lost. Your campaign and upgrades are saved.</p><div class="button-row"><button class="primary" data-action="leave-confirm">Return to camp</button><button class="secondary" data-action="modal-close">Keep fighting</button></div>`,
    );
  } else showHome();
}
function showHome() {
  mode = "home";
  battle = null;
  paused = false;
  keys.clear();
  $("#modal").hidden = true;
  $("#touch-controls").hidden = true;
  $("#battle-tip").hidden = true;
  $("#screen").className = "screen home-screen";
  $("#screen").innerHTML =
    `<div class="home-copy"><span class="eyebrow"><span class="gold-line"></span> THE DAWNWARD CHRONICLES</span><h1>BLADES <i>&</i><br>BANNERS<span>TWO FRONTS</span></h1><p>Wield the blade. Raise the banner.<br>Fight for a realm on the edge of ruin.</p><div class="button-row"><button class="primary large" data-action="begin">${save.unlocked > 1 ? "Continue campaign" : "Begin campaign"} <span>→</span></button><button class="text-button" data-action="codex">How to play <span>↗</span></button></div><div class="home-meta"><span>⚔ &nbsp; ACTION + STRATEGY</span><span>5 BATTLES · 1 KINGDOM</span></div></div><div class="home-art"><div class="hero-halo"></div><canvas id="hero-poster" width="420" height="460" aria-label="Dawnward commander with sword and blue cape"></canvas><span class="poster-caption"><i></i> THE DAWNWARD STANDS WITH YOU</span></div><div class="home-bottom"><span><b>01</b><strong>Wield your blade<small>Fight on the ridge. Earn gold.</small></strong></span><span><b>02</b><strong>Raise your army<small>Recruit below. Turn the tide.</small></strong></span><span><b>03</b><strong>Reclaim the realm<small>Five battles. A lasting legacy.</small></strong></span></div>`;
  const p = $("#hero-poster"),
    c = p.getContext("2d");
  c.save();
  c.translate(215, 425);
  c.scale(4.6, 4.6);
  character(
    c,
    { x: 0, y: 0, hp: 1, face: 0, walk: 0, kind: "hero", side: 0 },
    { hero: true, scale: 1 },
  );
  c.restore();
  updateHUD();
}
function campaign() {
  if (battle && !battle.over) {
    paused = true;
    returnMode = "battle";
  } else returnMode = "home";
  mode = "campaign";
  $("#screen").className = "screen campaign-screen";
  $("#touch-controls").hidden = true;
  $("#screen").innerHTML =
    `<div class="panel-heading"><div><span class="eyebrow">THE CAMPAIGN</span><h2>A banner for every horizon.</h2></div><button class="close" data-action="back" aria-label="Back">×</button></div><div class="campaign-body"><div class="campaign-map"><svg viewBox="0 0 720 340" role="img" aria-label="Map of the five campaign battles"><defs><pattern id="lines" width="35" height="35" patternUnits="userSpaceOnUse"><path d="M0 30 Q15 15 35 30" stroke="#bfc1a318" fill="none"/></pattern></defs><rect width="720" height="340" fill="url(#lines)"/><path d="M25 300Q160 230 175 250T340 175T480 120T660 65" fill="none" stroke="#cca86a55" stroke-width="4" stroke-dasharray="5 8"/><g fill="#81947f44" stroke="#9eae8f55">${[
      [65, 110],
      [185, 60],
      [375, 65],
      [580, 235],
      [90, 240],
      [320, 280],
    ]
      .map(
        ([x, y]) =>
          `<path d="M${x - 30} ${y + 15}l30 -48 36 48 -25 -7 -11 7 -12 -7z"/>`,
      )
      .join(
        "",
      )}</g><path d="M10 180Q200 130 220 240T460 295T710 200" stroke="#7dafa24a" fill="none" stroke-width="10"/><text x="340" y="325" fill="#afb19766" font-family="Georgia" font-size="13" letter-spacing="6">THE FRACTURED REALM</text></svg>${LEVELS.map((l, i) => `<button class="map-node ${i >= save.unlocked ? "locked" : ""} ${selected === i ? "selected" : ""}" data-level="${i}" style="left:${[12, 29, 48, 67, 88][i]}%;top:${[76, 62, 48, 34, 18][i]}%" ${i >= save.unlocked ? "disabled" : ""} aria-label="Select ${l.name}"><span>${i >= save.unlocked ? "♜" : String(i + 1).padStart(2, "0")}</span><small>${l.name}</small><em>${"✦".repeat(save.best[i]?.stars || 0)}</em></button>`).join("")}<span class="compass">✥<small>N</small></span></div><div class="level-detail"><span class="eyebrow">BATTLE ${String(selected + 1).padStart(2, "0")} / 05</span><h3>${LEVELS[selected].name}</h3><span class="region">${LEVELS[selected].region}</span><p>${LEVELS[selected].brief}</p><div class="level-best">${save.best[selected] ? `<span class="stars">${"✦".repeat(save.best[selected].stars)}</span> Best clear · ${time(save.best[selected].time)}` : '<span class="mini-diamond">◇</span> An unwritten chapter'}</div><button class="primary" data-action="start">March to battle <span>→</span></button><button class="text-button" data-action="upgrades">Visit the armory · ${save.marks} marks</button></div></div>`;
}
function startBattle(level = selected) {
  selected = level;
  battle = new Battle(level, save.upgrades);
  battle.deployOpening();
  mode = "battle";
  paused = false;
  resultRecorded = false;
  keys.clear();
  touch.attack = false;
  $("#screen").className = "screen hidden";
  $("#screen").innerHTML = "";
  $("#modal").hidden = true;
  $("#touch-controls").hidden = false;
  $("#battle-tip").hidden = false;
  $("#battle-tip").innerHTML = `<span>⚑</span> ${LEVELS[level].tip}`;
  audio.unlock();
  audio.play("recruit");
  updateHUD();
}
function updateHUD() {
  const b = battle || demo,
    h = b.hero;
  $("#chapter").textContent =
    mode === "home"
      ? "THE DAWNWARD CHRONICLES"
      : `BATTLE ${String(b.level + 1).padStart(2, "0")} / 05`;
  $("#battle-name").textContent =
    mode === "home" ? "A realm worth fighting for." : b.config.name;
  $("#hero-value").textContent = `${Math.ceil(h.hp)} / ${Math.ceil(h.maxHp)}`;
  $("#hero-fill").style.width = `${Math.max(0, h.hp / h.maxHp) * 100}%`;
  $("#hero-fill").classList.toggle("danger", h.hp / h.maxHp < 0.3);
  $("#gold").textContent = Math.floor(b.gold);
  $("#clock").textContent = time(b.time);
  $("#dash-label").textContent =
    h.dashCd > 0 ? `DODGE · ${h.dashCd.toFixed(1)}s` : "SHIFT · DODGE READY";
  $("#wave").textContent =
    b.time > 0
      ? `WAVE ${Math.min(b.wave + 1, b.waveBudget)} / ${b.waveBudget}`
      : "BATTLE TIME";
  $("#army-count").textContent = battle
    ? `${b.units.filter((u) => u.side === 0 && u.hp > 0).length} soldiers in the field · ${b.stats.kills} hero kills · ${Math.round((b.wave / b.waveBudget) * 100)}% of waves`
    : "Six paths to victory. One shared war chest.";
  $("#pause").disabled = !battle || battle.over;
  $("#mute").textContent = save.muted ? "♩" : "♫";
  $("#mute").classList.toggle("muted", save.muted);
  $(".tiny-dot").style.opacity = save.marks >= 80 ? "1" : ".15";
  document.querySelectorAll("[data-unit]").forEach((e, i) => {
    const cd = b.cooldowns[i],
      u = UNITS[i],
      poor = b.gold < u.cost;
    e.classList.toggle("unaffordable", poor);
    e.classList.toggle("cooling", cd > 0);
    e.classList.toggle("inactive", mode !== "battle");
    e.setAttribute(
      "aria-disabled",
      String(mode !== "battle" || poor || cd > 0),
    );
    e.querySelector(".unit-status").textContent =
      cd > 0 ? "Rallying" : poor ? "Need gold" : "Ready";
    e.querySelector(".cooldown-shade").style.height =
      `${(100 * cd) / (u.cooldown * Math.pow(0.92, b.upgrades.rally || 0))}%`;
    e.querySelector(".cooldown-text").textContent =
      cd > 0 ? `${cd.toFixed(1)}s` : "";
  });
  if (battle) $("#battle-tip").hidden = b.time > 18;
}
function recruit(i) {
  if (mode !== "battle" || paused || !battle) return;
  if (battle.recruit(i)) {
    const card = $(`[data-unit="${i}"]`);
    card.classList.remove("success");
    void card.offsetWidth;
    card.classList.add("success");
  }
  handleEvents();
  updateHUD();
}
function showModal(html) {
  $("#modal").innerHTML =
    `<div class="modal-card" role="dialog" aria-modal="true">${html}</div>`;
  $("#modal").hidden = false;
  setTimeout(() => $("#modal button")?.focus(), 20);
}
function pause() {
  if (!battle || battle.over || mode !== "battle") return;
  paused = !paused;
  keys.clear();
  touch.attack = false;
  if (paused)
    showModal(
      `<span class="eyebrow">A MOMENT OF RESPITE</span><h2>The banners hold.</h2><p>The battle is paused. Both fronts await your command.</p><button class="primary full" data-action="resume">Return to battle <span>→</span></button><div class="button-row"><button class="secondary" data-action="restart">Restart battle</button><button class="secondary" data-action="leave">Campaign map</button></div><button class="text-button" data-action="settings">Audio & settings</button><span class="modal-footnote">ESC TO RESUME</span>`,
    );
  else $("#modal").hidden = true;
}
function results() {
  mode = "results";
  paused = false;
  const r = battle.result;
  let marks = 0;
  if (!resultRecorded) {
    marks = recordResult(save, r);
    persist();
    resultRecorded = true;
  }
  $("#touch-controls").hidden = true;
  $("#battle-tip").hidden = true;
  const complete = r.victory && r.level === 4;
  $("#screen").className = "screen result-screen";
  $("#screen").innerHTML =
    `<div class="result-panel"><span class="result-emblem">${r.victory ? "⚑" : "⚔"}</span><span class="eyebrow">${complete ? "THE REALM IS RECLAIMED" : r.victory ? "THE DAWNWARD PREVAILS" : "THE BANNER WILL RISE AGAIN"}</span><h2>${complete ? "A new dawn." : r.victory ? "Victory." : "Defeat."}</h2><p>${r.victory ? `The Ashen banner falls over ${LEVELS[r.level].name.replace("The ", "the ")}.` : battle.hero.hp <= 0 ? "Your hero has fallen. Read the enemy windups and dodge to safety." : "The Dawnward Keep has fallen. Reinforce the valley before the next wave."}</p><div class="result-stars">${[1, 2, 3].map((i) => `<span class="${r.stars >= i ? "earned" : ""}">✦</span>`).join("")}</div><div class="result-stats"><span><b>${time(r.time)}</b>Battle duration</span><span><b>${r.kills + r.armyKills}</b>Enemies defeated</span><span><b>${r.recruited}</b>Soldiers recruited</span><span><b>${r.lost}</b>Soldiers lost</span><span><b>${r.goldEarned}</b>Gold earned</span><span><b>${marks ? `+${marks}` : save.marks}</b>Campaign marks</span></div><div class="button-row"><button class="primary" data-action="${r.victory && !complete ? "next" : "restart"}">${r.victory && !complete ? "Next battle" : "Fight again"} <span>→</span></button><button class="secondary" data-action="upgrades">Armory</button><button class="text-button" data-action="campaign">Campaign map</button></div><small class="stars-explanation">Victory · Keep ≥ 60 HP · Hero ≥ 45% HP & clear under 4:00</small></div>`;
  updateHUD();
}
function upgrades() {
  if (mode === "battle") {
    paused = true;
    returnMode = "battle";
  } else if (mode !== "upgrades") returnMode = mode;
  mode = "upgrades";
  $("#touch-controls").hidden = true;
  $("#screen").className = "screen upgrades-screen";
  $("#screen").innerHTML =
    `<div class="panel-heading"><div><span class="eyebrow">THE DAWNWARD ARMORY</span><h2>Forge the next victory.</h2></div><div class="marks">✦ <b>${save.marks}</b> <small>CAMPAIGN MARKS</small></div><button class="close" data-action="back" aria-label="Back">×</button></div><p class="panel-intro">Victories earn marks. Permanent upgrades take effect in your next battle.</p><div class="upgrades-grid">${UPGRADES.map(
      (u, i) => {
        const rank = save.upgrades[u.key],
          cost = 80 + rank * 40;
        return `<button class="upgrade-card ${save.marks < cost ? "unaffordable" : ""}" data-upgrade="${i}" ${rank >= 5 ? "disabled" : ""}><span class="upgrade-icon">${u.icon}</span><span><strong>${u.name}</strong><small>${u.desc} per rank</small><span class="rank-pips">${[0, 1, 2, 3, 4].map((n) => `<i class="${n < rank ? "filled" : ""}"></i>`).join("")}</span></span><span class="upgrade-cost">${rank === 5 ? "MAX" : `✦ ${cost}`}<small>${rank} / 5</small></span></button>`;
      },
    ).join(
      "",
    )}</div><div class="panel-bottom"><span>First clears and improved star ratings earn marks.</span><button class="primary" data-action="campaign">Return to campaign <span>→</span></button></div>`;
}
function buyUpgrade(index) {
  const u = UPGRADES[index],
    rank = save.upgrades[u.key],
    cost = 80 + rank * 40;
  if (rank >= 5) return;
  if (save.marks < cost) {
    toast("Win battles to earn more campaign marks.");
    return;
  }
  save.marks -= cost;
  save.upgrades[u.key]++;
  persist();
  audio.play("recruit");
  upgrades();
}
function codex() {
  if (mode === "battle") {
    paused = true;
    returnMode = "battle";
  } else if (mode !== "codex") returnMode = mode;
  mode = "codex";
  $("#touch-controls").hidden = true;
  $("#screen").className = "screen codex-screen";
  $("#screen").innerHTML =
    `<div class="panel-heading"><div><span class="eyebrow">THE FIELD GUIDE</span><h2>One commander. Two fronts.</h2></div><button class="close" data-action="back" aria-label="Back">×</button></div><div class="codex-columns"><div><h3>Above: earn your gold.</h3><p>Move your hero along the ridge. Your sword strikes in the direction you face. Defeat enemies to fund your army.</p><div class="controls-list"><span><kbd>W A S D</kbd> / <kbd>↑ ↓ ← →</kbd><b>Move & face</b></span><span><kbd>SPACE</kbd> / <kbd>CLICK</kbd><b>Sword attack</b></span><span><kbd>SHIFT</kbd><b>Dodge · brief invulnerability</b></span><span><kbd>1</kbd> – <kbd>6</kbd><b>Recruit soldiers</b></span><span><kbd>ESC</kbd><b>Pause both battlefields</b></span></div><p class="field-note">Watch the amber attack ring, then move away or dodge. The hero stays on the upper ridge.</p></div><div><h3>Below: turn the tide.</h3><p>Troops march and fight automatically. Destroy the Ashen Stronghold before your hero or keep falls.</p><div class="tactics"><span>♜ <b>Shieldbearers</b> protect allies from arrows.</span><span>✚ <b>Battle Priests</b> heal the most injured allies.</span><span>⚔ <b>Knights</b> charge with a stronger first strike.</span><span>✦ <b>Siege Golems</b> smash groups and strongholds.</span></div><p class="field-note">Mobile: use the left joystick to move, the right buttons to attack and dodge, and tap recruitment cards. Landscape is recommended.</p><div class="enemy-rewards">${HERO_ENEMIES.map((e) => `<span>${e.name}<b>◈ ${e.reward}</b></span>`).join("")}</div></div></div>`;
}
function settings() {
  if (mode === "battle") {
    paused = true;
    returnMode = "battle";
  } else if (mode !== "settings") returnMode = mode;
  mode = "settings";
  $("#touch-controls").hidden = true;
  $("#screen").className = "screen settings-screen";
  $("#modal").hidden = true;
  $("#screen").innerHTML =
    `<div class="settings-panel"><span class="eyebrow">AT YOUR COMMAND</span><h2>Settings</h2><label class="setting-row"><span>Battle audio<small>Swords, coins and battlefield feedback</small></span><input type="checkbox" id="audio-enabled" ${!save.muted ? "checked" : ""}></label><label class="setting-row"><span>Fantasy music<small>An original, softly played battle theme</small></span><input type="checkbox" id="music-enabled" ${save.music ? "checked" : ""}></label><label class="setting-row"><span>Volume<small id="volume-value">${Math.round(save.volume * 100)}%</small></span><input type="range" min="0" max="100" value="${save.volume * 100}" id="volume" aria-label="Audio volume"></label><p class="field-note">Progress and best results are saved on this browser. Audio begins after your first interaction.</p><button class="primary full" data-action="back">Return <span>→</span></button></div>`;
}
function back() {
  const prev = returnMode;
  if (prev === "battle" && battle && !battle.over) {
    mode = "battle";
    paused = false;
    $("#screen").className = "screen hidden";
    $("#screen").innerHTML = "";
    $("#modal").hidden = true;
    $("#touch-controls").hidden = false;
  } else if (prev === "results" && battle?.over) results();
  else if (prev === "campaign" || prev === "upgrades") campaign();
  else showHome();
}
function handleEvents() {
  if (!battle) return;
  for (const e of battle.events) {
    audio.play(e.type);
    if (e.type === "shortage") {
      const card = $(`[data-unit="${e.index}"]`);
      card.classList.remove("shortage");
      void card.offsetWidth;
      card.classList.add("shortage");
      toast(
        `Need ${UNITS[e.index].cost - Math.floor(battle.gold)} more gold for ${UNITS[e.index].name}.`,
      );
    }
    if (e.type === "commander")
      toast(
        "Marshal Veyr has entered the valley. Rally your strongest troops!",
      );
  }
  battle.events.length = 0;
}
function input() {
  return {
    x:
      (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) -
      (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0) +
      touch.x,
    y:
      (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0) -
      (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) +
      touch.y,
    attack: keys.has("Space") || touch.attack,
    dash: touch.dash || keys.has("ShiftLeft") || keys.has("ShiftRight"),
  };
}
function step(dt) {
  if (mode === "battle" && !paused && battle) {
    battle.update(dt, input());
    handleEvents();
    if (battle.over) results();
  }
  uiClock += dt;
  if (uiClock > 0.08) {
    uiClock = 0;
    updateHUD();
  }
}
function frame(ts) {
  const dt = Math.min((ts - last) / 1000 || 0, 0.05);
  last = ts;
  step(dt);
  renderer.render(battle || demo, dt);
  requestAnimationFrame(frame);
}
document.addEventListener("click", (e) => {
  const unit = e.target.closest("[data-unit]");
  if (unit) {
    audio.unlock();
    recruit(+unit.dataset.unit);
    return;
  }
  const lev = e.target.closest("[data-level]");
  if (lev && !lev.disabled) {
    selected = +lev.dataset.level;
    campaign();
    return;
  }
  const upgrade = e.target.closest("[data-upgrade]");
  if (upgrade) {
    buyUpgrade(+upgrade.dataset.upgrade);
    return;
  }
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  audio.unlock();
  audio.play("click");
  switch (action) {
    case "home":
      leaveBattle();
      break;
    case "begin":
      selected = Math.min(save.unlocked - 1, 4);
      campaign();
      break;
    case "campaign":
      if (mode === "battle" && battle && !battle.over) {
        paused = true;
        showModal(
          `<span class="eyebrow">RETURN TO CAMP?</span><h2>The battle still rages.</h2><p>Returning to the map ends this attempt. Campaign progress stays saved.</p><div class="button-row"><button class="primary" data-action="leave-confirm">Return to camp</button><button class="secondary" data-action="modal-close">Keep fighting</button></div>`,
        );
      } else campaign();
      break;
    case "start":
      startBattle();
      break;
    case "restart":
      startBattle(battle?.level ?? selected);
      break;
    case "next":
      selected = Math.min(4, battle.level + 1);
      campaign();
      break;
    case "pause":
      pause();
      break;
    case "resume":
      paused = false;
      $("#modal").hidden = true;
      break;
    case "leave":
      leaveBattle();
      break;
    case "leave-confirm":
      battle = null;
      paused = false;
      $("#modal").hidden = true;
      campaign();
      break;
    case "modal-close":
      $("#modal").hidden = true;
      paused = false;
      break;
    case "upgrades":
      upgrades();
      break;
    case "codex":
      codex();
      break;
    case "settings":
      settings();
      break;
    case "back":
      back();
      break;
    case "mute":
      save.muted = !save.muted;
      audio.sync();
      persist();
      updateHUD();
      break;
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "audio-enabled") save.muted = !e.target.checked;
  if (e.target.id === "music-enabled") save.music = e.target.checked;
  audio.sync();
  persist();
  updateHUD();
});
document.addEventListener("input", (e) => {
  if (e.target.id === "volume") {
    save.volume = +e.target.value / 100;
    $("#volume-value").textContent = `${e.target.value}%`;
    audio.sync();
    persist();
  }
});
window.addEventListener("keydown", (e) => {
  if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
  if (
    [
      "Space",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "ShiftLeft",
      "ShiftRight",
    ].includes(e.code) &&
    mode === "battle"
  )
    e.preventDefault();
  if (e.code === "Escape") {
    e.preventDefault();
    if (mode === "battle") pause();
    else if (mode !== "home") back();
    return;
  }
  keys.add(e.code);
  if (!e.repeat && e.code.startsWith("Digit")) recruit(+e.code.slice(5) - 1);
  if (e.code === "Space" || e.code.startsWith("Shift")) audio.unlock();
});
window.addEventListener("keyup", (e) => keys.delete(e.code));
function clearInput() {
  keys.clear();
  touch.x = touch.y = 0;
  touch.attack = touch.dash = false;
  $("#joystick span").style.transform = "translate(0,0)";
}
window.addEventListener("blur", () => {
  clearInput();
  if (mode === "battle" && !paused) pause();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInput();
    if (mode === "battle" && !paused) pause();
  }
});
canvas.addEventListener("pointerdown", (e) => {
  if (mode !== "battle" || paused || e.button !== 0) return;
  audio.unlock();
  const r = canvas.getBoundingClientRect(),
    x = ((e.clientX - r.left) / r.width) * 1280,
    y = ((e.clientY - r.top) / r.height) * 560;
  if (y > 293) return;
  battle.hero.face = Math.atan2(y - battle.hero.y, x - battle.hero.x);
  touch.attack = true;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointerup", () => (touch.attack = false));
canvas.addEventListener("pointercancel", () => (touch.attack = false));
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
const joystick = $("#joystick");
let joyPointer = null;
function moveJoystick(e) {
  if (joyPointer !== e.pointerId) return;
  const r = joystick.getBoundingClientRect(),
    dx = e.clientX - r.left - r.width / 2,
    dy = e.clientY - r.top - r.height / 2,
    l = Math.hypot(dx, dy),
    max = r.width * 0.32;
  touch.x = l < 6 ? 0 : dx / Math.max(l, max);
  touch.y = l < 6 ? 0 : dy / Math.max(l, max);
  joystick.querySelector("span").style.transform =
    `translate(${clamp(dx, -max, max)}px,${clamp(dy, -max, max)}px)`;
}
joystick.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  joyPointer = e.pointerId;
  joystick.setPointerCapture(e.pointerId);
  audio.unlock();
  moveJoystick(e);
});
joystick.addEventListener("pointermove", moveJoystick);
for (const event of ["pointerup", "pointercancel"])
  joystick.addEventListener(event, () => {
    joyPointer = null;
    touch.x = touch.y = 0;
    joystick.querySelector("span").style.transform = "translate(0,0)";
  });
for (const [id, key] of [
  ["attack-touch", "attack"],
  ["dash-touch", "dash"],
]) {
  const el = $("#" + id);
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    audio.unlock();
    el.setPointerCapture(e.pointerId);
    touch[key] = true;
  });
  for (const event of ["pointerup", "pointercancel"])
    el.addEventListener(event, () => (touch[key] = false));
}
window.render_game_to_text = () =>
  JSON.stringify({
    mode,
    paused,
    level: battle?.level ?? selected,
    time: battle?.time ?? 0,
    hero: battle
      ? {
          x: battle.hero.x,
          y: battle.hero.y,
          hp: battle.hero.hp,
          attack: battle.hero.attack,
          dash: battle.hero.dash,
          dashCd: battle.hero.dashCd,
        }
      : null,
    gold: battle?.gold,
    bases: battle?.bases,
    heroEnemies: battle?.enemies
      .filter((e) => e.hp > 0)
      .map((e) => ({ type: e.name, x: e.x, y: e.y, hp: e.hp, wind: e.wind })),
    units: battle?.units
      .filter((u) => u.hp > 0)
      .map((u) => ({ type: u.name, side: u.side, x: u.x, y: u.y, hp: u.hp })),
    stats: battle?.stats,
    result: battle?.result,
    save: {
      unlocked: save.unlocked,
      marks: save.marks,
      upgrades: save.upgrades,
    },
    coordinates: "1280x560; x right, y down; ridge y137–269, valley y399–499",
  });
window.advanceTime = (ms) => {
  for (let t = 0; t < ms; t += 1000 / 60)
    step(Math.min(1000 / 60, ms - t) / 1000);
  renderer.render(battle || demo);
  return window.render_game_to_text();
};
if (import.meta.env.DEV)
  window.__qa = {
    get battle() {
      return battle;
    },
    get save() {
      return save;
    },
    start: startBattle,
    finish: (win) => {
      battle.finish(win);
      handleEvents();
      results();
    },
    setKeys: (codes) => {
      keys.clear();
      codes.forEach((c) => keys.add(c));
    },
  };
showHome();
requestAnimationFrame(frame);
