"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";

const PAPER_W = 6.2;
const PAPER_H = 5.3;
const PAPER_SEG_X = 48;
const PAPER_SEG_Y = 44;

const POLAROID_W = 1.65;
const POLAROID_H = 2.00;
const POLAROID_SEG_X = 26;
const POLAROID_SEG_Y = 32;

const NAV_LINKS = [
  { href: "/about", code: "001", label: "ABOUT", active: true },
  { href: "/projects", code: "002", label: "PROJECTS" },
  { href: "/skills", code: "003", label: "SKILLS" },
  { href: "/experience", code: "004", label: "EXPERIENCE" },
  { href: "/contact", code: "005", label: "CONTACT" },
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

function makeBackdropTextures() {
  const w = 1024;
  const h = 1024;
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = w;
  colorCanvas.height = h;
  const ctx = colorCanvas.getContext("2d");

  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const bCtx = bumpCanvas.getContext("2d");

  const rand = seededRand(9142);

  // Dark weathered timber / plaster desk backdrop.
  const base = ctx.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, "#14100d");
  base.addColorStop(0.5, "#19130f");
  base.addColorStop(1, "#0e0b09");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  bCtx.fillStyle = "#808080";
  bCtx.fillRect(0, 0, w, h);

  // Subtle horizontal plank seams & wood grain streaks.
  for (let p = 1; p < 5; p++) {
    const py = (p / 5) * h;
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, py - 2, w, 4);
    bCtx.fillStyle = "#202020";
    bCtx.fillRect(0, py - 2, w, 4);
  }

  for (let i = 0; i < 650; i++) {
    const y = rand() * h;
    const len = 80 + rand() * 420;
    const x = rand() * w;
    const alpha = 0.03 + rand() * 0.08;
    ctx.fillStyle = rand() > 0.5 ? `rgba(0,0,0,${alpha})` : `rgba(88,65,45,${alpha * 0.6})`;
    ctx.fillRect(x, y, len, 1 + rand() * 2.5);
    bCtx.fillStyle = rand() > 0.5 ? "rgba(50,50,50,0.22)" : "rgba(180,180,180,0.16)";
    bCtx.fillRect(x, y, len, 1.5);
  }

  // Grit & soot mottling.
  for (let i = 0; i < 12000; i++) {
    const x = rand() * w;
    const y = rand() * h;
    ctx.fillStyle = rand() > 0.5 ? "rgba(0,0,0,0.14)" : "rgba(70,54,40,0.06)";
    ctx.fillRect(x, y, 2, 2);
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.anisotropy = 4;

  return { map, bumpMap };
}

function makeRustyMetalTextures() {
  const size = 512;
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

  const rand = seededRand(3319);

  // Dark weathered steel base.
  ctx.fillStyle = "#3a3634";
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = "#888888";
  bCtx.fillRect(0, 0, size, size);
  rCtx.fillStyle = "#7a7a7a";
  rCtx.fillRect(0, 0, size, size);

  // Heavy corroded rust patches & flaking oxidation.
  for (let i = 0; i < 95; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const rad = 14 + rand() * 54;
    const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, rad);
    const tone = rand();
    if (tone < 0.45) {
      g.addColorStop(0, "rgba(116, 48, 20, 0.88)");
      g.addColorStop(0.55, "rgba(82, 34, 15, 0.55)");
      g.addColorStop(1, "rgba(58, 28, 16, 0)");
    } else if (tone < 0.8) {
      g.addColorStop(0, "rgba(54, 29, 20, 0.90)");
      g.addColorStop(0.6, "rgba(38, 22, 16, 0.48)");
      g.addColorStop(1, "rgba(30, 20, 16, 0)");
    } else {
      g.addColorStop(0, "rgba(138, 66, 28, 0.65)");
      g.addColorStop(1, "rgba(90, 42, 18, 0)");
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();

    // Rust patches are rough & pitted in bump/roughness maps.
    bCtx.fillStyle = "rgba(36,36,36,0.32)";
    bCtx.beginPath();
    bCtx.arc(cx, cy, rad * 0.72, 0, Math.PI * 2);
    bCtx.fill();

    rCtx.fillStyle = "rgba(235,235,235,0.55)";
    rCtx.beginPath();
    rCtx.arc(cx, cy, rad * 0.8, 0, Math.PI * 2);
    rCtx.fill();
  }

  // Micro corrosion pitting & worn metal scratches.
  for (let i = 0; i < 6000; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const dark = rand() > 0.35;
    ctx.fillStyle = dark ? "rgba(22, 14, 10, 0.45)" : "rgba(148, 84, 42, 0.32)";
    ctx.fillRect(x, y, 1 + rand() * 2.4, 1 + rand() * 2.4);
    bCtx.fillStyle = dark ? "rgba(25,25,25,0.45)" : "rgba(220,220,220,0.35)";
    bCtx.fillRect(x, y, 1.5, 1.5);
  }

  for (let i = 0; i < 45; i++) {
    const x1 = rand() * size;
    const y1 = rand() * size;
    const x2 = x1 + (rand() - 0.5) * 90;
    const y2 = y1 + (rand() - 0.5) * 35;
    ctx.strokeStyle = "rgba(155, 150, 142, 0.32)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    rCtx.strokeStyle = "rgba(75,75,75,0.5)";
    rCtx.beginPath();
    rCtx.moveTo(x1, y1);
    rCtx.lineTo(x2, y2);
    rCtx.stroke();
  }

  const map = new THREE.CanvasTexture(cCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;

  const bumpMap = new THREE.CanvasTexture(bCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;

  return { map, bumpMap, roughnessMap };
}

function makeRustyPaperMaps() {
  const w = 1860;
  const h = 1590;

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

  const aCanvas = document.createElement("canvas");
  aCanvas.width = w;
  aCanvas.height = h;
  const aCtx = aCanvas.getContext("2d");

  const rand = seededRand(4004);

  // 1. Readable aged rusty parchment wash (bright enough for crisp ink, weathered edges).
  const baseGrad = ctx.createRadialGradient(w * 0.5, h * 0.48, 160, w * 0.5, h * 0.5, w * 0.66);
  baseGrad.addColorStop(0, "#dccaa6");
  baseGrad.addColorStop(0.58, "#c7ae83");
  baseGrad.addColorStop(0.88, "#9c7e54");
  baseGrad.addColorStop(1, "#70522e");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, w, h);

  bCtx.fillStyle = "#808080";
  bCtx.fillRect(0, 0, w, h);

  rCtx.fillStyle = "#e6e6e6";
  rCtx.fillRect(0, 0, w, h);

  // Irregular ragged torn edge alpha mask.
  aCtx.fillStyle = "#000000";
  aCtx.fillRect(0, 0, w, h);
  aCtx.fillStyle = "#ffffff";
  aCtx.beginPath();
  const margin = 16;
  const step = 16;
  for (let x = margin; x <= w - margin; x += step) {
    const jitter = (rand() - 0.5) * 14 - (x > w * 0.80 ? (x - w * 0.80) * 0.08 : 0);
    if (x === margin) aCtx.moveTo(x, margin + jitter);
    else aCtx.lineTo(x, margin + Math.max(2, jitter));
  }
  for (let y = margin; y <= h - margin; y += step) {
    const notch = y > h * 0.42 && y < h * 0.52 ? -20 * Math.sin(((y - h * 0.42) / (h * 0.1)) * Math.PI) : 0;
    aCtx.lineTo(w - margin + (rand() - 0.5) * 14 + notch, y);
  }
  for (let x = w - margin; x >= margin; x -= step) {
    const notch = x < w * 0.22 ? -18 * (1 - x / (w * 0.22)) : 0;
    aCtx.lineTo(x, h - margin + (rand() - 0.5) * 16 + notch);
  }
  for (let y = h - margin; y >= margin; y -= step) {
    aCtx.lineTo(margin + (rand() - 0.5) * 13, y);
  }
  aCtx.closePath();
  aCtx.fill();

  // 2. Rusty water-blotch clouds & foxing stains (subtle in center so text stays sharp).
  for (let i = 0; i < 42; i++) {
    const cx = rand() * w;
    const cy = rand() * h;
    const rad = 80 + rand() * 250;
    const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, rad);
    if (rand() > 0.45) {
      g.addColorStop(0, `rgba(112, 68, 30, ${0.04 + rand() * 0.08})`);
      g.addColorStop(0.65, `rgba(128, 80, 38, ${0.03 + rand() * 0.05})`);
      g.addColorStop(1, "rgba(128, 80, 38, 0)");
    } else {
      g.addColorStop(0, `rgba(232, 212, 174, ${0.05 + rand() * 0.08})`);
      g.addColorStop(1, "rgba(232, 212, 174, 0)");
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Aged cup / rust ring stain on lower-right edge.
  ctx.save();
  ctx.translate(w * 0.89, h * 0.88);
  for (let ring = 0; ring < 3; ring++) {
    ctx.strokeStyle = `rgba(74, 41, 16, ${0.22 - ring * 0.05})`;
    ctx.lineWidth = 4 + ring * 2.5;
    ctx.beginPath();
    ctx.ellipse(ring * 2, -ring * 1.5, 88 + ring * 3, 82 + ring * 3, 0.3, 0.2, Math.PI * 1.85);
    ctx.stroke();
  }
  ctx.restore();

  // Foxing rust spots across the paper.
  for (let i = 0; i < 240; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 1.5 + rand() * 6.5;
    ctx.fillStyle = `rgba(98, 52, 22, ${0.07 + rand() * 0.14})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Paper fiber grain & organic speckles in albedo + bump.
  for (let i = 0; i < 28000; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const a = rand() * 0.075;
    ctx.fillStyle = rand() > 0.5 ? `rgba(42, 26, 14, ${a})` : `rgba(244, 224, 188, ${a * 0.85})`;
    ctx.fillRect(x, y, 1 + rand() * 2.8, 1 + rand() * 2.2);

    bCtx.fillStyle = rand() > 0.5 ? "rgba(42,42,42,0.13)" : "rgba(215,215,215,0.13)";
    bCtx.fillRect(x, y, 2, 2);
  }

  // Short paper pulp fibers.
  ctx.lineWidth = 0.9;
  for (let i = 0; i < 900; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const angle = rand() * Math.PI * 2;
    const len = 5 + rand() * 14;
    ctx.strokeStyle = rand() > 0.5 ? "rgba(56, 38, 22, 0.065)" : "rgba(232, 210, 170, 0.065)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  // 4. Fold creases (horizontal & vertical) in both albedo and bump.
  const drawCrease = (x1, y1, x2, y2) => {
    ctx.save();
    ctx.strokeStyle = "rgba(52, 34, 18, 0.18)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(242, 224, 188, 0.16)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1 + 2, y1 + 3);
    ctx.lineTo(x2 + 2, y2 + 3);
    ctx.stroke();

    bCtx.strokeStyle = "rgba(38,38,38,0.42)";
    bCtx.lineWidth = 6;
    bCtx.beginPath();
    bCtx.moveTo(x1, y1);
    bCtx.lineTo(x2, y2);
    bCtx.stroke();

    bCtx.strokeStyle = "rgba(220,220,220,0.40)";
    bCtx.lineWidth = 3;
    bCtx.beginPath();
    bCtx.moveTo(x1 + 2, y1 + 4);
    bCtx.lineTo(x2 + 2, y2 + 4);
    bCtx.stroke();
    ctx.restore();
  };
  drawCrease(14, h * 0.455, w - 14, h * 0.462);
  drawCrease(w * 0.49, 14, w * 0.484, h - 14);

  // 5. Burned stains & charred ember holes along edges & corners.
  const burnSpots = [
    { x: w * 0.97, y: h * 0.11, rx: 145, ry: 155, hole: false },
    { x: w * 0.05, y: h * 0.94, rx: 185, ry: 135, hole: false },
    { x: w * 0.96, y: h * 0.50, rx: 84, ry: 105, hole: true },
    { x: w * 0.04, y: h * 0.78, rx: 46, ry: 42, hole: true },
  ];

  for (const b of burnSpots) {
    ctx.save();
    ctx.translate(b.x, b.y);
    const halo = ctx.createRadialGradient(0, 0, b.rx * 0.18, 0, 0, b.rx);
    halo.addColorStop(0, "rgba(12, 8, 6, 0.94)");
    halo.addColorStop(0.38, "rgba(34, 18, 8, 0.85)");
    halo.addColorStop(0.68, "rgba(104, 48, 12, 0.50)");
    halo.addColorStop(0.88, "rgba(132, 74, 22, 0.18)");
    halo.addColorStop(1, "rgba(132, 74, 22, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.ellipse(0, 0, b.rx, b.ry, rand() * 0.5, 0, Math.PI * 2);
    ctx.fill();

    rCtx.fillStyle = "rgba(250,250,250,0.65)";
    rCtx.beginPath();
    rCtx.ellipse(0, 0, b.rx * 0.6, b.ry * 0.6, 0, 0, Math.PI * 2);
    rCtx.fill();

    bCtx.strokeStyle = "rgba(230,230,230,0.5)";
    bCtx.lineWidth = 6;
    bCtx.beginPath();
    bCtx.ellipse(0, 0, b.rx * 0.34, b.ry * 0.34, 0, 0, Math.PI * 2);
    bCtx.stroke();

    if (b.hole) {
      const holeR = b.rx * 0.24;
      aCtx.save();
      aCtx.translate(b.x, b.y);
      aCtx.fillStyle = "#000000";
      aCtx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.35) {
        const rr = holeR * (0.78 + rand() * 0.42);
        const hx = Math.cos(a) * rr;
        const hy = Math.sin(a) * rr * (b.ry / b.rx);
        if (a === 0) aCtx.moveTo(hx, hy);
        else aCtx.lineTo(hx, hy);
      }
      aCtx.closePath();
      aCtx.fill();
      aCtx.restore();
    }
    ctx.restore();
  }

  // Darkened charred perimeter vignette.
  const edgeShade = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.40, w * 0.5, h * 0.5, w * 0.66);
  edgeShade.addColorStop(0, "rgba(0,0,0,0)");
  edgeShade.addColorStop(0.80, "rgba(42,24,10,0.18)");
  edgeShade.addColorStop(1, "rgba(18,10,5,0.58)");
  ctx.fillStyle = edgeShade;
  ctx.fillRect(0, 0, w, h);

  // 6. Tiny dried oxidized blood spatters along margins and corners.
  const drawBloodCluster = (cx, cy, count, spread, maxR) => {
    for (let i = 0; i < count; i++) {
      const ang = rand() * Math.PI * 2;
      const dist = Math.pow(rand(), 1.4) * spread;
      const x = cx + Math.cos(ang) * dist;
      const y = cy + Math.sin(ang) * dist;
      const r = 1.4 + rand() * maxR;
      const stretch = 1 + rand() * 0.9;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      const drop = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r * stretch);
      drop.addColorStop(0, "rgba(44, 4, 7, 0.94)");
      drop.addColorStop(0.65, "rgba(78, 10, 14, 0.84)");
      drop.addColorStop(0.9, "rgba(54, 7, 9, 0.55)");
      drop.addColorStop(1, "rgba(54, 7, 9, 0)");
      ctx.fillStyle = drop;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * stretch, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      rCtx.fillStyle = "rgba(90,90,90,0.5)";
      rCtx.beginPath();
      rCtx.arc(x, y, r, 0, Math.PI * 2);
      rCtx.fill();

      bCtx.fillStyle = "rgba(210,210,210,0.28)";
      bCtx.beginPath();
      bCtx.arc(x, y, r, 0, Math.PI * 2);
      bCtx.fill();
    }
  };

  drawBloodCluster(w * 0.93, h * 0.25, 22, 70, 5.5);
  drawBloodCluster(w * 0.04, h * 0.64, 18, 48, 4.5);
  drawBloodCluster(w * 0.95, h * 0.78, 16, 52, 4.2);
  drawBloodCluster(w * 0.55, h * 0.045, 11, 42, 3.4);
  drawBloodCluster(w * 0.22, h * 0.93, 14, 52, 4.0);

  // 7. Large, high-contrast typed dossier copy (top-left x: 75..605, y: 80..695 reserved for Polaroid).
  ctx.save();
  ctx.fillStyle = "rgba(22, 15, 9, 0.92)";
  ctx.font = "bold 24px 'Courier New', monospace";
  ctx.fillText("CASE DOSSIER // 001-ID", 645, 138);

  ctx.fillStyle = "rgba(96, 16, 18, 0.88)";
  ctx.font = "bold 22px 'Courier New', monospace";
  ctx.textAlign = "right";
  ctx.fillText("CONFIDENTIAL", 1745, 138);
  ctx.textAlign = "left";

  ctx.strokeStyle = "rgba(32, 22, 14, 0.60)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(645, 164);
  ctx.lineTo(1745, 164);
  ctx.stroke();

  ctx.fillStyle = "rgba(16, 11, 7, 0.96)";
  ctx.font = "bold 74px Georgia, serif";
  ctx.fillText("Luv Agarwal", 645, 255);

  ctx.fillStyle = "rgba(44, 28, 16, 0.92)";
  ctx.font = "italic 34px Georgia, serif";
  ctx.fillText("Builder · Developer · Curious Mind", 645, 308);

  const fields = [
    ["ORIGIN", "Kolkata & Howrah, West Bengal", 645, 396],
    ["STATUS", "B.Tech · 2nd Year (WBJEE)", 1210, 396],
    ["FOCUS", "Web · Apps · Cyber · Robotics", 645, 514],
    ["DISPATCH", "luvag0707@gmail.com", 1210, 514],
  ];

  fields.forEach(([label, value, fx, fy]) => {
    ctx.fillStyle = "rgba(56, 36, 20, 0.82)";
    ctx.font = "bold 20px 'Courier New', monospace";
    ctx.fillText(label, fx, fy);

    ctx.fillStyle = "rgba(18, 12, 7, 0.95)";
    ctx.font = "bold 26px 'Courier New', monospace";
    ctx.fillText(value, fx, fy + 36);

    ctx.strokeStyle = "rgba(44, 28, 16, 0.30)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 50);
    ctx.lineTo(fx + 520, fy + 50);
    ctx.stroke();
  });

  // Worn oxidized crimson rubber stamp.
  ctx.save();
  ctx.translate(1605, 628);
  ctx.rotate(-0.14);
  ctx.strokeStyle = "rgba(104, 16, 18, 0.70)";
  ctx.lineWidth = 4;
  ctx.strokeRect(-125, -32, 250, 64);
  ctx.fillStyle = "rgba(104, 16, 18, 0.76)";
  ctx.font = "bold 25px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("ARCHIVED // 26", 0, 9);
  ctx.restore();

  // Lower main biography section across full width below the Polaroid.
  ctx.strokeStyle = "rgba(32, 22, 14, 0.55)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(118, 725);
  ctx.lineTo(1742, 725);
  ctx.stroke();

  ctx.fillStyle = "rgba(46, 28, 16, 0.88)";
  ctx.font = "bold 24px 'Courier New', monospace";
  ctx.fillText("SUBJECT RECORD — BEHIND THE SCREEN", 118, 772);

  const paragraphs = [
    "I'm Luv Agarwal, born and bred in Kolkata, West Bengal. From a young age, I was fascinated by technology, networking, and how systems work beneath the surface. As I grew, technology evolved alongside me at an exponential pace—and instead of watching it vanish ahead like a distant classmate, catching up to it became my obsession.",
    "Through Class 12 at a private school in Howrah, all I knew was basic computing and school-level Java. Cracking WBJEE alongside JEE Mains earned me a seat at a top private college—and the freedom to discover what truly spikes my adrenaline.",
    "I learned web development from scratch, built half a dozen websites, and worked with real-world clients for true field experience—then quickly moved into app development with React. Now in my 2nd year, I've stepped into cybersecurity, diving into OSINT, Google Dorks, and networking.",
    "Still, a restless curiosity for electrical and hardware engineering remains—robots and drones have fascinated me since childhood, even if I haven't built in that space yet. The deeper I go into engineering, the clearer it gets: knowledge here is like drinking an ocean—a vast, bottomless void of possibilities waiting to be discovered.",
  ];

  const drawWrapped = (text, startX, startY, maxWidth, lineHeight) => {
    const words = text.split(" ");
    let line = "";
    let y = startY;
    for (let n = 0; n < words.length; n++) {
      const testLine = line ? `${line} ${words[n]}` : words[n];
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, startX, y);
        line = words[n];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, startX, y);
      y += lineHeight;
    }
    return y;
  };

  ctx.fillStyle = "rgba(16, 11, 7, 0.96)";
  ctx.font = "31px Georgia, serif";
  let cursorY = 828;
  for (const para of paragraphs) {
    cursorY = drawWrapped(para, 118, cursorY, 1620, 44);
    cursorY += 16;
  }

  const footerLineY = Math.max(1430, cursorY + 10);
  ctx.strokeStyle = "rgba(32, 22, 14, 0.42)";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(118, footerLineY);
  ctx.lineTo(1742, footerLineY);
  ctx.stroke();

  ctx.fillStyle = "rgba(38, 24, 14, 0.90)";
  ctx.font = "bold 20px 'Courier New', monospace";
  ctx.fillText(
    "TRAIL: WEB DEV · APPS · REACT · CYBERSECURITY (OSINT / DORKS) · ROBOTICS & HARDWARE",
    118,
    footerLineY + 44
  );

  ctx.fillStyle = "rgba(22, 14, 8, 0.88)";
  ctx.font = "italic 38px Georgia, serif";
  ctx.textAlign = "right";
  ctx.fillText("— Luv Agarwal", 1726, Math.min(1538, footerLineY + 95));
  ctx.restore();

  const map = new THREE.CanvasTexture(cCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  const bumpMap = new THREE.CanvasTexture(bCanvas);
  bumpMap.anisotropy = 4;

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.anisotropy = 4;

  const alphaMap = new THREE.CanvasTexture(aCanvas);
  alphaMap.anisotropy = 4;

  return { map, bumpMap, roughnessMap, alphaMap };
}

function makePolaroidMaps(onReady) {
  const w = 900;
  const h = 1090;

  const cCanvas = document.createElement("canvas");
  cCanvas.width = w;
  cCanvas.height = h;
  const ctx = cCanvas.getContext("2d");

  const rCanvas = document.createElement("canvas");
  rCanvas.width = w;
  rCanvas.height = h;
  const rCtx = rCanvas.getContext("2d");

  const bCanvas = document.createElement("canvas");
  bCanvas.width = w;
  bCanvas.height = h;
  const bCtx = bCanvas.getContext("2d");

  const rand = seededRand(7721);

  const renderFrame = (photoImg) => {
    // 1. Old yellowed/pale/rusty Polaroid border stock (muted ivory so light never blows it out).
    const borderGrad = ctx.createLinearGradient(0, 0, w, h);
    borderGrad.addColorStop(0, "#bfb196");
    borderGrad.addColorStop(0.55, "#a79678");
    borderGrad.addColorStop(1, "#8e7b5c");
    ctx.fillStyle = borderGrad;
    ctx.fillRect(0, 0, w, h);

    // Matte cardstock & low-glare aged photo paper so spotlights never wash out the face.
    rCtx.fillStyle = "#efefef";
    rCtx.fillRect(0, 0, w, h);
    bCtx.fillStyle = "#808080";
    bCtx.fillRect(0, 0, w, h);

    // Subtle rusty blotches & grime on border.
    for (let i = 0; i < 35; i++) {
      const cx = rand() * w;
      const cy = rand() * h;
      const rad = 30 + rand() * 110;
      const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, rad);
      g.addColorStop(0, `rgba(104, 68, 32, ${0.07 + rand() * 0.11})`);
      g.addColorStop(1, "rgba(104, 68, 32, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fine border paper texture.
    for (let i = 0; i < 6000; i++) {
      const x = rand() * w;
      const y = rand() * h;
      ctx.fillStyle = rand() > 0.5 ? "rgba(42,30,18,0.06)" : "rgba(255,244,220,0.04)";
      ctx.fillRect(x, y, 2, 2);
    }

    // 2. Photo aperture coordinates.
    const px = 66;
    const py = 68;
    const pw = 768;
    const ph = 768;

    // Matte-satin aged Polaroid emulsion (eliminates blinding white spotlight glare).
    rCtx.fillStyle = "#cccccc";
    rCtx.fillRect(px, py, pw, ph);

    // Recessed inner shadow around photo frame.
    ctx.fillStyle = "#181410";
    ctx.fillRect(px - 3, py - 3, pw + 6, ph + 6);

    bCtx.strokeStyle = "#353535";
    bCtx.lineWidth = 6;
    bCtx.strokeRect(px, py, pw, ph);

    if (photoImg) {
      // Draw photo cover-cropped on upper-center (preserves hair/glasses/smile).
      const srcRatio = photoImg.width / photoImg.height;
      let sx = 0;
      let sy = 0;
      let sw = photoImg.width;
      let sh = photoImg.height;
      if (srcRatio > 1) {
        sw = photoImg.height;
        sx = (photoImg.width - sw) * 0.5;
      } else {
        sh = photoImg.width;
        sy = (photoImg.height - sh) * 0.25;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.clip();

      // Toned-down vintage chemical grading so bright photo whites stay rich, pale, and clear.
      ctx.filter = "saturate(0.44) contrast(1.16) brightness(0.74) sepia(0.36)";
      ctx.drawImage(photoImg, sx, sy, sw, sh, px, py, pw, ph);
      ctx.filter = "none";

      // Subtle aged amber glaze (darkens hot highlights instead of washing them out).
      ctx.fillStyle = "rgba(88, 60, 28, 0.14)";
      ctx.fillRect(px, py, pw, ph);

      // Analog lens vignette around square frame.
      const vig = ctx.createRadialGradient(
        px + pw * 0.5,
        py + ph * 0.46,
        pw * 0.24,
        px + pw * 0.5,
        py + ph * 0.5,
        pw * 0.72
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(0.72, "rgba(22,16,10,0.20)");
      vig.addColorStop(1, "rgba(14,10,6,0.58)");
      ctx.fillStyle = vig;
      ctx.fillRect(px, py, pw, ph);

      // Subtle analog emulsion scratches & grain inside photo.
      for (let i = 0; i < 4500; i++) {
        ctx.fillStyle = rand() > 0.5 ? "rgba(255,240,210,0.03)" : "rgba(15,10,6,0.045)";
        ctx.fillRect(px + rand() * pw, py + rand() * ph, 2, 2);
      }
      for (let i = 0; i < 14; i++) {
        const sx1 = px + rand() * pw;
        const sy1 = py + rand() * ph;
        ctx.strokeStyle = "rgba(225, 208, 178, 0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx1 + (rand() - 0.5) * 40, sy1 + 15 + rand() * 55);
        ctx.stroke();
      }
      ctx.restore();
    } else {
      ctx.fillStyle = "#5c5040";
      ctx.fillRect(px, py, pw, ph);
    }

    // Rusty corner stain & tiny dried blood speck on Polaroid bottom-right border.
    const rustLift = ctx.createRadialGradient(w * 0.92, h * 0.94, 8, w * 0.9, h * 0.92, 130);
    rustLift.addColorStop(0, "rgba(86, 48, 20, 0.42)");
    rustLift.addColorStop(0.6, "rgba(104, 62, 28, 0.18)");
    rustLift.addColorStop(1, "rgba(104, 62, 28, 0)");
    ctx.fillStyle = rustLift;
    ctx.fillRect(w * 0.6, h * 0.72, w * 0.4, h * 0.28);

    // Tiny dried blood flecks near bottom-left chin.
    for (let i = 0; i < 7; i++) {
      const bx = 135 + rand() * 68;
      const by = 920 + rand() * 65;
      const br = 1.4 + rand() * 3.2;
      ctx.fillStyle = "rgba(62, 8, 10, 0.78)";
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle darkened perimeter bevel on the Polaroid border.
    ctx.strokeStyle = "rgba(48, 34, 20, 0.35)";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, w - 6, h - 6);

    // Handwritten faded marker caption on bottom chin.
    ctx.fillStyle = "rgba(38, 28, 20, 0.78)";
    ctx.font = "italic 46px Georgia, serif";
    ctx.fillText("Luv  ·  '26", 82, 972);

    ctx.fillStyle = "rgba(64, 46, 30, 0.55)";
    ctx.font = "18px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText("REF // 001", w - 72, 972);
    ctx.textAlign = "left";
  };

  renderFrame(null);

  const map = new THREE.CanvasTexture(cCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.anisotropy = 4;

  const bumpMap = new THREE.CanvasTexture(bCanvas);
  bumpMap.anisotropy = 4;

  let cancelled = false;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    if (cancelled) return;
    renderFrame(img);
    map.needsUpdate = true;
    roughnessMap.needsUpdate = true;
    bumpMap.needsUpdate = true;
    onReady?.();
  };
  img.src = "/profile_pic.jpg";

  return {
    map,
    roughnessMap,
    bumpMap,
    cancel: () => {
      cancelled = true;
    },
  };
}

function makeRustyClipPin(rustTextures) {
  const group = new THREE.Group();

  const rustMat = new THREE.MeshStandardMaterial({
    map: rustTextures.map,
    bumpMap: rustTextures.bumpMap,
    bumpScale: 0.018,
    roughnessMap: rustTextures.roughnessMap,
    roughness: 0.85,
    metalness: 0.74,
  });

  const darkPinMat = new THREE.MeshStandardMaterial({
    map: rustTextures.map,
    bumpMap: rustTextures.bumpMap,
    bumpScale: 0.022,
    roughnessMap: rustTextures.roughnessMap,
    color: 0x8f7c6b,
    roughness: 0.78,
    metalness: 0.78,
  });

  // 3D curved steel paperclip sliding diagonally over the top-left corner of the Polaroid.
  // Back leg starts behind the paper/Polaroid edge, wraps over top edge, clamps down onto the front.
  const clipCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.075, -0.14, -0.024),
    new THREE.Vector3(-0.075, 0.14, -0.022),
    new THREE.Vector3(-0.04, 0.255, 0.016),
    new THREE.Vector3(0.055, 0.255, 0.036),
    new THREE.Vector3(0.088, 0.14, 0.026),
    new THREE.Vector3(0.088, -0.19, 0.024),
    new THREE.Vector3(0.048, -0.275, 0.028),
    new THREE.Vector3(-0.036, -0.275, 0.028),
    new THREE.Vector3(-0.055, -0.18, 0.026),
    new THREE.Vector3(-0.055, 0.09, 0.026),
    new THREE.Vector3(-0.015, 0.155, 0.032),
    new THREE.Vector3(0.036, 0.14, 0.030),
    new THREE.Vector3(0.042, -0.09, 0.026),
  ]);

  const clipGeo = new THREE.TubeGeometry(clipCurve, 96, 0.020, 12, false);
  const clipMesh = new THREE.Mesh(clipGeo, rustMat);
  clipMesh.castShadow = true;
  clipMesh.receiveShadow = true;
  group.add(clipMesh);

  // Small corroded iron/brass pin-clasp stud anchoring the top loop into the paper.
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.042, 0.035, 16),
    darkPinMat
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0.01, 0.19, 0.036);
  collar.castShadow = true;
  group.add(collar);

  const tackHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.076, 0.068, 0.022, 24),
    darkPinMat
  );
  tackHead.rotation.x = Math.PI / 2;
  tackHead.position.set(0.01, 0.19, 0.056);
  tackHead.castShadow = true;
  tackHead.receiveShadow = true;
  group.add(tackHead);

  const tackDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.068, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.45),
    rustMat
  );
  tackDome.rotation.x = Math.PI / 2;
  tackDome.scale.set(1, 0.42, 1);
  tackDome.position.set(0.01, 0.19, 0.064);
  tackDome.castShadow = true;
  tackDome.receiveShadow = true;
  group.add(tackDome);

  return group;
}

function makeDustSpriteTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, "rgba(255,228,184,1)");
  grad.addColorStop(0.4, "rgba(255,204,142,0.42)");
  grad.addColorStop(1, "rgba(255,190,120,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function AboutView() {
  const mountRef = useRef(null);
  const cursorRef = useRef(null);
  const veilRef = useRef(null);
  const zoomTargetRef = useRef(0);
  const [cursorHovered, setCursorHovered] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    const veil = veilRef.current;
    if (!mount) return;

    if (veil) {
      veil.style.opacity = "1";
      requestAnimationFrame(() => {
        if (veil) veil.style.opacity = "0";
      });
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060505);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.2, 40);
    camera.position.set(0, 0, 8.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "about-three-canvas";
    mount.appendChild(renderer.domElement);

    // Brighter warm ambient & fill illumination so all text & details are effortlessly clear while keeping horror shadows.
    const ambient = new THREE.AmbientLight(0xc2b093, 0.48);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xdcc7a0, 0x241918, 0.42);
    scene.add(hemi);

    // Angled upper-left overhead lamp casting realistic diagonal shadows from the lifted Polaroid corner & clip-pin.
    const rakingLamp = new THREE.SpotLight(0xffdfa8, 36, 24, 0.85, 0.88, 1.25);
    rakingLamp.position.set(-4.4, 4.2, 6.6);
    rakingLamp.target.position.set(0, 0.2, 0);
    rakingLamp.castShadow = true;
    rakingLamp.shadow.mapSize.set(2048, 2048);
    rakingLamp.shadow.camera.near = 1.5;
    rakingLamp.shadow.camera.far = 16;
    rakingLamp.shadow.bias = -0.00018;
    rakingLamp.shadow.normalBias = 0.008;
    rakingLamp.shadow.radius = 3.5;
    scene.add(rakingLamp);
    scene.add(rakingLamp.target);

    // Subtle atmospheric crimson practical glow in upper-left margin.
    const redGlow = new THREE.PointLight(0x78151b, 2.8, 12, 1.8);
    redGlow.position.set(-5.2, 3.2, 2.0);
    scene.add(redGlow);

    // Interactive handheld flashlight tracking the cursor smoothly without washing out the photo.
    const flashlight = new THREE.SpotLight(0xffe3b5, 44, 22, 0.42, 0.90, 1.35);
    flashlight.position.set(-0.6, -1.0, 5.4);
    flashlight.castShadow = true;
    flashlight.shadow.mapSize.set(2048, 2048);
    flashlight.shadow.camera.near = 1.5;
    flashlight.shadow.camera.far = 14;
    flashlight.shadow.bias = -0.00018;
    flashlight.shadow.normalBias = 0.008;
    flashlight.shadow.radius = 4;
    scene.add(flashlight);
    scene.add(flashlight.target);

    // Dark scarred wooden surface behind the rusty paper.
    const backdropTextures = makeBackdropTextures();
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 18),
      new THREE.MeshStandardMaterial({
        map: backdropTextures.map,
        bumpMap: backdropTextures.bumpMap,
        bumpScale: 0.03,
        roughness: 0.92,
        metalness: 0.05,
      })
    );
    backdrop.position.set(0, 0, -0.30);
    backdrop.receiveShadow = true;
    scene.add(backdrop);

    // Root document assembly (subtle parallax & entry settle physics).
    const docGroup = new THREE.Group();
    docGroup.position.set(0, -0.08, 0);
    scene.add(docGroup);

    // ---------------------------------------------------------
    // 1. OLD RUSTY PAPER WITH REAL CLOTH/PAPER VERTEX PHYSICS
    // ---------------------------------------------------------
    const paperMaps = makeRustyPaperMaps();
    const paperGeo = new THREE.PlaneGeometry(PAPER_W, PAPER_H, PAPER_SEG_X, PAPER_SEG_Y);
    const paperMat = new THREE.MeshStandardMaterial({
      map: paperMaps.map,
      bumpMap: paperMaps.bumpMap,
      bumpScale: 0.026,
      roughnessMap: paperMaps.roughnessMap,
      roughness: 0.88,
      metalness: 0.02,
      alphaMap: paperMaps.alphaMap,
      alphaTest: 0.45,
      side: THREE.DoubleSide,
    });
    const paperMesh = new THREE.Mesh(paperGeo, paperMat);
    paperMesh.castShadow = true;
    paperMesh.receiveShadow = true;
    docGroup.add(paperMesh);

    const paperPosAttr = paperGeo.attributes.position;
    const paperVertCount = paperPosAttr.count;
    const paperRestZ = new Float32Array(paperVertCount);
    const paperDisp = new Float32Array(paperVertCount);
    const paperVel = new Float32Array(paperVertCount);
    const paperNext = new Float32Array(paperVertCount);
    const paperPinned = new Float32Array(paperVertCount);

    for (let i = 0; i < paperVertCount; i++) {
      const vx = paperPosAttr.getX(i);
      const vy = paperPosAttr.getY(i);
      const nx = vx / (PAPER_W * 0.5); // -1..1
      const ny = vy / (PAPER_H * 0.5); // -1..1

      // Organic aged warp + subtle crease valley + slightly curled free bottom corners.
      const creaseH = -Math.exp(-Math.pow((ny - 0.02) * 14, 2)) * 0.025;
      const creaseV = Math.exp(-Math.pow((nx + 0.02) * 14, 2)) * 0.018;
      const wave = Math.sin(nx * 2.1 + 0.4) * Math.cos(ny * 1.7) * 0.028;
      const bottomLift =
        Math.pow(Math.max(0, -ny), 2.1) *
        (0.06 + 0.14 * Math.pow(Math.abs(nx), 1.8));
      const topRightCurl =
        Math.pow(Math.max(0, ny), 2.2) * Math.pow(Math.max(0, nx), 2.0) * 0.08;

      const rz = creaseH + creaseV + wave + bottomLift + topRightCurl;
      paperRestZ[i] = rz;
      paperPosAttr.setZ(i, rz);

      // Pin weight: top-left (under clip-pin) & center spine are tightly anchored; outer corners flex freely.
      const distTopLeft = Math.hypot(nx + 0.65, ny - 0.52);
      paperPinned[i] = clamp(1 - distTopLeft * 0.68, 0.08, 1);
    }
    paperGeo.computeVertexNormals();

    // ---------------------------------------------------------
    // 2. POLAROID PHOTO ON TOP-LEFT (LIFTED BOTTOM-RIGHT CORNER)
    // ---------------------------------------------------------
    const polaroidAnchor = new THREE.Group();
    polaroidAnchor.position.set(-2.00, 1.36, 0.032);
    polaroidAnchor.rotation.z = 0.045;
    docGroup.add(polaroidAnchor);

    const polaroidMaps = makePolaroidMaps();
    const polaroidGeo = new THREE.PlaneGeometry(
      POLAROID_W,
      POLAROID_H,
      POLAROID_SEG_X,
      POLAROID_SEG_Y
    );
    const polaroidMat = new THREE.MeshStandardMaterial({
      map: polaroidMaps.map,
      roughnessMap: polaroidMaps.roughnessMap,
      bumpMap: polaroidMaps.bumpMap,
      bumpScale: 0.014,
      roughness: 0.88,
      metalness: 0.04,
      side: THREE.FrontSide,
    });
    const polaroidMesh = new THREE.Mesh(polaroidGeo, polaroidMat);
    polaroidMesh.castShadow = true;
    polaroidMesh.receiveShadow = true;
    polaroidAnchor.add(polaroidMesh);

    const polaroidBackMat = new THREE.MeshStandardMaterial({
      color: 0x3b3227,
      roughness: 0.94,
      metalness: 0.02,
      side: THREE.BackSide,
    });
    const polaroidBackMesh = new THREE.Mesh(polaroidGeo, polaroidBackMat);
    polaroidBackMesh.position.z = -0.007;
    polaroidBackMesh.castShadow = true;
    polaroidAnchor.add(polaroidBackMesh);

    const polPosAttr = polaroidGeo.attributes.position;
    const polVertCount = polPosAttr.count;
    const polBaseCurl = new Float32Array(polVertCount);

    for (let i = 0; i < polVertCount; i++) {
      const vx = polPosAttr.getX(i);
      const vy = polPosAttr.getY(i);
      const u = clamp(vx / POLAROID_W + 0.5); // 0 (left) -> 1 (right)
      const v = clamp(0.5 - vy / POLAROID_H); // 0 (top) -> 1 (bottom)

      // Top-left clip-pin holds (u≈0.12, v≈0.08) flush; bottom-right (u=1, v=1) curls realistically upward!
      const du = clamp((u - 0.07) / 0.93);
      const dv = clamp((v - 0.05) / 0.95);
      const lift =
        Math.pow(du, 1.52) * Math.pow(dv, 1.42) * 0.46 +
        Math.pow(du, 2.3) * 0.045 +
        Math.pow(dv, 2.3) * 0.025;
      polBaseCurl[i] = lift;
      polPosAttr.setZ(i, lift);
    }
    polaroidGeo.computeVertexNormals();

    // ---------------------------------------------------------
    // 3. RUSTY 3D CLIP-PIN HOLDING TOP-LEFT CORNER OF POLAROID
    // ---------------------------------------------------------
    const rustTextures = makeRustyMetalTextures();
    const clipPin = makeRustyClipPin(rustTextures);
    clipPin.position.set(-POLAROID_W * 0.35, POLAROID_H * 0.43, 0.014);
    clipPin.rotation.z = 0.24;
    clipPin.scale.setScalar(1.22);
    polaroidAnchor.add(clipPin);

    // Floating dust motes drifting across the flashlight cone.
    const DUST_COUNT = 140;
    const dustPositions = new Float32Array(DUST_COUNT * 3);
    const dustVels = [];
    for (let i = 0; i < DUST_COUNT; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 9;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      dustPositions[i * 3 + 2] = 0.4 + Math.random() * 2.8;
      dustVels.push({
        vx: (Math.random() - 0.5) * 0.12,
        vy: 0.03 + Math.random() * 0.08,
        phase: Math.random() * Math.PI * 2,
      });
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustSprite = makeDustSpriteTexture();
    const dustMat = new THREE.PointsMaterial({
      map: dustSprite,
      size: 0.07,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // Interactive state & physics variables.
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2(0, 0);
    const docPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const desiredSpot = new THREE.Vector3(0, 0.2, 0);
    const springSpot = new THREE.Vector3(-0.6, 0.8, 0);
    const spotVel = new THREE.Vector3();
    const hitPoint = new THREE.Vector3();
    const localHit = new THREE.Vector3();

    let baseCamZ = 8.4;
    let zoomCurrent = 0;
    let pointerSpeedX = 0;
    let pointerSpeedY = 0;
    let lastClientX = window.innerWidth * 0.5;
    let lastClientY = window.innerHeight * 0.5;

    // Polaroid lifted corner spring physics (press & spring back up!).
    let curlScale = 1.0;
    let curlVel = 0;
    let hoveringPolaroid = false;

    // Smooth entry settle animation for the whole document.
    let entryProgress = 0;

    const applyPaperImpulse = (worldPt, strength, radius = 1.15) => {
      localHit.copy(worldPt);
      paperMesh.worldToLocal(localHit);
      const rSq = radius * radius;
      for (let i = 0; i < paperVertCount; i++) {
        const dx = paperPosAttr.getX(i) - localHit.x;
        const dy = paperPosAttr.getY(i) - localHit.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < rSq) {
          const falloff = 1 - dSq / rSq;
          const free = 1.15 - paperPinned[i] * 0.85;
          paperVel[i] += strength * falloff * free;
        }
      }
    };

    const handlePointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerNdc.x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      pointerNdc.y = clamp(-((event.clientY - rect.top) / rect.height) * 2 + 1, -1, 1);

      const dx = (event.clientX - lastClientX) / rect.width;
      const dy = (event.clientY - lastClientY) / rect.height;
      lastClientX = event.clientX;
      lastClientY = event.clientY;
      pointerSpeedX = clamp(pointerSpeedX + dx * 16, -6, 6);
      pointerSpeedY = clamp(pointerSpeedY + dy * 16, -6, 6);

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      }

      raycaster.setFromCamera(pointerNdc, camera);
      if (raycaster.ray.intersectPlane(docPlane, hitPoint)) {
        desiredSpot.copy(hitPoint);
        const speedMag = Math.hypot(dx, dy);
        if (speedMag > 0.008) {
          applyPaperImpulse(hitPoint, -Math.min(0.45, speedMag * 7.5), 0.9);
        }
      }

      const polHits = raycaster.intersectObject(polaroidMesh, false);
      const isOverPolaroid = polHits.length > 0;
      hoveringPolaroid = isOverPolaroid;
      if (isOverPolaroid && Math.hypot(dx, dy) > 0.01) {
        curlVel += (Math.random() - 0.5) * 0.9;
      }

      const targetEl = event.target instanceof Element ? event.target : null;
      const domInteractive = Boolean(targetEl?.closest("a, button"));
      setCursorHovered(domInteractive || isOverPolaroid);
    };

    const handlePointerDown = (event) => {
      if (event.button !== 0) return;
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);

      const polHits = raycaster.intersectObject(polaroidMesh, false);
      if (polHits.length > 0) {
        // Press lifted corner down toward the paper and let it spring back!
        curlVel -= 6.8;
        applyPaperImpulse(polHits[0].point, -1.8, 1.35);
        return;
      }

      const paperHits = raycaster.intersectObject(paperMesh, false);
      if (paperHits.length > 0) {
        applyPaperImpulse(paperHits[0].point, -2.4, 1.45);
      }
    };

    const handleWheel = (event) => {
      event.preventDefault();
      const next = clamp(zoomTargetRef.current - event.deltaY * 0.0014, 0, 1);
      zoomTargetRef.current = next;
      const shouldBeZoomed = next > 0.25;
      setZoomed((prev) => (prev === shouldBeZoomed ? prev : shouldBeZoomed));
    };

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      const aspect = width / height;
      camera.aspect = aspect;
      camera.fov = aspect < 0.9 ? 46 : 40;
      camera.updateProjectionMatrix();

      const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const distForH = 3.05 / tanHalfFov;
      const distForW = 3.45 / (tanHalfFov * Math.max(aspect, 0.42));
      baseCamZ = Math.max(distForH, distForW);

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    renderer.domElement.addEventListener("pointerdown", handlePointerDown, { passive: true });
    renderer.domElement.addEventListener("wheel", handleWheel, { passive: false });
    resize();

    const cols = PAPER_SEG_X + 1;
    const rows = PAPER_SEG_Y + 1;
    let frameId = 0;
    let prevTime = performance.now();

    const animate = (now) => {
      const dt = Math.min((now - prevTime) / 1000, 0.032);
      prevTime = now;
      const elapsed = now / 1000;

      // 1. Smooth entry settle.
      entryProgress = Math.min(1, entryProgress + dt * 1.45);
      const entryEase = 1 - Math.pow(1 - entryProgress, 3);

      // 2. Smooth handheld flashlight tracking & subtle camera parallax.
      const sx = 125 * (desiredSpot.x - springSpot.x) - 18 * spotVel.x;
      const sy = 125 * (desiredSpot.y - springSpot.y) - 18 * spotVel.y;
      spotVel.x += sx * dt;
      spotVel.y += sy * dt;
      springSpot.x += spotVel.x * dt;
      springSpot.y += spotVel.y * dt;

      flashlight.position.set(
        -0.65 + springSpot.x * 0.28,
        -1.05 + springSpot.y * 0.28,
        5.1
      );
      flashlight.target.position.copy(springSpot);
      flashlight.target.updateMatrixWorld();

      redGlow.intensity = 3.0 + Math.sin(elapsed * 6.5) * 0.28 + Math.sin(elapsed * 21) * 0.14;

      // Smooth inspection zoom & wider pan while reading up close.
      zoomCurrent += (zoomTargetRef.current - zoomCurrent) * Math.min(1, dt * 6.5);
      const camTargetX = pointerNdc.x * (0.28 + zoomCurrent * 1.15);
      const camTargetY = pointerNdc.y * (0.18 + zoomCurrent * 1.45);
      camera.position.x += (camTargetX - camera.position.x) * Math.min(1, dt * 6);
      camera.position.y += (camTargetY - camera.position.y) * Math.min(1, dt * 6);
      camera.position.z = baseCamZ * (1 - zoomCurrent * 0.42) + (1 - entryEase) * 0.9;
      camera.lookAt(
        camera.position.x * 0.65 * zoomCurrent,
        -0.05 + camera.position.y * 0.72 * zoomCurrent,
        0
      );

      docGroup.rotation.z = -0.015 + (1 - entryEase) * 0.04;
      docGroup.position.y = -0.08 - (1 - entryEase) * 0.35;

      // 3. Polaroid lifted bottom-right corner spring physics.
      const targetCurl = hoveringPolaroid
        ? 1.04 + Math.sin(elapsed * 2.6) * 0.035
        : 1.0 + Math.sin(elapsed * 1.3) * 0.018;
      const curlAccel = 145 * (targetCurl - curlScale) - 8.8 * curlVel;
      curlVel += curlAccel * dt;
      curlScale = Math.max(0.22, curlScale + curlVel * dt);

      for (let i = 0; i < polVertCount; i++) {
        polPosAttr.setZ(i, polBaseCurl[i] * curlScale);
      }
      polPosAttr.needsUpdate = true;
      polaroidGeo.computeVertexNormals();

      // 4. Real-time paper cloth/spring physics with neighbor tension.
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          let neighborAvg = 0;
          let nCount = 0;
          if (c > 0) {
            neighborAvg += paperDisp[i - 1];
            nCount++;
          }
          if (c < cols - 1) {
            neighborAvg += paperDisp[i + 1];
            nCount++;
          }
          if (r > 0) {
            neighborAvg += paperDisp[i - cols];
            nCount++;
          }
          if (r < rows - 1) {
            neighborAvg += paperDisp[i + cols];
            nCount++;
          }
          neighborAvg = nCount > 0 ? neighborAvg / nCount : 0;

          const freeWeight = 1.08 - paperPinned[i] * 0.86;
          const draft =
            Math.sin(elapsed * 1.45 + c * 0.12 + r * 0.09) * 0.045 * freeWeight;
          const force =
            -44 * paperDisp[i] +
            24 * (neighborAvg - paperDisp[i]) -
            5.8 * paperVel[i] +
            draft;

          paperVel[i] += force * dt;
          paperNext[i] = clamp(paperDisp[i] + paperVel[i] * dt, -0.28, 0.28);
        }
      }

      for (let i = 0; i < paperVertCount; i++) {
        paperDisp[i] = paperNext[i];
        paperPosAttr.setZ(i, paperRestZ[i] + paperDisp[i]);
      }
      paperPosAttr.needsUpdate = true;
      paperGeo.computeVertexNormals();

      // 5. Dust motes drifting across the examination table.
      const dArr = dustGeo.attributes.position.array;
      for (let i = 0; i < DUST_COUNT; i++) {
        const dv = dustVels[i];
        const idx = i * 3;
        dv.vx = dv.vx * Math.exp(-1.5 * dt) + pointerSpeedX * 0.04 * dt;
        dv.vy = dv.vy * Math.exp(-1.2 * dt) + 0.025 * dt - pointerSpeedY * 0.03 * dt;
        dArr[idx] += (dv.vx + Math.sin(elapsed * 0.8 + dv.phase) * 0.06) * dt;
        dArr[idx + 1] += dv.vy * dt;
        if (dArr[idx] > 4.6) dArr[idx] = -4.6;
        if (dArr[idx] < -4.6) dArr[idx] = 4.6;
        if (dArr[idx + 1] > 4.6) dArr[idx + 1] = -4.6;
        if (dArr[idx + 1] < -4.6) dArr[idx + 1] = 4.6;
      }
      dustGeo.attributes.position.needsUpdate = true;
      pointerSpeedX *= Math.exp(-7 * dt);
      pointerSpeedY *= Math.exp(-7 * dt);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      polaroidMaps.cancel();
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("wheel", handleWheel);

      scene.traverse((obj) => {
        if (obj.isMesh || obj.isPoints) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });

      backdropTextures.map.dispose();
      backdropTextures.bumpMap.dispose();
      paperMaps.map.dispose();
      paperMaps.bumpMap.dispose();
      paperMaps.roughnessMap.dispose();
      paperMaps.alphaMap.dispose();
      polaroidMaps.map.dispose();
      polaroidMaps.roughnessMap.dispose();
      polaroidMaps.bumpMap.dispose();
      rustTextures.map.dispose();
      rustTextures.bumpMap.dispose();
      rustTextures.roughnessMap.dispose();
      dustSprite.dispose();

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const handleToggleZoom = () => {
    const nextZoomed = !zoomed;
    zoomTargetRef.current = nextZoomed ? 1 : 0;
    setZoomed(nextZoomed);
  };

  return (
    <main className="about-room">
      <div ref={mountRef} className="about-three-mount" />

      <div
        ref={cursorRef}
        className={`about-cursor ${cursorHovered ? "is-target" : ""}`}
        aria-hidden="true"
      >
        <span />
      </div>

      <header className="about-hud-top">
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
          <span>IDENTITY / 001</span>
        </div>
      </header>

      <div className="about-hud-bottom">
        <span>MOVE LIGHT TO EXAMINE · SCROLL OR CLICK TO INSPECT</span>
        <button type="button" className="hud-zoom-btn" onClick={handleToggleZoom}>
          {zoomed ? "[- RESET VIEW]" : "[+ ZOOM CLOSER]"}
        </button>
      </div>

      <div ref={veilRef} className="entry-veil" aria-hidden="true" />

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: #030304;
          overflow: hidden;
        }
        .about-room {
          position: relative;
          width: 100%;
          height: 100svh;
          min-height: 580px;
          overflow: hidden;
          background: #040303;
          color: #e7dcc7;
          font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif;
        }
        @media (hover: hover) and (pointer: fine) {
          .about-room,
          .about-room a,
          .about-room button {
            cursor: none;
          }
        }
        .about-three-mount {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .about-three-canvas {
          display: block;
          width: 100%;
          height: 100%;
          outline: none;
        }
        .about-cursor {
          display: none;
        }
        @media (hover: hover) and (pointer: fine) {
          .about-cursor {
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
          .about-cursor.is-target {
            width: 38px;
            height: 38px;
            margin: -19px 0 0 -19px;
            border-color: rgba(212, 165, 102, 0.95);
          }
          .about-cursor::before,
          .about-cursor::after {
            content: "";
            position: absolute;
            background: rgba(255, 232, 194, 0.72);
          }
          .about-cursor::before {
            width: 40px;
            height: 1px;
            left: -7px;
            top: 50%;
          }
          .about-cursor::after {
            height: 40px;
            width: 1px;
            top: -7px;
            left: 50%;
          }
          .about-cursor span {
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
        .about-hud-top {
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
          background: rgba(12, 10, 9, 0.7);
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
        .about-hud-bottom {
          position: absolute;
          left: 50%;
          bottom: 16px;
          transform: translateX(-50%);
          z-index: 25;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          width: max-content;
          max-width: 94%;
          text-align: center;
          color: rgba(226, 212, 186, 0.72);
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.5px;
          pointer-events: none;
          text-shadow: 0 2px 10px #000;
        }
        .hud-zoom-btn {
          pointer-events: auto;
          background: rgba(16, 12, 9, 0.72);
          border: 1px solid rgba(186, 152, 108, 0.42);
          border-radius: 3px;
          padding: 4px 9px;
          color: rgba(242, 226, 198, 0.9);
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.4px;
          transition: border-color 0.16s ease, color 0.16s ease, background 0.16s ease;
        }
        .hud-zoom-btn:hover {
          border-color: rgba(218, 174, 118, 0.85);
          background: rgba(34, 24, 16, 0.86);
          color: #fff3dd;
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
          .about-hud-top {
            padding: 14px 16px;
            flex-wrap: wrap;
          }
          .hud-nav {
            order: 3;
            width: 100%;
          }
          .about-hud-bottom {
            font-size: 7px;
            bottom: 10px;
            gap: 8px;
          }
          .hud-zoom-btn {
            font-size: 7px;
            padding: 3px 7px;
          }
        }
      `}</style>
    </main>
  );
}
