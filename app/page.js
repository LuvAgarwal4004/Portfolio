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
  group.position.set(0, -0.48, -0.78);

  const metal = new THREE.MeshStandardMaterial({
    color: 0x555b62,
    metalness: 0.82,
    roughness: 0.3,
  });

  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x252a30,
    metalness: 0.68,
    roughness: 0.36,
  });

  const rubber = new THREE.MeshStandardMaterial({
    color: 0x222327,
    roughness: 0.85,
  });

  const glass = new THREE.MeshStandardMaterial({
    color: 0xffe6b8,
    emissive: 0xffcc75,
    emissiveIntensity: 4.5,
    metalness: 0.2,
    roughness: 0.1,
  });

  const glove = new THREE.MeshStandardMaterial({
    color: 0x29252a,
    roughness: 0.9,
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
  const group = new THREE.Group();
  group.visible = true;

  const steel = new THREE.MeshStandardMaterial({
    color: 0x59616b,
    metalness: 0.86,
    roughness: 0.28,
  });

  const darkSteel = new THREE.MeshStandardMaterial({
    color: 0x272b31,
    metalness: 0.72,
    roughness: 0.35,
  });

  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x29221d,
    roughness: 0.88,
  });

  const slide = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.88, 0.25), steel);
  slide.position.set(0, 0.86, 0);
  group.add(slide);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 1.12, 20), darkSteel);
  barrel.position.set(0, 1.14, 0);
  group.add(barrel);

  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.075, 24), steel);
  muzzle.position.set(0, 1.49, 0);
  group.add(muzzle);

  const muzzleHole = new THREE.Mesh(new THREE.CylinderGeometry(0.073, 0.073, 0.078, 24), new THREE.MeshBasicMaterial({ color: 0x020304 }));
  muzzleHole.position.set(0, 1.535, 0);
  group.add(muzzleHole);

  const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.11, 0.25), darkSteel);
  rearSight.position.set(0, 1.34, 0);
  group.add(rearSight);

  const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.23), steel);
  frontSight.position.set(0, 1.49, 0);
  group.add(frontSight);

  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.63, 0.27), gripMat);
  grip.position.set(-0.055, 0.12, 0);
  grip.rotation.z = -0.16;
  group.add(grip);

  const gripPanel = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.49, 0.22), darkSteel);
  gripPanel.position.set(-0.22, 0.12, 0);
  gripPanel.rotation.z = -0.16;
  group.add(gripPanel);

  const triggerGuard = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.025, 8, 20, Math.PI),
    steel
  );
  triggerGuard.position.set(0.04, 0.38, 0.03);
  triggerGuard.rotation.z = Math.PI;
  group.add(triggerGuard);

  const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.18, 0.04), darkSteel);
  trigger.position.set(0.045, 0.32, 0.08);
  trigger.rotation.z = -0.2;
  group.add(trigger);

  const hand = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.42, 5, 10), gripMat);
  hand.position.set(-0.055, -0.02, 0.13);
  hand.rotation.z = -0.12;
  group.add(hand);

  // Small metallic screws and slide grooves.
  for (const z of [-0.13, 0.13]) {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 12), steel);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(0.13, 0.68, z);
    group.add(screw);
  }

  scene.add(group);
  return group;
}

export default function Home() {
  const mountRef = useRef(null);
  const cursorRef = useRef(null);
  const overlayRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

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

    // The wall is physically behind the boards on negative Z.
    const wallTexture = makeWallTexture();
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 13.5),
      new THREE.MeshStandardMaterial({
        map: wallTexture,
        color: 0xc2b394,
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
    const torchSpot = new THREE.SpotLight(0xffdfae, 115, 18, 0.215, 0.82, 1.45);
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

    const updateAim = () => {
      raycaster.setFromCamera(pointerNdc, camera);
      raycaster.ray.intersectPlane(wallPlane, aimTarget);

      const torchDirection = aimTarget.clone().sub(torchBase).normalize();
      torch.group.position.copy(torchBase);
      torch.group.quaternion.setFromUnitVectors(UP, torchDirection);
      torch.group.updateMatrixWorld(true);

      lensWorld.copy(torch.lensLocal);
      torch.group.localToWorld(lensWorld);

      const beamDirection = aimTarget.clone().sub(lensWorld);
      const beamDistance = Math.max(0.2, beamDirection.length());
      beamDirection.normalize();

      torchSpot.position.copy(lensWorld);
      torchSpot.target.position.copy(aimTarget);
      torchSpot.target.updateMatrixWorld();

      const beamQuaternion = new THREE.Quaternion().setFromUnitVectors(UP, beamDirection);
      beam.position.copy(lensWorld);
      beam.quaternion.copy(beamQuaternion);
      beam.scale.set(1, beamDistance, 1);
      softBeam.position.copy(lensWorld);
      softBeam.quaternion.copy(beamQuaternion);
      softBeam.scale.set(1, beamDistance, 1);
    };

    // -----------------------------------------------
    // 3D GUN: hidden until a portfolio board is clicked.
    // -----------------------------------------------

    const gun = makeGun(scene);
    const gunStart = new THREE.Vector3(0.75, -0.62, -1.05);
    const gunReady = new THREE.Vector3(0.75, -0.62, -1.05);
    const gunState = {
      phase: "idle",
      startTime: 0,
      phaseTime: 0,
      card: null,
      target: null,
      aimQuaternion: new THREE.Quaternion(),
      direction: new THREE.Vector3(0, 0, -1),
      bullet: null,
      tracer: null,
      muzzleFlash: null,
      bulletStart: new THREE.Vector3(),
    };

    const debris = [];
    const bats = [];
    let navigated = false;
    let transitionStarted = false;
    function createBullet(start, end) {
      const bulletMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd08a,
        emissive: 0xff7b24,
        emissiveIntensity: 4,
        metalness: 0.25,
        roughness: 0.2,
      });
      const bullet = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), bulletMaterial);
      bullet.position.copy(start);
      scene.add(bullet);

      const points = [start.clone(), start.clone()];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const tracer = new THREE.Line(
        lineGeometry,
        new THREE.LineBasicMaterial({ color: 0xffc477, transparent: true, opacity: 0.95 })
      );
      scene.add(tracer);

      const flash = new THREE.PointLight(0xffa43b, 18, 3, 2);
      flash.position.copy(start);
      scene.add(flash);

      const flashBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xffd18a, transparent: true, opacity: 0.95 })
      );
      flashBall.position.copy(start);
      scene.add(flashBall);

      gunState.bullet = bullet;
      gunState.tracer = tracer;
      gunState.muzzleFlash = { light: flash, ball: flashBall };
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
      const direction = target.clone().sub(gunReady).normalize();
      const aimQuaternion = new THREE.Quaternion().setFromUnitVectors(UP, direction);

      gunState.phase = "draw";
      gunState.startTime = performance.now();
      gunState.phaseTime = performance.now();
      gunState.card = card;
      gunState.target = target;
      gunState.direction.copy(direction);
      gunState.aimQuaternion.copy(aimQuaternion);
      gun.visible = true;
      gun.position.copy(gunStart);
      gun.quaternion.identity();
    }

    function updateGun(now) {
      if (gunState.phase === "idle") return;

      const elapsed = now - gunState.phaseTime;

      if (gunState.phase === "draw") {
        const progress = clamp(elapsed / 360);
        const eased = 1 - Math.pow(1 - progress, 3);
        gun.position.lerpVectors(gunStart, gunReady, eased);
        gun.quaternion.identity().slerp(gunState.aimQuaternion, eased);

        if (progress >= 1) {
          gun.position.copy(gunReady);
          gun.quaternion.copy(gunState.aimQuaternion);
          gun.updateMatrixWorld(true);
          const muzzlePosition = new THREE.Vector3(0, 1.56, 0);
          gun.localToWorld(muzzlePosition);
          createBullet(muzzlePosition, gunState.target);
          gunState.phase = "fire";
          gunState.phaseTime = now;
        }
      } else if (gunState.phase === "fire") {
        const progress = clamp(elapsed / 155);
        const recoil = Math.sin(progress * Math.PI) * 0.14;
        gun.position.copy(gunReady).addScaledVector(gunState.direction, -recoil);

        const recoilRotation = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          -Math.sin(progress * Math.PI) * 0.09
        );
        gun.quaternion.copy(gunState.aimQuaternion).multiply(recoilRotation);

        if (gunState.bullet) {
          const current = gunState.bulletStart.clone().lerp(gunState.target, progress);
          gunState.bullet.position.copy(current);
          const positions = gunState.tracer.geometry.attributes.position;
          positions.setXYZ(0, gunState.bulletStart.x, gunState.bulletStart.y, gunState.bulletStart.z);
          positions.setXYZ(1, current.x, current.y, current.z);
          positions.needsUpdate = true;
        }

        if (gunState.muzzleFlash) {
          const fade = 1 - progress;
          gunState.muzzleFlash.light.intensity = 18 * fade;
          gunState.muzzleFlash.ball.scale.setScalar(0.3 + fade * 1.2);
          gunState.muzzleFlash.ball.material.opacity = fade;
        }

        if (progress >= 1) {
          if (gunState.bullet) scene.remove(gunState.bullet);
          if (gunState.tracer) scene.remove(gunState.tracer);
          if (gunState.muzzleFlash) {
            scene.remove(gunState.muzzleFlash.light);
            scene.remove(gunState.muzzleFlash.ball);
          }
          gunState.bullet = null;
          gunState.tracer = null;
          gunState.muzzleFlash = null;

          shatterCard(gunState.card);
          releaseBats(gunState.card);

          gunState.phase = "holster";
          gunState.phaseTime = now;
        }
      } else if (gunState.phase === "holster") {
        const progress = clamp(elapsed / 330);
        const eased = smoothstep(progress);
        gun.position.lerpVectors(gunReady, gunStart, eased);
        gun.quaternion.slerp(new THREE.Quaternion(), eased * 0.12);

        if (progress >= 1) {
          gun.visible = false;
          gunState.phase = "idle";
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
          piece.mesh.geometry.dispose();
          piece.mesh.material.dispose();
          piece.mesh.children.forEach((child) => {
            child.geometry?.dispose();
            child.material?.dispose();
          });
          debris.splice(i, 1);
        }
      }
    }

    function updateBats(delta) {
      for (let i = bats.length - 1; i >= 0; i--) {
        const bat = bats[i];
        bat.age += delta;

        const flap = Math.sin(bat.age * 38) * 1.05;
        bat.leftWing.rotation.z = flap;
        bat.rightWing.rotation.z = -flap;

        if (bat.hero) {
          const progress = clamp(bat.age / 0.26);
          const eased = smoothstep(progress);

          const destination = new THREE.Vector3(
            (Math.random() - 0.5) * 0.08,
            (Math.random() - 0.5) * 0.08,
            -0.38
          );

          bat.group.position.lerpVectors(
            bat.start,
            destination,
            eased
          );

          bat.group.scale.setScalar(0.42 + progress * 8.0);

          if (overlayRef.current) {
            overlayRef.current.style.opacity = String(
              clamp((progress - 0.35) / 0.65)
            );
          }

          if (progress >= 1 && !navigated) {
            navigated = true;

            const destinationRoute = gunState.card?.href || "/";

            // Reset transition state before navigation.
            if (overlayRef.current) {
              overlayRef.current.style.opacity = "0";
            }

            router.push(destinationRoute);
          }
        } else {
          // Faster and more unpredictable bat movement.
          bat.velocity.x += (Math.random() - 0.5) * 18 * delta;
          bat.velocity.y += (Math.random() - 0.5) * 18 * delta;
          bat.velocity.z += (Math.random() - 0.5) * 8 * delta;

          bat.velocity.clampLength(0, 18);

          bat.group.position.addScaledVector(bat.velocity, delta * 8);

          bat.group.rotation.z +=
            Math.sin(bat.age * 18) * delta * 1.2;

          bat.group.rotation.x =
            Math.sin(bat.age * 14) * 0.25;

          bat.group.rotation.y =
            Math.cos(bat.age * 12) * 0.25;

          bat.group.scale.setScalar(
            bat.baseScale * (1 + Math.sin(bat.age * 24) * 0.16)
          );

          if (bat.age > 0.7) {
            scene.remove(bat.group);

            bat.group.traverse((object) => {
              if (object.isMesh) {
                object.geometry.dispose();

                if (Array.isArray(object.material)) {
                  object.material.forEach((m) => m.dispose());
                } else {
                  object.material.dispose();
                }
              }
            });

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
      if (event.button !== 0 || gunState.phase !== "idle") return;
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

    renderer.domElement.addEventListener("pointermove", handlePointerMove, { passive: true });
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
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

    let frameId = 0;
    let previousTime = performance.now();
    const animate = (now) => {
      const delta = Math.min((now - previousTime) / 1000, 0.035);
      previousTime = now;

      updateGun(now);
      updateDebris(delta);
      updateBats(delta);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);

      scene.traverse((object) => {
        if (object.isMesh || object.isLine) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) object.material.forEach((m) => m.dispose());
          else object.material?.dispose();
        }
      });
      if (overlayRef.current) {
        overlayRef.current.style.opacity = "0";
      }
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
