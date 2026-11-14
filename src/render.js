import { LEVELS } from "./data.js";
import { rng } from "./engine.js";
const TAU = Math.PI * 2;
function poly(c, pts, fill, stroke = null, width = 1) {
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath();
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.stroke();
  }
}
function ellipse(c, x, y, rx, ry, fill) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, TAU);
  c.fillStyle = fill;
  c.fill();
}
function line(c, x, y, x2, y2, color, w = 2) {
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(x2, y2);
  c.strokeStyle = color;
  c.lineWidth = w;
  c.lineCap = "round";
  c.stroke();
}
function rect(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}
function tree(c, x, y, s, color, r, kind = 0) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  if (kind === 2) {
    line(c, 0, 0, -7, -125, "#49423b", 7);
    for (let i = 0; i < 4; i++) {
      const yy = -35 - i * 23;
      line(c, -i * 1.5, yy, -32 + i * 3, yy - 31, "#49423b", 4 - i * 0.5);
      line(c, -i * 1.5, yy + 10, 25 - i * 2, yy - 22, "#49423b", 3 - i * 0.4);
    }
  } else if (kind === 1) {
    line(c, 0, 0, -5, -110, "#3e4c42", 8);
    for (let i = 0; i < 5; i++) {
      const yy = -34 - i * 22;
      poly(c, [-43 + i * 5, yy + 10, -5, yy - 55, 36 - i * 4, yy + 12], color);
    }
  } else {
    line(c, 0, 0, -8, -105, "#4b5141", 9);
    line(c, -5, -70, -40, -111, "#4b5141", 4);
    line(c, -5, -65, 34, -112, "#4b5141", 4);
    for (let i = 0; i < 17; i++) {
      const a = r() * TAU,
        d = r() * 47;
      ellipse(
        c,
        -5 + Math.cos(a) * d,
        -111 + Math.sin(a) * d * 0.55,
        22 + r() * 17,
        17 + r() * 11,
        color,
      );
    }
  }
  c.restore();
}
function mountain(c, r, y, color, amplitude) {
  let pts = [0, 290, 0, y];
  for (let x = 0; x <= 1320; x += 55) pts.push(x, y - r() * amplitude);
  pts.push(1320, 290);
  poly(c, pts, color);
  c.globalAlpha = 0.12;
  for (let i = 4; i < pts.length - 2; i += 4) {
    poly(
      c,
      [
        pts[i],
        pts[i + 1],
        pts[i] + 70,
        pts[i + 1] + 100,
        pts[i] + 12,
        pts[i + 1] + 70,
      ],
      "#f9edd2",
    );
  }
  c.globalAlpha = 1;
}
export function makeBackground(level) {
  const config = LEVELS[level],
    r = rng(config.seed),
    canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 560;
  const c = canvas.getContext("2d");
  const sky = c.createLinearGradient(0, 0, 0, 280);
  sky.addColorStop(0, config.sky[0]);
  sky.addColorStop(1, config.sky[1]);
  rect(c, 0, 0, 1280, 560, sky);
  ellipse(c, 990, 62, 33, 33, "#f7e6b0");
  ellipse(c, 990, 62, 48, 48, "#f8e4b71a");
  for (let i = 0; i < 14; i++) {
    const x = r() * 1400,
      y = r() * 100;
    c.globalAlpha = 0.11;
    ellipse(c, x, y, 70 + r() * 120, 7 + r() * 10, "#fff9e8");
  }
  c.globalAlpha = 1;
  mountain(c, r, 149, config.mountain + "65", 108);
  mountain(c, r, 165, config.mountain + "a0", 93);
  mountain(c, r, 180, config.mountain, 72);
  for (let i = 0; i < 21; i++)
    tree(
      c,
      r() * 1280,
      142 + r() * 10,
      0.32 + r() * 0.3,
      level === 3 ? "#344c42" : "#526f5a",
      r,
      level === 4 ? 2 : i % 3 === 0 ? 1 : 0,
    );
  // Upper ridge, golden path and a cross-section of its rocky edge.
  rect(c, 0, 145, 1280, 157, config.ground);
  const path = c.createLinearGradient(0, 146, 0, 292);
  path.addColorStop(0, config.road + "90");
  path.addColorStop(0.5, config.road);
  path.addColorStop(1, config.ground);
  poly(
    c,
    [
      0, 173, 180, 159, 330, 181, 650, 170, 970, 161, 1280, 175, 1280, 287, 0,
      287,
    ],
    path,
  );
  for (let i = 0; i < 250; i++) {
    let x = r() * 1280,
      y = 155 + r() * 130;
    line(c, x, y, x + 3 + r() * 9, y - 1, i % 3 ? "#e3d5aa33" : "#283f3933", 1);
  }
  poly(
    c,
    [
      0, 285, 90, 291, 162, 284, 260, 292, 360, 285, 440, 295, 555, 286, 650,
      291, 790, 284, 930, 292, 1030, 284, 1180, 290, 1280, 285, 1280, 337, 0,
      337,
    ],
    "#505746",
  );
  for (let i = 0; i < 60; i++) {
    let x = i * 24,
      y = 295 + r() * 10;
    poly(
      c,
      [x, y, x + 24, y - 5, x + 37, 322 + r() * 13, x + 7, 329 + r() * 10],
      i % 2 ? "#67705a" : "#5b6250",
      "#7c826144",
      1,
    );
  }
  for (let i = 0; i < 45; i++) {
    let x = r() * 1280,
      y = 289 + r() * 7;
    line(c, x, y, x + 3, y - 5 - r() * 7, "#93a270", 2);
  }
  // Valley with a distant stream and three natural ranks.
  rect(c, 0, 332, 1280, 228, config.ground);
  poly(
    c,
    [
      0, 341, 300, 357, 580, 339, 810, 350, 1000, 338, 1280, 351, 1280, 376,
      900, 366, 560, 370, 260, 366, 0, 378,
    ],
    level === 4 ? "#b36f44" : level === 2 ? "#769d9a" : "#869987",
  );
  for (let i = 0; i < 23; i++) {
    let x = r() * 1280,
      y = 347 + r() * 24;
    line(
      c,
      x,
      y,
      x + 12 + r() * 27,
      y,
      level === 4 ? "#f3bc7155" : "#d3d8bd44",
      1,
    );
  }
  poly(
    c,
    [
      0, 393, 240, 389, 480, 397, 710, 384, 950, 391, 1280, 386, 1280, 520,
      1040, 511, 790, 524, 530, 514, 280, 522, 0, 511,
    ],
    config.road,
  );
  for (let i = 0; i < 500; i++) {
    let x = r() * 1280,
      y = 390 + r() * 137;
    const col = i % 3 ? "#d5c59938" : "#3f4b3c33";
    line(c, x, y, x + 2 + r() * 9, y + (r() - 0.5) * 2, col, 1);
  }
  for (let i = 0; i < 85; i++) {
    let x = r() * 1280,
      y = 518 + r() * 42;
    line(c, x, y, x - 3, y - 7 - r() * 9, "#314b3c66", 2);
    line(c, x, y, x + 5, y - 4 - r() * 6, "#adb58255", 1);
  }
  for (let i = 0; i < 12; i++) {
    let x = r() * 1280,
      y = 534 + r() * 20;
    poly(
      c,
      [x, y, x + 5, y - 6, x + 15, y - 4, x + 20, y + 2, x + 2, y + 3],
      "#747866",
      "#a3a389",
      1,
    );
  }
  if (level === 2) {
    for (let i = 0; i < 20; i++) {
      let x = r() * 1280,
        y = 365 + r() * 25;
      line(c, x, y, x + 1, y - 17, "#687854", 2);
      line(c, x + 1, y - 17, x + 1, y - 23, "#7a613f", 4);
    }
  }
  if (level === 3) {
    for (let x = 0; x < 1280; x += 195)
      tree(c, x + 20, 148, 1.6, "#2f483c", r, 1);
  }
  if (level === 1) {
    for (let i = 0; i < 12; i++) {
      const x = r() * 1280,
        y = 180 + r() * 88;
      poly(
        c,
        [x, y, x + 8, y - 10, x + 20, y - 7, x + 29, y + 3, x + 8, y + 5],
        "#8f8f7b",
        "#b4b39a77",
        1,
      );
    }
  }
  if (level === 4) {
    for (let i = 0; i < 11; i++) {
      let x = r() * 1280;
      poly(c, [x, 220, x + 40, 143 - r() * 90, x + 85, 220], "#5b5550");
    }
    for (let i = 0; i < 7; i++) {
      let x = r() * 1280;
      line(c, x, 540, x + 25, 530, "#e39755", 2);
    }
  }
  tree(
    c,
    -14,
    558,
    1.7,
    level === 3 ? "#243e33" : "#385542",
    r,
    level === 4 ? 2 : 0,
  );
  tree(
    c,
    1297,
    550,
    1.9,
    level === 3 ? "#243e33" : "#385542",
    r,
    level === 4 ? 2 : 0,
  );
  return canvas;
}
function flag(c, x, y, side, t, scale = 1) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  line(c, 0, 0, 0, -65, "#4c4c3c", 3);
  const wave = Math.sin(t * 2 + x) * 3;
  poly(
    c,
    [2, -64, 38, -61 + wave, 34, -34 + wave, 20, -40, 2, -38],
    side ? "#873d38" : "#467a88",
    "#d0ae6e",
    1,
  );
  if (side) {
    line(c, 13, -55, 26, -44, "#d9b08a", 2);
    line(c, 26, -55, 13, -44, "#d9b08a", 2);
  } else {
    poly(
      c,
      [
        19, -57, 22, -50, 29, -49, 24, -44, 25, -37, 19, -41, 13, -37, 14, -44,
        9, -49, 16, -50,
      ],
      "#e5c78b",
    );
  }
  c.restore();
}
function castle(c, x, y, side, hp, t) {
  c.save();
  c.translate(x, y);
  if (side) c.scale(-1, 1);
  const wall = side ? "#6b5750" : "#8a9383",
    light = side ? "#978071" : "#bcc3a3",
    dark = side ? "#423a38" : "#5b6c60";
  ellipse(c, 0, 6, 87, 13, "#233b3b33");
  poly(
    c,
    [
      -66, 0, -66, -77, -49, -77, -49, -88, -34, -88, -34, -77, 43, -77, 43,
      -89, 59, -89, 59, -77, 69, -77, 69, 0,
    ],
    wall,
    dark,
    2,
  );
  rect(c, -48, -61, 98, 61, wall);
  for (let yy = -67; yy < 0; yy += 15) {
    line(c, -62, yy, 64, yy, dark + "55", 1);
    for (let xx = -54 + (yy % 2 ? 0 : 13); xx < 66; xx += 27)
      line(c, xx, yy, xx, yy + 13, dark + "44", 1);
  }
  rect(c, -74, -99, 36, 99, wall);
  rect(c, -74, -99, 8, 14, light);
  rect(c, -58, -99, 9, 14, light);
  rect(c, -43, -99, 7, 14, light);
  rect(c, 41, -99, 36, 99, wall);
  for (let xx = 41; xx < 78; xx += 15) rect(c, xx, -99, 8, 14, light);
  line(c, -73, -79, -39, -79, light, 3);
  line(c, 42, -79, 75, -79, light, 3);
  poly(
    c,
    [-29, 0, -29, -40, -24, -50, -12, -57, 1, -59, 17, -54, 28, -42, 28, 0],
    dark,
  );
  poly(
    c,
    [-21, 0, -21, -37, -16, -44, -5, -48, 8, -47, 20, -38, 20, 0],
    side ? "#322d2c" : "#3c514a",
  );
  for (let xx = -16; xx < 23; xx += 9) line(c, xx, -39, xx, -4, "#a58c62", 2);
  line(c, -21, -20, 20, -20, "#a58c62", 2);
  for (const xx of [-63, 53]) {
    rect(c, xx, -60, 10, 22, dark);
    line(c, xx + 5, -58, xx + 5, -39, light, 1);
  }
  poly(c, [-33, -77, -33, -128, 0, -154, 33, -128, 33, -77], wall, dark, 2);
  poly(
    c,
    [-42, -129, 0, -162, 41, -129],
    side ? "#653c38" : "#426a72",
    "#3e4c42",
    2,
  );
  rect(c, -9, -117, 18, 24, dark);
  line(c, 0, -116, 0, -95, light, 2);
  line(c, -8, -105, 8, -105, light, 2);
  flag(c, 0, -156, side, t, 0.8);
  if (hp < 50) {
    line(c, 40, -60, 55, -45, dark, 3);
    line(c, 55, -45, 48, -21, dark, 3);
  }
  if (hp < 25) {
    poly(c, [-75, 0, -60, -15, -42, 0], dark);
  }
  c.restore();
}
export function character(c, u, opts = {}) {
  const hero = opts.hero;
  const kind = u.kind || "hero";
  const side = u.side ?? (hero ? 0 : 1);
  const front = hero ? Math.cos(u.face) >= 0 : side === 0;
  const size =
    opts.scale ??
    (hero
      ? 1.1
      : kind === "golem"
        ? 1.45
        : kind === "beast"
          ? 1.25
          : u.size || 1);
  const dead = u.hp <= 0;
  const t = u.walk || 0;
  const attacking = (u.attack || u.anim || 0) > 0;
  const hurt = u.hurt > 0;
  const skin =
    kind === "scout"
      ? "#8d9c65"
      : kind === "assassin"
        ? "#b5a69e"
        : side
          ? "#b2a087"
          : "#dbc4a0";
  const armor = side ? "#685150" : "#607f8a",
    armorLight = side ? "#968071" : "#a0b6b4",
    cloth = side ? (kind === "assassin" ? "#4f4659" : "#813e37") : "#315e71",
    gold = side ? "#ba9470" : "#d6b46d",
    ink = "#293732";
  c.save();
  c.translate(u.x, u.y);
  c.scale(size, size);
  if (dead) {
    c.globalAlpha = Math.max(0, (u.dead || 0) / 0.65);
    c.translate(0, 6);
    c.rotate((side ? -1 : 1) * (1 - (u.dead || 0) / 0.65) * 1.45);
  }
  ellipse(c, 0, 1, kind === "golem" ? 23 : 17, 5, "#182d2d33");
  if (!front) c.scale(-1, 1);
  c.translate(
    0,
    Math.sin(t * 2) * 1.2 +
      Math.sin((opts.time || 0) * 2.2 + (u.id || 0)) * 0.7,
  );
  if (hurt) c.globalAlpha = 0.65;
  if (kind === "beast") {
    poly(
      c,
      [-34, -20, -27, -39, 4, -45, 29, -36, 36, -20, 25, -9, -24, -9],
      "#645b50",
      ink,
      2,
    );
    for (const x of [-24, 20]) {
      line(
        c,
        x,
        -13,
        x + Math.sin(t + (x < 0 ? 0 : Math.PI)) * 7,
        0,
        "#403f38",
        7,
      );
    }
    poly(
      c,
      [18, -40, 32, -55, 44, -48, 48, -25, 36, -17, 25, -23],
      "#7e715e",
      ink,
      2,
    );
    poly(c, [31, -48, 23, -63, 36, -54], "#d9c69c", ink, 1);
    poly(c, [41, -49, 51, -62, 48, -44], "#d9c69c", ink, 1);
    ellipse(c, 40, -38, 3, 2, "#e8be69");
    poly(
      c,
      [-25, -36, -14, -52, 6, -50, 18, -37, 2, -23, -15, -26],
      cloth,
      ink,
      2,
    );
    line(c, -23, -43, 16, -43, gold, 3);
    if (u.commander) {
      flag(c, -6, -49, 1, u.walk, 0.65);
      poly(c, [-13, -56, -7, -78, 0, -71, 7, -80, 12, -57], gold, ink, 2);
    }
    c.restore();
    return;
  }
  if (kind === "golem") {
    for (const x of [-15, 13])
      poly(
        c,
        [x - 8, -16, x + 9, -15, x + 10 + Math.sin(t) * 2, 0, x - 10, 0],
        "#646e66",
        ink,
        2,
      );
    poly(
      c,
      [-23, -52, -12, -65, 16, -63, 28, -46, 21, -19, -17, -19, -28, -39],
      armor,
      ink,
      2,
    );
    poly(
      c,
      [-18, -49, -3, -57, 17, -51, 19, -34, 0, -27, -19, -34],
      armorLight,
      ink,
      1.5,
    );
    poly(
      c,
      [-8, -47, 3, -50, 10, -40, 2, -32, -8, -36],
      side ? "#c39763" : "#b7e1d1",
      gold,
      2,
    );
    for (const [x, a] of [
      [-30, -1],
      [28, 1],
    ]) {
      const ay = attacking ? -35 : -23;
      poly(
        c,
        [x - 10, -48, x + 11, -43, x + 12, ay + 14, x - 10, ay + 16],
        armor,
        ink,
        2,
      );
      poly(
        c,
        [x - 12, ay + 2, x + 11, ay, x + 15, ay + 17, x - 8, ay + 22],
        armorLight,
        ink,
        2,
      );
    }
    poly(
      c,
      [-13, -73, -9, -83, 13, -81, 19, -69, 13, -58, -10, -60],
      armorLight,
      ink,
      2,
    );
    line(c, -4, -69, 11, -69, side ? "#e6a177" : "#b5ece7", 3);
    c.restore();
    return;
  }
  const step = Math.sin(t) * 7;
  // Cloth cape, articulated boots and steel greaves.
  poly(
    c,
    [-10, -46, -24, -48, -30 - Math.sin(t) * 3, -9, -8, -14, 4, -28],
    cloth,
    ink,
    2,
  );
  poly(
    c,
    [-11, -23, -1, -22, -3 + step, -5, -12 + step, -5],
    side ? "#4e4640" : "#465952",
    ink,
    1.6,
  );
  poly(
    c,
    [2, -24, 12, -22, 13 - step, -5, 4 - step, -5],
    side ? "#4e4640" : "#465952",
    ink,
    1.6,
  );
  poly(c, [-13 + step, -9, -3 + step, -9, 2 + step, -1, -14 + step, -1], ink);
  poly(c, [3 - step, -9, 14 - step, -9, 19 - step, -1, 3 - step, -1], ink);
  if (kind === "priest") {
    poly(
      c,
      [-12, -46, 9, -46, 18, -7, -19, -7],
      side ? "#645c51" : "#e1d8b5",
      ink,
      2,
    );
    poly(c, [-6, -46, 2, -47, 7, -9, -4, -9], cloth);
    line(c, -14, -20, 14, -20, gold, 2);
  } else {
    poly(
      c,
      [-13, -49, 8, -50, 15, -27, 9, -19, -12, -20, -17, -32],
      armor,
      ink,
      2,
    );
    poly(c, [-8, -46, 6, -47, 10, -31, -8, -29], armorLight);
    poly(c, [-12, -27, 12, -27, 13, -18, -13, -18], cloth, ink, 1.5);
    line(c, -12, -24, 12, -24, gold, 3);
    rect(c, -2, -26, 5, 5, gold);
  }
  // Neck and head, with faction-specific helmets, crests and expressive eye slits.
  rect(c, -5, -57, 10, 12, skin);
  ellipse(c, 0, -61, 11, 13, skin);
  if (hero) {
    poly(
      c,
      [
        -13, -63, -12, -72, -5, -79, 8, -77, 14, -69, 9, -62, 4, -68, -6, -66,
        -7, -57,
      ],
      "#6a5841",
      ink,
      1.5,
    );
    poly(c, [-10, -69, -6, -76, 6, -74, 11, -70], gold);
    line(c, 4, -62, 9, -62, ink, 2);
    poly(c, [1, -54, 8, -56, 7, -50, 0, -49], "#887253");
  } else if (kind === "scout") {
    poly(c, [-8, -65, -25, -70, -14, -55], skin, ink, 1);
    poly(c, [8, -65, 24, -69, 14, -55], skin, ink, 1);
    poly(c, [-12, -67, -9, -75, 7, -74, 12, -66], cloth, ink, 1.5);
    line(c, 4, -61, 10, -63, "#d5db8e", 2);
  } else if (kind === "priest" || kind === "assassin" || kind === "bow") {
    poly(
      c,
      [
        -13, -57, -13, -68, -5, -78, 5, -77, 14, -67, 12, -54, 7, -57, 6, -67,
        -6, -65, -6, -57,
      ],
      cloth,
      ink,
      2,
    );
    line(c, 2, -61, 9, -61, side ? "#dbbe8f" : "#293a36", 2);
  } else {
    poly(
      c,
      [
        -13, -59, -13, -70, -6, -78, 7, -78, 14, -69, 14, -57, 6, -54, 6, -65,
        -7, -64, -6, -55,
      ],
      armorLight,
      ink,
      2,
    );
    line(c, -12, -64, 13, -65, armor, 3);
    line(c, 4, -62, 11, -62, ink, 2);
    if (kind === "knight" || kind === "brute" || kind === "shield") {
      poly(c, [-8, -76, -4, -91, 7, -89, 7, -77], cloth, ink, 1.5);
    }
  }
  const armSwing = attacking ? -1.2 : Math.sin(t) * 0.13;
  c.save();
  c.translate(9, -44);
  c.rotate(armSwing);
  line(c, 0, 0, 10, 12, armor, 8);
  line(c, 10, 12, 18, 8, skin, 6);
  ellipse(c, 18, 8, 4, 4, skin);
  if (kind === "bow") {
    c.strokeStyle = gold;
    c.lineWidth = 3;
    c.beginPath();
    c.arc(24, 3, 25, -1.2, 1.2);
    c.stroke();
    line(c, 33, -21, 33, 26, "#e4d7b2", 1);
    line(c, 13, 4, 43, 4, "#d7c59b", 2);
  } else if (kind === "priest") {
    line(c, 20, 25, 20, -39, "#7d6244", 4);
    ellipse(c, 20, -43, 6, 8, side ? "#b7bf83" : "#b9ded5");
    line(c, 10, -40, 30, -40, gold, 3);
    if (u.healAnim > 0) {
      ellipse(c, 20, -43, 13, 13, "#bbe4b733");
    }
  } else {
    line(c, 17, 8, 35, -1, gold, 4);
    poly(c, [24, 5, 18, -1, 44, -36, 49, -40, 48, -32], "#d9e1ce", ink, 1.3);
    line(c, 24, -1, 45, -34, "#f7f4df", 1);
    line(c, 17, 7, 12, 15, "#584b3c", 4);
  }
  c.restore();
  c.save();
  c.translate(-10, -43);
  c.rotate(Math.sin(t) * -0.12);
  line(c, 0, 0, -5, 18, armor, 8);
  if (kind === "shield" || kind === "knight") {
    poly(c, [-20, 3, 1, -1, 7, 9, 4, 34, -8, 42, -22, 30], cloth, ink, 2);
    poly(
      c,
      [-16, 7, -1, 4, 3, 12, 0, 29, -8, 35, -18, 26],
      armorLight,
      gold,
      2,
    );
    line(c, -7, 8, -7, 30, gold, 2);
    line(c, -17, 18, 2, 16, gold, 2);
  } else ellipse(c, -5, 18, 4, 4, skin);
  c.restore();
  if (hero && u.attack > 0) {
    const p = 1 - u.attack / 0.24;
    c.save();
    c.rotate(u.face + (front ? 0 : Math.PI));
    c.strokeStyle = "#fff2c1";
    c.lineWidth = 5 * (1 - p) + 1;
    c.globalAlpha = 1 - p * 0.7;
    c.beginPath();
    c.ellipse(18, -29, 64, 48, 0, -1.1 + p * 0.6, 1.15 + p * 0.6);
    c.stroke();
    c.strokeStyle = "#f3cd76";
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(18, -29, 58, 43, 0, -1 + p * 0.6, 1 + p * 0.6);
    c.stroke();
    c.restore();
  }
  c.restore();
}
function healthbar(c, u, hero = false) {
  if (u.hp <= 0) return;
  if (!hero && u.hp >= u.maxHp && !u.commander) return;
  const width = hero ? 59 : u.commander ? 76 : 32,
    y = u.y - (u.kind === "golem" ? 131 : hero ? 104 : 93) * (u.size || 1);
  rect(c, u.x - width / 2 - 1, y - 1, width + 2, 6, "#243b36");
  rect(
    c,
    u.x - width / 2,
    y,
    width * Math.max(0, u.hp / u.maxHp),
    4,
    u.side ? "#bb7763" : "#a8c9ab",
  );
}
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.c = canvas.getContext("2d");
    this.backgrounds = new Map();
    this.ambient = 0;
  }
  render(b, dt = 0) {
    const c = this.c;
    this.ambient += dt;
    if (!this.backgrounds.has(b.level))
      this.backgrounds.set(b.level, makeBackground(b.level));
    c.clearRect(0, 0, 1280, 560);
    c.save();
    if (b.shake)
      c.translate(
        (Math.random() - 0.5) * b.shake,
        (Math.random() - 0.5) * b.shake * 0.5,
      );
    c.drawImage(this.backgrounds.get(b.level), 0, 0);
    // Gentle high clouds and drifting seed motes provide atmosphere.
    for (let i = 0; i < 13; i++) {
      const x = (i * 107 + this.ambient * (4 + (i % 3))) % 1320,
        y = 65 + ((i * 31) % 200);
      ellipse(c, x, y + Math.sin(this.ambient + i) * 4, 1.2, 0.9, "#fff4ce88");
    }
    castle(c, 81, 480, 0, b.bases[0], this.ambient);
    castle(c, 1201, 480, 1, b.bases[1], this.ambient);
    for (const e of b.enemies) {
      if (e.wind > 0 && e.hp > 0) {
        c.strokeStyle = "#c76a4b";
        c.fillStyle = "#c16c3e22";
        c.lineWidth = 2;
        c.beginPath();
        c.ellipse(e.lockedX, e.lockedY, 40, 15, 0, 0, TAU);
        c.fill();
        c.stroke();
        c.strokeStyle = "#edc184";
        c.beginPath();
        c.ellipse(
          e.lockedX,
          e.lockedY,
          40,
          15,
          0,
          -Math.PI / 2,
          -Math.PI / 2 + TAU * (1 - e.wind / e.windup),
        );
        c.stroke();
      }
    }
    const top = [...b.enemies, b.hero].sort((a, d) => a.y - d.y);
    for (const u of top) {
      const isHero = u === b.hero;
      if (
        isHero &&
        u.invulnerable > 0 &&
        Math.floor(u.invulnerable * 18) % 2 === 0
      )
        c.globalAlpha = 0.65;
      character(c, u, { hero: isHero, time: this.ambient });
      c.globalAlpha = 1;
      healthbar(c, u, isHero);
      if (isHero && u.hp > 0) {
        poly(
          c,
          [u.x - 5, u.y + 12, u.x, u.y + 17, u.x + 5, u.y + 12, u.x, u.y + 8],
          "#d6bd78",
        );
      }
    }
    for (const u of [...b.units].sort((a, d) => a.y - d.y)) {
      character(c, u, { time: this.ambient });
      healthbar(c, u);
      if (u.commander && u.hp > 0) {
        c.font = "bold 10px Georgia";
        c.textAlign = "center";
        c.fillStyle = "#ffe0a6";
        c.fillText("MARSHAL VEYR", u.x, u.y - 112);
      }
    }
    for (const p of b.projectiles) {
      if (p.heal) {
        ellipse(c, p.x, p.y, 4, 4, "#d4efba");
        ellipse(c, p.x, p.y, 8, 8, "#cfedb333");
      } else {
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.angle || 0);
        line(c, -12, 0, 8, 0, p.color, 2);
        poly(c, [9, 0, 3, -3, 3, 3], p.color);
        line(c, -10, 0, -15, -4, p.color, 1);
        c.restore();
      }
    }
    for (const e of b.effects) {
      const p = 1 - e.life / e.maxLife;
      c.save();
      c.globalAlpha = Math.min(1, e.life * 3);
      if (e.kind === "text") {
        c.font = "bold 15px Georgia";
        c.textAlign = "center";
        c.lineWidth = 3;
        c.strokeStyle = "#35433ee0";
        c.strokeText(e.text, e.x, e.y);
        c.fillStyle = e.color;
        c.fillText(e.text, e.x, e.y);
      } else if (e.kind === "coin") {
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * TAU;
          ellipse(
            c,
            e.x + Math.cos(a) * p * 35,
            e.y + Math.sin(a) * p * 25 - p * 20,
            3,
            4,
            e.color,
          );
        }
      } else if (e.kind === "spawn" || e.kind === "heal") {
        c.strokeStyle = e.color;
        c.lineWidth = 2;
        c.beginPath();
        c.ellipse(e.x, e.y, 12 + p * 25, 5 + p * 8, 0, 0, TAU);
        c.stroke();
      } else if (e.kind === "trail") {
        ellipse(c, e.x, e.y, 12, 20, e.color + "33");
      } else {
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * TAU;
          line(
            c,
            e.x + Math.cos(a) * p * 15,
            e.y + Math.sin(a) * p * 15,
            e.x + Math.cos(a) * p * 32,
            e.y + Math.sin(a) * p * 32,
            e.color,
            2,
          );
        }
      }
      c.restore();
    }
    c.restore();
    // Embedded labels sit above the action, with subtle edge vignettes.
    const shade = c.createLinearGradient(0, 0, 0, 110);
    shade.addColorStop(0, "#152d2b55");
    shade.addColorStop(1, "#152d2b00");
    rect(c, 0, 0, 1280, 110, shade);
    c.textAlign = "left";
    c.font = "600 11px system-ui";
    c.letterSpacing = "2px";
    c.fillStyle = "#f5efd6";
    c.fillText("01  /  THE RIDGE", 24, 25);
    c.font = "11px system-ui";
    c.letterSpacing = "0px";
    c.fillStyle = "#eee9d0bb";
    c.fillText("YOUR HERO · FIGHT TO EARN GOLD", 24, 43);
    c.fillStyle = "#e8e6c8";
    c.font = "600 11px system-ui";
    c.letterSpacing = "2px";
    c.fillText("02  /  THE VALLEY", 24, 324);
    c.letterSpacing = "0px";
    c.font = "11px system-ui";
    c.fillStyle = "#e3dfc5aa";
    c.fillText("YOUR ARMY · RECRUIT TO ADVANCE", 24, 341);
    for (const [side, x, name] of [
      [0, 32, "DAWNWARD KEEP"],
      [1, 1100, "ASHEN STRONGHOLD"],
    ]) {
      rect(c, x, 518, 148, 4, "#24393477");
      rect(
        c,
        x,
        518,
        (148 * b.bases[side]) / 100,
        4,
        side ? "#c38b75" : "#bfd1b1",
      );
      c.fillStyle = "#e6e7ce";
      c.font = "600 9px system-ui";
      c.letterSpacing = "1px";
      c.fillText(name, x, 538);
      c.letterSpacing = "0px";
      c.textAlign = "right";
      c.fillText(Math.ceil(b.bases[side]) + " / 100", x + 148, 550);
      c.textAlign = "left";
    }
  }
}
export function portrait(canvas, kind, index = 0, side = 0) {
  const c = canvas.getContext("2d");
  const w = canvas.width,
    h = canvas.height;
  const g = c.createRadialGradient(
    w * 0.5,
    h * 0.35,
    0,
    w * 0.5,
    h * 0.5,
    w * 0.65,
  );
  g.addColorStop(0, side ? "#665b4a" : "#65736a");
  g.addColorStop(1, side ? "#35372f" : "#263c39");
  rect(c, 0, 0, w, h, g);
  c.save();
  c.translate(w * 0.5, h * 0.95);
  c.scale(w / 75, w / 75);
  character(c, { x: 0, y: 0, kind, side, hp: 1, walk: 0, face: 0, anim: 0 });
  c.restore();
}
