import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { makeBackground, character } from "../src/render.js";
import { Battle } from "../src/engine.js";
globalThis.document = { createElement: () => createCanvas(1280, 560) };
if (existsSync("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"))
  GlobalFonts.registerFromPath(
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    "CoverSerif",
  );
if (existsSync("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
  GlobalFonts.registerFromPath(
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "CoverSans",
  );
const canvas = createCanvas(960, 600),
  c = canvas.getContext("2d");
c.drawImage(makeBackground(0), 0, 0, 960, 600);
const b = new Battle(0, {}, 2);
c.save();
c.scale(0.75, 1.07);
for (let i = 0; i < 8; i++) {
  const u = b.addUnit(i % 6, 0);
  u.x = 280 + i * 38;
  u.y = 440 + (i % 3) * 23;
  character(c, u);
}
for (let i = 0; i < 7; i++) {
  const u = b.addUnit(i % 6, 1);
  u.x = 840 + i * 45;
  u.y = 440 + (i % 3) * 23;
  character(c, u);
}
c.restore();
const g = c.createLinearGradient(0, 0, 960, 0);
g.addColorStop(0, "#142d29fa");
g.addColorStop(0.45, "#19312bdf");
g.addColorStop(1, "#19312b11");
c.fillStyle = g;
c.fillRect(0, 0, 960, 600);
c.save();
c.translate(740, 480);
c.scale(4.2, 4.2);
character(
  c,
  { x: 0, y: 0, hp: 1, kind: "hero", side: 0, face: 0 },
  { hero: true, scale: 1 },
);
c.restore();
c.fillStyle = "#d8b579";
c.font = "12px CoverSans";
c.letterSpacing = "4px";
c.fillText("THE DAWNWARD CHRONICLES", 54, 86);
c.letterSpacing = "0px";
c.font = "68px CoverSerif";
c.fillStyle = "#f0ead2";
c.fillText("BLADES &", 48, 201);
c.fillText("BANNERS", 48, 283);
c.fillStyle = "#d8b579";
c.font = "17px CoverSans";
c.letterSpacing = "8px";
c.fillText("TWO FRONTS", 54, 330);
c.letterSpacing = "0px";
c.font = "17px CoverSans";
c.fillStyle = "#c6cfb5";
c.fillText("Wield the blade. Raise the banner.", 54, 391);
c.font = "11px CoverSans";
c.letterSpacing = "2px";
c.fillStyle = "#b8c6a8";
c.fillText("ONE HERO. TWO BATTLEFIELDS. YOUR KINGDOM.", 54, 553);
mkdirSync("public", { recursive: true });
writeFileSync("public/cover.webp", canvas.toBuffer("image/webp", 90));
console.log("Created public/cover.webp (960 × 600).");
