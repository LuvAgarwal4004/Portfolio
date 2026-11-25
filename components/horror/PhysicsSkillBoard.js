"use client";

import { useEffect, useRef } from "react";

const SKILL_GRAPH_NODES = [
  { id: "REACT", category: "frontend", level: 92, x: 0.24, y: 0.28 },
  { id: "NEXT.JS", category: "frontend", level: 94, x: 0.44, y: 0.22 },
  { id: "THREE.JS", category: "frontend", level: 88, x: 0.34, y: 0.52 },
  { id: "UI / UX", category: "design", level: 89, x: 0.16, y: 0.58 },
  { id: "TAILWIND", category: "frontend", level: 93, x: 0.22, y: 0.80 },
  { id: "NODE.JS", category: "backend", level: 90, x: 0.68, y: 0.28 },
  { id: "EXPRESS", category: "backend", level: 87, x: 0.84, y: 0.44 },
  { id: "MONGODB", category: "backend", level: 89, x: 0.72, y: 0.66 },
  { id: "NEXTAUTH", category: "backend", level: 86, x: 0.56, y: 0.48 },
  { id: "AI / ML", category: "ai", level: 82, x: 0.56, y: 0.78 },
  { id: "WEBGL", category: "frontend", level: 84, x: 0.40, y: 0.78 },
  { id: "REST APIS", category: "backend", level: 91, x: 0.84, y: 0.78 },
];

const SKILL_EDGES = [
  ["REACT", "NEXT.JS"],
  ["REACT", "THREE.JS"],
  ["REACT", "UI / UX"],
  ["REACT", "TAILWIND"],
  ["NEXT.JS", "NODE.JS"],
  ["NEXT.JS", "NEXTAUTH"],
  ["THREE.JS", "WEBGL"],
  ["THREE.JS", "UI / UX"],
  ["NODE.JS", "EXPRESS"],
  ["NODE.JS", "MONGODB"],
  ["NODE.JS", "AI / ML"],
  ["EXPRESS", "REST APIS"],
  ["MONGODB", "REST APIS"],
  ["NEXTAUTH", "MONGODB"],
  ["AI / ML", "THREE.JS"],
];

export default function PhysicsSkillBoard({
  activeCategory,
  selectedId,
  onSelectSkill,
  impulseTick,
  resetTick,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const filterRef = useRef(activeCategory);
  const selectedRef = useRef(selectedId);
  const onSelectRef = useRef(onSelectSkill);
  const nodesRef = useRef([]);
  const sizeRef = useRef({ width: 760, height: 460 });

  useEffect(() => {
    filterRef.current = activeCategory;
  }, [activeCategory]);

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    onSelectRef.current = onSelectSkill;
  }, [onSelectSkill]);

  useEffect(() => {
    if (!impulseTick) return;
    for (const node of nodesRef.current) {
      node.vx += (Math.random() - 0.5) * 460;
      node.vy += (Math.random() - 0.5) * 420 - 120;
    }
  }, [impulseTick]);

  useEffect(() => {
    if (!resetTick) return;
    const { width, height } = sizeRef.current;
    nodesRef.current.forEach((node, index) => {
      const def = SKILL_GRAPH_NODES[index];
      node.targetX = def.x * width;
      node.targetY = def.y * height;
      node.x = node.targetX;
      node.y = node.targetY;
      node.vx = (Math.random() - 0.5) * 20;
      node.vy = (Math.random() - 0.5) * 20;
    });
  }, [resetTick]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");

    const initNodes = (width, height) => {
      if (nodesRef.current.length === 0) {
        nodesRef.current = SKILL_GRAPH_NODES.map((def) => ({
          ...def,
          x: def.x * width,
          y: def.y * height,
          targetX: def.x * width,
          targetY: def.y * height,
          vx: (Math.random() - 0.5) * 18,
          vy: (Math.random() - 0.5) * 18,
          halfW: 54,
          halfH: 20,
          tilt: (Math.random() - 0.5) * 0.08,
        }));
      } else {
        nodesRef.current.forEach((node, idx) => {
          const def = SKILL_GRAPH_NODES[idx];
          node.targetX = def.x * width;
          node.targetY = def.y * height;
        });
      }
    };

    const resize = () => {
      const width = container.clientWidth;
      const height = Math.max(360, Math.min(480, Math.round(width * 0.58)));
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { width, height };
      initNodes(width, height);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let dragNode = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let pointerX = -999;
    let pointerY = -999;

    const getLocalCoords = (event) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const handlePointerDown = (event) => {
      const { x, y } = getLocalCoords(event);
      pointerX = x;
      pointerY = y;
      lastPointerX = x;
      lastPointerY = y;

      for (let i = nodesRef.current.length - 1; i >= 0; i--) {
        const node = nodesRef.current[i];
        if (
          Math.abs(x - node.x) <= node.halfW + 6 &&
          Math.abs(y - node.y) <= node.halfH + 6
        ) {
          dragNode = node;
          dragOffsetX = node.x - x;
          dragOffsetY = node.y - y;
          node.vx = 0;
          node.vy = 0;
          canvas.setPointerCapture?.(event.pointerId);
          onSelectRef.current?.(node.id);
          break;
        }
      }
    };

    const handlePointerMove = (event) => {
      const { x, y } = getLocalCoords(event);
      pointerX = x;
      pointerY = y;
      if (dragNode) {
        const vx = (x - lastPointerX) * 28;
        const vy = (y - lastPointerY) * 28;
        dragNode.x = x + dragOffsetX;
        dragNode.y = y + dragOffsetY;
        dragNode.vx = Math.max(-550, Math.min(550, vx));
        dragNode.vy = Math.max(-550, Math.min(550, vy));
      }
      lastPointerX = x;
      lastPointerY = y;
    };

    const handlePointerUp = (event) => {
      if (dragNode) {
        canvas.releasePointerCapture?.(event.pointerId);
        dragNode = null;
      }
    };

    const handlePointerLeave = () => {
      pointerX = -999;
      pointerY = -999;
      dragNode = null;
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    let frameId = 0;
    let prev = performance.now();

    const step = (now) => {
      const dt = Math.min((now - prev) / 1000, 0.032);
      prev = now;
      const { width, height } = sizeRef.current;
      const nodes = nodesRef.current;
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));

      // 1. Hooke's law spring anchors + edge string tension.
      for (const node of nodes) {
        if (node === dragNode) continue;
        // Soft anchor spring pulling back toward home pin spot.
        const anchorK = 3.2;
        node.vx += (node.targetX - node.x) * anchorK * dt;
        node.vy += (node.targetY - node.y) * anchorK * dt;

        // Subtle pointer repulsion when sweeping near pins.
        const dx = node.x - pointerX;
        const dy = node.y - pointerY;
        const distSq = dx * dx + dy * dy;
        if (distSq > 4 && distSq < 6800) {
          const dist = Math.sqrt(distSq);
          const push = (1 - dist / 82) * 140 * dt;
          node.vx += (dx / dist) * push;
          node.vy += (dy / dist) * push;
        }
      }

      // 2. Elastic string tension between connected skill tags.
      for (const [aId, bId] of SKILL_EDGES) {
        const a = nodeMap.get(aId);
        const b = nodeMap.get(bId);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const rest = Math.min(width, height) * 0.31;
        const stretch = dist - rest;
        const force = stretch * 1.45 * dt;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (a !== dragNode) {
          a.vx += fx;
          a.vy += fy;
        }
        if (b !== dragNode) {
          b.vx -= fx;
          b.vy -= fy;
        }
      }

      // 3. Soft node-node collision separation so tags stay legible.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const minDx = a.halfW + b.halfW + 14;
          const minDy = a.halfH + b.halfH + 12;
          if (Math.abs(dx) < minDx && Math.abs(dy) < minDy) {
            const ox = (minDx - Math.abs(dx)) * (dx >= 0 ? 1 : -1) * 10 * dt;
            const oy = (minDy - Math.abs(dy)) * (dy >= 0 ? 1 : -1) * 10 * dt;
            if (Math.abs(dx) / minDx > Math.abs(dy) / minDy) {
              if (a !== dragNode) a.vx -= ox;
              if (b !== dragNode) b.vx += ox;
            } else {
              if (a !== dragNode) a.vy -= oy;
              if (b !== dragNode) b.vy += oy;
            }
          }
        }
      }

      // 4. Integrate velocities, damping, and elastic wall bounce.
      const padX = 62;
      const padY = 30;
      for (const node of nodes) {
        if (node !== dragNode) {
          node.vx *= Math.exp(-3.1 * dt);
          node.vy *= Math.exp(-3.1 * dt);
          node.x += node.vx * dt;
          node.y += node.vy * dt;
        }
        if (node.x < padX) {
          node.x = padX;
          node.vx = Math.abs(node.vx) * 0.55;
        } else if (node.x > width - padX) {
          node.x = width - padX;
          node.vx = -Math.abs(node.vx) * 0.55;
        }
        if (node.y < padY) {
          node.y = padY;
          node.vy = Math.abs(node.vy) * 0.55;
        } else if (node.y > height - padY) {
          node.y = height - padY;
          node.vy = -Math.abs(node.vy) * 0.55;
        }
        node.tilt = Math.max(-0.18, Math.min(0.18, node.vx * 0.00055));
      }

      // 5. Render dark cork/slate pegboard, crimson/amber strings, and pinned tags.
      ctx.clearRect(0, 0, width, height);

      // Subtle dark grid lines.
      ctx.strokeStyle = "rgba(212, 185, 138, 0.045)";
      ctx.lineWidth = 1;
      for (let gx = 40; gx < width; gx += 48) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 40; gy < height; gy += 48) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // Torch glow under pointer on board.
      if (pointerX > 0 && pointerY > 0) {
        const spot = ctx.createRadialGradient(
          pointerX,
          pointerY,
          8,
          pointerX,
          pointerY,
          170
        );
        spot.addColorStop(0, "rgba(255, 214, 150, 0.14)");
        spot.addColorStop(1, "rgba(255, 214, 150, 0)");
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, width, height);
      }

      const activeFilter = filterRef.current;
      const selected = selectedRef.current;

      // Draw connecting investigation threads with subtle sag.
      for (const [aId, bId] of SKILL_EDGES) {
        const a = nodeMap.get(aId);
        const b = nodeMap.get(bId);
        if (!a || !b) continue;
        const isHighlighted = a.id === selected || b.id === selected;
        const matchesFilter =
          activeFilter === "all" ||
          a.category === activeFilter ||
          b.category === activeFilter;

        ctx.beginPath();
        const midX = (a.x + b.x) / 2;
        const sag = 10 + Math.hypot(b.x - a.x, b.y - a.y) * 0.04;
        const midY = (a.y + b.y) / 2 + sag;
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(midX, midY, b.x, b.y);

        if (isHighlighted) {
          ctx.strokeStyle = "rgba(186, 46, 54, 0.88)";
          ctx.lineWidth = 2;
        } else if (matchesFilter) {
          ctx.strokeStyle = "rgba(155, 42, 48, 0.44)";
          ctx.lineWidth = 1.25;
        } else {
          ctx.strokeStyle = "rgba(120, 105, 86, 0.15)";
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      }

      // Draw each pinned skill dossier tag.
      for (const node of nodes) {
        const isSelected = node.id === selected;
        const matches = activeFilter === "all" || node.category === activeFilter;

        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.rotate(node.tilt);
        ctx.globalAlpha = matches || isSelected ? 1 : 0.34;

        const w = node.halfW * 2;
        const h = node.halfH * 2;

        // Drop shadow.
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(-node.halfW + 3, -node.halfH + 5, w, h);

        // Card face.
        ctx.fillStyle = isSelected ? "#261416" : "#171412";
        ctx.fillRect(-node.halfW, -node.halfH, w, h);

        ctx.strokeStyle = isSelected
          ? "rgba(217, 130, 118, 0.9)"
          : "rgba(208, 186, 148, 0.35)";
        ctx.lineWidth = isSelected ? 1.6 : 1;
        ctx.strokeRect(-node.halfW, -node.halfH, w, h);

        // Brass/crimson pin at top of tag.
        ctx.beginPath();
        ctx.arc(0, -node.halfH + 5, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? "#c4353d" : "#a98f64";
        ctx.fill();

        // Label.
        ctx.fillStyle = isSelected ? "#f6e8d0" : "#ddd0b8";
        ctx.font = "600 11px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.id, 0, 3);

        ctx.restore();
      }

      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="skill-board-frame">
      <canvas
        ref={canvasRef}
        data-interactive="true"
        className="skill-board-canvas"
      />
      <style jsx>{`
        .skill-board-frame {
          position: relative;
          width: 100%;
          border: 1px solid rgba(208, 186, 148, 0.24);
          background: radial-gradient(
            circle at 50% 40%,
            rgba(22, 18, 16, 0.92),
            rgba(9, 8, 9, 0.96)
          );
          box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.78),
            0 20px 50px rgba(0, 0, 0, 0.75);
          overflow: hidden;
        }
        .skill-board-canvas {
          display: block;
          width: 100%;
          touch-action: none;
        }
      `}</style>
    </div>
  );
}
