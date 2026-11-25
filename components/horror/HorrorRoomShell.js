"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";

const NAV_ITEMS = [
  { id: "about", href: "/about", code: "001", label: "ABOUT" },
  { id: "projects", href: "/projects", code: "002", label: "PROJECTS" },
  { id: "skills", href: "/skills", code: "003", label: "SKILLS" },
  { id: "experience", href: "/experience", code: "004", label: "EXPERIENCE" },
  { id: "contact", href: "/contact", code: "005", label: "CONTACT" },
];

const UP = new THREE.Vector3(0, 1, 0);
const WALL_Z = -10;

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function makeSubpageWallTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#8d7f68";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
  base.addColorStop(0, "#a79982");
  base.addColorStop(0.55, "#8f816b");
  base.addColorStop(1, "#695c4b");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 18000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const alpha = Math.random() * 0.07;
    ctx.fillStyle = Math.random() > 0.5
      ? `rgba(36,28,20,${alpha})`
      : `rgba(255,236,204,${alpha})`;
    ctx.fillRect(x, y, Math.random() * 3 + 0.5, Math.random() * 2 + 0.5);
  }

  ctx.lineWidth = 1.2;
  for (let i = 0; i < 20; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let j = 0; j < 5; j++) {
      x += (Math.random() - 0.5) * 44;
      y += Math.random() * 28;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(38,28,20,0.20)";
    ctx.stroke();
  }

  const stains = [
    [160, 210, 0.78],
    [1360, 170, 0.72],
    [320, 810, 0.55],
    [1220, 770, 0.85],
    [760, 140, 0.45],
  ];

  for (const [cx, cy, scale] of stains) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    const blob = ctx.createRadialGradient(0, 0, 8, 0, 0, 96);
    blob.addColorStop(0, "rgba(42,5,9,0.78)");
    blob.addColorStop(0.5, "rgba(65,8,14,0.52)");
    blob.addColorStop(0.8, "rgba(72,11,15,0.2)");
    blob.addColorStop(1, "rgba(70,10,13,0)");
    ctx.fillStyle = blob;
    ctx.beginPath();
    ctx.ellipse(0, 0, 100, 58, Math.random() * 0.7, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 26; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 26 + Math.random() * 92;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.62;
      const r = 2 + Math.random() * 6;
      ctx.fillStyle = `rgba(56,5,11,${0.28 + Math.random() * 0.45})`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * (0.55 + Math.random()), Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 3; i++) {
      const x = (Math.random() - 0.5) * 80;
      const y = 16 + Math.random() * 14;
      const len = 35 + Math.random() * 82;
      const drip = ctx.createLinearGradient(x, y, x, y + len);
      drip.addColorStop(0, "rgba(56,5,10,0.7)");
      drip.addColorStop(1, "rgba(56,5,10,0.02)");
      ctx.strokeStyle = drip;
      ctx.lineWidth = 3 + Math.random() * 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x - 5, y + len * 0.3, x + 5, y + len * 0.7, x, y + len);
      ctx.stroke();
    }
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeDustSpriteTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, "rgba(255,232,190,1)");
  grad.addColorStop(0.35, "rgba(255,212,155,0.45)");
  grad.addColorStop(1, "rgba(255,200,130,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeHangingTag(scene, x, y, z, length) {
  const pivot = new THREE.Group();
  pivot.position.set(x, y, z);

  const wireMat = new THREE.MeshStandardMaterial({
    color: 0x2f2922,
    metalness: 0.65,
    roughness: 0.45,
  });
  const tagMat = new THREE.MeshStandardMaterial({
    color: 0x8e7c5d,
    roughness: 0.85,
    metalness: 0.1,
  });
  const pinMat = new THREE.MeshStandardMaterial({
    color: 0x6f5a3e,
    metalness: 0.75,
    roughness: 0.32,
  });

  const wire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, length, 8),
    wireMat
  );
  wire.position.y = -length / 2;
  pivot.add(wire);

  const tag = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.03), tagMat);
  tag.position.y = -length - 0.31;
  tag.castShadow = true;
  pivot.add(tag);

  const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), pinMat);
  rivet.position.set(0, -length - 0.05, 0.02);
  pivot.add(rivet);

  scene.add(pivot);
  return {
    pivot,
    length,
    angle: (Math.random() - 0.5) * 0.18,
    angularVel: 0,
    phase: Math.random() * Math.PI * 2,
  };
}

function makeAmbientBat(scene, startX, startY, startZ) {
  const root = new THREE.Group();
  root.position.set(startX, startY, startZ);
  root.scale.setScalar(0.28 + Math.random() * 0.14);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0a090d,
    roughness: 0.92,
  });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x131117,
    roughness: 0.95,
    side: THREE.DoubleSide,
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x7c1018 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), bodyMat);
  body.scale.set(0.75, 1.25, 0.75);
  root.add(body);

  for (const x of [-0.03, 0.03]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), eyeMat);
    eye.position.set(x, 0.11, 0.09);
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

  const wingGeo = new THREE.ShapeGeometry(wingShape, 8);
  const leftWing = new THREE.Group();
  leftWing.position.x = -0.05;
  const leftMesh = new THREE.Mesh(wingGeo, wingMat);
  leftMesh.scale.x = -1;
  leftWing.add(leftMesh);
  root.add(leftWing);

  const rightWing = new THREE.Group();
  rightWing.position.x = 0.05;
  rightWing.add(new THREE.Mesh(wingGeo, wingMat));
  root.add(rightWing);

  scene.add(root);
  return {
    root,
    leftWing,
    rightWing,
    dir: startX < 0 ? 1 : -1,
    speed: 1.5 + Math.random() * 0.9,
    baseY: startY,
    age: Math.random() * 10,
  };
}

export default function HorrorRoomShell({
  activeId,
  code,
  eyebrow,
  title,
  subtitle,
  children,
}) {
  const canvasMountRef = useRef(null);
  const cursorRef = useRef(null);
  const veilRef = useRef(null);
  const pendulumMeterRef = useRef(null);
  const [cursorHovered, setCursorHovered] = useState(false);

  useEffect(() => {
    const mount = canvasMountRef.current;
    const veil = veilRef.current;
    if (!mount) return;

    // Fade open from dark transition veil on arrival.
    if (veil) {
      veil.style.opacity = "1";
      requestAnimationFrame(() => {
        if (veil) veil.style.opacity = "0";
      });
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030305);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80);
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
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "subpage-three-canvas";
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xb8aa92, 0.15);
    scene.add(ambient);
    const hemi = new THREE.HemisphereLight(0xc9b894, 0x171116, 0.16);
    scene.add(hemi);

    const wallTexture = makeSubpageWallTexture();
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 15),
      new THREE.MeshStandardMaterial({
        map: wallTexture,
        color: 0x9b8e74,
        roughness: 0.96,
        metalness: 0,
      })
    );
    wall.position.set(0, 0, WALL_Z);
    wall.receiveShadow = true;
    scene.add(wall);

    const redPractical = new THREE.PointLight(0x6c1018, 2.5, 10, 1.8);
    redPractical.position.set(-6.5, 3.2, -7.2);
    scene.add(redPractical);

    const warmRimLight = new THREE.PointLight(0x8e724b, 1.4, 9, 2);
    warmRimLight.position.set(6.5, -2.5, -7.2);
    scene.add(warmRimLight);

    // Handheld spotlight + volumetric beam with spring-damped inertia.
    const torchOrigin = new THREE.Vector3(-0.08, -1.05, -0.65);
    const torchSpot = new THREE.SpotLight(0xffdfae, 130, 20, 0.36, 0.85, 1.4);
    torchSpot.castShadow = true;
    torchSpot.shadow.mapSize.set(1024, 1024);
    torchSpot.shadow.bias = -0.00015;
    torchSpot.shadow.radius = 4;
    scene.add(torchSpot);
    scene.add(torchSpot.target);

    const beamGeo = new THREE.CylinderGeometry(1.15, 0.04, 1, 24, 1, true);
    beamGeo.translate(0, 0.5, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffdca3,
      transparent: true,
      opacity: 0.045,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    scene.add(beamMesh);

    // Floating dust motes with aerodynamic swirl & pointer turbulence.
    const DUST_COUNT = 220;
    const dustPositions = new Float32Array(DUST_COUNT * 3);
    const dustVelocities = [];
    for (let i = 0; i < DUST_COUNT; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 18;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      dustPositions[i * 3 + 2] = -2 - Math.random() * 7.5;
      dustVelocities.push({
        vx: (Math.random() - 0.5) * 0.14,
        vy: 0.04 + Math.random() * 0.12,
        vz: (Math.random() - 0.5) * 0.08,
        phase: Math.random() * Math.PI * 2,
      });
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustSprite = makeDustSpriteTexture();
    const dustMat = new THREE.PointsMaterial({
      map: dustSprite,
      size: 0.095,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // Hanging background evidence tags driven by pendulum physics.
    const pendulums = [
      makeHangingTag(scene, -6.2, 4.8, -7.2, 2.2),
      makeHangingTag(scene, 6.4, 4.9, -7.4, 2.6),
    ];

    // Two distant background bats gliding subtly behind the fog.
    const ambientBats = [
      makeAmbientBat(scene, -9.5, 2.4, -8.5),
      makeAmbientBat(scene, 9.5, -1.1, -8.8),
    ];

    const wallPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -WALL_Z);
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2(0, 0);
    const desiredAim = new THREE.Vector3(0, 0, WALL_Z);
    const springAim = new THREE.Vector3(0, 0, WALL_Z);
    const springVel = new THREE.Vector3();
    const beamDir = new THREE.Vector3();
    const beamQuat = new THREE.Quaternion();

    let lastClientX = window.innerWidth * 0.5;
    let lastClientY = window.innerHeight * 0.5;
    let pointerSpeedX = 0;
    let pointerSpeedY = 0;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let scrollAngle = 0;
    let scrollAngVel = 0;
    let cameraSpringY = 0;
    let cameraVelY = 0;

    const updateDesiredAim = () => {
      raycaster.setFromCamera(pointerNdc, camera);
      if (!raycaster.ray.intersectPlane(wallPlane, desiredAim)) {
        desiredAim.set(0, 0, WALL_Z);
      }
    };

    const handlePointerMove = (event) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      pointerNdc.x = (event.clientX / w) * 2 - 1;
      pointerNdc.y = -(event.clientY / h) * 2 + 1;

      const dx = (event.clientX - lastClientX) / w;
      const dy = (event.clientY - lastClientY) / h;
      lastClientX = event.clientX;
      lastClientY = event.clientY;
      pointerSpeedX = clamp(pointerSpeedX + dx * 18, -8, 8);
      pointerSpeedY = clamp(pointerSpeedY + dy * 18, -8, 8);

      // Impart gentle physical draft onto hanging tags from fast cursor sweeps.
      for (const p of pendulums) {
        p.angularVel += dx * 2.4;
      }

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      }

      const targetEl = event.target instanceof Element ? event.target : null;
      const interactive = Boolean(
        targetEl?.closest("a, button, [data-interactive='true'], input, textarea")
      );
      setCursorHovered(interactive);

      updateDesiredAim();
    };

    const handlePointerDown = () => {
      // Tactile room impulse when clicking anywhere.
      for (const p of pendulums) {
        p.angularVel += (Math.random() - 0.5) * 1.1;
      }
      scrollAngVel += (Math.random() - 0.5) * 1.2;
    };

    const handleScroll = () => {
      const curY = window.scrollY;
      const deltaY = curY - lastScrollY;
      lastScrollY = curY;
      scrollVelocity = clamp(scrollVelocity + deltaY * 0.025, -4, 4);
      scrollAngVel += clamp(deltaY * 0.012, -0.45, 0.45);
    };

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.fov = width / height < 1.1 ? 56 : 48;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height);
      updateDesiredAim();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", resize);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    let frameId = 0;
    let prev = performance.now();

    const animate = (now) => {
      const delta = Math.min((now - prev) / 1000, 0.035);
      prev = now;
      const elapsed = now / 1000;

      // 1. Second-order spring-damped flashlight tracking.
      const stiffness = 115;
      const damping = 17;
      const ax = stiffness * (desiredAim.x - springAim.x) - damping * springVel.x;
      const ay = stiffness * (desiredAim.y - springAim.y) - damping * springVel.y;
      springVel.x += ax * delta;
      springVel.y += ay * delta;
      springAim.x += springVel.x * delta;
      springAim.y += springVel.y * delta;

      torchSpot.position.copy(torchOrigin);
      torchSpot.target.position.copy(springAim);
      torchSpot.target.updateMatrixWorld();

      beamDir.copy(springAim).sub(torchOrigin);
      const beamDist = Math.max(0.2, beamDir.length());
      beamDir.normalize();
      beamQuat.setFromUnitVectors(UP, beamDir);
      beamMesh.position.copy(torchOrigin);
      beamMesh.quaternion.copy(beamQuat);
      beamMesh.scale.set(1, beamDist, 1);

      // 2. Subtle scroll-coupled camera parallax & plumb-bob pendulum physics.
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const scrollRatio = clamp(window.scrollY / maxScroll);
      const targetCamY = (0.5 - scrollRatio) * 0.45;
      const camForce = 45 * (targetCamY - cameraSpringY) - 10 * cameraVelY;
      cameraVelY += camForce * delta;
      cameraSpringY += cameraVelY * delta;
      camera.position.y = cameraSpringY;
      camera.lookAt(0, cameraSpringY * 0.2, -10);

      // Plumb-bob pendulum angle for HUD indicator.
      const plumbTorque = -24 * Math.sin(scrollAngle) - 4.2 * scrollAngVel;
      scrollAngVel += plumbTorque * delta;
      scrollAngle += scrollAngVel * delta;
      scrollVelocity *= Math.exp(-6 * delta);
      if (pendulumMeterRef.current) {
        const deg = clamp(scrollAngle * (180 / Math.PI), -24, 24);
        pendulumMeterRef.current.style.transform = `rotate(${deg.toFixed(2)}deg)`;
      }

      // 3. Organic red practical light flicker.
      redPractical.intensity =
        2.35 + Math.sin(elapsed * 7.3) * 0.25 + Math.sin(elapsed * 23.1) * 0.15;

      // 4. Real pendulum physics on hanging background evidence tags.
      const G = 9.8;
      for (const p of pendulums) {
        const draft = Math.sin(elapsed * 0.9 + p.phase) * 0.08;
        const torque = -(G / p.length) * Math.sin(p.angle) - 0.55 * p.angularVel + draft;
        p.angularVel += torque * delta;
        p.angle += p.angularVel * delta;
        p.pivot.rotation.z = p.angle;
      }

      // 5. Aerodynamic dust motes swirled by cursor motion.
      const posAttr = dustGeo.attributes.position;
      const arr = posAttr.array;
      for (let i = 0; i < DUST_COUNT; i++) {
        const v = dustVelocities[i];
        const idx = i * 3;
        const px = arr[idx];
        const py = arr[idx + 1];

        const distX = px - springAim.x * 0.45;
        const distY = py - springAim.y * 0.45;
        const distSq = distX * distX + distY * distY;
        if (distSq < 5.5) {
          const factor = (1 - distSq / 5.5) * delta * 0.85;
          v.vx += pointerSpeedX * factor;
          v.vy -= pointerSpeedY * factor;
        }

        v.vx *= Math.exp(-1.2 * delta);
        v.vy = v.vy * Math.exp(-0.8 * delta) + 0.04 * delta;

        arr[idx] = px + (v.vx + Math.sin(elapsed * 0.7 + v.phase) * 0.08) * delta;
        arr[idx + 1] = py + v.vy * delta;
        arr[idx + 2] += v.vz * delta;

        if (arr[idx] > 9.5) arr[idx] = -9.5;
        if (arr[idx] < -9.5) arr[idx] = 9.5;
        if (arr[idx + 1] > 5.5) arr[idx + 1] = -5.5;
        if (arr[idx + 1] < -5.5) arr[idx + 1] = 5.5;
        if (arr[idx + 2] > -2) arr[idx + 2] = -9.2;
        if (arr[idx + 2] < -9.5) arr[idx + 2] = -2.2;
      }
      posAttr.needsUpdate = true;
      pointerSpeedX *= Math.exp(-8 * delta);
      pointerSpeedY *= Math.exp(-8 * delta);

      // 6. Distant shadow bats drifting across the dark wall.
      for (const b of ambientBats) {
        b.age += delta;
        const flap = Math.sin(b.age * 14) * 0.75;
        b.leftWing.rotation.z = flap;
        b.rightWing.rotation.z = -flap;
        b.root.position.x += b.dir * b.speed * delta;
        b.root.position.y = b.baseY + Math.sin(b.age * 2.2) * 0.42;
        if (b.root.position.x > 11.5) b.root.position.x = -11.5;
        if (b.root.position.x < -11.5) b.root.position.x = 11.5;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", resize);

      scene.traverse((obj) => {
        if (obj.isMesh || obj.isLine || obj.isPoints) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });
      wallTexture.dispose();
      dustSprite.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="horror-subpage">
      <div ref={canvasMountRef} className="subpage-bg-scene" aria-hidden="true" />
      <div className="subpage-vignette" aria-hidden="true" />

      <div
        ref={cursorRef}
        className={`aim-cursor ${cursorHovered ? "is-target" : ""}`}
        aria-hidden="true"
      >
        <span />
      </div>

      <header className="subpage-header">
        <div className="subpage-header-left">
          <Link href="/" className="brand-link" data-interactive="true">
            <span className="brand-symbol">L.</span>
            <span className="brand-text-col">
              <span className="brand-name">THE UNKNOWN ROOM</span>
              <span className="brand-return">← RETURN TO WALL</span>
            </span>
          </Link>
        </div>

        <nav className="subpage-nav" aria-label="Archive Sections">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeId;
            return (
              <Link
                key={item.id}
                href={item.href}
                data-interactive="true"
                className={`nav-pill ${isActive ? "is-active" : ""}`}
              >
                <span className="nav-code">{item.code}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="subpage-status">
          <div className="plumb-bob-wrap" aria-hidden="true">
            <div ref={pendulumMeterRef} className="plumb-bob-arm">
              <span className="plumb-line" />
              <span className="plumb-weight" />
            </div>
          </div>
          <span className="status-light" />
          <span>{code}</span>
        </div>
      </header>

      <main className="subpage-content">
        <section className="subpage-hero">
          <span className="hero-eyebrow">{eyebrow}</span>
          <h1 className="hero-title">
            {title}
            <br />
            <span>{subtitle}</span>
          </h1>
        </section>

        {children}

        <footer className="subpage-footer">
          <span>ARCHIVE / {code} · THE UNKNOWN ROOM</span>
          <Link href="/" className="footer-back" data-interactive="true">
            RETURN TO 3D ARCHIVE WALL →
          </Link>
        </footer>
      </main>

      <div ref={veilRef} className="entry-veil" aria-hidden="true" />

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: #020203;
          color: #e7dcc7;
          overflow-x: hidden;
          overflow-y: auto;
        }
        .horror-subpage {
          position: relative;
          min-height: 100svh;
          width: 100%;
          isolation: isolate;
          background: #030305;
          color: #e7dcc7;
          font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif;
        }
        @media (hover: hover) and (pointer: fine) {
          .horror-subpage,
          .horror-subpage a,
          .horror-subpage button {
            cursor: none;
          }
        }
        .subpage-bg-scene {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .subpage-three-canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
        .subpage-vignette {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(
            circle at 50% 42%,
            rgba(3, 3, 5, 0.25) 0%,
            rgba(3, 3, 5, 0.72) 68%,
            rgba(2, 2, 4, 0.94) 100%
          );
        }
        .aim-cursor {
          display: none;
        }
        @media (hover: hover) and (pointer: fine) {
          .aim-cursor {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 90;
            width: 28px;
            height: 28px;
            margin: -14px 0 0 -14px;
            pointer-events: none;
            will-change: transform, width, height, border-color;
            border: 1px solid rgba(255, 235, 198, 0.72);
            border-radius: 50%;
            box-shadow: 0 0 12px rgba(255, 213, 155, 0.28);
            transition: width 0.16s ease, height 0.16s ease, margin 0.16s ease,
              border-color 0.16s ease, box-shadow 0.16s ease;
          }
          .aim-cursor.is-target {
            width: 38px;
            height: 38px;
            margin: -19px 0 0 -19px;
            border-color: rgba(212, 165, 102, 0.95);
            box-shadow: 0 0 16px rgba(176, 36, 44, 0.45);
          }
          .aim-cursor::before,
          .aim-cursor::after {
            content: "";
            position: absolute;
            background: rgba(255, 235, 198, 0.72);
          }
          .aim-cursor::before {
            width: 40px;
            height: 1px;
            left: -7px;
            top: 50%;
          }
          .aim-cursor::after {
            height: 40px;
            width: 1px;
            top: -7px;
            left: 50%;
          }
          .aim-cursor span {
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
        .subpage-header {
          position: sticky;
          top: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 36px;
          background: linear-gradient(
            180deg,
            rgba(3, 3, 5, 0.92) 0%,
            rgba(3, 3, 5, 0.68) 70%,
            rgba(3, 3, 5, 0) 100%
          );
          backdrop-filter: blur(8px);
        }
        .brand-link {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #d9c9ad;
          text-decoration: none;
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .brand-link:hover {
          color: #ffe8c4;
          transform: translateX(-2px);
        }
        .brand-symbol {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(220, 198, 160, 0.52);
          background: rgba(16, 14, 12, 0.75);
          font: 17px Georgia, serif;
          flex-shrink: 0;
        }
        .brand-text-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .brand-name {
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 2px;
        }
        .brand-return {
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.5px;
          color: rgba(212, 185, 138, 0.72);
        }
        .subpage-nav {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
        }
        .nav-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border: 1px solid rgba(212, 192, 156, 0.18);
          background: rgba(12, 11, 10, 0.72);
          color: rgba(223, 212, 192, 0.68);
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 1.5px;
          text-decoration: none;
          transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease,
            transform 0.2s ease;
        }
        .nav-pill:hover {
          border-color: rgba(212, 185, 138, 0.52);
          color: #f3e8d2;
          transform: translateY(-1px);
        }
        .nav-pill.is-active {
          border-color: rgba(168, 42, 48, 0.78);
          background: rgba(74, 14, 18, 0.42);
          color: #f4e6cf;
          box-shadow: 0 0 18px rgba(108, 16, 24, 0.35);
        }
        .nav-code {
          color: rgba(187, 167, 130, 0.65);
        }
        .nav-pill.is-active .nav-code {
          color: #d98276;
        }
        .subpage-status {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(223, 212, 192, 0.64);
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.6px;
          white-space: nowrap;
        }
        .plumb-bob-wrap {
          width: 18px;
          height: 24px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        .plumb-bob-arm {
          display: flex;
          flex-direction: column;
          align-items: center;
          transform-origin: top center;
          will-change: transform;
        }
        .plumb-line {
          width: 1px;
          height: 15px;
          background: rgba(203, 180, 138, 0.65);
        }
        .plumb-weight {
          width: 5px;
          height: 5px;
          transform: rotate(45deg);
          background: #cbb48a;
          box-shadow: 0 0 6px rgba(213, 180, 123, 0.5);
        }
        .status-light {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #9f262e;
          box-shadow: 0 0 10px #b92a33;
          animation: status-pulse 2.4s ease-in-out infinite;
        }
        @keyframes status-pulse {
          0%,
          100% {
            opacity: 0.45;
          }
          50% {
            opacity: 1;
          }
        }
        .subpage-content {
          position: relative;
          z-index: 10;
          max-width: 1180px;
          margin: 0 auto;
          padding: 28px 28px 72px;
        }
        .subpage-hero {
          margin-bottom: 36px;
          animation: hero-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes hero-enter {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hero-eyebrow {
          display: inline-block;
          color: #b6a281;
          font: 10px var(--font-geist-mono), monospace;
          letter-spacing: 3px;
          margin-bottom: 10px;
        }
        .hero-title {
          margin: 0;
          color: #eae0cd;
          font: 400 clamp(34px, 5vw, 62px) / 1.04 Georgia, serif;
          letter-spacing: -1.5px;
          text-shadow: 0 4px 24px rgba(0, 0, 0, 0.85);
        }
        .hero-title span {
          color: #b8a37e;
          font-style: italic;
        }
        .subpage-footer {
          margin-top: 64px;
          padding-top: 22px;
          border-top: 1px solid rgba(212, 192, 156, 0.16);
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          color: rgba(220, 207, 184, 0.45);
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 1.8px;
        }
        .footer-back {
          color: #cbb48a;
          text-decoration: none;
          border: 1px solid rgba(203, 180, 138, 0.3);
          padding: 8px 14px;
          background: rgba(14, 12, 10, 0.72);
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
        }
        .footer-back:hover {
          border-color: rgba(224, 198, 152, 0.75);
          background: rgba(74, 14, 18, 0.35);
          color: #f6ebd6;
        }
        .entry-veil {
          position: fixed;
          inset: 0;
          z-index: 80;
          background: #020103;
          opacity: 1;
          pointer-events: none;
          transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (max-width: 900px) {
          .subpage-header {
            padding: 14px 18px;
            flex-wrap: wrap;
          }
          .subpage-nav {
            order: 3;
            width: 100%;
            justify-content: flex-start;
          }
          .subpage-content {
            padding: 18px 16px 56px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .status-light,
          .subpage-hero {
            animation: none;
          }
          .entry-veil {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
