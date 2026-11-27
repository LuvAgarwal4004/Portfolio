"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";

const CARD_W = 2.18;
const CARD_H = 3.52;
const CARD_R = 0.12;
const CARD_THICK = 0.022;

const TEX_W = 1090;
const TEX_H = 1760;

const NAV_LINKS = [
  { href: "/about", code: "001", label: "ABOUT" },
  { href: "/projects", code: "002", label: "PROJECTS" },
  { href: "/skills", code: "003", label: "SKILLS", active: true },
  { href: "/experience", code: "004", label: "EXPERIENCE" },
  { href: "/contact", code: "005", label: "CONTACT" },
];

const SKILLS_CARDS = [
  {
    id: "fullstack",
    numeral: "I",
    code: "01 / 03",
    arcana: "ARCANA I · THE SOVEREIGN LOOM",
    titleLines: ["FULLSTACK WEB", "DEVELOPER"],
    tools: [
      "REACT JS",
      "NODE JS",
      "MONGODB",
      "NEXT JS",
      "MERN STACK",
      "AI INTEGRATION",
      "GOOGLE ANALYTICS",
    ],
    body: "For a year now, I have been building and deploying production-level, fully secure, and custom-crafted websites. My experience spans designing complete interfaces, bringing customers' web designs to life, integrating AI features, patching bugs and security leaks common in vibe-coded apps, dealing with real-life clients, managing Google Analytics, and verifying sites with Google.",
    sigil: "web",
  },
  {
    id: "mobile",
    numeral: "II",
    code: "02 / 03",
    arcana: "ARCANA II · THE TWIN MIRROR",
    titleLines: ["CROSS-PLATFORM", "APP DEVELOPER"],
    tools: ["REACT NATIVE", "EXPO", "EXPO GO", "CLERK", "NODE JS"],
    body: "Having spent enough time mastering web development, transitioning from React to React Native came effortlessly—followed smoothly by learning Expo Go and Clerk. I built several apps, including an AI assistant that tracks my emails and Google Calendar and prioritizes emails around my pattern-recognition behavior. Many more apps lie ahead, because the stream of ideas never runs dry.",
    sigil: "mobile",
  },
  {
    id: "cybersecurity",
    numeral: "III",
    code: "03 / 03",
    arcana: "ARCANA III · THE SHADOW CIPHER",
    titleLines: ["CYBERSECURITY"],
    tools: ["OSINT", "NETWORKING", "EXIF METADATA", "GOOGLE DORKING"],
    body: "I have been growing a fierce fascination for this vast discipline. Even though the scale of it still leaves me overwhelmed, lost, and confused at times, my passion only flows deeper into this endless tunnel of knowledge. I have been studying cybersecurity independently for months—and while learning it free across the web is tough, I have grasped solid foundations and will not stop until my struggles pay off.",
    sigil: "cyber",
  },
];

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function seededRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

function makeChromeGrad(ctx, x0, y0, x1, y1, warm = false) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  if (warm) {
    g.addColorStop(0, "#756b58");
    g.addColorStop(0.28, "#b9ad94");
    g.addColorStop(0.54, "#857a64");
    g.addColorStop(0.78, "#cbc0a7");
    g.addColorStop(1, "#625949");
  } else {
    g.addColorStop(0, "#686d76");
    g.addColorStop(0.26, "#b2b8c2");
    g.addColorStop(0.5, "#7b8089");
    g.addColorStop(0.76, "#c2c7d0");
    g.addColorStop(1, "#5c6068");
  }
  return g;
}

function makeWoodTableTextures(maxAniso = 4) {
  const size = 1024;
  const cCanvas = document.createElement("canvas");
  cCanvas.width = size;
  cCanvas.height = size;
  const ctx = cCanvas.getContext("2d");

  const bCanvas = document.createElement("canvas");
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext("2d");

  const rCanvas = document.createElement("canvas");
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext("2d");

  const rand = seededRand(4409);

  // Rich weathered dark oak / walnut base.
  const baseGrad = ctx.createLinearGradient(0, 0, size, size);
  baseGrad.addColorStop(0, "#2f1e13");
  baseGrad.addColorStop(0.5, "#3b2618");
  baseGrad.addColorStop(1, "#24160d");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = "#808080";
  bCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = "#a8a8a8";
  rCtx.fillRect(0, 0, size, size);

  // Horizontal planks with alternating tones and deep chamfered joints.
  const plankCount = 5;
  const plankH = size / plankCount;
  const plankTints = [
    "rgba(72, 46, 28, 0.28)",
    "rgba(32, 18, 10, 0.30)",
    "rgba(88, 56, 34, 0.22)",
    "rgba(42, 26, 16, 0.25)",
    "rgba(66, 42, 24, 0.26)",
  ];

  for (let p = 0; p < plankCount; p++) {
    const py = p * plankH;
    ctx.fillStyle = plankTints[p % plankTints.length];
    ctx.fillRect(0, py, size, plankH);

    // Subtle sheen differences per board.
    rCtx.fillStyle = p % 2 === 0 ? "#9e9e9e" : "#b4b4b4";
    rCtx.fillRect(0, py, size, plankH);

    // Fine wood grain fibers running along plank length.
    for (let i = 0; i < 420; i++) {
      const gy = py + 6 + rand() * (plankH - 12);
      const thickness = 0.7 + rand() * 2.1;
      const dark = rand() > 0.45;
      ctx.strokeStyle = dark
        ? `rgba(18, 10, 6, ${0.14 + rand() * 0.24})`
        : `rgba(128, 86, 52, ${0.08 + rand() * 0.14})`;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      let curX = 0;
      ctx.moveTo(0, gy);
      const waveAmp = 2.5 + rand() * 6;
      const waveFreq = 0.005 + rand() * 0.012;
      const wavePhase = rand() * 12;
      while (curX <= size) {
        curX += 32;
        ctx.lineTo(curX, gy + Math.sin(curX * waveFreq + wavePhase) * waveAmp);
      }
      ctx.stroke();

      bCtx.strokeStyle = dark
        ? `rgba(92, 92, 92, ${0.22 + rand() * 0.2})`
        : `rgba(155, 155, 155, 0.16)`;
      bCtx.lineWidth = thickness * 0.9;
      bCtx.beginPath();
      ctx.moveTo(0, gy);
      for (let x = 32; x <= size; x += 32) {
        bCtx.lineTo(x, gy + Math.sin(x * waveFreq + wavePhase) * waveAmp);
      }
      bCtx.stroke();
    }

    // Organic dark wood knots.
    if (rand() > 0.25) {
      const kx = 120 + rand() * (size - 240);
      const ky = py + plankH * (0.28 + rand() * 0.44);
      const krx = 24 + rand() * 28;
      const kry = 10 + rand() * 12;
      const kg = ctx.createRadialGradient(kx, ky, 2, kx, ky, krx);
      kg.addColorStop(0, "rgba(18, 9, 4, 0.75)");
      kg.addColorStop(0.65, "rgba(42, 23, 12, 0.35)");
      kg.addColorStop(1, "rgba(42, 23, 12, 0)");
      ctx.save();
      ctx.translate(kx, ky);
      ctx.scale(1, kry / krx);
      ctx.translate(-kx, -ky);
      ctx.fillStyle = kg;
      ctx.beginPath();
      ctx.arc(kx, ky, krx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Deep plank seam groove.
    if (p > 0) {
      ctx.fillStyle = "rgba(8, 5, 3, 0.92)";
      ctx.fillRect(0, py - 3, size, 5);
      ctx.fillStyle = "rgba(126, 86, 54, 0.22)";
      ctx.fillRect(0, py + 2, size, 2);

      bCtx.fillStyle = "#161616";
      bCtx.fillRect(0, py - 3, size, 6);
      rCtx.fillStyle = "#ededed";
      rCtx.fillRect(0, py - 3, size, 6);
    }
  }

  // Aged table scratches, candle ash smudges, and faint gouges.
  for (let s = 0; s < 55; s++) {
    const sx = rand() * size;
    const sy = rand() * size;
    const len = 18 + rand() * 90;
    const ang = (rand() - 0.5) * 0.5;
    ctx.strokeStyle =
      rand() > 0.35 ? "rgba(12, 7, 4, 0.35)" : "rgba(155, 118, 82, 0.14)";
    ctx.lineWidth = 0.8 + rand() * 1.4;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
    ctx.stroke();

    bCtx.strokeStyle = "rgba(38, 38, 38, 0.45)";
    bCtx.lineWidth = 1.2;
    bCtx.beginPath();
    bCtx.moveTo(sx, sy);
    bCtx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
    bCtx.stroke();
  }

  // Soft outer oak vignette.
  const vig = ctx.createRadialGradient(
    size * 0.5,
    size * 0.52,
    size * 0.18,
    size * 0.5,
    size * 0.5,
    size * 0.72
  );
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(5,3,2,0.52)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, size, size);

  const map = new THREE.CanvasTexture(cCanvas);
  const bumpMap = new THREE.CanvasTexture(bCanvas);
  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = maxAniso;
  bumpMap.anisotropy = maxAniso;
  roughnessMap.anisotropy = maxAniso;
  return { map, bumpMap, roughnessMap };
}

function drawRoyalCorners(ctx, mCtx, bCtx, x, y, w, h, strokeColor) {
  const corners = [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ];
  for (const [cx, cy, dx, dy] of corners) {
    const drawCornerOn = (targetCtx, color, lw) => {
      targetCtx.save();
      targetCtx.translate(cx, cy);
      targetCtx.scale(dx, dy);
      targetCtx.strokeStyle = color;
      targetCtx.lineWidth = lw;
      targetCtx.beginPath();
      targetCtx.moveTo(0, 84);
      targetCtx.lineTo(0, 14);
      targetCtx.quadraticCurveTo(0, 0, 14, 0);
      targetCtx.lineTo(84, 0);
      targetCtx.stroke();

      targetCtx.beginPath();
      targetCtx.moveTo(16, 62);
      targetCtx.lineTo(16, 16);
      targetCtx.lineTo(62, 16);
      targetCtx.stroke();

      // Ornate royal diamond rosette at corner intersection.
      targetCtx.fillStyle = color;
      targetCtx.beginPath();
      targetCtx.moveTo(16, 4);
      targetCtx.lineTo(28, 16);
      targetCtx.lineTo(16, 28);
      targetCtx.lineTo(4, 16);
      targetCtx.closePath();
      targetCtx.fill();

      // Regal crescent tick inside corner.
      targetCtx.beginPath();
      targetCtx.arc(34, 34, 10, Math.PI * 0.9, Math.PI * 2.1);
      targetCtx.stroke();
      targetCtx.restore();
    };

    drawCornerOn(ctx, strokeColor, 3.2);
    if (mCtx) drawCornerOn(mCtx, "#e6e6e6", 3.5);
    if (bCtx) drawCornerOn(bCtx, "#e2e2e2", 3.4);
  }
}

function drawCrownCrest(ctx, mCtx, bCtx, cx, cy, scale = 1, chromeGrad) {
  const drawTo = (target, strokeCol, fillCol) => {
    target.save();
    target.translate(cx, cy);
    target.scale(scale, scale);
    target.strokeStyle = strokeCol;
    target.fillStyle = fillCol;
    target.lineWidth = 3;
    target.beginPath();
    target.moveTo(-46, 18);
    target.lineTo(-56, -14);
    target.lineTo(-22, 2);
    target.lineTo(0, -26);
    target.lineTo(22, 2);
    target.lineTo(56, -14);
    target.lineTo(46, 18);
    target.closePath();
    target.fill();
    target.stroke();

    // Base band & three royal jewels.
    target.fillRect(-48, 22, 96, 8);
    for (const jx of [-56, 0, 56]) {
      const jy = jx === 0 ? -32 : -19;
      target.beginPath();
      target.arc(jx, jy, 4.5, 0, Math.PI * 2);
      target.fill();
    }
    target.restore();
  };

  drawTo(ctx, chromeGrad, "rgba(180, 172, 152, 0.25)");
  if (mCtx) drawTo(mCtx, "#ededed", "#c6c6c6");
  if (bCtx) drawTo(bCtx, "#eaeaea", "#d4d4d4");
}

function drawSkillSigil(ctx, mCtx, bCtx, sigilType, cx, cy) {
  const chrome = makeChromeGrad(ctx, cx - 180, cy - 160, cx + 180, cy + 160, false);
  const warmChrome = makeChromeGrad(ctx, cx - 160, cy - 140, cx + 160, cy + 140, true);

  const renderArtwork = (tCtx, silverCol, goldCol, faintCol) => {
    tCtx.save();
    tCtx.translate(cx, cy);

    // Subtle cosmic halo ring common to all three Royal Arcana cards.
    tCtx.strokeStyle = faintCol;
    tCtx.lineWidth = 1.8;
    tCtx.beginPath();
    tCtx.arc(0, 0, 168, 0, Math.PI * 2);
    tCtx.stroke();

    tCtx.setLineDash([7, 9]);
    tCtx.strokeStyle = silverCol;
    tCtx.lineWidth = 1.6;
    tCtx.beginPath();
    tCtx.arc(0, 0, 146, 0, Math.PI * 2);
    tCtx.stroke();
    tCtx.setLineDash([]);

    // 12 zodiacal hour ticks.
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      tCtx.strokeStyle = i % 3 === 0 ? goldCol : faintCol;
      tCtx.lineWidth = i % 3 === 0 ? 3 : 1.5;
      tCtx.beginPath();
      tCtx.moveTo(Math.cos(a) * 150, Math.sin(a) * 150);
      tCtx.lineTo(Math.cos(a) * (i % 3 === 0 ? 174 : 164), Math.sin(a) * (i % 3 === 0 ? 174 : 164));
      tCtx.stroke();
    }

    if (sigilType === "web") {
      // ARCANA I: Astrolabe Globe + Sovereign Code Rune.
      tCtx.strokeStyle = silverCol;
      tCtx.lineWidth = 3.2;
      tCtx.beginPath();
      tCtx.arc(0, 8, 96, 0, Math.PI * 2);
      tCtx.stroke();

      // Tilted orbital longitude rings.
      for (const tilt of [-0.55, 0.55]) {
        tCtx.save();
        tCtx.rotate(tilt);
        tCtx.strokeStyle = goldCol;
        tCtx.lineWidth = 2.4;
        tCtx.beginPath();
        tCtx.ellipse(0, 8, 128, 42, 0, 0, Math.PI * 2);
        tCtx.stroke();
        tCtx.restore();
      }

      // Latitude chords & geometric core diamond.
      tCtx.strokeStyle = faintCol;
      tCtx.lineWidth = 2;
      tCtx.beginPath();
      tCtx.ellipse(0, 8, 96, 36, 0, 0, Math.PI * 2);
      tCtx.stroke();

      // Crisp etched `< / >` filigree rune inside central diamond.
      tCtx.strokeStyle = silverCol;
      tCtx.lineWidth = 5;
      tCtx.lineCap = "round";
      tCtx.lineJoin = "round";
      // `<`
      tCtx.beginPath();
      tCtx.moveTo(-26, -12);
      tCtx.lineTo(-48, 8);
      tCtx.lineTo(-26, 28);
      tCtx.stroke();
      // `>`
      tCtx.beginPath();
      tCtx.moveTo(26, -12);
      tCtx.lineTo(48, 8);
      tCtx.lineTo(26, 28);
      tCtx.stroke();
      // `/`
      tCtx.strokeStyle = goldCol;
      tCtx.beginPath();
      tCtx.moveTo(11, -18);
      tCtx.lineTo(-11, 34);
      tCtx.stroke();

      // Royal node stars.
      for (const [nx, ny] of [
        [0, -90],
        [-96, 8],
        [96, 8],
        [0, 104],
      ]) {
        tCtx.fillStyle = goldCol;
        tCtx.beginPath();
        tCtx.arc(nx, ny, 5.5, 0, Math.PI * 2);
        tCtx.fill();
      }
    } else if (sigilType === "mobile") {
      // ARCANA II: Twin Obsidian Mirrors + AI Pattern Winged Compass.
      // Mirror frames (two offset royal portable tablets).
      tCtx.strokeStyle = faintCol;
      tCtx.lineWidth = 2.6;
      roundRectPath(tCtx, -82, -88, 96, 158, 12);
      tCtx.stroke();

      tCtx.strokeStyle = silverCol;
      tCtx.lineWidth = 3.6;
      roundRectPath(tCtx, -14, -68, 96, 158, 12);
      tCtx.stroke();

      // Inner AI pattern constellation linking the two frames.
      tCtx.strokeStyle = goldCol;
      tCtx.lineWidth = 2.6;
      const pts = [
        [-48, -32],
        [34, -22],
        [-22, 12],
        [52, 22],
        [-36, 48],
        [24, 58],
      ];
      tCtx.beginPath();
      tCtx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        tCtx.lineTo(pts[i][0], pts[i][1]);
      }
      tCtx.stroke();

      for (const [px, py] of pts) {
        tCtx.fillStyle = silverCol;
        tCtx.beginPath();
        tCtx.arc(px, py, 5.5, 0, Math.PI * 2);
        tCtx.fill();
      }

      // Winged arc symmetry outside frames.
      for (const sx of [-1, 1]) {
        tCtx.strokeStyle = goldCol;
        tCtx.lineWidth = 2.2;
        tCtx.beginPath();
        tCtx.moveTo(sx * 92, -16);
        tCtx.quadraticCurveTo(sx * 142, -52, sx * 124, -4);
        tCtx.quadraticCurveTo(sx * 142, 16, sx * 92, 24);
        tCtx.stroke();
      }
    } else {
      // ARCANA III: The Shadow Cipher — Veiled Eye inside Encrypted Keyhole Escutcheon.
      // Ornate Keyhole silhouette outer shield.
      tCtx.strokeStyle = goldCol;
      tCtx.lineWidth = 3.4;
      tCtx.beginPath();
      tCtx.arc(0, -18, 62, Math.PI * 0.72, Math.PI * 2.28);
      tCtx.lineTo(38, 102);
      tCtx.lineTo(-38, 102);
      tCtx.closePath();
      tCtx.stroke();

      // All-seeing Silver Eye inside top ring.
      tCtx.strokeStyle = silverCol;
      tCtx.lineWidth = 3.4;
      tCtx.beginPath();
      tCtx.moveTo(-48, -18);
      tCtx.quadraticCurveTo(0, -54, 48, -18);
      tCtx.quadraticCurveTo(0, 18, -48, -18);
      tCtx.stroke();

      tCtx.strokeStyle = goldCol;
      tCtx.lineWidth = 2.6;
      tCtx.beginPath();
      tCtx.arc(0, -18, 16, 0, Math.PI * 2);
      tCtx.stroke();

      tCtx.fillStyle = silverCol;
      tCtx.beginPath();
      tCtx.arc(0, -18, 6, 0, Math.PI * 2);
      tCtx.fill();

      // Crossed cipher keys behind keyhole.
      for (const s of [-1, 1]) {
        tCtx.save();
        tCtx.rotate(s * 0.62);
        tCtx.strokeStyle = faintCol;
        tCtx.lineWidth = 2.6;
        tCtx.beginPath();
        tCtx.moveTo(0, -124);
        tCtx.lineTo(0, 122);
        tCtx.stroke();
        tCtx.beginPath();
        tCtx.arc(0, -134, 12, 0, Math.PI * 2);
        tCtx.stroke();
        tCtx.beginPath();
        tCtx.moveTo(0, 96);
        tCtx.lineTo(14, 96);
        tCtx.moveTo(0, 110);
        tCtx.lineTo(18, 110);
        tCtx.stroke();
        tCtx.restore();
      }
    }

    tCtx.restore();
  };

  renderArtwork(ctx, chrome, warmChrome, "rgba(176, 182, 192, 0.36)");
  if (mCtx) renderArtwork(mCtx, "#f0f0f0", "#dedede", "#828282");
  if (bCtx) renderArtwork(bCtx, "#e6e6e6", "#d8d8d8", "#a4a4a4");
}

function drawWrappedLines(ctx, text, x, y, maxW, lineH) {
  const words = text.split(" ");
  let line = "";
  let curY = y;
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, curY);
      line = words[i];
      curY += lineH;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, curY);
    curY += lineH;
  }
  return curY;
}

function makeTarotBackTextures(maxAniso = 4) {
  const w = TEX_W;
  const h = TEX_H;

  const cCanvas = document.createElement("canvas");
  cCanvas.width = w;
  cCanvas.height = h;
  const ctx = cCanvas.getContext("2d");

  const bCanvas = document.createElement("canvas");
  bCanvas.width = w;
  bCanvas.height = h;
  const bCtx = bCanvas.getContext("2d");

  const rCanvas = document.createElement("canvas");
  rCanvas.width = w;
  rCanvas.height = h;
  const rCtx = rCanvas.getContext("2d");

  const mCanvas = document.createElement("canvas");
  mCanvas.width = w;
  mCanvas.height = h;
  const mCtx = mCanvas.getContext("2d");

  const rand = seededRand(7719);

  // Dark obsidian-chrome enamel card back base.
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, h * 0.62);
  bg.addColorStop(0, "#242730");
  bg.addColorStop(0.55, "#171920");
  bg.addColorStop(1, "#0d0e13");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  bCtx.fillStyle = "#767676";
  bCtx.fillRect(0, 0, w, h);

  rCtx.fillStyle = "#b8b8b8";
  rCtx.fillRect(0, 0, w, h);

  mCtx.fillStyle = "#202020";
  mCtx.fillRect(0, 0, w, h);

  // Subtle smoked metallic cross-hatch engraving inside back field.
  ctx.save();
  roundRectPath(ctx, 84, 84, w - 168, h - 168, 22);
  ctx.clip();
  ctx.strokeStyle = "rgba(162, 168, 180, 0.08)";
  ctx.lineWidth = 1.2;
  for (let d = -h; d < w + h; d += 34) {
    ctx.beginPath();
    ctx.moveTo(d, 0);
    ctx.lineTo(d + h, h);
    ctx.moveTo(d + h, 0);
    ctx.lineTo(d, h);
    ctx.stroke();
  }
  ctx.restore();

  const silverChrome = makeChromeGrad(ctx, 60, 60, w - 60, h - 60, false);
  const antiqueGoldChrome = makeChromeGrad(ctx, 140, 180, w - 140, h - 180, true);

  // Nested dull-chromic borders.
  const drawFrame = (tCtx, cOuter, cInner, lw1, lw2) => {
    tCtx.strokeStyle = cOuter;
    tCtx.lineWidth = lw1;
    roundRectPath(tCtx, 46, 46, w - 92, h - 92, 34);
    tCtx.stroke();

    tCtx.strokeStyle = cInner;
    tCtx.lineWidth = lw2;
    roundRectPath(tCtx, 74, 74, w - 148, h - 148, 24);
    tCtx.stroke();

    tCtx.strokeStyle = cOuter;
    tCtx.lineWidth = 2.2;
    roundRectPath(tCtx, 102, 102, w - 204, h - 204, 16);
    tCtx.stroke();
  };
  drawFrame(ctx, silverChrome, antiqueGoldChrome, 5, 3);
  drawFrame(mCtx, "#ececec", "#e2e2e2", 5.5, 3.5);
  drawFrame(bCtx, "#e6e6e6", "#d8d8d8", 5, 3);
  drawFrame(rCtx, "#555555", "#606060", 5.5, 3.5);

  drawRoyalCorners(ctx, mCtx, bCtx, 114, 114, w - 228, h - 228, silverChrome);

  // Symmetric top and bottom royal crowns (reversible tarot back).
  drawCrownCrest(ctx, mCtx, bCtx, w * 0.5, 255, 1.35, antiqueGoldChrome);
  ctx.save();
  ctx.translate(w * 0.5, h - 255);
  ctx.rotate(Math.PI);
  ctx.translate(-w * 0.5, -(h - 255));
  drawCrownCrest(ctx, null, null, w * 0.5, h - 255, 1.35, antiqueGoldChrome);
  ctx.restore();

  // Mirror top/bottom crown metallic & bump stamps cleanly.
  mCtx.save();
  mCtx.translate(w * 0.5, h - 255);
  mCtx.rotate(Math.PI);
  mCtx.translate(-w * 0.5, -(h - 255));
  drawCrownCrest(mCtx, null, null, w * 0.5, h - 255, 1.35, "#ececec");
  mCtx.restore();

  bCtx.save();
  bCtx.translate(w * 0.5, h - 255);
  bCtx.rotate(Math.PI);
  bCtx.translate(-w * 0.5, -(h - 255));
  drawCrownCrest(bCtx, null, null, w * 0.5, h - 255, 1.35, "#e6e6e6");
  bCtx.restore();

  // Central Haunted Royal Compass Star / Esoteric Mandala.
  const drawMandala = (tCtx, cMain, cAccent, cSoft) => {
    tCtx.save();
    tCtx.translate(w * 0.5, h * 0.5);

    for (const r of [310, 265, 185, 108]) {
      tCtx.strokeStyle = r === 265 || r === 108 ? cAccent : cMain;
      tCtx.lineWidth = r === 310 ? 4 : 2.4;
      tCtx.beginPath();
      tCtx.arc(0, 0, r, 0, Math.PI * 2);
      tCtx.stroke();
    }

    // 16-ray compass star.
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      const major = i % 2 === 0;
      const outer = major ? 305 : 225;
      tCtx.strokeStyle = major ? cMain : cAccent;
      tCtx.lineWidth = major ? 3.2 : 1.8;
      tCtx.beginPath();
      tCtx.moveTo(Math.cos(ang) * 44, Math.sin(ang) * 44);
      tCtx.lineTo(Math.cos(ang) * outer, Math.sin(ang) * outer);
      tCtx.stroke();
    }

    // Interlocking royal diamond lattice.
    for (const rot of [0, Math.PI / 4]) {
      tCtx.save();
      tCtx.rotate(rot);
      tCtx.strokeStyle = cSoft;
      tCtx.lineWidth = 2.6;
      tCtx.strokeRect(-142, -142, 284, 284);
      tCtx.restore();
    }

    // Central occult eye crest.
    tCtx.strokeStyle = cAccent;
    tCtx.lineWidth = 4;
    tCtx.beginPath();
    tCtx.moveTo(-64, 0);
    tCtx.quadraticCurveTo(0, -48, 64, 0);
    tCtx.quadraticCurveTo(0, 48, -64, 0);
    tCtx.stroke();

    tCtx.fillStyle = cMain;
    tCtx.beginPath();
    tCtx.arc(0, 0, 17, 0, Math.PI * 2);
    tCtx.fill();

    // Vertical spine filigree lines.
    tCtx.strokeStyle = cAccent;
    tCtx.lineWidth = 2.5;
    tCtx.beginPath();
    tCtx.moveTo(0, -320);
    tCtx.lineTo(0, -520);
    tCtx.moveTo(0, 320);
    tCtx.lineTo(0, 520);
    tCtx.stroke();

    tCtx.restore();
  };

  drawMandala(ctx, silverChrome, antiqueGoldChrome, "rgba(188, 194, 204, 0.52)");
  drawMandala(mCtx, "#ececec", "#e2e2e2", "#b8b8b8");
  drawMandala(bCtx, "#e6e6e6", "#d8d8d8", "#c2c2c2");
  drawMandala(rCtx, "#545454", "#626262", "#787878");

  // Fine tarnished patina & micro-scratches so chrome reads antique, not plastic.
  for (let i = 0; i < 480; i++) {
    const px = rand() * w;
    const py = rand() * h;
    ctx.fillStyle = `rgba(10, 11, 14, ${0.06 + rand() * 0.16})`;
    ctx.fillRect(px, py, 2 + rand() * 5, 1 + rand() * 3);
    rCtx.fillStyle = `rgba(210, 210, 210, ${0.18 + rand() * 0.2})`;
    rCtx.fillRect(px, py, 3 + rand() * 5, 2 + rand() * 3);
  }

  const map = new THREE.CanvasTexture(cCanvas);
  const bumpMap = new THREE.CanvasTexture(bCanvas);
  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  const metalnessMap = new THREE.CanvasTexture(mCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  [map, bumpMap, roughnessMap, metalnessMap].forEach((t) => {
    t.anisotropy = maxAniso;
  });
  return { map, bumpMap, roughnessMap, metalnessMap };
}

function makeTarotFrontTextures(skill, displayFont, bodyFont, maxAniso = 4) {
  const w = TEX_W;
  const h = TEX_H;

  const cCanvas = document.createElement("canvas");
  cCanvas.width = w;
  cCanvas.height = h;
  const ctx = cCanvas.getContext("2d");

  const bCanvas = document.createElement("canvas");
  bCanvas.width = w;
  bCanvas.height = h;
  const bCtx = bCanvas.getContext("2d");

  const rCanvas = document.createElement("canvas");
  rCanvas.width = w;
  rCanvas.height = h;
  const rCtx = rCanvas.getContext("2d");

  const mCanvas = document.createElement("canvas");
  mCanvas.width = w;
  mCanvas.height = h;
  const mCtx = mCanvas.getContext("2d");

  const drawCardFace = (dispFont, txtFont) => {
    const rand = seededRand(901 + skill.numeral.length * 131);

    // 1. Dark smoked-obsidian / pewter outer border shell.
    const outerBg = ctx.createLinearGradient(0, 0, w, h);
    outerBg.addColorStop(0, "#15171d");
    outerBg.addColorStop(0.5, "#1b1e26");
    outerBg.addColorStop(1, "#101217");
    ctx.fillStyle = outerBg;
    ctx.fillRect(0, 0, w, h);

    bCtx.fillStyle = "#808080";
    bCtx.fillRect(0, 0, w, h);

    // Non-glare velvet-paper roughness default; chrome filigree gets lower roughness.
    rCtx.fillStyle = "#c8c8c8";
    rCtx.fillRect(0, 0, w, h);

    mCtx.fillStyle = "#181818";
    mCtx.fillRect(0, 0, w, h);

    const silverChrome = makeChromeGrad(ctx, 40, 40, w - 40, h - 40, false);
    const warmChrome = makeChromeGrad(ctx, 80, 100, w - 80, h - 100, true);

    // Outer double beveled metallic card rims.
    ctx.strokeStyle = silverChrome;
    ctx.lineWidth = 4.5;
    roundRectPath(ctx, 38, 38, w - 76, h - 76, 32);
    ctx.stroke();

    ctx.strokeStyle = warmChrome;
    ctx.lineWidth = 2.4;
    roundRectPath(ctx, 58, 58, w - 116, h - 116, 24);
    ctx.stroke();

    mCtx.strokeStyle = "#e8e8e8";
    mCtx.lineWidth = 5;
    roundRectPath(mCtx, 38, 38, w - 76, h - 76, 32);
    mCtx.stroke();
    roundRectPath(mCtx, 58, 58, w - 116, h - 116, 24);
    mCtx.stroke();

    bCtx.strokeStyle = "#dedede";
    bCtx.lineWidth = 4.5;
    roundRectPath(bCtx, 38, 38, w - 76, h - 76, 32);
    bCtx.stroke();

    rCtx.strokeStyle = "#525252";
    rCtx.lineWidth = 5;
    roundRectPath(rCtx, 38, 38, w - 76, h - 76, 32);
    rCtx.stroke();

    drawRoyalCorners(ctx, mCtx, bCtx, 74, 74, w - 148, h - 148, silverChrome);

    // 2. Top Arcana numeral & subtitle strip.
    ctx.fillStyle = "#d9d0bd";
    ctx.font = `700 26px ${dispFont}, Georgia, serif`;
    ctx.textAlign = "left";
    ctx.fillText(`TAROT · ${skill.numeral}`, 114, 114);

    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(212, 198, 170, 0.78)";
    ctx.font = `600 22px ${dispFont}, Georgia, serif`;
    ctx.fillText(skill.code, w - 114, 114);

    ctx.textAlign = "center";
    ctx.fillStyle = "#b8a888";
    ctx.font = `600 20px ${dispFont}, Georgia, serif`;
    ctx.fillText(skill.arcana, w * 0.5, 114);

    // 3. Top Gothic Occult Illustration Sanctuary Arch.
    const archX = 96;
    const archY = 136;
    const archW = w - 192;
    const archH = 424;

    ctx.save();
    roundRectPath(ctx, archX, archY, archW, archH, 18);
    const archGrad = ctx.createRadialGradient(
      w * 0.5,
      archY + archH * 0.48,
      20,
      w * 0.5,
      archY + archH * 0.5,
      archW * 0.65
    );
    archGrad.addColorStop(0, "#1c202c");
    archGrad.addColorStop(0.6, "#12141c");
    archGrad.addColorStop(1, "#0a0b10");
    ctx.fillStyle = archGrad;
    ctx.fill();
    ctx.clip();

    // Subtle engraved geometric sunbeams inside dark sanctuary.
    ctx.strokeStyle = "rgba(182, 188, 200, 0.08)";
    ctx.lineWidth = 1.4;
    for (let r = 0; r < 18; r++) {
      const ang = (r / 18) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, archY + archH * 0.52);
      ctx.lineTo(
        w * 0.5 + Math.cos(ang) * 480,
        archY + archH * 0.52 + Math.sin(ang) * 480
      );
      ctx.stroke();
    }

    drawCrownCrest(ctx, mCtx, bCtx, w * 0.5, archY + 46, 0.72, warmChrome);
    drawSkillSigil(ctx, mCtx, bCtx, skill.sigil, w * 0.5, archY + archH * 0.55);
    ctx.restore();

    // Arch metallic frame border.
    ctx.strokeStyle = warmChrome;
    ctx.lineWidth = 3.2;
    roundRectPath(ctx, archX, archY, archW, archH, 18);
    ctx.stroke();

    mCtx.strokeStyle = "#dcdcdc";
    mCtx.lineWidth = 3.2;
    roundRectPath(mCtx, archX, archY, archW, archH, 18);
    mCtx.stroke();

    rCtx.strokeStyle = "#565656";
    rCtx.lineWidth = 3.4;
    roundRectPath(rCtx, archX, archY, archW, archH, 18);
    rCtx.stroke();

    // 4. Lower Tarot Cartouche Plate: Tarot Heading Band + Highlighted Tech Stack + Crisp Reading Body.
    // Dark royal engraved nameplate for the Tarot Skill Heading.
    const headX = 96;
    const headY = 582;
    const headW = w - 192;
    const headH = 148;

    const plateGrad = ctx.createLinearGradient(headX, headY, headX + headW, headY + headH);
    plateGrad.addColorStop(0, "#191c24");
    plateGrad.addColorStop(0.5, "#232630");
    plateGrad.addColorStop(1, "#161820");
    ctx.fillStyle = plateGrad;
    roundRectPath(ctx, headX, headY, headW, headH, 14);
    ctx.fill();

    ctx.strokeStyle = silverChrome;
    ctx.lineWidth = 3.2;
    ctx.stroke();
    ctx.strokeStyle = "rgba(182, 166, 132, 0.55)";
    ctx.lineWidth = 1.4;
    roundRectPath(ctx, headX + 8, headY + 8, headW - 16, headH - 16, 10);
    ctx.stroke();

    mCtx.strokeStyle = "#e4e4e4";
    mCtx.lineWidth = 3.4;
    roundRectPath(mCtx, headX, headY, headW, headH, 14);
    mCtx.stroke();

    // Tarot Heading in large authentic Cinzel display font.
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const isTwoLines = skill.titleLines.length > 1;
    const titleFontSize = isTwoLines ? 44 : 54;
    ctx.font = `700 ${titleFontSize}px ${dispFont}, Georgia, serif`;

    // Engraved dark bevel + bright silver-ivory letters.
    const drawTitleLine = (txt, ty) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.fillText(txt, w * 0.5 + 2, ty + 3);
      ctx.fillStyle = "#f2ead9";
      ctx.fillText(txt, w * 0.5, ty);
    };

    if (isTwoLines) {
      drawTitleLine(skill.titleLines[0], headY + 51);
      drawTitleLine(skill.titleLines[1], headY + 101);
    } else {
      drawTitleLine(skill.titleLines[0], headY + headH * 0.51);
    }
    ctx.textBaseline = "alphabetic";

    // Rivets at left and right ends of heading banner.
    for (const rx of [headX + 34, headX + headW - 34]) {
      ctx.fillStyle = warmChrome;
      ctx.beginPath();
      ctx.arc(rx, headY + headH * 0.5, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. High-Contrast Aged Silver-Vellum Reading Tablet below the Heading.
    const bodyBoxX = 96;
    const bodyBoxY = 750;
    const bodyBoxW = w - 192;
    const bodyBoxH = 918;

    const vellum = ctx.createRadialGradient(
      w * 0.5,
      bodyBoxY + bodyBoxH * 0.48,
      40,
      w * 0.5,
      bodyBoxY + bodyBoxH * 0.5,
      bodyBoxH * 0.68
    );
    vellum.addColorStop(0, "#e2dccf");
    vellum.addColorStop(0.65, "#cfc6b4");
    vellum.addColorStop(1, "#ada28e");
    ctx.fillStyle = vellum;
    roundRectPath(ctx, bodyBoxX, bodyBoxY, bodyBoxW, bodyBoxH, 16);
    ctx.fill();

    // Subtle paper grain fibers inside vellum tablet only (matte roughness, zero glare).
    ctx.save();
    roundRectPath(ctx, bodyBoxX, bodyBoxY, bodyBoxW, bodyBoxH, 16);
    ctx.clip();
    for (let f = 0; f < 900; f++) {
      const fx = bodyBoxX + rand() * bodyBoxW;
      const fy = bodyBoxY + rand() * bodyBoxH;
      ctx.fillStyle =
        rand() > 0.5
          ? `rgba(76, 62, 42, ${0.03 + rand() * 0.05})`
          : `rgba(250, 245, 236, ${0.04 + rand() * 0.06})`;
      ctx.fillRect(fx, fy, 1 + rand() * 5, 1 + rand() * 2);
    }
    ctx.restore();

    // Matte high-roughness finish on reading tablet so overhead lights never wash out text!
    rCtx.fillStyle = "#dfdfdf";
    roundRectPath(rCtx, bodyBoxX, bodyBoxY, bodyBoxW, bodyBoxH, 16);
    rCtx.fill();
    mCtx.fillStyle = "#080808";
    roundRectPath(mCtx, bodyBoxX, bodyBoxY, bodyBoxW, bodyBoxH, 16);
    mCtx.fill();

    // Metallic border around reading tablet.
    ctx.strokeStyle = warmChrome;
    ctx.lineWidth = 3.2;
    roundRectPath(ctx, bodyBoxX, bodyBoxY, bodyBoxW, bodyBoxH, 16);
    ctx.stroke();

    ctx.strokeStyle = "rgba(42, 34, 24, 0.36)";
    ctx.lineWidth = 1.4;
    roundRectPath(ctx, bodyBoxX + 12, bodyBoxY + 12, bodyBoxW - 24, bodyBoxH - 24, 10);
    ctx.stroke();

    // 6. Highlighted Technologies / Tools Section inside top of tablet.
    ctx.textAlign = "center";
    ctx.fillStyle = "#4d3820";
    ctx.font = `700 20px ${dispFont}, Georgia, serif`;
    ctx.fillText("◆  CONFIDENT ARSENAL & CORE TOOLS  ◆", w * 0.5, bodyBoxY + 48);

    // Measure & wrap pill chips cleanly centered inside bodyBoxW - 60.
    const pillFont = `700 24px ${dispFont}, Arial, sans-serif`;
    ctx.font = pillFont;
    const chipPadX = 22;
    const chipH = 48;
    const chipGapX = 14;
    const chipGapY = 14;
    const maxRowW = bodyBoxW - 68;

    const rows = [];
    let currentRow = [];
    let currentW = 0;

    for (const tool of skill.tools) {
      const chipW = Math.ceil(ctx.measureText(tool).width) + chipPadX * 2;
      const needed = currentRow.length === 0 ? chipW : currentW + chipGapX + chipW;
      if (needed > maxRowW && currentRow.length > 0) {
        rows.push({ items: currentRow, totalW: currentW });
        currentRow = [{ label: tool, width: chipW }];
        currentW = chipW;
      } else {
        currentRow.push({ label: tool, width: chipW });
        currentW = needed;
      }
    }
    if (currentRow.length > 0) {
      rows.push({ items: currentRow, totalW: currentW });
    }

    let chipY = bodyBoxY + 72;
    for (const row of rows) {
      let curX = w * 0.5 - row.totalW * 0.5;
      for (const item of row.items) {
        // Dark metallic iron plaque badge with warm tarnished bronze/silver border.
        const cg = ctx.createLinearGradient(curX, chipY, curX, chipY + chipH);
        cg.addColorStop(0, "#242731");
        cg.addColorStop(1, "#14161c");
        ctx.fillStyle = cg;
        roundRectPath(ctx, curX, chipY, item.width, chipH, 8);
        ctx.fill();

        ctx.strokeStyle = warmChrome;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        mCtx.strokeStyle = "#dcdcdc";
        mCtx.lineWidth = 2.4;
        roundRectPath(mCtx, curX, chipY, item.width, chipH, 8);
        mCtx.stroke();

        ctx.fillStyle = "#f4ecdc";
        ctx.font = pillFont;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.label, curX + item.width * 0.5, chipY + chipH * 0.52);
        ctx.textBaseline = "alphabetic";

        curX += item.width + chipGapX;
      }
      chipY += chipH + chipGapY;
    }

    // Ornamental divider between highlighted stack & body description.
    const divY = chipY + 12;
    ctx.strokeStyle = "rgba(62, 46, 28, 0.35)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(bodyBoxX + 46, divY);
    ctx.lineTo(w * 0.5 - 32, divY);
    ctx.moveTo(w * 0.5 + 32, divY);
    ctx.lineTo(bodyBoxX + bodyBoxW - 46, divY);
    ctx.stroke();

    ctx.fillStyle = "#5a4226";
    ctx.beginPath();
    ctx.moveTo(w * 0.5, divY - 8);
    ctx.lineTo(w * 0.5 + 10, divY);
    ctx.lineTo(w * 0.5, divY + 8);
    ctx.lineTo(w * 0.5 - 10, divY);
    ctx.closePath();
    ctx.fill();

    // 7. Main Description Body (large high-contrast editorial serif, zero clipping).
    const bodyStartX = bodyBoxX + 44;
    const bodyMaxW = bodyBoxW - 88;
    const bodyStartY = divY + 54;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(18, 16, 15, 0.96)";
    ctx.font = `600 34px ${txtFont}, Georgia, serif`;
    drawWrappedLines(ctx, skill.body, bodyStartX, bodyStartY, bodyMaxW, 50);

    // Subtle footer seal inside bottom border margin.
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(218, 204, 178, 0.72)";
    ctx.font = `600 18px ${dispFont}, Georgia, serif`;
    ctx.fillText("◆  LUV AGARWAL · HAND-FORGED SKILL ARCANA  ◆", w * 0.5, h - 72);
  };

  drawCardFace(displayFont, bodyFont);

  const map = new THREE.CanvasTexture(cCanvas);
  const bumpMap = new THREE.CanvasTexture(bCanvas);
  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  const metalnessMap = new THREE.CanvasTexture(mCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  [map, bumpMap, roughnessMap, metalnessMap].forEach((t) => {
    t.anisotropy = maxAniso;
  });

  return {
    map,
    bumpMap,
    roughnessMap,
    metalnessMap,
    redrawWithFonts(newDispFont, newBodyFont) {
      drawCardFace(newDispFont, newBodyFont);
      map.needsUpdate = true;
      bumpMap.needsUpdate = true;
      roughnessMap.needsUpdate = true;
      metalnessMap.needsUpdate = true;
    },
  };
}

function createRoundedCardShape(w, h, r) {
  const hw = w * 0.5;
  const hh = h * 0.5;
  const s = new THREE.Shape();
  s.moveTo(-hw + r, -hh);
  s.lineTo(hw - r, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + r);
  s.lineTo(hw, hh - r);
  s.quadraticCurveTo(hw, hh, hw - r, hh);
  s.lineTo(-hw + r, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - r);
  s.lineTo(-hw, -hh + r);
  s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  return s;
}

function normalizeShapeUVs(geo, w, h) {
  const pos = geo.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uvs[i * 2] = x / w + 0.5;
    uvs[i * 2 + 1] = y / h + 0.5;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
}

function makeDustSprite() {
  const s = 64;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(s / 2, s / 2, 1, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255, 240, 210, 0.92)");
  g.addColorStop(0.4, "rgba(255, 224, 175, 0.35)");
  g.addColorStop(1, "rgba(255, 224, 175, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function SkillsView({
  displayFontFamily = "Cinzel, Georgia, serif",
  bodyFontFamily = "Cormorant Garamond, Georgia, serif",
}) {
  const mountRef = useRef(null);
  const cursorRef = useRef(null);
  const veilRef = useRef(null);

  const controlsRef = useRef({
    switchCard: () => {},
    selectCard: () => {},
    setZoom: () => {},
    toggleMacroZoom: () => {},
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [macroZoomed, setMacroZoomed] = useState(false);
  const [cursorHovered, setCursorHovered] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    const veil = veilRef.current;
    if (!mount) return;

    let disposed = false;

    if (veil) {
      veil.style.opacity = "1";
      requestAnimationFrame(() => {
        if (veil) veil.style.opacity = "0";
      });
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060505);
    scene.fog = new THREE.FogExp2(0x070505, 0.042);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.2, 50);
    const lookTarget = new THREE.Vector3(0, 0.04, 0.14);
    const camAnchor = new THREE.Vector3(0, 5.4, 4.4);
    camera.position.copy(camAnchor);
    camera.lookAt(lookTarget);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.85));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.className = "skills-three-canvas";
    mount.appendChild(renderer.domElement);

    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 4);

    // Warm, balanced horror study lighting so wood grain, dull chrome, and text are always crisp.
    const ambient = new THREE.AmbientLight(0xf3e8d4, 0.62);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xffeacc, 0x20150d, 0.54);
    scene.add(hemi);

    const keyLight = new THREE.SpotLight(0xffdfb0, 56, 26, 0.92, 0.85, 1.15);
    keyLight.position.set(-4.2, 7.8, 3.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 1.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.bias = -0.00045;
    keyLight.shadow.normalBias = 0.015;
    keyLight.target.position.set(0, 0, 0.12);
    scene.add(keyLight);
    scene.add(keyLight.target);

    // Cool moonlight steel rim so the dull-chromic silver bevels and filigree glint delicately.
    const chromeRim = new THREE.DirectionalLight(0xa8bdd8, 0.92);
    chromeRim.position.set(4.5, 5.2, -3.5);
    scene.add(chromeRim);

    // Interactive warm lantern light tracking cursor.
    const lantern = new THREE.SpotLight(0xffdfad, 36, 18, 0.48, 0.92, 1.1);
    lantern.position.set(0.6, 5.6, 2.2);
    lantern.target.position.set(0, 0.2, 0.2);
    scene.add(lantern);
    scene.add(lantern.target);

    // Warm antique candle glow from upper-left desk corner.
    const candleGlow = new THREE.PointLight(0xff8e42, 4.4, 11, 1.4);
    candleGlow.position.set(-4.5, 0.82, -2.0);
    scene.add(candleGlow);

    // 1. Realistic Wooden Table on XZ plane (y = 0).
    const woodTextures = makeWoodTableTextures(maxAniso);
    const tableGeo = new THREE.BoxGeometry(19.5, 0.26, 14.5);
    const tableMat = new THREE.MeshStandardMaterial({
      map: woodTextures.map,
      bumpMap: woodTextures.bumpMap,
      bumpScale: 0.025,
      roughnessMap: woodTextures.roughnessMap,
      roughness: 0.84,
      metalness: 0.08,
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(0, -0.13, 0);
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // Subtle brass & wax candle prop resting cleanly in upper-left background.
    const propGroup = new THREE.Group();
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0x5c4f3d,
      metalness: 0.84,
      roughness: 0.36,
    });
    const waxMat = new THREE.MeshStandardMaterial({
      color: 0xd9cbb0,
      roughness: 0.72,
      metalness: 0.04,
      emissive: 0x3b1f09,
      emissiveIntensity: 0.28,
    });
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.06, 24), dishMat);
    dish.position.set(-4.5, 0.03, -2.0);
    dish.castShadow = true;
    dish.receiveShadow = true;
    propGroup.add(dish);

    const candleBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.23, 0.56, 20),
      waxMat
    );
    candleBody.position.set(-4.5, 0.34, -2.0);
    candleBody.castShadow = true;
    candleBody.receiveShadow = true;
    propGroup.add(candleBody);

    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffc670 });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 12), flameMat);
    flame.position.set(-4.5, 0.69, -2.0);
    propGroup.add(flame);

    // Small tarnished silver occult coin in upper-right distance.
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.03, 24), dishMat);
    coin.position.set(4.15, 0.015, -1.75);
    coin.castShadow = true;
    coin.receiveShadow = true;
    propGroup.add(coin);
    scene.add(propGroup);

    // 2. Shared Rounded Tarot Geometry & Card Back Texture.
    const cardShape = createRoundedCardShape(CARD_W, CARD_H, CARD_R);
    const frontGeo = new THREE.ShapeGeometry(cardShape, 10);
    normalizeShapeUVs(frontGeo, CARD_W, CARD_H);

    const backGeo = frontGeo.clone();
    const coreGeo = new THREE.ExtrudeGeometry(cardShape, {
      depth: CARD_THICK - 0.006,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: 2,
      curveSegments: 10,
    });
    coreGeo.translate(0, 0, -(CARD_THICK - 0.006) * 0.5);

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x8e9198,
      metalness: 0.88,
      roughness: 0.28,
    });

    const backTextures = makeTarotBackTextures(maxAniso);
    const backMat = new THREE.MeshStandardMaterial({
      map: backTextures.map,
      bumpMap: backTextures.bumpMap,
      bumpScale: 0.014,
      roughnessMap: backTextures.roughnessMap,
      roughness: 0.72,
      metalnessMap: backTextures.metalnessMap,
      metalness: 0.84,
    });

    // 3. Build 3D Tarot Card Rigs with 3 nested groups for clean Euler-free flips.
    const frontTextureSets = [];
    const cardHitMeshes = [];
    const cards = SKILLS_CARDS.map((skill, idx) => {
      const frontTex = makeTarotFrontTextures(
        skill,
        displayFontFamily,
        bodyFontFamily,
        maxAniso
      );
      frontTextureSets.push(frontTex);

      const frontMat = new THREE.MeshStandardMaterial({
        map: frontTex.map,
        bumpMap: frontTex.bumpMap,
        bumpScale: 0.012,
        roughnessMap: frontTex.roughnessMap,
        roughness: 0.86,
        metalnessMap: frontTex.metalnessMap,
        metalness: 0.78,
      });

      const outerGroup = new THREE.Group();
      const pitchGroup = new THREE.Group();
      const flipGroup = new THREE.Group();

      const rimMesh = new THREE.Mesh(coreGeo, rimMat);
      rimMesh.castShadow = true;
      rimMesh.receiveShadow = true;
      rimMesh.userData = { cardIndex: idx };

      const frontMesh = new THREE.Mesh(frontGeo, frontMat);
      frontMesh.position.z = CARD_THICK * 0.5 + 0.0008;
      frontMesh.castShadow = false;
      frontMesh.receiveShadow = true;
      frontMesh.userData = { cardIndex: idx };

      const backMesh = new THREE.Mesh(backGeo, backMat);
      backMesh.rotation.y = Math.PI;
      backMesh.position.z = -(CARD_THICK * 0.5 + 0.0008);
      backMesh.castShadow = false;
      backMesh.receiveShadow = true;
      backMesh.userData = { cardIndex: idx };

      flipGroup.add(rimMesh, frontMesh, backMesh);
      pitchGroup.add(flipGroup);
      outerGroup.add(pitchGroup);
      scene.add(outerGroup);

      cardHitMeshes.push(frontMesh, backMesh);

      return {
        index: idx,
        outerGroup,
        pitchGroup,
        flipGroup,
        springBounce: 0,
        springVel: 0,
      };
    });

    // Redraw card canvases once Google Fonts finish resolving.
    if (document.fonts && document.fonts.ready) {
      Promise.all([
        document.fonts.load(`700 44px ${displayFontFamily}`).catch(() => null),
        document.fonts.load(`600 34px ${bodyFontFamily}`).catch(() => null),
        document.fonts.ready,
      ]).then(() => {
        if (disposed) return;
        frontTextureSets.forEach((ft) =>
          ft.redrawWithFonts(displayFontFamily, bodyFontFamily)
        );
      });
    }

    // 4. Floating Ambient Dust Motes in Study Air.
    const dustCount = 85;
    const dustPos = new Float32Array(dustCount * 3);
    const dustSpd = new Float32Array(dustCount);
    const dRand = seededRand(8123);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (dRand() - 0.5) * 9.5;
      dustPos[i * 3 + 1] = 0.25 + dRand() * 3.8;
      dustPos[i * 3 + 2] = (dRand() - 0.5) * 6.5;
      dustSpd[i] = 0.06 + dRand() * 0.14;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustSprite = makeDustSprite();
    const dustMat = new THREE.PointsMaterial({
      map: dustSprite,
      size: 0.065,
      transparent: true,
      opacity: 0.36,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.Points(dustGeo, dustMat));

    // 5. Framing, Table Resting Slots, & Physical Switch/Zoom State.
    let activeIdx = 0;
    let isZoomed = false;
    let zoomProgress = 0;
    let macroTarget = 0;
    let macroProgress = 0;

    let tableCamDist = 7.9;
    let baseInspectDist = 6.3;
    let camPitch = -0.89; // Looking slightly down across the wooden table.

    const camForward = new THREE.Vector3();
    const camRight = new THREE.Vector3();
    const camUp = new THREE.Vector3();

    const getRestSlot = (cardIdx, curActive) => {
      const n = cards.length;
      const offset = (cardIdx - curActive + n) % n;
      if (offset === 0) {
        // Active hero card rests ON TOP of the lower cards (higher elevation above oak table), face UP!
        return {
          x: 0,
          y: 0.145,
          z: 0.18,
          yaw: 0.015,
          pitch: -Math.PI * 0.5 + 0.024,
          flipY: 0,
        };
      }
      if (offset === 1) {
        // Right card underneath, face DOWN!
        return {
          x: 1.66,
          y: 0.042,
          z: 0.16,
          yaw: -0.17,
          pitch: -Math.PI * 0.5,
          flipY: Math.PI,
        };
      }
      if (offset === n - 1) {
        // Left card underneath, face DOWN!
        return {
          x: -1.66,
          y: 0.022,
          z: 0.15,
          yaw: 0.17,
          pitch: -Math.PI * 0.5,
          flipY: -Math.PI,
        };
      }
      // Supports >3 skills cleanly tucked beneath wings.
      const wingSide = offset <= n * 0.5 ? 1 : -1;
      return {
        x: wingSide * 2.15,
        y: 0.012,
        z: 0.14,
        yaw: -wingSide * 0.24,
        pitch: -Math.PI * 0.5,
        flipY: wingSide * Math.PI,
      };
    };

    // Place initial resting cards cleanly.
    const currentPose = cards.map((_, idx) => ({ ...getRestSlot(idx, 0) }));

    // Track switch flip animation between active cards using live snapshots so zoomed/unzoomed transitions never pop.
    const switchAnim = {
      active: false,
      t: 1,
      dir: 1,
      oldIdx: 0,
      newIdx: 0,
      fromSlots: [],
      toSlots: [],
    };

    const normalizeFlipNear = (angle, ref) => {
      let a = angle;
      while (a - ref > Math.PI) a -= Math.PI * 2;
      while (a - ref < -Math.PI) a += Math.PI * 2;
      return a;
    };

    const startSwitch = (dir) => {
      const n = cards.length;
      const prevActive = activeIdx;
      const nextActive = (activeIdx + dir + n) % n;
      activeIdx = nextActive;
      setActiveIndex(nextActive);

      const fromSlots = cards.map((card, idx) => ({
        x: card.outerGroup.position.x,
        y: card.outerGroup.position.y,
        z: card.outerGroup.position.z,
        yaw: card.outerGroup.rotation.y,
        pitch: card.pitchGroup.rotation.x,
        flipY: card.flipGroup.rotation.y,
        idx,
      }));
      const toSlots = cards.map((_, idx) => ({ ...getRestSlot(idx, nextActive) }));

      // Outgoing card turns face-down cleanly (-dir * PI); incoming unrolls to 0 (face-up).
      fromSlots[prevActive].flipY = normalizeFlipNear(fromSlots[prevActive].flipY, 0);
      toSlots[prevActive].flipY = -dir * Math.PI;

      const incomingTargetBias = dir * Math.PI;
      fromSlots[nextActive].flipY = normalizeFlipNear(
        fromSlots[nextActive].flipY,
        incomingTargetBias
      );
      if (Math.abs(fromSlots[nextActive].flipY) < 0.15) {
        fromSlots[nextActive].flipY = incomingTargetBias;
      }
      toSlots[nextActive].flipY = 0;

      cards.forEach((_, idx) => {
        if (idx !== prevActive && idx !== nextActive) {
          fromSlots[idx].flipY = normalizeFlipNear(fromSlots[idx].flipY, dir * Math.PI);
          toSlots[idx].flipY = dir * Math.PI;
        }
      });

      switchAnim.active = true;
      switchAnim.t = 0;
      switchAnim.dir = dir;
      switchAnim.oldIdx = prevActive;
      switchAnim.newIdx = nextActive;
      switchAnim.fromSlots = fromSlots;
      switchAnim.toSlots = toSlots;
    };

    const setZoomState = (nextZoom) => {
      isZoomed = nextZoom;
      setZoomed(nextZoom);
      if (!nextZoom) {
        macroTarget = 0;
        setMacroZoomed(false);
      }
      cards[activeIdx].springVel += nextZoom ? 1.8 : -2.6;
    };

    const selectSpecificCard = (targetIdx) => {
      if (targetIdx === activeIdx) {
        setZoomState(!isZoomed);
        return;
      }
      const n = cards.length;
      const forwardDist = (targetIdx - activeIdx + n) % n;
      const backwardDist = (activeIdx - targetIdx + n) % n;
      startSwitch(forwardDist <= backwardDist ? 1 : -1);
    };

    controlsRef.current = {
      switchCard: startSwitch,
      selectCard: selectSpecificCard,
      setZoom: setZoomState,
      toggleMacroZoom: () => {
        if (!isZoomed) {
          setZoomState(true);
          macroTarget = 0.72;
          setMacroZoomed(true);
          return;
        }
        const nextMacro = macroTarget > 0.25 ? 0 : 0.75;
        macroTarget = nextMacro;
        setMacroZoomed(nextMacro > 0.25);
      },
    };

    // Raycaster & pre-allocated temporary vectors for zero per-frame allocations.
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2(0, 0);
    const clickNdcVec = new THREE.Vector2(0, 0);
    const tablePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const tableDirNorm = new THREE.Vector3(0, 5.1, 4.1).normalize();
    const camBaseTemp = new THREE.Vector3();
    const rayHit = new THREE.Vector3();
    const springSpot = new THREE.Vector3(0, 0.2, 0.2);
    const desiredSpot = new THREE.Vector3(0, 0.2, 0.2);
    const spotVel = new THREE.Vector3();

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      const aspect = width / height;
      camera.aspect = aspect;
      camera.fov = aspect < 0.9 ? 46 : 38;
      camera.updateProjectionMatrix();

      const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
      const distH = 2.82 / tanHalfFov;
      const distW = 3.32 / (tanHalfFov * Math.max(aspect, 0.42));
      tableCamDist = Math.max(distH, distW);

      const inspectH = 2.28 / tanHalfFov;
      const inspectW = 1.32 / (tanHalfFov * Math.max(aspect, 0.42));
      baseInspectDist = Math.max(inspectH, inspectW);

      // Update camera base orientation vector along normalized angle (0, 5.1, 4.1).
      camAnchor.copy(lookTarget).addScaledVector(tableDirNorm, tableCamDist);
      camera.position.copy(camAnchor);
      camera.lookAt(lookTarget);

      camera.updateMatrixWorld();
      camPitch = camera.rotation.x;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.85));
      renderer.setSize(width, height);
    };

    const handlePointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerNdc.x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      pointerNdc.y = clamp(-((event.clientY - rect.top) / rect.height) * 2 + 1, -1, 1);

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      }

      raycaster.setFromCamera(pointerNdc, camera);
      const cardHits = raycaster.intersectObjects(cardHitMeshes, false);

      if (raycaster.ray.intersectPlane(tablePlane, rayHit)) {
        desiredSpot.set(clamp(rayHit.x, -4.5, 4.5), 0.18, clamp(rayHit.z, -3.5, 3.5));
      }

      const targetEl = event.target instanceof Element ? event.target : null;
      const domInteractive = Boolean(targetEl?.closest("a, button"));
      const sideEdge = Math.abs(pointerNdc.x) > (isZoomed ? 0.27 : 0.25);
      setCursorHovered(domInteractive || cardHits.length > 0 || sideEdge);
    };

    const handlePointerDown = (event) => {
      if (event.button !== 0) return;
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const clickNdcX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      const clickNdcY = clamp(-((event.clientY - rect.top) / rect.height) * 2 + 1, -1, 1);
      clickNdcVec.set(clickNdcX, clickNdcY);
      raycaster.setFromCamera(clickNdcVec, camera);

      const cardHits = raycaster.intersectObjects(cardHitMeshes, false);

      if (isZoomed) {
        const onOuterEdge = Math.abs(clickNdcX) > 0.42;
        if (onOuterEdge) {
          startSwitch(clickNdcX > 0 ? 1 : -1);
          return;
        }
        if (cardHits.length > 0 && cardHits[0].object.userData.cardIndex === activeIdx) {
          // Clicking the centered zoomed card lays it gently back down on the wooden table.
          setZoomState(false);
          return;
        }
        if (Math.abs(clickNdcX) > 0.18) {
          startSwitch(clickNdcX > 0 ? 1 : -1);
          return;
        }
        setZoomState(false);
        return;
      }

      // Tabletop Overview clicks:
      if (cardHits.length > 0) {
        const hitIdx = cardHits[0].object.userData.cardIndex;
        if (hitIdx === activeIdx) {
          setZoomState(true);
          return;
        }
        const n = cards.length;
        const isRight = hitIdx === (activeIdx + 1) % n;
        startSwitch(isRight ? 1 : -1);
        return;
      }

      if (clickNdcX > 0.22) {
        startSwitch(1);
      } else if (clickNdcX < -0.22) {
        startSwitch(-1);
      }
    };

    const handleWheel = (event) => {
      event.preventDefault();
      if (!isZoomed && event.deltaY < 0) {
        setZoomState(true);
        return;
      }
      if (isZoomed) {
        const next = clamp(macroTarget - event.deltaY * 0.0014, 0, 1);
        macroTarget = next;
        setMacroZoomed(next > 0.25);
        if (next <= 0.001 && event.deltaY > 18) {
          setZoomState(false);
        }
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") startSwitch(1);
      else if (event.key === "ArrowLeft") startSwitch(-1);
      else if (event.key === "Escape" && isZoomed) setZoomState(false);
      else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setZoomState(!isZoomed);
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    renderer.domElement.addEventListener("pointerdown", handlePointerDown, { passive: true });
    renderer.domElement.addEventListener("wheel", handleWheel, { passive: false });
    resize();

    let frameId = 0;
    let prevTime = performance.now();
    let entryProgress = 0;

    const inspectWorld = new THREE.Vector3();
    const restWorld = new THREE.Vector3();

    const animate = (now) => {
      const dt = Math.min((now - prevTime) / 1000, 0.032);
      prevTime = now;
      const elapsed = now / 1000;

      entryProgress = Math.min(1, entryProgress + dt * 1.55);
      const entryEase = 1 - Math.pow(1 - entryProgress, 3);

      // Smooth cursor lantern spring.
      const sx = 120 * (desiredSpot.x - springSpot.x) - 17 * spotVel.x;
      const sy = 120 * (desiredSpot.z - springSpot.z) - 17 * spotVel.y;
      spotVel.x += sx * dt;
      spotVel.y += sy * dt;
      springSpot.x += spotVel.x * dt;
      springSpot.z += spotVel.y * dt;

      // Candle subtle warm flicker.
      candleGlow.intensity =
        4.3 + Math.sin(elapsed * 7.2) * 0.35 + Math.sin(elapsed * 23) * 0.14;
      flame.scale.set(
        1 + Math.sin(elapsed * 16) * 0.08,
        1 + Math.sin(elapsed * 19) * 0.14,
        1
      );

      // Smooth zoom and macro-inspection transitions.
      const zoomGoal = isZoomed ? 1 : 0;
      zoomProgress += (zoomGoal - zoomProgress) * Math.min(1, dt * 6.5);
      macroProgress += (macroTarget - macroProgress) * Math.min(1, dt * 6.5);

      // Gentle camera parallax & entrance push-in.
      const dynamicCamDist =
        tableCamDist * (1 - zoomProgress * 0.05) + (1 - entryEase) * 1.35;
      camBaseTemp.copy(lookTarget).addScaledVector(tableDirNorm, dynamicCamDist);
      camera.position.x = camBaseTemp.x + pointerNdc.x * 0.24;
      camera.position.y = camBaseTemp.y + pointerNdc.y * 0.14;
      camera.position.z = camBaseTemp.z;
      camera.lookAt(lookTarget);
      camera.updateMatrixWorld();

      camForward.set(0, 0, -1).applyQuaternion(camera.quaternion);
      camRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
      camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
      camPitch = camera.rotation.x;

      lantern.position.set(
        springSpot.x * 0.35,
        4.9 + zoomProgress * 0.8,
        2.1 + springSpot.z * 0.25
      );
      lantern.target.position.set(
        springSpot.x * (1 - zoomProgress * 0.72),
        0.18 + zoomProgress * 1.6,
        springSpot.z * (1 - zoomProgress * 0.72)
      );
      lantern.target.updateMatrixWorld();

      // Advance active 3D flip switch choreography.
      let arcLiftOld = 0;
      let arcLiftNew = 0;
      let flipSwell = 0;
      let switchEaseT = 1;
      if (switchAnim.active) {
        switchAnim.t = Math.min(1, switchAnim.t + dt * 1.48);
        const rawT = switchAnim.t;
        // Quintic ease in-out for physical weight & snap.
        switchEaseT =
          rawT < 0.5
            ? 16 * rawT * rawT * rawT * rawT * rawT
            : 1 - Math.pow(-2 * rawT + 2, 5) * 0.5;

        for (let i = 0; i < cards.length; i++) {
          const from = switchAnim.fromSlots[i];
          const to = switchAnim.toSlots[i];
          currentPose[i].x = THREE.MathUtils.lerp(from.x, to.x, switchEaseT);
          currentPose[i].y = THREE.MathUtils.lerp(from.y, to.y, switchEaseT);
          currentPose[i].z = THREE.MathUtils.lerp(from.z, to.z, switchEaseT);
          currentPose[i].yaw = THREE.MathUtils.lerp(from.yaw, to.yaw, switchEaseT);
          currentPose[i].pitch = THREE.MathUtils.lerp(from.pitch, to.pitch, switchEaseT);
          currentPose[i].flipY = THREE.MathUtils.lerp(from.flipY, to.flipY, switchEaseT);
        }

        const bell = Math.sin(rawT * Math.PI);
        arcLiftOld = bell * 0.42;
        arcLiftNew = bell * 1.18;
        flipSwell = bell * Math.exp(-rawT * 0.8) * 0.14;

        if (switchAnim.t >= 1) {
          switchAnim.active = false;
          cards[switchAnim.newIdx].springVel += 2.6;
          cards[switchAnim.oldIdx].springVel -= 2.2;
        }
      }

      // Compute zoomed inspection target perch floating cleanly perpendicular in front of camera.
      const activeDist = baseInspectDist * (1 - macroProgress * 0.36);
      const panScale = 0.08 + macroProgress * 0.92;
      inspectWorld
        .copy(camera.position)
        .addScaledVector(camForward, activeDist)
        .addScaledVector(camRight, -pointerNdc.x * macroProgress * 0.55)
        .addScaledVector(camUp, -0.05 - pointerNdc.y * macroProgress * 0.95);

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const pose = currentPose[i];

        // Spring rebound physics on landing/clicking.
        const springF = -135 * card.springBounce - 11.5 * card.springVel;
        card.springVel += springF * dt;
        card.springBounce += card.springVel * dt;

        const isActiveCard = i === activeIdx;
        const isOutgoingCard = switchAnim.active && i === switchAnim.oldIdx;
        const isIncomingCard = switchAnim.active && i === switchAnim.newIdx;

        let worldX = pose.x;
        let worldY = pose.y + card.springBounce * 0.03;
        let worldZ = pose.z;
        const pitchX = pose.pitch;
        const yawY = pose.yaw;
        const flipY = pose.flipY;

        if (isOutgoingCard) {
          const bell = switchAnim.active ? Math.sin(switchAnim.t * Math.PI) : 0;
          if (zoomProgress > 0.04) {
            worldX = THREE.MathUtils.lerp(pose.x, worldX - switchAnim.dir * 0.32, bell * 0.5);
            worldY += arcLiftOld * 0.75;
            worldZ += bell * 0.36;
          } else {
            worldY += arcLiftOld;
            worldZ += arcLiftOld * 0.28;
          }
        } else if (isIncomingCard) {
          worldY += arcLiftNew * (1 - zoomProgress * 0.45);
        }

        if (isActiveCard && zoomProgress > 0.001) {
          restWorld.set(worldX, worldY, worldZ);
          // When incoming flips up into zoom, blend smoothly from its wing pose directly to reading perch.
          const zEase = zoomProgress * zoomProgress * (3 - 2 * zoomProgress);
          const flightMix = zEase * (isIncomingCard ? switchEaseT : 1);
          const arcOut = isIncomingCard ? Math.sin(switchAnim.t * Math.PI) * 0.42 : 0;

          card.outerGroup.position.lerpVectors(restWorld, inspectWorld, flightMix);
          card.outerGroup.position.addScaledVector(camForward, -arcOut);
          card.outerGroup.rotation.y = THREE.MathUtils.lerp(yawY, 0, flightMix);

          const handTiltX = pointerNdc.y * (0.045 * panScale) * flightMix;
          const handTiltY = pointerNdc.x * (0.065 * panScale) * flightMix;
          card.pitchGroup.rotation.x = THREE.MathUtils.lerp(
            pitchX,
            camPitch + handTiltX,
            flightMix
          );
          card.flipGroup.rotation.y = flipY + handTiltY;
          card.flipGroup.rotation.x =
            Math.sin(elapsed * 1.4 + i) * 0.012 * flightMix + flipSwell;
        } else {
          // Subtle living hover on resting top card vs weighted calm on lower cards.
          const topBreath = isActiveCard ? Math.sin(elapsed * 1.6) * 0.008 : 0;
          card.outerGroup.position.set(worldX, worldY + topBreath, worldZ);
          card.outerGroup.rotation.y = yawY;
          card.pitchGroup.rotation.x = pitchX + (isIncomingCard ? flipSwell : 0);
          card.flipGroup.rotation.y = flipY;
          card.flipGroup.rotation.x = 0;
        }
      }

      // Drift ambient dust specks softly through candlelit air.
      const dAttr = dustGeo.attributes.position.array;
      for (let i = 0; i < dustCount; i++) {
        const idx = i * 3;
        dAttr[idx + 1] += dustSpd[i] * dt;
        dAttr[idx] += Math.sin(elapsed * 0.55 + i) * 0.0014;
        if (dAttr[idx + 1] > 4.2) dAttr[idx + 1] = 0.25;
      }
      dustGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("keydown", handleKeyDown);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("wheel", handleWheel);

      scene.traverse((obj) => {
        if (obj.isMesh || obj.isPoints) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });

      woodTextures.map.dispose();
      woodTextures.bumpMap.dispose();
      woodTextures.roughnessMap.dispose();
      backTextures.map.dispose();
      backTextures.bumpMap.dispose();
      backTextures.roughnessMap.dispose();
      backTextures.metalnessMap.dispose();
      frontTextureSets.forEach((ft) => {
        ft.map.dispose();
        ft.bumpMap.dispose();
        ft.roughnessMap.dispose();
        ft.metalnessMap.dispose();
      });
      dustSprite.dispose();

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [displayFontFamily, bodyFontFamily]);

  const activeSkill = SKILLS_CARDS[activeIndex] || SKILLS_CARDS[0];

  return (
    <main className="skills-room">
      <div ref={mountRef} className="skills-three-mount" />

      {/* Hidden font preloader nodes ensure WebFonts download eagerly for HTML Canvas card rendering. */}
      <div className="font-preloader" aria-hidden="true">
        <span style={{ fontFamily: displayFontFamily, fontWeight: 700 }}>ARCANA I FULLSTACK</span>
        <span style={{ fontFamily: bodyFontFamily, fontWeight: 600 }}>Cybersecurity MERN</span>
      </div>

      <div
        ref={cursorRef}
        className={`skills-cursor ${cursorHovered ? "is-target" : ""}`}
        aria-hidden="true"
      >
        <span />
      </div>

      <header className="skills-hud-top">
        <Link href="/" className="brand-mark">
          <span className="brand-symbol">L.</span>
          <span className="brand-stack">
            <span className="brand-name">THE UNKNOWN ROOM</span>
            <span className="brand-sub">← RETURN TO WALL</span>
          </span>
        </Link>

        <nav className="hud-nav" aria-label="Archive Sections">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hud-link ${item.active ? "is-active" : ""}`}
            >
              <span>{item.code}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="hud-status">
          <span className="status-dot" />
          <span>SKILLS / 003</span>
        </div>
      </header>

      {/* Subtle left & right card-flip trigger buttons aligned neatly at screen sides */}
      <button
        type="button"
        aria-label="Flip to previous skill tarot card"
        className="side-flip-btn side-flip-left"
        onClick={() => controlsRef.current.switchCard(-1)}
      >
        <span aria-hidden="true">‹</span>
      </button>

      <button
        type="button"
        aria-label="Flip to next skill tarot card"
        className="side-flip-btn side-flip-right"
        onClick={() => controlsRef.current.switchCard(1)}
      >
        <span aria-hidden="true">›</span>
      </button>

      <div className="skills-hud-bottom">
        <div className="card-pips" role="tablist" aria-label="Tarot skill cards">
          {SKILLS_CARDS.map((card, i) => (
            <button
              key={card.id}
              type="button"
              role="tab"
              aria-selected={activeIndex === i}
              className={`card-pip ${activeIndex === i ? "is-active" : ""}`}
              onClick={() => controlsRef.current.selectCard(i)}
            >
              <span>{card.numeral}</span>
              <span className="pip-name">{card.titleLines[0]}</span>
            </button>
          ))}
        </div>

        <div className="hud-actions-row">
          <span className="hud-hint">
            {zoomed
              ? `READING ${activeSkill.numeral} · CLICK LEFT / RIGHT TO FLIP · CLICK CARD FOR TABLE`
              : "CLICK CENTER CARD TO ZOOM · CLICK LEFT / RIGHT TO FLIP TAROT"}
          </span>

          <div className="hud-btn-group">
            <button
              type="button"
              className="hud-ctrl-btn"
              onClick={() => controlsRef.current.setZoom(!zoomed)}
            >
              {zoomed ? "[- RETURN TO TABLE]" : "[+ ZOOM CARD]"}
            </button>
            {zoomed && (
              <button
                type="button"
                className="hud-ctrl-btn"
                onClick={() => controlsRef.current.toggleMacroZoom()}
              >
                {macroZoomed ? "[- FIT CARD]" : "[+ READ CLOSER]"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div ref={veilRef} className="entry-veil" aria-hidden="true" />

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: #040303;
          overflow: hidden;
        }
        .skills-room {
          position: relative;
          width: 100%;
          height: 100svh;
          min-height: 580px;
          overflow: hidden;
          background: #050404;
          color: #e7dcc7;
          font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif;
          user-select: none;
        }
        .font-preloader {
          position: fixed;
          opacity: 0;
          pointer-events: none;
          top: -9999px;
          left: -9999px;
        }
        @media (hover: hover) and (pointer: fine) {
          .skills-room,
          .skills-room a,
          .skills-room button {
            cursor: none;
          }
        }
        .skills-three-mount {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .skills-three-canvas {
          display: block;
          width: 100%;
          height: 100%;
          outline: none;
        }
        .skills-cursor {
          display: none;
        }
        @media (hover: hover) and (pointer: fine) {
          .skills-cursor {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 40;
            width: 28px;
            height: 28px;
            margin: -14px 0 0 -14px;
            pointer-events: none;
            will-change: transform, width, height;
            border: 1px solid rgba(255, 232, 194, 0.72);
            border-radius: 50%;
            box-shadow: 0 0 12px rgba(255, 210, 148, 0.25);
            transition: width 0.16s ease, height 0.16s ease, margin 0.16s ease,
              border-color 0.16s ease;
          }
          .skills-cursor.is-target {
            width: 38px;
            height: 38px;
            margin: -19px 0 0 -19px;
            border-color: rgba(212, 165, 102, 0.95);
          }
          .skills-cursor::before,
          .skills-cursor::after {
            content: "";
            position: absolute;
            background: rgba(255, 232, 194, 0.72);
          }
          .skills-cursor::before {
            width: 40px;
            height: 1px;
            left: -7px;
            top: 50%;
          }
          .skills-cursor::after {
            height: 40px;
            width: 1px;
            top: -7px;
            left: 50%;
          }
          .skills-cursor span {
            position: absolute;
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: #ffe8c4;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }
        .skills-hud-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 25;
          padding: 20px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          pointer-events: none;
        }
        .brand-mark {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 11px;
          color: #d9c9ad;
          text-decoration: none;
        }
        .brand-symbol {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(220, 198, 160, 0.5);
          background: rgba(12, 10, 9, 0.74);
          font: 16px Georgia, serif;
        }
        .brand-stack {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .brand-name {
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 2px;
        }
        .brand-sub {
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.5px;
          color: rgba(212, 185, 138, 0.7);
        }
        .hud-nav {
          pointer-events: auto;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .hud-link {
          display: inline-flex;
          gap: 5px;
          padding: 5px 10px;
          border: 1px solid rgba(212, 192, 156, 0.16);
          background: rgba(10, 9, 8, 0.65);
          color: rgba(223, 212, 192, 0.62);
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.4px;
          text-decoration: none;
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .hud-link:hover {
          border-color: rgba(212, 185, 138, 0.52);
          color: #f3e6d0;
        }
        .hud-link.is-active {
          border-color: rgba(168, 42, 48, 0.72);
          color: #f3e4cb;
        }
        .hud-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(223, 212, 192, 0.56);
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.6px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #9f262e;
          box-shadow: 0 0 9px #b92a33;
        }
        .side-flip-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 24;
          width: 44px;
          height: 74px;
          border-radius: 6px;
          border: 1px solid rgba(182, 178, 168, 0.28);
          background: rgba(14, 14, 18, 0.56);
          color: rgba(224, 216, 198, 0.78);
          font: 28px Georgia, serif;
          display: grid;
          place-items: center;
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease,
            transform 0.2s ease;
        }
        .side-flip-left {
          left: 20px;
        }
        .side-flip-right {
          right: 20px;
        }
        .side-flip-btn:hover {
          border-color: rgba(212, 190, 142, 0.78);
          background: rgba(24, 22, 26, 0.82);
          color: #f8eed9;
          transform: translateY(-50%) scale(1.06);
        }
        .skills-hud-bottom {
          position: absolute;
          left: 50%;
          bottom: 14px;
          transform: translateX(-50%);
          z-index: 25;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: max-content;
          max-width: 95%;
          pointer-events: none;
        }
        .card-pips {
          pointer-events: auto;
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .card-pip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 3px;
          border: 1px solid rgba(176, 172, 162, 0.24);
          background: rgba(12, 12, 15, 0.72);
          color: rgba(216, 206, 188, 0.65);
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.2px;
          transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
        }
        .card-pip.is-active {
          border-color: rgba(206, 182, 134, 0.76);
          background: rgba(26, 23, 20, 0.88);
          color: #f4ebd8;
        }
        .card-pip:hover {
          border-color: rgba(214, 188, 138, 0.6);
          color: #efe2cb;
        }
        .hud-actions-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .hud-hint {
          color: rgba(226, 212, 186, 0.7);
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.4px;
          text-shadow: 0 2px 10px #000;
          text-align: center;
        }
        .hud-btn-group {
          display: flex;
          gap: 8px;
          pointer-events: auto;
        }
        .hud-ctrl-btn {
          background: rgba(16, 13, 10, 0.78);
          border: 1px solid rgba(190, 162, 114, 0.48);
          border-radius: 3px;
          padding: 4px 10px;
          color: rgba(244, 230, 204, 0.92);
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.3px;
          transition: border-color 0.16s ease, background 0.16s ease;
        }
        .hud-ctrl-btn:hover {
          border-color: rgba(224, 186, 128, 0.9);
          background: rgba(36, 26, 18, 0.88);
          color: #fff6e2;
        }
        .entry-veil {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: #020103;
          opacity: 1;
          pointer-events: none;
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (max-width: 820px) {
          .skills-hud-top {
            padding: 14px 16px;
            flex-wrap: wrap;
          }
          .hud-nav {
            order: 3;
            width: 100%;
          }
          .side-flip-btn {
            width: 34px;
            height: 54px;
            font-size: 22px;
          }
          .side-flip-left {
            left: 8px;
          }
          .side-flip-right {
            right: 8px;
          }
          .pip-name {
            display: none;
          }
          .hud-hint {
            font-size: 7px;
          }
          .hud-ctrl-btn {
            font-size: 7px;
            padding: 3px 8px;
          }
        }
      `}</style>
    </main>
  );
}
