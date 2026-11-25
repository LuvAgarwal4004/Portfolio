"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";

const ITEMS = [
  { id: "about", href: "/about", kind: "about", code: "IDENTITY / 001", title: "Behind the screen.", description: "A little about the person building things.", action: "GET TO KNOW ME", position: [-5.25, 1.05, -8.7], size: [2.35, 2.9], angle: -0.035 },
  { id: "projects", href: "/projects", kind: "projects", code: "CASE FILES / 002", title: "Things I've built.", description: "Experiments, products and projects.", action: "EXPLORE PROJECTS", position: [0, 1.45, -8.65], size: [3.35, 2.55], angle: 0.025 },
  { id: "skills", href: "/skills", kind: "skills", code: "TOOLS / 003", title: "My toolkit.", description: "Technologies, tools and things I work with.", action: "VIEW MY SKILLS", position: [5.2, 0.95, -8.7], size: [2.45, 2.75], angle: 0.035 },
  { id: "experience", href: "/experience", kind: "experience", code: "FIELD NOTES / 004", title: "The journey.", description: "My experience, learning and milestones.", action: "FOLLOW THE TRAIL", position: [-3.05, -2.25, -8.65], size: [3.05, 2.05], angle: -0.02 },
  { id: "contact", href: "/contact", kind: "contact", code: "TRANSMISSION / 005", title: "Let's talk.", description: "Have something interesting in mind?", action: "GET IN TOUCH", position: [3.15, -2.35, -8.65], size: [2.75, 2.05], angle: 0.025 },
];

const UP = new THREE.Vector3(0, 1, 0);
const WALL_Z = -10;

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(value) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function makeWallTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#9f9178";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
  base.addColorStop(0, "#bdb098");
  base.addColorStop(0.52, "#a99a80");
  base.addColorStop(1, "#81735f");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const stains = [
    [170, 230, 0.8],
    [1810, 190, 0.75],
    [430, 850, 0.55],
    [1570, 790, 0.85],
    [1040, 130, 0.42],
    [1190, 920, 0.5],
  ];

  // Uneven plaster grain.
  for (let i = 0; i < 26000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const alpha = Math.random() * 0.075;
    ctx.fillStyle = Math.random() > 0.5
      ? `rgba(45,35,25,${alpha})`
      : `rgba(255,239,211,${alpha})`;
    ctx.fillRect(x, y, Math.random() * 3 + 0.5, Math.random() * 2 + 0.5);
  }

  // Fine cracks in the plaster.
  ctx.lineWidth = 1.3;
  for (let i = 0; i < 24; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let j = 0; j < 5; j++) {
      x += (Math.random() - 0.5) * 45;
      y += Math.random() * 28;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(42,31,22,0.18)";
    ctx.stroke();
  }

  // Stylized dried blood: irregular dark stains, splatter and short drips.
  for (const [cx, cy, scale] of stains) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    const blob = ctx.createRadialGradient(0, 0, 8, 0, 0, 100);
    blob.addColorStop(0, "rgba(43,5,10,0.78)");
    blob.addColorStop(0.48, "rgba(66,8,15,0.58)");
    blob.addColorStop(0.78, "rgba(75,12,16,0.24)");
    blob.addColorStop(1, "rgba(70,10,13,0)");
    ctx.fillStyle = blob;
    ctx.beginPath();
    ctx.ellipse(0, 0, 105, 62, Math.random() * 0.7, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 34; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 28 + Math.random() * 100;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.62;
      const r = 2 + Math.random() * 7;
      ctx.fillStyle = `rgba(57,5,11,${0.3 + Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * (0.55 + Math.random()), Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 3; i++) {
      const x = (Math.random() - 0.5) * 85;
      const y = 18 + Math.random() * 15;
      const length = 35 + Math.random() * 90;
      const drip = ctx.createLinearGradient(x, y, x, y + length);
      drip.addColorStop(0, "rgba(58,5,10,0.72)");
      drip.addColorStop(1, "rgba(58,5,10,0.02)");
      ctx.strokeStyle = drip;
      ctx.lineWidth = 3 + Math.random() * 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x - 5, y + length * 0.3, x + 5, y + length * 0.7, x, y + length);
      ctx.stroke();
    }
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function makeCardTexture(item) {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 760;
  const ctx = canvas.getContext("2d");

  const palettes = {
    about: ["#d7c7a9", "#786b55", "#292820"],
    projects: ["#242a29", "#a58f6b", "#d8c6a5"],
    skills: ["#cabb9c", "#6f604b", "#382f24"],
    experience: ["#dfd1b8", "#8e7958", "#43392d"],
    contact: ["#e2d5bf", "#907b5d", "#4b3d2c"],
  };

  const [background, accent, ink] = palettes[item.kind];
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 1000, 760);

  const wash = ctx.createLinearGradient(0, 0, 1000, 760);
  wash.addColorStop(0, "rgba(255,255,255,.13)");
  wash.addColorStop(1, "rgba(0,0,0,.13)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, 1000, 760);

  // Paper grain.
  for (let i = 0; i < 4500; i++) {
    ctx.fillStyle = Math.random() > 0.5
      ? "rgba(255,255,255,.035)"
      : "rgba(0,0,0,.035)";
    ctx.fillRect(Math.random() * 1000, Math.random() * 760, 2, 2);
  }

  ctx.strokeStyle = `${ink}88`;
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, 952, 712);

  ctx.fillStyle = ink;
  ctx.font = "22px monospace";
  ctx.letterSpacing = "5px";
  ctx.fillText(item.code, 58, 78);
  ctx.textAlign = "right";
  ctx.fillText("ARCHIVE / 0" + (ITEMS.findIndex((entry) => entry.id === item.id) + 1), 942, 78);
  ctx.textAlign = "left";

  ctx.strokeStyle = `${ink}66`;
  ctx.beginPath();
  ctx.moveTo(58, 105);
  ctx.lineTo(942, 105);
  ctx.stroke();

  if (item.kind === "about") {
    const g = ctx.createRadialGradient(500, 330, 20, 500, 330, 255);
    g.addColorStop(0, "#e9d3aa");
    g.addColorStop(1, "#625744");
    ctx.fillStyle = g;
    ctx.fillRect(80, 140, 840, 330);
    ctx.fillStyle = "#292720";
    ctx.beginPath();
    ctx.arc(500, 265, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(500, 440, 180, 150, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,235,199,.6)";
    ctx.fillRect(125, 170, 120, 220);
    ctx.fillStyle = ink;
    ctx.font = "italic 64px Georgia";
    ctx.fillText("A person behind the pixels.", 62, 575);
  } else if (item.kind === "projects") {
    ctx.fillStyle = "#101617";
    ctx.fillRect(90, 150, 820, 320);
    for (let i = 0; i < 3; i++) {
      const x = 125 + i * 260;
      ctx.fillStyle = ["#7b8b7e", "#a58a66", "#596c72"][i];
      ctx.fillRect(x, 190, 220, 225);
      ctx.fillStyle = "rgba(15,18,18,.75)";
      ctx.fillRect(x + 15, 208, 190, 22);
      ctx.fillStyle = "rgba(236,220,190,.8)";
      for (let j = 0; j < 4; j++) ctx.fillRect(x + 18, 255 + j * 32, 150 + Math.random() * 28, 7);
    }
    ctx.fillStyle = "#e8dcc6";
    ctx.font = "italic 66px Georgia";
    ctx.fillText("Selected experiments.", 62, 575);
  } else if (item.kind === "skills") {
    ctx.fillStyle = `${accent}55`;
    ctx.fillRect(85, 150, 830, 320);
    const tags = ["REACT", "NEXT.JS", "NODE.JS", "MONGODB", "THREE.JS", "AI / ML", "UI / UX", "EXPRESS"];
    tags.forEach((tag, i) => {
      const x = 115 + (i % 4) * 195;
      const y = 205 + Math.floor(i / 4) * 125;
      ctx.strokeStyle = ink;
      ctx.strokeRect(x, y, 165, 72);
      ctx.fillStyle = ink;
      ctx.font = "bold 24px monospace";
      ctx.fillText(tag, x + 18, y + 44);
    });
    ctx.fillStyle = ink;
    ctx.font = "italic 66px Georgia";
    ctx.fillText("Tools of the trade.", 62, 575);
  } else if (item.kind === "experience") {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(160, 190);
    ctx.lineTo(160, 450);
    ctx.stroke();
    [210, 330, 445].forEach((y, i) => {
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(160, y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ink;
      ctx.font = "bold 27px monospace";
      ctx.fillText(["THE BEGINNING", "BUILDING THINGS", "WHAT'S NEXT?"][i], 210, y + 8);
      ctx.font = "22px Georgia";
      ctx.fillText(["Ideas & curiosity", "Projects & experiments", "The story continues"][i], 210, y + 42);
    });
    ctx.fillStyle = ink;
    ctx.font = "italic 66px Georgia";
    ctx.fillText("Field notes.", 62, 575);
  } else {
    ctx.fillStyle = "#b49e7d";
    ctx.fillRect(325, 205, 350, 220);
    ctx.strokeStyle = "#564630";
    ctx.lineWidth = 5;
    ctx.strokeRect(325, 205, 350, 220);
    ctx.beginPath();
    ctx.moveTo(325, 205);
    ctx.lineTo(500, 350);
    ctx.lineTo(675, 205);
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.font = "italic 66px Georgia";
    ctx.fillText("Leave a message.", 62, 575);
  }

  ctx.fillStyle = ink;
  ctx.font = "20px monospace";
  ctx.fillText(item.description.toUpperCase(), 62, 685);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function makeBat(scene, position, hero = false) {
  const root = new THREE.Group();
  root.position.copy(position);
  root.renderOrder = 10;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x09090d,
    roughness: 0.9,
    metalness: 0.05,
  });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x111016,
    roughness: 0.95,
    side: THREE.DoubleSide,
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x8b111a });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), bodyMat);
  body.scale.set(0.75, 1.25, 0.75);
  root.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), bodyMat);
  head.position.set(0, 0.12, 0.035);
  root.add(head);

  const earGeometry = new THREE.ConeGeometry(0.045, 0.16, 5);
  const earL = new THREE.Mesh(earGeometry, bodyMat);
  earL.position.set(-0.055, 0.235, 0.02);
  earL.rotation.z = 0.22;
  root.add(earL);
  const earR = earL.clone();
  earR.position.x = 0.055;
  earR.rotation.z = -0.22;
  root.add(earR);

  for (const x of [-0.035, 0.035]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), eyeMat);
    eye.position.set(x, 0.13, 0.105);
    root.add(eye);
  }

  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(0.18, 0.12);
  wingShape.lineTo(0.38, 0.31);
  wingShape.quadraticCurveTo(0.48, 0.34, 0.62, 0.20);
  wingShape.quadraticCurveTo(0.55, 0.12, 0.49, 0.03);
  wingShape.quadraticCurveTo(0.41, 0.14, 0.34, -0.08);
  wingShape.quadraticCurveTo(0.25, 0.06, 0.17, -0.13);
  wingShape.quadraticCurveTo(0.09, -0.02, 0, 0);

  const wingGeometry = new THREE.ShapeGeometry(wingShape, 8);
  const leftWing = new THREE.Group();
  leftWing.position.x = -0.055;
  const leftMesh = new THREE.Mesh(wingGeometry, wingMat);
  leftMesh.scale.x = -1;
  leftWing.add(leftMesh);
  root.add(leftWing);

  const rightWing = new THREE.Group();
  rightWing.position.x = 0.055;
  rightWing.add(new THREE.Mesh(wingGeometry, wingMat));
  root.add(rightWing);

  scene.add(root);

  return {
    group: root,
    leftWing,
    rightWing,
    hero,
    age: 0,
    start: position.clone(),
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.35) * 3.5,
      2.4 + Math.random() * 3.0
    ),
    baseScale: hero ? 0.42 : 0.22 + Math.random() * 0.22,
  };
}

function makeTorch(scene) {
  const group = new THREE.Group();
  group.position.set(-0.04, -0.65, -0.82);

  const metal = new THREE.MeshStandardMaterial({
    color: 0x36393e,
    metalness: 0.65,
    roughness: 0.44,
  });

  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x1e2024,
    metalness: 0.60,
    roughness: 0.48,
  });

  const rubber = new THREE.MeshStandardMaterial({
    color: 0x131518,
    roughness: 0.94,
  });

  const switchMat = new THREE.MeshStandardMaterial({
    color: 0x282b30,
    roughness: 0.58,
  });

  const glass = new THREE.MeshStandardMaterial({
    color: 0xffe0a3,
    emissive: 0xffb347,
    emissiveIntensity: 2.6,
    metalness: 0.25,
    roughness: 0.14,
  });

  const glove = new THREE.MeshStandardMaterial({
    color: 0x171518,
    roughness: 0.95,
  });

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.14, 1.22, 24), rubber);
  handle.position.y = 0.66;
  handle.castShadow = true;
  group.add(handle);

  const handleCore = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.145, 1.12, 24), metal);
  handleCore.position.y = 0.68;
  group.add(handleCore);

  for (let i = 0; i < 8; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 24), darkMetal);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.27 + i * 0.115;
    group.add(ring);
  }

  const powerSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.085, 0.04), switchMat);
  powerSwitch.position.set(0, 1.16, 0.115);
  group.add(powerSwitch);

  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.135, 0.34, 32), darkMetal);
  head.position.y = 1.43;
  head.castShadow = true;
  group.add(head);

  const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.10, 32), metal);
  bezel.position.y = 1.64;
  group.add(bezel);

  const innerRing = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.035, 32), darkMetal);
  innerRing.position.y = 1.70;
  group.add(innerRing);

  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.018, 32), glass);
  lens.position.y = 1.725;
  group.add(lens);

  // A 3D gloved hand gripping the near end of the torch.
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), glove);
  palm.position.set(0, 0.22, 0.14);
  palm.scale.set(0.92, 0.9, 0.9);
  group.add(palm);

  for (let i = 0; i < 4; i++) {
    const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.047, 0.19, 4, 8), glove);
    finger.position.set(-0.13 + i * 0.085, 0.55, 0.16);
    finger.rotation.z = -0.13;
    group.add(finger);
  }

  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.24, 4, 8), glove);
  thumb.position.set(-0.19, 0.74, 0.12);
  thumb.rotation.z = -0.85;
  group.add(thumb);

  scene.add(group);
  return { group, lensLocal: new THREE.Vector3(0, 1.735, 0) };
}

function makeGun(scene) {
  // Semi-auto pistol oriented with +Y forward, +Z up, +-X width.
  const group = new THREE.Group();
  group.visible = true;
  group.scale.setScalar(0.88);

  const slideMat = new THREE.MeshStandardMaterial({
    color: 0x3f444a,
    metalness: 0.66,
    roughness: 0.40,
  });

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1f2226,
    metalness: 0.56,
    roughness: 0.48,
  });

  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x1c1816,
    metalness: 0.04,
    roughness: 0.90,
  });

  const handMat = new THREE.MeshStandardMaterial({
    color: 0x171518,
    roughness: 0.94,
  });

  const portMat = new THREE.MeshStandardMaterial({
    color: 0x090a0c,
    roughness: 0.92,
  });

  const sightDotMat = new THREE.MeshStandardMaterial({
    color: 0x525049,
    roughness: 0.72,
  });

  // Lower receiver & underbarrel dustcover rail.
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.145, 0.92, 0.105), frameMat);
  frame.position.set(0, 0.42, 0.01);
  group.add(frame);

  const underRail = new THREE.Mesh(new THREE.BoxGeometry(0.118, 0.34, 0.045), frameMat);
  underRail.position.set(0, 0.68, -0.055);
  group.add(underRail);

  // Moving upper slide sub-group (animates blowback on shot & rack on equip).
  const slideGroup = new THREE.Group();

  const slide = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.96, 0.135), slideMat);
  slide.position.set(0, 0.44, 0.125);
  slideGroup.add(slide);

  const slideTop = new THREE.Mesh(new THREE.BoxGeometry(0.122, 0.95, 0.026), slideMat);
  slideTop.position.set(0, 0.44, 0.20);
  slideGroup.add(slideTop);

  const ejectionPort = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.20, 0.032), portMat);
  ejectionPort.position.set(0.054, 0.50, 0.198);
  slideGroup.add(ejectionPort);

  for (let i = 0; i < 5; i++) {
    const serration = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.014, 0.09), frameMat);
    serration.position.set(0, 0.02 + i * 0.032, 0.125);
    slideGroup.add(serration);
  }

  const rearSightBase = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.055, 0.025), frameMat);
  rearSightBase.position.set(0, 0.01, 0.218);
  slideGroup.add(rearSightBase);

  for (const x of [-0.035, 0.035]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.05, 0.042), frameMat);
    post.position.set(x, 0.01, 0.238);
    slideGroup.add(post);

    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), sightDotMat);
    dot.position.set(x, -0.016, 0.244);
    slideGroup.add(dot);
  }

  const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.055, 0.042), frameMat);
  frontSight.position.set(0, 0.86, 0.232);
  slideGroup.add(frontSight);

  const frontDot = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), sightDotMat);
  frontDot.position.set(0, 0.831, 0.242);
  slideGroup.add(frontDot);

  group.add(slideGroup);

  // Stationary inner barrel, bore, guide rod, and rear hammer.
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.92, 16), frameMat);
  barrel.position.set(0, 0.50, 0.125);
  group.add(barrel);

  const muzzleHole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.026, 0.018, 16),
    new THREE.MeshBasicMaterial({ color: 0x040507 })
  );
  muzzleHole.position.set(0, 0.956, 0.125);
  group.add(muzzleHole);

  const guideRod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 12), slideMat);
  guideRod.position.set(0, 0.87, 0.04);
  group.add(guideRod);

  const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.068, 0.065), frameMat);
  hammer.position.set(0, -0.055, 0.095);
  hammer.rotation.x = 0.35;
  group.add(hammer);

  // Trigger guard & trigger.
  const guardBottom = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.23, 0.024), frameMat);
  guardBottom.position.set(0, 0.24, -0.145);
  group.add(guardBottom);

  const guardFront = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.026, 0.13), frameMat);
  guardFront.position.set(0, 0.35, -0.085);
  guardFront.rotation.x = 0.22;
  group.add(guardFront);

  const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.034, 0.105), slideMat);
  trigger.position.set(0, 0.245, -0.065);
  trigger.rotation.x = -0.35;
  group.add(trigger);

  // Angled pistol grip, side panels, and magazine baseplate.
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.132, 0.205, 0.50), frameMat);
  grip.position.set(0, -0.02, -0.24);
  grip.rotation.x = -0.28;
  group.add(grip);

  const gripPanels = new THREE.Mesh(new THREE.BoxGeometry(0.142, 0.16, 0.40), gripMat);
  gripPanels.position.set(0, -0.02, -0.24);
  gripPanels.rotation.x = -0.28;
  group.add(gripPanels);

  const magBase = new THREE.Mesh(new THREE.BoxGeometry(0.142, 0.22, 0.042), frameMat);
  magBase.position.set(0, -0.092, -0.49);
  magBase.rotation.x = -0.28;
  group.add(magBase);

  // Dark gloved hand & forearm gripping the pistol.
  const palm = new THREE.Mesh(new THREE.CapsuleGeometry(0.086, 0.24, 6, 12), handMat);
  palm.position.set(0.006, -0.05, -0.17);
  palm.rotation.x = 1.29;
  group.add(palm);

  for (let i = 0; i < 3; i++) {
    const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.13, 4, 8), handMat);
    finger.position.set(0, 0.068 - i * 0.026, -0.145 - i * 0.085);
    finger.rotation.z = Math.PI / 2;
    group.add(finger);
  }

  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.13, 4, 8), handMat);
  thumb.position.set(-0.084, 0.07, -0.01);
  thumb.rotation.x = 0.20;
  thumb.rotation.z = -0.10;
  group.add(thumb);

  const triggerFinger = new THREE.Mesh(new THREE.CapsuleGeometry(0.024, 0.16, 4, 8), handMat);
  triggerFinger.position.set(0.078, 0.14, -0.055);
  triggerFinger.rotation.x = -0.18;
  triggerFinger.rotation.z = 0.10;
  group.add(triggerFinger);

  const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.48, 6, 12), handMat);
  forearm.position.set(0.03, -0.28, -0.34);
  forearm.rotation.x = 0.45;
  group.add(forearm);

  scene.add(group);
  return {
    group,
    slideGroup,
    barrelTipLocal: new THREE.Vector3(0, 0.97, 0.125),
    ejectionPortLocal: new THREE.Vector3(0.065, 0.50, 0.19),
  };
}

export default function Home() {
  const mountRef = useRef(null);
  const cursorRef = useRef(null);
  const overlayRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const mount = mountRef.current;
    const overlay = overlayRef.current;
    if (!mount) return;
    if (overlay) {
      overlay.style.opacity = "0";
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030305);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.08, 80);
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, -10);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "three-scene-canvas";
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xb8aa92, 0.17);
    scene.add(ambient);
    const hemi = new THREE.HemisphereLight(0xc9b894, 0x171116, 0.18);
    scene.add(hemi);
    // Dim local foreground lights so gun, torch, and hands keep a moody dark horror silhouette.
    const equipmentFill = new THREE.PointLight(0xa09585, 1.35, 4.0, 1.8);
    equipmentFill.position.set(-0.35, -0.25, 0.45);
    scene.add(equipmentFill);

    const equipmentRim = new THREE.PointLight(0x647285, 1.20, 4.0, 1.8);
    equipmentRim.position.set(0.95, 0.35, -0.30);
    scene.add(equipmentRim);
    // The wall is physically behind the boards on negative Z.
    const wallTexture = makeWallTexture();
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 13.5),
      new THREE.MeshStandardMaterial({
        map: wallTexture,
        color: 0xa39579,
        roughness: 0.96,
        metalness: 0,
      })
    );
    wall.position.set(0, 0, WALL_Z);
    wall.receiveShadow = true;
    scene.add(wall);

    // A faint red practical light adds an atmospheric stain to the room.
    const redPractical = new THREE.PointLight(0x6c1018, 2.2, 8, 2);
    redPractical.position.set(-7, 3.4, -7.5);
    scene.add(redPractical);

    const cards = [];
    const cardMeshes = [];

    for (const item of ITEMS) {
      const [w, h] = item.size;
      const group = new THREE.Group();
      group.position.set(...item.position);
      group.rotation.z = item.angle;

      const frameMaterial = new THREE.MeshStandardMaterial({
        color: item.kind === "projects" ? 0x28251f : 0x766349,
        metalness: 0.48,
        roughness: 0.48,
      });
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.15, h + 0.15, 0.16),
        frameMaterial
      );
      frame.castShadow = true;
      frame.receiveShadow = true;
      group.add(frame);

      const texture = makeCardTexture(item);
      const board = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.9,
          metalness: 0.02,
          side: THREE.DoubleSide,
        })
      );
      board.position.z = 0.09;
      board.castShadow = true;
      board.receiveShadow = true;
      board.userData.card = null;
      group.add(board);

      // Top hanging wire and a small metal pin.
      const wireLength = 0.62;
      const wire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.009, 0.009, wireLength, 8),
        new THREE.MeshStandardMaterial({ color: 0x302a22, metalness: 0.45, roughness: 0.7 })
      );
      wire.position.set(0, h / 2 + wireLength / 2 + 0.06, -0.015);
      group.add(wire);

      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0x99815d, metalness: 0.78, roughness: 0.25 })
      );
      pin.position.set(0, h / 2 + 0.06, 0.13);
      group.add(pin);

      scene.add(group);

      const card = { ...item, group, board, texture, width: w, height: h, broken: false };
      board.userData.card = card;
      cards.push(card);
      cardMeshes.push(board);
    }

    // -----------------------------------------------
    // REAL 3D TORCH: grip is closer to camera; lens is
    // further into negative Z and points at the wall.
    // -----------------------------------------------

    const torch = makeTorch(scene);
    const torchBase = torch.group.position.clone();
    const torchSpot = new THREE.SpotLight(0xffdfae, 150, 18, 0.32, 0.82, 1.45);
    torchSpot.castShadow = true;
    torchSpot.shadow.mapSize.set(1024, 1024);
    torchSpot.shadow.bias = -0.00015;
    torchSpot.shadow.radius = 5;
    scene.add(torchSpot);
    scene.add(torchSpot.target);

    const beamGeometry = new THREE.CylinderGeometry(0.9, 0.035, 1, 24, 1, true);
    beamGeometry.translate(0, 0.5, 0);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0xffdca3,
      transparent: true,
      opacity: 0.075,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.renderOrder = 2;
    scene.add(beam);

    const softBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 0.075, 1, 24, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xffdca3,
        transparent: true,
        opacity: 0.022,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    softBeam.geometry.translate(0, 0.5, 0);
    softBeam.renderOrder = 1;
    scene.add(softBeam);

    const wallPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -WALL_Z);
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2(0, 0);
    const aimTarget = new THREE.Vector3(0, 0, WALL_Z);
    const lensWorld = new THREE.Vector3();
    const torchDirection = new THREE.Vector3();
    const beamDirection = new THREE.Vector3();
    const beamQuaternion = new THREE.Quaternion();
    const gunDirection = new THREE.Vector3();
    const gunIdleQuaternion = new THREE.Quaternion();
    const recoilEuler = new THREE.Euler(0, 0, 0, "YXZ");
    const recoilRotation = new THREE.Quaternion();
    const baseAimQuat = new THREE.Quaternion();
    const equipStartPos = new THREE.Vector3(0.56, -1.12, -0.58);
    const equipMidPos = new THREE.Vector3(0.26, -0.24, -1.04);
    const holsterOffsetQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-0.78, 0.58, 0.24, "YXZ")
    );
    const equipMidOffsetQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0.08, 0.24, 0.08, "YXZ")
    );
    const equipWorkQuat = new THREE.Quaternion();
    const equipSnapEuler = new THREE.Euler(0, 0, 0, "YXZ");
    const equipSnapQuat = new THREE.Quaternion();
    const identityQuat = new THREE.Quaternion();
    const bulletCurrent = new THREE.Vector3();

    // -----------------------------------------------
    // 3D PISTOL: drawn above the torch on entry/reload.
    // Its barrel axis is the local +Y axis.
    // -----------------------------------------------

    const pistol = makeGun(scene);
    const gun = pistol.group;
    const slideGroup = pistol.slideGroup;
    const gunReady = new THREE.Vector3(0.18, -0.14, -1.15);
    gun.position.copy(equipStartPos);

    const gunState = {
      phase: "equip",
      shotTime: 0,
      phaseTime: 0,
      card: null,
      target: new THREE.Vector3(),
      aimQuaternion: new THREE.Quaternion(),
      direction: new THREE.Vector3(0, 0, -1),
      bullet: null,
      tracer: null,
      muzzleFlash: null,
      bulletStart: new THREE.Vector3(),
    };

    const updateAim = () => {
      raycaster.setFromCamera(pointerNdc, camera);
      if (!raycaster.ray.intersectPlane(wallPlane, aimTarget)) {
        aimTarget.set(0, 0, WALL_Z);
      }

      torchDirection.copy(aimTarget).sub(torchBase).normalize();
      if (gunState.phase === "idle" || gunState.phase === "equip") {
        torch.group.position.copy(torchBase);
      }
      torch.group.quaternion.setFromUnitVectors(UP, torchDirection);
      torch.group.updateMatrixWorld(true);

      lensWorld.copy(torch.lensLocal);
      torch.group.localToWorld(lensWorld);

      beamDirection.copy(aimTarget).sub(lensWorld);
      const beamDistance = Math.max(0.2, beamDirection.length());
      beamDirection.normalize();

      torchSpot.position.copy(lensWorld);
      torchSpot.target.position.copy(aimTarget);
      torchSpot.target.updateMatrixWorld();

      beamQuaternion.setFromUnitVectors(UP, beamDirection);
      beam.position.copy(lensWorld);
      beam.quaternion.copy(beamQuaternion);
      beam.scale.set(1, beamDistance, 1);
      softBeam.position.copy(lensWorld);
      softBeam.quaternion.copy(beamQuaternion);
      softBeam.scale.set(1, beamDistance, 1);

      gunDirection.copy(aimTarget).sub(gunReady).normalize();
      gunIdleQuaternion.setFromUnitVectors(UP, gunDirection);
      if (gunState.phase === "idle") {
        gun.position.copy(gunReady);
        gun.quaternion.copy(gunIdleQuaternion);
        gun.updateMatrixWorld(true);
      }
    };

    const debris = [];
    const bats = [];
    const particles = [];
    let navigated = false;
    let transitionStarted = false;

    function spawnShotEffects(muzzleStart, ejectStart, ejectRight) {
      // Multi-layered muzzle flash: hot core, warm bloom halo, and volumetric cross flare.
      const flashLight = new THREE.PointLight(0xffb45c, 28, 5.5, 1.8);
      flashLight.position.copy(muzzleStart);
      scene.add(flashLight);

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.095, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xfff1c9, transparent: true, opacity: 0.96 })
      );
      core.position.copy(muzzleStart);
      scene.add(core);

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 12, 10),
        new THREE.MeshBasicMaterial({
          color: 0xff9436,
          transparent: true,
          opacity: 0.58,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      halo.position.copy(muzzleStart);
      scene.add(halo);

      const cross = new THREE.Group();
      cross.position.copy(muzzleStart);
      cross.quaternion.copy(gunState.aimQuaternion);
      cross.rotateY(Math.random() * Math.PI);
      const flareMat = new THREE.MeshBasicMaterial({
        color: 0xffe1a8,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const flareGeo = new THREE.PlaneGeometry(0.44, 0.085);
      const flareA = new THREE.Mesh(flareGeo, flareMat);
      const flareB = new THREE.Mesh(flareGeo.clone(), flareMat.clone());
      flareB.rotation.y = Math.PI / 2;
      cross.add(flareA, flareB);
      scene.add(cross);

      // Expanding dark gun-smoke puffs drifting from the muzzle.
      for (let i = 0; i < 5; i++) {
        const smokeMat = new THREE.MeshBasicMaterial({
          color: 0x525256,
          transparent: true,
          opacity: 0.24,
          depthWrite: false,
        });
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), smokeMat);
        puff.position.copy(muzzleStart).addScaledVector(gunState.direction, 0.06 + i * 0.05);
        scene.add(puff);
        particles.push({
          kind: "smoke",
          mesh: puff,
          velocity: gunState.direction.clone()
            .multiplyScalar(0.85 + Math.random() * 1.1)
            .add(new THREE.Vector3(
              (Math.random() - 0.5) * 0.45,
              0.38 + Math.random() * 0.45,
              (Math.random() - 0.5) * 0.35
            )),
          spin: new THREE.Vector3(0, 0, 0),
          gravity: 0,
          age: 0,
          life: 0.48 + Math.random() * 0.18,
          baseOpacity: 0.24,
        });
      }

      // Spent brass casing tumbling out of the ejection port.
      const casing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.013, 0.013, 0.048, 8),
        new THREE.MeshStandardMaterial({
          color: 0x6b5834,
          metalness: 0.65,
          roughness: 0.42,
        })
      );
      casing.position.copy(ejectStart);
      casing.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      scene.add(casing);
      particles.push({
        kind: "casing",
        mesh: casing,
        velocity: ejectRight.clone()
          .multiplyScalar(1.6 + Math.random() * 0.6)
          .add(new THREE.Vector3(0, 1.55 + Math.random() * 0.4, 0.35)),
        spin: new THREE.Vector3(
          14 + Math.random() * 12,
          12 + Math.random() * 10,
          18 + Math.random() * 12
        ),
        gravity: 9.2,
        age: 0,
        life: 1.05,
        baseOpacity: 1,
      });

      return { light: flashLight, core, halo, cross };
    }

    function createBullet(start, end, ejectStart, ejectRight) {
      const bulletMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd08a,
        emissive: 0xff7b24,
        emissiveIntensity: 4,
        metalness: 0.25,
        roughness: 0.2,
      });
      const bullet = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), bulletMaterial);
      bullet.position.copy(start);
      scene.add(bullet);

      const points = [start.clone(), start.clone()];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const tracer = new THREE.Line(
        lineGeometry,
        new THREE.LineBasicMaterial({ color: 0xffc477, transparent: true, opacity: 0.95 })
      );
      scene.add(tracer);

      gunState.bullet = bullet;
      gunState.tracer = tracer;
      gunState.muzzleFlash = spawnShotEffects(start, ejectStart, ejectRight);
      gunState.bulletStart.copy(start);
      gunState.target.copy(end);
    }

    function shatterCard(card) {
      if (card.broken) return;
      card.broken = true;
      card.group.updateMatrixWorld(true);

      const cols = 5;
      const rows = 4;
      const w = card.width;
      const h = card.height;
      const x0 = -w / 2;
      const y0 = -h / 2;
      const center = card.group.getWorldPosition(new THREE.Vector3());

      const corners = (x, y) => new THREE.Vector3(x, y, 0.105).applyMatrix4(card.group.matrixWorld);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const xa = x0 + (col / cols) * w;
          const xb = x0 + ((col + 1) / cols) * w;
          const ya = y0 + (row / rows) * h;
          const yb = y0 + ((row + 1) / rows) * h;
          const uvA = [col / cols, row / rows];
          const uvB = [(col + 1) / cols, row / rows];
          const uvC = [(col + 1) / cols, (row + 1) / rows];
          const uvD = [col / cols, (row + 1) / rows];

          const triangles = [
            [[xa, ya, uvA], [xb, ya, uvB], [xb, yb, uvC]],
            [[xa, ya, uvA], [xb, yb, uvC], [xa, yb, uvD]],
          ];

          for (const tri of triangles) {
            const worldVertices = tri.map(([x, y]) => corners(x, y));
            const centroid = worldVertices[0].clone()
              .add(worldVertices[1])
              .add(worldVertices[2])
              .multiplyScalar(1 / 3);

            const positions = [];
            const uvs = [];
            tri.forEach((vertex, index) => {
              const local = worldVertices[index].clone().sub(centroid);
              positions.push(local.x, local.y, local.z);
              uvs.push(vertex[2][0], 1 - vertex[2][1]);
            });

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
            geometry.computeVertexNormals();

            const material = new THREE.MeshStandardMaterial({
              map: card.texture,
              roughness: 0.8,
              metalness: 0.02,
              side: THREE.DoubleSide,
              transparent: true,
            });
            const shard = new THREE.Mesh(geometry, material);
            shard.position.copy(centroid);
            shard.castShadow = true;
            scene.add(shard);

            const edge = new THREE.LineSegments(
              new THREE.EdgesGeometry(geometry),
              new THREE.LineBasicMaterial({ color: 0x51432f, transparent: true, opacity: 0.85 })
            );
            shard.add(edge);

            const outward = centroid.clone().sub(center).normalize();
            const velocity = new THREE.Vector3(
              outward.x * (1.2 + Math.random() * 2.7) + (Math.random() - 0.5) * 1.6,
              outward.y * (1.2 + Math.random() * 2.7) + Math.random() * 1.2,
              1.7 + Math.random() * 3.2
            );

            debris.push({
              mesh: shard,
              velocity,
              spin: new THREE.Vector3(
                (Math.random() - 0.5) * 7,
                (Math.random() - 0.5) * 7,
                (Math.random() - 0.5) * 7
              ),
              age: 0,
              life: 2.8 + Math.random() * 0.7,
            });
          }
        }
      }

      card.group.visible = false;
    }

    function releaseBats(card) {
      const origin = card.group.getWorldPosition(new THREE.Vector3());
      origin.z += 0.18;

      for (let i = 0; i < 11; i++) {
        const start = origin.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * card.width * 0.8,
          (Math.random() - 0.5) * card.height * 0.7,
          (Math.random() - 0.5) * 0.18
        ));
        const bat = makeBat(scene, start, i === 0);
        bats.push(bat);
      }
    }

    function disposeObjectTree(root) {
      root.traverse((object) => {
        if (object.isMesh || object.isLine) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material?.dispose();
          }
        }
      });
    }

    function clearShotVisuals() {
      if (gunState.bullet) {
        scene.remove(gunState.bullet);
        disposeObjectTree(gunState.bullet);
      }
      if (gunState.tracer) {
        scene.remove(gunState.tracer);
        disposeObjectTree(gunState.tracer);
      }
      if (gunState.muzzleFlash) {
        scene.remove(gunState.muzzleFlash.light);
        scene.remove(gunState.muzzleFlash.core);
        scene.remove(gunState.muzzleFlash.halo);
        scene.remove(gunState.muzzleFlash.cross);
        disposeObjectTree(gunState.muzzleFlash.core);
        disposeObjectTree(gunState.muzzleFlash.halo);
        disposeObjectTree(gunState.muzzleFlash.cross);
      }
      gunState.bullet = null;
      gunState.tracer = null;
      gunState.muzzleFlash = null;
    }

    function startEquipAnimation() {
      gun.visible = true;
      gun.position.copy(equipStartPos);
      slideGroup.position.set(0, 0, 0);
      gunState.phase = "equip";
      gunState.phaseTime = performance.now();
      gun.quaternion.copy(gunIdleQuaternion).multiply(holsterOffsetQuat);
    }

    function resetSceneState() {
      navigated = false;
      transitionStarted = false;

      if (overlay) {
        overlay.style.opacity = "0";
      }

      clearShotVisuals();
      gunState.card = null;
      camera.position.set(0, 0, 0);
      camera.lookAt(0, 0, -10);
      torch.group.position.copy(torchBase);

      for (let i = bats.length - 1; i >= 0; i--) {
        scene.remove(bats[i].group);
        disposeObjectTree(bats[i].group);
      }
      bats.length = 0;

      for (let i = debris.length - 1; i >= 0; i--) {
        scene.remove(debris[i].mesh);
        disposeObjectTree(debris[i].mesh);
      }
      debris.length = 0;

      for (let i = particles.length - 1; i >= 0; i--) {
        scene.remove(particles[i].mesh);
        disposeObjectTree(particles[i].mesh);
      }
      particles.length = 0;

      cards.forEach((card) => {
        card.broken = false;
        card.group.visible = true;
      });

      updateAim();
      startEquipAnimation();
    }

    function beginShot(card) {
      if (
        transitionStarted ||
        gunState.phase !== "idle" ||
        bats.length > 0 ||
        card.broken ||
        navigated
      ) return;

      transitionStarted = true;
      const target = card.group.getWorldPosition(new THREE.Vector3());

      gunState.target.copy(target);
      gunState.card = card;

      // Pistol barrel points along local +Y.
      const direction = target.clone().sub(gunReady).normalize();
      gunState.direction.copy(direction);
      gunState.aimQuaternion.setFromUnitVectors(UP, direction);

      const now = performance.now();
      gunState.phase = "fire";
      gunState.phaseTime = now;
      gunState.shotTime = now;

      gun.visible = true;
      gun.position.copy(gunReady);
      gun.quaternion.copy(gunState.aimQuaternion);
      slideGroup.position.set(0, 0, 0);
      gun.updateMatrixWorld(true);

      const muzzlePosition = pistol.barrelTipLocal.clone();
      gun.localToWorld(muzzlePosition);

      const ejectPosition = pistol.ejectionPortLocal.clone();
      gun.localToWorld(ejectPosition);

      const ejectRight = new THREE.Vector3(1, 0, 0)
        .applyQuaternion(gunState.aimQuaternion)
        .normalize();

      createBullet(muzzlePosition, target, ejectPosition, ejectRight);
    }

    function updateGun(now) {
      if (gunState.phase === "idle") return;

      const elapsed = now - gunState.phaseTime;

      if (gunState.phase === "equip") {
        const t = clamp(elapsed / 880);

        if (t < 0.52) {
          const p1 = t / 0.52;
          const e1 = 1 - Math.pow(1 - p1, 3);
          gun.position.lerpVectors(equipStartPos, equipMidPos, e1);
          gun.position.x += Math.sin(p1 * Math.PI) * 0.12;
          gun.position.z -= Math.sin(p1 * Math.PI) * 0.08;
          equipWorkQuat.copy(holsterOffsetQuat).slerp(equipMidOffsetQuat, e1);
          gun.quaternion.copy(gunIdleQuaternion).multiply(equipWorkQuat);
          slideGroup.position.y = 0;
        } else {
          const p2 = (t - 0.52) / 0.48;
          const e2 = smoothstep(p2);
          gun.position.lerpVectors(equipMidPos, gunReady, e2);

          // Chamber-check slide rack before locking smoothly above the torch.
          let rack = 0;
          if (p2 >= 0.06 && p2 < 0.30) {
            rack = smoothstep((p2 - 0.06) / 0.24) * 0.14;
          } else if (p2 >= 0.30 && p2 <= 0.56) {
            rack = (1 - smoothstep((p2 - 0.30) / 0.26)) * 0.14;
          }
          slideGroup.position.y = -rack;

          const snapBump = Math.sin(clamp((p2 - 0.54) / 0.32) * Math.PI) * 0.032;
          equipWorkQuat.copy(equipMidOffsetQuat).slerp(identityQuat, e2);
          equipSnapEuler.set(snapBump, 0, -snapBump * 0.4, "YXZ");
          equipSnapQuat.setFromEuler(equipSnapEuler);
          gun.quaternion.copy(gunIdleQuaternion).multiply(equipWorkQuat).multiply(equipSnapQuat);
        }

        if (t >= 1) {
          gun.position.copy(gunReady);
          gun.quaternion.copy(gunIdleQuaternion);
          slideGroup.position.set(0, 0, 0);
          gunState.phase = "idle";
        }
        return;
      }

      // Continuous underdamped spring recoil shared smoothly across fire and recovery.
      const rt = clamp((now - gunState.shotTime) / 480);
      const rawKick = rt < 0.13
        ? Math.pow(rt / 0.13, 0.45)
        : Math.exp(-6.2 * (rt - 0.13)) * Math.cos(10.5 * (rt - 0.13));
      const kickEnv = rawKick * (1 - smoothstep((rt - 0.78) / 0.22));

      gun.position.copy(gunReady).addScaledVector(gunState.direction, -kickEnv * 0.18);
      gun.position.y += Math.max(0, kickEnv) * 0.04;

      const aimBlend = gunState.phase === "recoil" ? smoothstep(clamp(elapsed / 345)) : 0;
      baseAimQuat.copy(gunState.aimQuaternion).slerp(gunIdleQuaternion, aimBlend);
      recoilEuler.set(kickEnv * 0.34, -kickEnv * 0.12, kickEnv * 0.04, "YXZ");
      recoilRotation.setFromEuler(recoilEuler);
      gun.quaternion.copy(baseAimQuat).multiply(recoilRotation);

      const slideBack = rt < 0.14
        ? (rt / 0.14) * 0.22
        : Math.max(0, 1 - (rt - 0.14) / 0.26) * 0.22;
      slideGroup.position.y = -slideBack;

      camera.position.set(0, kickEnv * 0.012, kickEnv * 0.032);
      camera.rotation.set(kickEnv * 0.022, 0, -kickEnv * 0.008);
      torch.group.position.copy(torchBase);
      torch.group.position.y -= Math.max(0, kickEnv) * 0.025;

      if (gunState.phase === "fire") {
        const progress = clamp(elapsed / 135);

        if (gunState.bullet) {
          bulletCurrent.copy(gunState.bulletStart).lerp(gunState.target, progress);
          gunState.bullet.position.copy(bulletCurrent);
          const positions = gunState.tracer.geometry.attributes.position;
          positions.setXYZ(0, gunState.bulletStart.x, gunState.bulletStart.y, gunState.bulletStart.z);
          positions.setXYZ(1, bulletCurrent.x, bulletCurrent.y, bulletCurrent.z);
          positions.needsUpdate = true;
        }

        if (gunState.muzzleFlash) {
          const fade = 1 - progress;
          gunState.muzzleFlash.light.intensity = 28 * fade * fade;
          gunState.muzzleFlash.core.scale.setScalar(0.5 + fade * 0.9);
          gunState.muzzleFlash.core.material.opacity = fade;
          gunState.muzzleFlash.halo.scale.setScalar(0.7 + (1 - fade) * 1.4);
          gunState.muzzleFlash.halo.material.opacity = fade * 0.58;
          gunState.muzzleFlash.cross.scale.setScalar(0.4 + fade * 1.1);
          gunState.muzzleFlash.cross.children.forEach((plane) => {
            plane.material.opacity = fade * 0.85;
          });
        }

        if (progress >= 1) {
          clearShotVisuals();
          shatterCard(gunState.card);
          releaseBats(gunState.card);

          gunState.phase = "recoil";
          gunState.phaseTime = now;
        }
      } else if (gunState.phase === "recoil" && rt >= 1) {
        gun.position.copy(gunReady);
        gun.quaternion.copy(gunIdleQuaternion);
        slideGroup.position.set(0, 0, 0);
        camera.position.set(0, 0, 0);
        camera.lookAt(0, 0, -10);
        camera.updateMatrixWorld(true);
        torch.group.position.copy(torchBase);
        gunState.phase = "idle";
        updateAim();
      }
    }

    function updateParticles(delta) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += delta;
        p.velocity.y -= p.gravity * delta;
        p.mesh.position.addScaledVector(p.velocity, delta);

        if (p.kind === "smoke") {
          const t = clamp(p.age / p.life);
          p.mesh.scale.setScalar(1 + t * 2.8);
          p.mesh.material.opacity = p.baseOpacity * (1 - t);
        } else {
          p.mesh.rotation.x += p.spin.x * delta;
          p.mesh.rotation.y += p.spin.y * delta;
          p.mesh.rotation.z += p.spin.z * delta;
        }

        if (p.age >= p.life) {
          scene.remove(p.mesh);
          disposeObjectTree(p.mesh);
          particles.splice(i, 1);
        }
      }
    }

    function updateDebris(delta) {
      for (let i = debris.length - 1; i >= 0; i--) {
        const piece = debris[i];
        piece.age += delta;
        piece.velocity.y -= 4.5 * delta;
        piece.mesh.position.addScaledVector(piece.velocity, delta);
        piece.mesh.rotation.x += piece.spin.x * delta;
        piece.mesh.rotation.y += piece.spin.y * delta;
        piece.mesh.rotation.z += piece.spin.z * delta;

        const fade = clamp(1 - piece.age / piece.life);
        piece.mesh.material.opacity = fade;

        if (piece.age >= piece.life) {
          scene.remove(piece.mesh);
          disposeObjectTree(piece.mesh);
          debris.splice(i, 1);
        }
      }
    }

    const HERO_BAT_DURATION = 1.25;
    const HERO_BAT_EXP_K = 4.2;
    const HERO_BAT_EXP_NORM = Math.exp(HERO_BAT_EXP_K) - 1;
    const heroDestination = new THREE.Vector3(0, 0, -0.38);

    function updateBats(delta) {
      for (let i = bats.length - 1; i >= 0; i--) {
        const bat = bats[i];
        bat.age += delta;

        if (bat.hero) {
          const progress = clamp(bat.age / HERO_BAT_DURATION);
          // Starts at normal pace alongside the flock, then accelerates exponentially with time.
          const accel = (Math.exp(HERO_BAT_EXP_K * progress) - 1) / HERO_BAT_EXP_NORM;

          const heroFlap = Math.sin(bat.age * (19 + progress * 24)) * (0.78 + progress * 0.16);
          bat.leftWing.rotation.z = heroFlap;
          bat.rightWing.rotation.z = -heroFlap;

          bat.group.position.lerpVectors(bat.start, heroDestination, accel);
          bat.group.position.x += Math.sin(bat.age * 20) * 0.07 * (1 - progress);
          bat.group.position.y += Math.cos(bat.age * 17) * 0.06 * (1 - progress);
          bat.group.scale.setScalar(0.42 + accel * 3.65);

          if (overlay) {
            overlay.style.opacity = String(clamp((progress - 0.72) / 0.28));
          }

          if (progress >= 1 && !navigated) {
            navigated = true;

            const destinationRoute = gunState.card?.href || "/";
            if (overlay) {
              overlay.style.opacity = "1";
            }

            router.push(destinationRoute);
          }
        } else {
          // Normal bat speed & flutter as before.
          const flap = Math.sin(bat.age * 19) * 0.78;
          bat.leftWing.rotation.z = flap;
          bat.rightWing.rotation.z = -flap;

          bat.group.position.addScaledVector(bat.velocity, delta);
          bat.group.rotation.z += Math.sin(bat.age * 5) * delta * 0.22;
          bat.group.scale.setScalar(bat.baseScale * (1 + Math.sin(bat.age * 8) * 0.08));

          if (bat.age > 3.0) {
            scene.remove(bat.group);
            disposeObjectTree(bat.group);
            bats.splice(i, 1);
          }
        }
      }
    }

    // -----------------------------------------------
    // POINTER: direct ray-to-wall mapping, no lerp.
    // -----------------------------------------------

    const handlePointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      updateAim();

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${event.clientX - rect.left}px, ${event.clientY - rect.top}px, 0)`;
      }
    };

    const handlePointerDown = (event) => {
      if (
        event.button !== 0 ||
        gunState.phase !== "idle" ||
        transitionStarted ||
        navigated
      ) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(cardMeshes, false);
      const card = hits[0]?.object?.userData?.card;
      if (card && !card.broken) {
        event.preventDefault();
        beginShot(card);
      }
    };

    const handlePageShow = (event) => {
      if (event.persisted) {
        resetSceneState();
      }
    };

    renderer.domElement.addEventListener("pointermove", handlePointerMove, { passive: true });
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pageshow", handlePageShow);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      const aspect = width / height;
      camera.aspect = aspect;

      // A slightly wider field of view helps the wall fit on tablets.
      camera.fov = aspect < 1.45 ? 56 : 48;
      camera.updateProjectionMatrix();

      // Re-arrange the actual 3D boards on narrow screens rather than
      // letting the left/right boards disappear outside the camera view.
      if (aspect < 0.9) {
        const mobileLayout = {
          about: [-1.12, 2.15, -8.7],
          projects: [1.12, 2.15, -8.7],
          skills: [-1.12, -0.1, -8.7],
          experience: [1.12, -0.1, -8.7],
          contact: [0, -2.35, -8.7],
        };
        cards.forEach((card) => {
          card.group.position.set(...mobileLayout[card.id]);
          card.group.scale.setScalar(0.62);
        });
      } else if (aspect < 1.45) {
        const tabletLayout = {
          about: [-4.45, 1.05, -8.7],
          projects: [0, 1.45, -8.65],
          skills: [4.45, 0.95, -8.7],
          experience: [-2.65, -2.25, -8.65],
          contact: [2.65, -2.35, -8.65],
        };
        cards.forEach((card) => {
          card.group.position.set(...tabletLayout[card.id]);
          card.group.scale.setScalar(0.9);
        });
      } else {
        cards.forEach((card) => {
          card.group.position.set(...card.position);
          card.group.scale.setScalar(1);
        });
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height);
      updateAim();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    window.addEventListener("resize", resize);
    resize();
    startEquipAnimation();

    let frameId = 0;
    let previousTime = performance.now();
    const animate = (now) => {
      const delta = Math.min((now - previousTime) / 1000, 0.035);
      previousTime = now;

      updateGun(now);
      updateParticles(delta);
      updateDebris(delta);
      updateBats(delta);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      if (overlay) {
        overlay.style.opacity = "0";
      }
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pageshow", handlePageShow);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      // Clear bat, debris, and particle references on scene teardown.
      bats.length = 0;
      debris.length = 0;
      particles.length = 0;
      disposeObjectTree(scene);
      wallTexture.dispose();
      cards.forEach((card) => card.texture.dispose());

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [router]);

  return (
    <main className="horror-portfolio">
      <div ref={mountRef} className="three-scene" />

      <div ref={cursorRef} className="aim-cursor" aria-hidden="true">
        <span />
      </div>

      <header className="scene-header">
        <div className="brand-mark">
          <span className="brand-symbol">L.</span>
          <span className="brand-name">THE UNKNOWN ROOM</span>
        </div>
        <div className="header-status">
          <span className="status-light" />
          <span>ENVIRONMENT ACTIVE</span>
        </div>
      </header>

      <section className="scene-intro">
        <span className="intro-eyebrow">AN INTERACTIVE EXPERIENCE</span>
        <h1>
          Find your way
          <br />
          <span>through the dark.</span>
        </h1>
        <p>Move your light around. Click an archive to uncover what is hidden.</p>
      </section>

      <div className="scene-instruction">
        <span className="instruction-icon">✣</span>
        <span>MOVE TO EXPLORE · CLICK AN ARCHIVE TO ENTER</span>
      </div>

      <footer className="scene-footer">
        <span>PORTFOLIO / INTERACTIVE ARCHIVE</span>
        <span>KEEP LOOKING.</span>
      </footer>

      <div ref={overlayRef} className="transition-overlay" aria-hidden="true" />

      <style jsx global>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #020203; overflow: hidden; }
        .horror-portfolio {
          position: relative; width: 100%; height: 100svh; min-height: 600px;
          overflow: hidden; isolation: isolate; background: #030305; color: #e7dcc7;
          cursor: none; font-family: Arial, Helvetica, sans-serif;
        }
        .three-scene { position: absolute; inset: 0; z-index: 1; }
        .three-scene canvas { display: block; width: 100%; height: 100%; outline: none; }
        .aim-cursor {
          position: absolute; top: 0; left: 0; z-index: 22; width: 30px; height: 30px;
          margin: -15px 0 0 -15px; pointer-events: none; will-change: transform;
          border: 1px solid rgba(255,235,198,.78); border-radius: 50%;
          box-shadow: 0 0 12px rgba(255,213,155,.35);
        }
        .aim-cursor::before, .aim-cursor::after {
          content: ""; position: absolute; background: rgba(255,235,198,.75);
        }
        .aim-cursor::before { width: 44px; height: 1px; left: -8px; top: 14px; }
        .aim-cursor::after { height: 44px; width: 1px; top: -8px; left: 14px; }
        .aim-cursor span {
          position: absolute; width: 3px; height: 3px; border-radius: 50%;
          background: #ffe8c4; top: 12px; left: 12px;
        }
        .scene-header {
          position: absolute; top: 0; left: 0; right: 0; z-index: 25;
          padding: 29px 42px; display: flex; justify-content: space-between; align-items: center;
          pointer-events: none;
        }
        .brand-mark { display: flex; gap: 11px; align-items: center; color: #d9c9ad; }
        .brand-symbol {
          width: 35px; height: 35px; display: grid; place-items: center;
          border: 1px solid rgba(220,198,160,.52); font: 16px Georgia,serif;
        }
        .brand-name { font: 9px monospace; letter-spacing: 2px; }
        .header-status {
          display: flex; align-items: center; gap: 9px; color: rgba(223,212,192,.56);
          font: 8px monospace; letter-spacing: 1.6px;
        }
        .status-light {
          width: 6px; height: 6px; border-radius: 50%; background: #b8a078;
          box-shadow: 0 0 9px #d5b47b; animation: status-pulse 2.5s ease-in-out infinite;
        }
        @keyframes status-pulse { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
        .scene-intro {
          position: absolute; left: 50%; top: 6%; width: 440px; max-width: 75%; z-index: 12;
          transform: translateX(-50%); text-align: center; pointer-events: none;
          text-shadow: 0 2px 15px #000;
        }
        .intro-eyebrow { color: #b6a281; font: 8px monospace; letter-spacing: 3px; }
        .scene-intro h1 {
          margin: 13px 0 9px; color: #e4d9c4; font: 400 clamp(27px,3.8vw,47px)/1.05 Georgia,serif;
          letter-spacing: -1.5px;
        }
        .scene-intro h1 span { color: #bba782; font-style: italic; }
        .scene-intro p { margin: 0; color: rgba(224,212,190,.65); font-size: 10px; }
        .scene-instruction {
          position: absolute; left: 50%; bottom: 39px; z-index: 25; transform: translateX(-50%);
          display: flex; align-items: center; gap: 10px; width: max-content;
          color: rgba(221,207,181,.78); font: 8px monospace; letter-spacing: 1.4px;
          pointer-events: none; text-shadow: 0 2px 12px #000;
        }
        .instruction-icon { font-size: 15px; color: #cbb48a; }
        .scene-footer {
          position: absolute; left: 42px; right: 42px; bottom: 19px; z-index: 25;
          display: flex; justify-content: space-between; color: rgba(220,207,184,.38);
          font: 7px monospace; letter-spacing: 1.6px; pointer-events: none;
        }
        .transition-overlay {
          position: absolute; inset: 0; z-index: 40; background: #020103;
          opacity: 0; pointer-events: none; will-change: opacity;
        }
        @media (max-width: 700px) {
          .scene-header { padding: 18px; }
          .brand-symbol { width: 29px; height: 29px; }
          .brand-name { font-size: 7px; letter-spacing: 1.2px; }
          .header-status { font-size: 6px; letter-spacing: .8px; }
          .scene-intro { top: 9%; max-width: 90%; }
          .scene-intro h1 { font-size: clamp(26px,8vw,37px); }
          .scene-intro p { font-size: 9px; }
          .scene-instruction { bottom: 17px; font-size: 6px; letter-spacing: .8px; }
          .scene-footer { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .status-light { animation: none; }
        }
      `}</style>
    </main>
  );
}
