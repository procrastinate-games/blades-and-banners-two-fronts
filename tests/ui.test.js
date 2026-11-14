import test from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { createCanvas } from "@napi-rs/canvas";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const w = new Window({ url: "http://game.local" });
globalThis.window = w;
globalThis.document = w.document;
globalThis.requestAnimationFrame = () => 0;
w.document.body.innerHTML = '<div id="app"></div>';
w.HTMLCanvasElement.prototype.getContext = function () {
  if (!this._native) {
    this._native = createCanvas(this.width, this.height);
    const ctx = this._native.getContext("2d"),
      draw = ctx.drawImage.bind(ctx);
    ctx.drawImage = (img, ...args) => draw(img._native || img, ...args);
  }
  return this._native.getContext("2d");
};
const mainURL = new URL("../src/main.js", import.meta.url);
let source = await readFile(mainURL, "utf8");
source = source
  .replace(/import\s+["']\.\/style\.css["'];?\s*/, "")
  .replace(
    /from\s+["'](\.\/[^"']+)["']/g,
    (_, path) => `from "${new URL(path, mainURL).href}"`,
  )
  .replaceAll("import.meta.env.DEV", "true");
await import(
  "data:text/javascript;base64," + Buffer.from(source).toString("base64")
);
const click = (sel) => {
  const el = document.querySelector(sel);
  assert.ok(el, `Missing ${sel}`);
  el.click();
};
const state = () => JSON.parse(w.render_game_to_text());
test("title → campaign → real battle; recruitment, movement, pause and restart integrate", () => {
  assert.equal(state().mode, "home");
  click('[data-action="begin"]');
  assert.equal(state().mode, "campaign");
  click('[data-action="start"]');
  assert.equal(state().mode, "battle");
  assert.equal(state().gold, 75);
  click('[data-unit="0"]');
  assert.equal(state().gold, 50);
  assert.ok(state().units.some((u) => u.side === 0));
  const x = state().hero.x;
  w.dispatchEvent(new w.KeyboardEvent("keydown", { code: "KeyD" }));
  w.advanceTime(300);
  w.dispatchEvent(new w.KeyboardEvent("keyup", { code: "KeyD" }));
  assert.ok(state().hero.x > x);
  w.dispatchEvent(new w.KeyboardEvent("keydown", { code: "Escape" }));
  assert.ok(state().paused);
  const t = state().time;
  w.advanceTime(1000);
  assert.equal(state().time, t);
  click('[data-action="resume"]');
  assert.equal(state().paused, false);
  w.__qa.start(0);
  assert.equal(state().gold, 75);
});
test("results unlock next level, armory upgrades persist and settings work", () => {
  w.__qa.finish(true);
  assert.equal(state().mode, "results");
  assert.equal(state().save.unlocked, 2);
  assert.ok(state().save.marks >= 100);
  click('#screen [data-action="upgrades"]');
  click('[data-upgrade="0"]');
  assert.equal(state().save.upgrades.attack, 1);
  const saved = JSON.parse(
    w.localStorage.getItem("pg:blades-and-banners-two-fronts:save:v1"),
  );
  assert.equal(saved.upgrades.attack, 1);
  click('.header-tools [data-action="settings"]');
  const audio = document.querySelector("#audio-enabled");
  audio.click();
  assert.equal(
    JSON.parse(
      w.localStorage.getItem("pg:blades-and-banners-two-fronts:save:v1"),
    ).muted,
    true,
  );
});
test("touch joystick and attack/dodge buttons provide real input", () => {
  w.__qa.start(0);
  click('[data-unit="0"]');
  const joy = document.querySelector("#joystick");
  joy.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: 82,
    height: 82,
  });
  const px = state().hero.x;
  joy.dispatchEvent(
    new w.PointerEvent("pointerdown", {
      pointerId: 1,
      clientX: 76,
      clientY: 41,
    }),
  );
  w.advanceTime(150);
  joy.dispatchEvent(new w.PointerEvent("pointerup", { pointerId: 1 }));
  assert.ok(state().hero.x > px);
  const attack = document.querySelector("#attack-touch");
  attack.dispatchEvent(new w.Event("pointerdown"));
  w.advanceTime(40);
  assert.ok(state().hero.attack > 0);
  attack.dispatchEvent(new w.Event("pointerup"));
  const dodge = document.querySelector("#dash-touch");
  dodge.dispatchEvent(new w.Event("pointerdown"));
  const x = state().hero.x;
  w.advanceTime(100);
  dodge.dispatchEvent(new w.Event("pointerup"));
  assert.ok(state().hero.x > x);
  assert.ok(state().hero.dashCd > 0);
});
test("all five environments render through production drawing code", async () => {
  await mkdir("output/qa", { recursive: true });
  for (let i = 0; i < 5; i++) {
    w.__qa.start(i);
    w.advanceTime(100);
    const canvas = document.querySelector("#battlefield")._native;
    const bytes = canvas.toBuffer("image/png");
    assert.ok(bytes.length > 20000);
    await writeFile(`output/qa/battle-${i + 1}.png`, bytes);
  }
});
