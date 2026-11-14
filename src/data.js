export const UNITS = [
  {
    name: "Swordsman",
    role: "Reliable frontline",
    cost: 25,
    hp: 66,
    damage: 12,
    range: 32,
    interval: 0.95,
    speed: 43,
    cooldown: 1.8,
    kind: "sword",
    desc: "A dependable blade. Holds the line and deals steady melee damage.",
  },
  {
    name: "Archer",
    role: "Ranged support",
    cost: 45,
    hp: 40,
    damage: 13,
    range: 190,
    interval: 1.45,
    speed: 40,
    cooldown: 3,
    kind: "bow",
    desc: "Fires arrows from behind your frontline. Keep protected.",
  },
  {
    name: "Shieldbearer",
    role: "Armored defender",
    cost: 60,
    hp: 190,
    damage: 7,
    range: 36,
    interval: 1.3,
    speed: 30,
    cooldown: 4,
    kind: "shield",
    desc: "Takes 25% less damage and intercepts arrows aimed at nearby allies.",
  },
  {
    name: "Battle Priest",
    role: "Healing support",
    cost: 80,
    hp: 65,
    damage: 5,
    range: 145,
    interval: 1.7,
    speed: 34,
    cooldown: 6,
    kind: "priest",
    desc: "Restores 16 health to the most injured nearby ally. Carries a defensive staff.",
  },
  {
    name: "Knight",
    role: "Elite vanguard",
    cost: 120,
    hp: 235,
    damage: 29,
    range: 44,
    interval: 1.05,
    speed: 49,
    cooldown: 7,
    kind: "knight",
    desc: "An armored veteran. The first strike after charging deals bonus damage.",
  },
  {
    name: "Siege Golem",
    role: "Siege & area damage",
    cost: 180,
    hp: 390,
    damage: 39,
    range: 56,
    interval: 2.1,
    speed: 25,
    cooldown: 10,
    kind: "golem",
    desc: "Smashes groups of enemies and deals triple damage to strongholds.",
  },
];
export const ENEMIES = [
  {
    name: "Marauder",
    hp: 52,
    damage: 9,
    range: 32,
    interval: 1.15,
    speed: 37,
    kind: "sword",
  },
  {
    name: "Crossbow Raider",
    hp: 38,
    damage: 12,
    range: 175,
    interval: 1.8,
    speed: 33,
    kind: "bow",
  },
  {
    name: "Armored Champion",
    hp: 160,
    damage: 14,
    range: 38,
    interval: 1.45,
    speed: 28,
    kind: "shield",
  },
  {
    name: "Dark Shaman",
    hp: 65,
    damage: 8,
    range: 145,
    interval: 2,
    speed: 30,
    kind: "priest",
  },
  {
    name: "War Beast",
    hp: 210,
    damage: 23,
    range: 45,
    interval: 1.2,
    speed: 47,
    kind: "beast",
  },
  {
    name: "Enemy Siege Brute",
    hp: 310,
    damage: 33,
    range: 55,
    interval: 2.3,
    speed: 24,
    kind: "golem",
  },
];
export const HERO_ENEMIES = [
  {
    name: "Goblin Scout",
    hp: 34,
    damage: 5,
    speed: 84,
    reward: 12,
    size: 0.77,
    windup: 0.55,
    interval: 1.3,
    kind: "scout",
  },
  {
    name: "Raider",
    hp: 56,
    damage: 8,
    speed: 66,
    reward: 18,
    size: 1,
    windup: 0.6,
    interval: 1.65,
    kind: "raider",
  },
  {
    name: "Armored Brute",
    hp: 106,
    damage: 14,
    speed: 40,
    reward: 30,
    size: 1.3,
    windup: 0.85,
    interval: 2.15,
    kind: "brute",
  },
  {
    name: "Shadow Assassin",
    hp: 60,
    damage: 9,
    speed: 102,
    reward: 35,
    size: 0.9,
    windup: 0.65,
    interval: 1.8,
    kind: "assassin",
  },
];
export const LEVELS = [
  {
    name: "The Borderlands",
    region: "The western marches",
    tag: "A banner rises",
    brief:
      "Ashen scouts have crossed the border. Cut them down on the ridge and send the Dawnward to reclaim the watchtower.",
    tip: "Fight on the upper ridge. Spend your gold to recruit troops below.",
    color: "#819977",
    sky: ["#aec5be", "#e8d8ab"],
    ground: "#657552",
    road: "#afa180",
    mountain: "#728d87",
    army: [0, 0, 0, 0, 0],
    hero: [0, 0, 1],
    spawn: 10,
    strength: 0.92,
    seed: 41,
  },
  {
    name: "The Broken Road",
    region: "The iron foothills",
    tag: "Under arrow fire",
    brief:
      "Crossbow raiders control the old trade road. Shieldbearers can shelter your archers as you break their defenses.",
    tip: "Shieldbearers intercept arrows. Recruit archers to fire from safety.",
    color: "#a28d6c",
    sky: ["#9cafa9", "#e5c59e"],
    ground: "#7c795d",
    road: "#b4a083",
    mountain: "#777f7a",
    army: [0, 0, 1, 0, 1, 0, 2],
    hero: [0, 1, 1, 2],
    spawn: 8.8,
    strength: 1,
    seed: 69,
  },
  {
    name: "The Marsh Crossing",
    region: "The drowned lowlands",
    tag: "Steel in the mire",
    brief:
      "Armored champions guard the only dry crossing. Bring healing and heavy blades to outlast their advance.",
    tip: "Priests heal injured allies. Knights break armored frontlines.",
    color: "#7a9689",
    sky: ["#849e98", "#c7cdb1"],
    ground: "#485f53",
    road: "#898c69",
    mountain: "#59736b",
    army: [0, 2, 1, 2, 0, 4],
    hero: [0, 1, 2, 2, 3],
    spawn: 8.2,
    strength: 1.05,
    seed: 118,
  },
  {
    name: "The Black Forest",
    region: "The elderwood",
    tag: "Whispers in the dark",
    brief:
      "Dark shamans gather beneath the ancient trees. Their magic sustains the legion. Field a balanced army and press forward.",
    tip: "Golems strike groups. A protected priest keeps your army moving.",
    color: "#6d857d",
    sky: ["#475f61", "#a8b59a"],
    ground: "#384f43",
    road: "#78836a",
    mountain: "#3b5750",
    army: [0, 1, 3, 2, 4, 3],
    hero: [1, 3, 2, 3],
    spawn: 7.4,
    strength: 1.12,
    seed: 211,
  },
  {
    name: "Siege of the Ashen Citadel",
    region: "The cinder crown",
    tag: "The last dawn",
    brief:
      "Marshal Veyr stands at the gates of the Ashen Citadel. Break his war beasts and siege brutes. End the two-front war.",
    tip: "The commander arrives after 70 seconds. Keep your frontline reinforced.",
    color: "#bb8974",
    sky: ["#675f61", "#cea38b"],
    ground: "#594f47",
    road: "#927864",
    mountain: "#675c57",
    army: [0, 1, 2, 3, 4, 5, 2],
    hero: [1, 2, 3, 3],
    spawn: 6.7,
    strength: 1.2,
    seed: 301,
  },
];
export const UPGRADES = [
  {
    name: "Tempered steel",
    desc: "+10% hero damage",
    key: "attack",
    icon: "⚔",
  },
  {
    name: "Heart of the Dawn",
    desc: "+10% hero health",
    key: "health",
    icon: "♥",
  },
  { name: "Forged armor", desc: "+10% troop health", key: "armor", icon: "♜" },
  {
    name: "Veteran training",
    desc: "+10% troop damage",
    key: "training",
    icon: "⚑",
  },
  {
    name: "Rally the ranks",
    desc: "8% faster recruitment",
    key: "rally",
    icon: "⌛",
  },
  { name: "War chest", desc: "+15 starting gold", key: "gold", icon: "✦" },
];
export const freshSave = () => ({
  unlocked: 1,
  marks: 0,
  best: {},
  upgrades: { attack: 0, health: 0, armor: 0, training: 0, rally: 0, gold: 0 },
  muted: false,
  music: true,
  volume: 0.45,
});
export function loadSave(storage) {
  try {
    const x = JSON.parse(
      storage.getItem("pg:blades-and-banners-two-fronts:save:v1"),
    );
    const d = freshSave();
    if (!x || typeof x !== "object") return d;
    d.unlocked = Math.max(1, Math.min(5, Math.floor(Number(x.unlocked) || 1)));
    d.marks = Math.max(0, Math.floor(Number(x.marks) || 0));
    for (const u of UPGRADES)
      d.upgrades[u.key] = Math.max(
        0,
        Math.min(5, Math.floor(Number(x.upgrades?.[u.key]) || 0)),
      );
    d.best = x.best && typeof x.best === "object" ? x.best : {};
    d.muted = !!x.muted;
    d.music = x.music !== false;
    d.volume = Math.max(0, Math.min(1, Number(x.volume ?? 0.45)));
    return d;
  } catch {
    return freshSave();
  }
}
export function recordResult(save, result) {
  if (!result.victory) return 0;
  const previous = save.best[result.level];
  const earned = previous
    ? Math.max(0, result.stars - (previous.stars || 0)) * 30
    : 100 + result.stars * 30;
  save.best[result.level] = {
    stars: Math.max(previous?.stars || 0, result.stars),
    time: Math.min(previous?.time || Infinity, result.time),
  };
  save.unlocked = Math.max(save.unlocked, Math.min(5, result.level + 2));
  save.marks += earned;
  return earned;
}
