export class Audio {
  constructor(settings) {
    this.settings = settings;
    this.ctx = null;
    this.timer = null;
    this.note = 0;
    this.last = {};
  }
  unlock() {
    if (!this.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      this.ctx = new C();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
    }
    this.ctx.resume().catch(() => {});
    this.sync();
    if (!this.timer) this.timer = setInterval(() => this.music(), 480);
  }
  sync() {
    if (this.master)
      this.master.gain.setTargetAtTime(
        this.settings.muted ? 0 : this.settings.volume,
        this.ctx.currentTime,
        0.03,
      );
  }
  tone(
    freq,
    duration = 0.1,
    type = "sine",
    gain = 0.15,
    delay = 0,
    end = null,
  ) {
    if (!this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime + delay,
      o = this.ctx.createOscillator(),
      g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (end)
      o.frequency.exponentialRampToValueAtTime(Math.max(20, end), t + duration);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + duration + 0.01);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }
  noise(duration = 0.1, gain = 0.1, filter = 2000) {
    if (!this.ctx || this.ctx.state !== "running") return;
    const n = this.ctx.sampleRate * duration,
      buffer = this.ctx.createBuffer(1, n, this.ctx.sampleRate),
      data = buffer.getChannelData(0);
    for (let i = 0; i < n; i++)
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    const s = this.ctx.createBufferSource(),
      f = this.ctx.createBiquadFilter(),
      g = this.ctx.createGain();
    s.buffer = buffer;
    f.type = "lowpass";
    f.frequency.value = filter;
    g.gain.value = gain;
    s.connect(f);
    f.connect(g);
    g.connect(this.master);
    s.start();
    s.onended = () => {
      s.disconnect();
      f.disconnect();
      g.disconnect();
    };
  }
  play(type) {
    if (!this.ctx || this.settings.muted) return;
    const now = this.ctx.currentTime;
    if (now - (this.last[type] ?? -10) < 0.075) return;
    this.last[type] = now;
    switch (type) {
      case "slash":
        this.noise(0.13, 0.22, 3800);
        this.tone(320, 0.08, "triangle", 0.07, 0, 100);
        break;
      case "impact":
        this.noise(0.09, 0.12, 950);
        this.tone(100, 0.1, "triangle", 0.1, 0, 45);
        break;
      case "unitDeath":
      case "enemyDeath":
        this.tone(130, 0.13, "triangle", 0.035, 0, 55);
        break;
      case "hurt":
      case "death":
        this.tone(180, 0.25, "sawtooth", 0.08, 0, 60);
        this.noise(0.15, 0.1, 800);
        break;
      case "coin":
        this.tone(1108, 0.13, "sine", 0.14);
        this.tone(1661, 0.2, "sine", 0.1, 0.08);
        break;
      case "recruit":
        this.tone(261, 0.13, "triangle", 0.15);
        this.tone(392, 0.22, "triangle", 0.1, 0.1);
        break;
      case "arrow":
        this.noise(0.08, 0.07, 4500);
        break;
      case "heal":
        this.tone(659, 0.35, "sine", 0.045);
        this.tone(880, 0.4, "sine", 0.04, 0.08);
        break;
      case "dash":
        this.noise(0.2, 0.1, 2400);
        break;
      case "baseHit":
        this.noise(0.3, 0.2, 400);
        this.tone(65, 0.3, "triangle", 0.13);
        break;
      case "victory":
        [261, 330, 392, 523, 659, 784].forEach((f, i) =>
          this.tone(f, 0.6, "triangle", 0.13, i * 0.15),
        );
        break;
      case "defeat":
        [220, 196, 164, 110].forEach((f, i) =>
          this.tone(f, 0.7, "triangle", 0.1, i * 0.23),
        );
        break;
      case "click":
        this.tone(430, 0.055, "triangle", 0.05);
        break;
    }
  }
  music() {
    if (
      !this.settings.music ||
      this.settings.muted ||
      !this.ctx ||
      this.ctx.state !== "running"
    )
      return;
    const notes = [
      146.83, 0, 220, 261.63, 0, 220, 196, 0, 130.81, 0, 196, 220, 0, 196,
      174.61, 0, 116.54, 0, 174.61, 220, 0, 261.63, 220, 0, 130.81, 0, 196,
      174.61, 0, 164.81, 146.83, 0,
    ];
    const f = notes[this.note % notes.length];
    if (f) this.tone(f * 2, 0.85, "sine", 0.035);
    if (this.note % 8 === 0) {
      this.tone(notes[this.note % notes.length] / 2, 3.6, "sine", 0.045);
      this.tone(73.42, 2, "triangle", 0.015);
    }
    this.note++;
  }
}
