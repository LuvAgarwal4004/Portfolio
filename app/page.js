
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const TORCH_LENGTH = 193;

const portfolioItems = [
  {
    id: "about",
    href: "/about",
    kind: "about",
    code: "IDENTITY / 001",
    title: "Behind the screen.",
    description: "A little about the person building things.",
    action: "GET TO KNOW ME",
  },
  {
    id: "projects",
    href: "/projects",
    kind: "projects",
    code: "CASE FILES / 002",
    title: "Things I've built.",
    description: "Experiments, products and projects.",
    action: "EXPLORE PROJECTS",
  },
  {
    id: "skills",
    href: "/skills",
    kind: "skills",
    code: "TOOLS / 003",
    title: "My toolkit.",
    description: "Technologies, tools and things I work with.",
    action: "VIEW MY SKILLS",
  },
  {
    id: "experience",
    href: "/experience",
    kind: "experience",
    code: "FIELD NOTES / 004",
    title: "The journey.",
    description: "My experience, learning and milestones.",
    action: "FOLLOW THE TRAIL",
  },
  {
    id: "contact",
    href: "/contact",
    kind: "contact",
    code: "TRANSMISSION / 005",
    title: "Let's talk.",
    description: "Have something interesting in mind?",
    action: "GET IN TOUCH",
  },
];

// The same geometry is used for both the physical torch
// and the Canvas flashlight beam.
function calculateTorchPose(x, y, width, height) {
  const pivotX = width / 2;
  const pivotY = height + 26;

  const dx = x - pivotX;
  const dy = y - pivotY;

  const distance = Math.max(0.001, Math.hypot(dx, dy));

  const directionX = dx / distance;
  const directionY = dy / distance;

  // An upright torch points toward the top of the screen.
  // Rotate it to the exact direction of the pointer.
  const angle =
    (Math.atan2(dy, dx) * 180) / Math.PI + 90;

  // The torch shortens slightly when pointed very close
  // to its pivot, keeping its lens behind the target.
  const torchScale = Math.min(
    1,
    Math.max(0.001, (distance - 5) / TORCH_LENGTH)
  );

  const lensDistance = TORCH_LENGTH * torchScale;

  const originX = pivotX + directionX * lensDistance;
  const originY = pivotY + directionY * lensDistance;

  return {
    angle,
    torchScale,
    pivotX,
    pivotY,
    directionX,
    directionY,
    originX,
    originY,
  };
}

export default function Home() {
  const sceneRef = useRef(null);
  const canvasRef = useRef(null);
  const torchRef = useRef(null);

  // There is NO interpolated position.
  // These coordinates are the actual pointer coordinates.
  const pointer = useRef({
    x: 0,
    y: 0,
    initialized: false,
  });

  // --------------------------------------------------
  // DIRECT POINTER TRACKING + TORCH ROTATION
  // --------------------------------------------------

  const updatePointer = (event) => {
    const scene = sceneRef.current;

    if (!scene) return;

    const rect = scene.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    pointer.current.x = x;
    pointer.current.y = y;
    pointer.current.initialized = true;

    // Both torch and spotlight receive the same coordinates.
    const pose = calculateTorchPose(
      x,
      y,
      rect.width,
      rect.height
    );

    // Direct CSS update: NO transition, NO animation delay.
    const torch = torchRef.current;

    if (torch) {
      torch.style.setProperty(
        "--torch-angle",
        `${pose.angle}deg`
      );

      torch.style.setProperty(
        "--torch-scale",
        pose.torchScale
      );
    }
  };

  // --------------------------------------------------
  // CANVAS FLASHLIGHT ENGINE
  // --------------------------------------------------

  useEffect(() => {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;

    if (!scene || !canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationId;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Dust particles.
    const dust = Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.45 + 0.35,
      speed: Math.random() * 0.23 + 0.05,
      drift: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
    }));

    // --------------------------------------------------
    // RESIZE
    // --------------------------------------------------

    const resize = () => {
      const rect = scene.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!pointer.current.initialized) {
        pointer.current.x = width * 0.5;
        pointer.current.y = height * 0.46;
        pointer.current.initialized = true;
      }

      // Recalculate the torch angle after resize.
      const pose = calculateTorchPose(
        pointer.current.x,
        pointer.current.y,
        width,
        height
      );

      if (torchRef.current) {
        torchRef.current.style.setProperty(
          "--torch-angle",
          `${pose.angle}deg`
        );

        torchRef.current.style.setProperty(
          "--torch-scale",
          pose.torchScale
        );
      }
    };

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    const render = (time) => {
      const t = time * 0.001;

      // IMPORTANT:
      // No smoothing factor.
      // No tx/ty interpolation.
      // No delayed pointer position.
      const mouseX = pointer.current.x;
      const mouseY = pointer.current.y;

      const pose = calculateTorchPose(
        mouseX,
        mouseY,
        width,
        height
      );

      // The flashlight origin is its ACTUAL lens.
      const ox = pose.originX;
      const oy = pose.originY;

      const px = mouseX;
      const py = mouseY;

      const beamDX = px - ox;
      const beamDY = py - oy;

      const beamLength = Math.max(
        1,
        Math.hypot(beamDX, beamDY)
      );

      const beamX = beamDX / beamLength;
      const beamY = beamDY / beamLength;

      // Perpendicular direction for cone width.
      const normalX = -beamY;
      const normalY = beamX;

      const halfWidth = Math.min(
        155,
        Math.max(12, beamLength * 0.14)
      );

      const spotlightRadius = Math.min(
        190,
        Math.max(75, width * 0.135)
      );

      ctx.clearRect(0, 0, width, height);

      // ==========================================
      // 1. DARKNESS
      // ==========================================

      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = "rgba(2, 2, 4, 0.975)";
      ctx.fillRect(0, 0, width, height);

      // ==========================================
      // 2. REMOVE DARKNESS FROM THE LIGHT CONE
      // ==========================================

      ctx.save();

      ctx.globalCompositeOperation = "destination-out";

      ctx.beginPath();

      ctx.moveTo(ox, oy);

      ctx.lineTo(
        px + normalX * halfWidth,
        py + normalY * halfWidth
      );

      ctx.lineTo(
        px - normalX * halfWidth,
        py - normalY * halfWidth
      );

      ctx.closePath();

      const coneMask = ctx.createLinearGradient(
        ox,
        oy,
        px,
        py
      );

      coneMask.addColorStop(
        0,
        "rgba(0,0,0,0.035)"
      );

      coneMask.addColorStop(
        0.2,
        "rgba(0,0,0,0.09)"
      );

      coneMask.addColorStop(
        0.65,
        "rgba(0,0,0,0.23)"
      );

      coneMask.addColorStop(
        1,
        "rgba(0,0,0,0.38)"
      );

      ctx.fillStyle = coneMask;
      ctx.shadowBlur = 35;
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.fill();

      // Bright circular light on the wall.
      const spotlight = ctx.createRadialGradient(
        px,
        py,
        0,
        px,
        py,
        spotlightRadius
      );

      spotlight.addColorStop(
        0,
        "rgba(0,0,0,0.99)"
      );

      spotlight.addColorStop(
        0.25,
        "rgba(0,0,0,0.94)"
      );

      spotlight.addColorStop(
        0.55,
        "rgba(0,0,0,0.68)"
      );

      spotlight.addColorStop(
        0.82,
        "rgba(0,0,0,0.25)"
      );

      spotlight.addColorStop(
        1,
        "rgba(0,0,0,0)"
      );

      ctx.shadowBlur = 0;
      ctx.fillStyle = spotlight;

      ctx.beginPath();

      ctx.arc(
        px,
        py,
        spotlightRadius,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();

      // ==========================================
      // 3. VOLUMETRIC LIGHT BEAM
      // ==========================================

      ctx.save();

      ctx.globalCompositeOperation = "screen";

      // Main beam.
      ctx.beginPath();

      ctx.moveTo(ox, oy);

      ctx.lineTo(
        px + normalX * halfWidth,
        py + normalY * halfWidth
      );

      ctx.lineTo(
        px - normalX * halfWidth,
        py - normalY * halfWidth
      );

      ctx.closePath();

      const beamGradient = ctx.createLinearGradient(
        ox,
        oy,
        px,
        py
      );

      beamGradient.addColorStop(
        0,
        "rgba(255,224,171,0.025)"
      );

      beamGradient.addColorStop(
        0.35,
        "rgba(255,224,171,0.035)"
      );

      beamGradient.addColorStop(
        0.72,
        "rgba(255,224,171,0.075)"
      );

      beamGradient.addColorStop(
        1,
        "rgba(255,229,183,0.14)"
      );

      ctx.fillStyle = beamGradient;

      ctx.shadowBlur = 48;
      ctx.shadowColor = "rgba(255,219,159,0.22)";

      ctx.fill();

      ctx.shadowBlur = 0;

      // Individual rays inside the volumetric beam.
      for (let i = -4; i <= 4; i++) {
        const offset = (i / 4) * halfWidth * 0.78;

        const shimmer =
          0.5 + Math.sin(t * 1.7 + i * 1.4) * 0.5;

        const ray = ctx.createLinearGradient(
          ox,
          oy,
          px,
          py
        );

        ray.addColorStop(
          0,
          "rgba(255,225,178,0)"
        );

        ray.addColorStop(
          0.55,
          `rgba(255,225,178,${0.008 + shimmer * 0.013})`
        );

        ray.addColorStop(
          1,
          `rgba(255,230,187,${0.025 + shimmer * 0.035})`
        );

        ctx.beginPath();

        ctx.moveTo(
          ox + normalX * offset * 0.03,
          oy + normalY * offset * 0.03
        );

        ctx.lineTo(
          px + normalX * offset,
          py + normalY * offset
        );

        ctx.strokeStyle = ray;
        ctx.lineWidth = i === 0 ? 2 : 1;

        ctx.stroke();
      }

      // Glow at the point where the light hits the wall.
      const endpointGlow = ctx.createRadialGradient(
        px,
        py,
        0,
        px,
        py,
        spotlightRadius
      );

      endpointGlow.addColorStop(
        0,
        "rgba(255,235,202,0.15)"
      );

      endpointGlow.addColorStop(
        0.4,
        "rgba(255,224,179,0.055)"
      );

      endpointGlow.addColorStop(
        1,
        "rgba(255,224,179,0)"
      );

      ctx.fillStyle = endpointGlow;

      ctx.beginPath();

      ctx.arc(
        px,
        py,
        spotlightRadius,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();

      // ==========================================
      // 4. FLOATING DUST PARTICLES
      // ==========================================

      ctx.save();

      ctx.globalCompositeOperation = "screen";

      for (const particle of dust) {
        if (!reduceMotion) {
          particle.y -= particle.speed;

          particle.x +=
            particle.drift +
            Math.sin(t + particle.phase) * 0.08;
        }

        if (particle.y < -5) {
          particle.y = height + 5;
          particle.x = Math.random() * width;
        }

        if (particle.x < -5) particle.x = width + 5;
        if (particle.x > width + 5) particle.x = -5;

        const relativeX = particle.x - ox;
        const relativeY = particle.y - oy;

        const progress =
          (relativeX * beamDX + relativeY * beamDY) /
          (beamLength * beamLength);

        if (progress <= 0 || progress >= 1) continue;

        const closestX = ox + beamDX * progress;
        const closestY = oy + beamDY * progress;

        const perpendicularDistance = Math.hypot(
          particle.x - closestX,
          particle.y - closestY
        );

        const localBeamWidth = halfWidth * progress;

        if (perpendicularDistance < localBeamWidth) {
          const intensity =
            1 -
            perpendicularDistance /
              Math.max(1, localBeamWidth);

          const alpha = 0.035 + intensity * 0.28;

          ctx.beginPath();

          ctx.arc(
            particle.x,
            particle.y,
            particle.radius,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            `rgba(255,233,194,${alpha})`;

          ctx.fill();
        }
      }

      ctx.restore();

      // ==========================================
      // 5. FOCUS RETICLE EXACTLY AT THE MOUSE
      // ==========================================

      ctx.save();

      ctx.globalCompositeOperation = "screen";

      ctx.strokeStyle = "rgba(255,236,201,0.75)";
      ctx.fillStyle = "rgba(255,236,201,0.9)";
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.stroke();

      const crosshair = 5;

      ctx.beginPath();

      ctx.moveTo(px - 20, py);
      ctx.lineTo(px - crosshair, py);

      ctx.moveTo(px + crosshair, py);
      ctx.lineTo(px + 20, py);

      ctx.moveTo(px, py - 20);
      ctx.lineTo(px, py - crosshair);

      ctx.moveTo(px, py + crosshair);
      ctx.lineTo(px, py + 20);

      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);

    resizeObserver.observe(scene);

    window.addEventListener("resize", resize);

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);

      resizeObserver.disconnect();

      window.removeEventListener("resize", resize);
    };
  }, []);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <main
      className="horror-portfolio"
      ref={sceneRef}
      onPointerMove={updatePointer}
      onPointerDown={updatePointer}
    >
      {/* THE WALL */}

      <div className="wall-surface" />
      <div className="wall-vignette" />

      {/* PORTFOLIO OBJECTS */}

      <div className="portfolio-wall">
        {portfolioItems.map((item, index) => (
          <Link
            key={item.id}
            href={item.href}
            className={`portfolio-card card--${item.kind}`}
            aria-label={`Open ${item.title} section`}
          >
            <span className="hanging-thread" />

            <span className="wall-pin">
              <span />
            </span>

            <div className="card-content">
              <div className="card-topline">
                <span>{item.code}</span>
                <span>0{index + 1}</span>
              </div>

              {/* ABOUT */}

              {item.kind === "about" && (
                <>
                  <div className="portrait-art">
                    <div className="portrait-window" />
                    <div className="portrait-sun" />

                    <div className="portrait-person">
                      <div className="portrait-head" />
                      <div className="portrait-body" />
                    </div>

                    <span className="portrait-caption">
                      PERSONAL ARCHIVE
                    </span>
                  </div>

                  <div className="card-heading">
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                  </div>
                </>
              )}

              {/* PROJECTS */}

              {item.kind === "projects" && (
                <>
                  <div className="project-collage">
                    <div className="project-window window-one">
                      <div className="window-bar">
                        <i />
                        <i />
                        <i />
                      </div>

                      <div className="window-layout">
                        <div />
                        <div />
                        <div />
                      </div>
                    </div>

                    <div className="project-window window-two">
                      <div className="window-bar">
                        <i />
                        <i />
                        <i />
                      </div>

                      <div className="window-layout">
                        <div />
                        <div />
                      </div>
                    </div>

                    <span className="collage-number">03</span>
                  </div>

                  <div className="card-heading">
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                  </div>
                </>
              )}

              {/* SKILLS */}

              {item.kind === "skills" && (
                <>
                  <div className="skills-art">
                    <span className="skill-label">
                      CURRENT LOADOUT
                    </span>

                    <div className="skill-tags">
                      <span>REACT</span>
                      <span>NEXT.JS</span>
                      <span>NODE</span>
                      <span>MONGODB</span>
                      <span>UI / UX</span>
                      <span>AI</span>
                    </div>

                    <div className="skill-stamp">
                      TOOLS
                      <br />
                      OF THE
                      <br />
                      TRADE
                    </div>
                  </div>

                  <div className="card-heading">
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                  </div>
                </>
              )}

              {/* EXPERIENCE */}

              {item.kind === "experience" && (
                <>
                  <div className="timeline-art">
                    <div className="timeline-line" />

                    <div className="timeline-entry">
                      <span />

                      <div>
                        <b>THE BEGINNING</b>
                        <small>Ideas &amp; curiosity</small>
                      </div>
                    </div>

                    <div className="timeline-entry">
                      <span />

                      <div>
                        <b>BUILDING THINGS</b>
                        <small>Projects &amp; experiments</small>
                      </div>
                    </div>

                    <div className="timeline-entry">
                      <span />

                      <div>
                        <b>WHAT'S NEXT?</b>
                        <small>The story continues</small>
                      </div>
                    </div>
                  </div>

                  <div className="card-heading">
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                  </div>
                </>
              )}

              {/* CONTACT */}

              {item.kind === "contact" && (
                <>
                  <div className="contact-art">
                    <div className="envelope">
                      <div className="envelope-flap" />
                      <span>OPEN ME</span>
                    </div>

                    <span className="contact-mark">✳</span>
                  </div>

                  <div className="card-heading">
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                  </div>
                </>
              )}

              <div className="card-bottom">
                <span>{item.action}</span>
                <span className="card-arrow">↗</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* FLASHLIGHT CANVAS */}

      <canvas
        ref={canvasRef}
        className="flashlight-canvas"
        aria-hidden="true"
      />

      {/* ==========================================
          3D-STYLE FLASHLIGHT + HAND
          Its bottom is the fixed pivot.
          Its front lens rotates towards the pointer.
      ========================================== */}

      <div
        ref={torchRef}
        className="torch-rig"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 144 210"
          className="torch-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Main metallic body */}

            <linearGradient
              id="torchBody"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0" stopColor="#08090b" />
              <stop offset="0.13" stopColor="#272a2d" />
              <stop offset="0.29" stopColor="#55575a" />
              <stop offset="0.45" stopColor="#242629" />
              <stop offset="0.68" stopColor="#393b3e" />
              <stop offset="0.85" stopColor="#141518" />
              <stop offset="1" stopColor="#050607" />
            </linearGradient>

            <linearGradient
              id="torchHead"
              x1="0"
              y1="0"
              x2="0.8"
              y2="1"
            >
              <stop offset="0" stopColor="#56565a" />
              <stop offset="0.28" stopColor="#1e2023" />
              <stop offset="0.7" stopColor="#090a0c" />
              <stop offset="1" stopColor="#35373a" />
            </linearGradient>

            <linearGradient
              id="torchGrip"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0" stopColor="#08090b" />
              <stop offset="0.5" stopColor="#292a2b" />
              <stop offset="1" stopColor="#070809" />
            </linearGradient>

            <radialGradient
              id="torchLens"
              cx="45%"
              cy="35%"
              r="70%"
            >
              <stop offset="0" stopColor="#fff8e9" />
              <stop offset="0.22" stopColor="#f8dfad" />
              <stop offset="0.55" stopColor="#bca276" />
              <stop offset="0.85" stopColor="#4e4436" />
              <stop offset="1" stopColor="#141414" />
            </radialGradient>

            <linearGradient id="handGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#302a27" />
              <stop offset="0.45" stopColor="#171518" />
              <stop offset="1" stopColor="#07080a" />
            </linearGradient>

            <filter id="torchShadow">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* Soft shadow behind the object */}

          <ellipse
            cx="72"
            cy="189"
            rx="48"
            ry="13"
            fill="#000"
            opacity="0.4"
            filter="url(#torchShadow)"
          />

          {/* HAND / WRIST IN FOREGROUND */}

          <path
            d="
              M28 210
              C26 193 29 181 37 170
              L45 151
              C48 140 54 133 62 136
              C67 138 68 145 66 153
              L72 140
              C77 129 87 128 92 134
              C96 139 92 149 89 157
              C98 146 107 149 109 157
              C112 165 103 176 100 184
              L108 210Z
            "
            fill="url(#handGradient)"
            stroke="#403934"
            strokeWidth="1"
          />

          {/* Palm highlight */}

          <path
            d="M38 185 C43 165 53 154 62 151"
            stroke="#5c5045"
            strokeWidth="2"
            opacity="0.28"
            fill="none"
          />

          {/* Flashlight lower handle */}

          <path
            d="
              M51 77
              Q72 68 93 77
              L98 150
              Q98 162 88 169
              L56 169
              Q46 162 46 150Z
            "
            fill="url(#torchBody)"
            stroke="#77706a"
            strokeWidth="1.2"
          />

          {/* Grip texture */}

          {Array.from({ length: 7 }, (_, i) => (
            <path
              key={i}
              d={`M49 ${112 + i * 6} Q72 ${108 + i * 6} 95 ${112 + i * 6}`}
              fill="none"
              stroke="#08090b"
              strokeWidth="2"
              opacity="0.75"
            />
          ))}

          {/* Body reflection */}

          <path
            d="M58 81 Q55 115 59 154"
            fill="none"
            stroke="#b1a18c"
            strokeWidth="2"
            opacity="0.22"
          />

          <path
            d="M87 82 Q91 122 87 154"
            fill="none"
            stroke="#77716c"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* Flashlight rear cap */}

          <path
            d="
              M52 157
              Q72 164 92 157
              L94 169
              Q72 179 50 169Z
            "
            fill="url(#torchHead)"
            stroke="#827362"
            strokeWidth="1"
          />

          {/* Metallic rings on the barrel */}

          <path
            d="M49 83 Q72 91 95 83"
            fill="none"
            stroke="#8c806e"
            strokeWidth="2"
            opacity="0.65"
          />

          <path
            d="M49 91 Q72 99 95 91"
            fill="none"
            stroke="#090a0b"
            strokeWidth="2"
          />

          {/* Flashlight head cylinder */}

          <path
            d="
              M47 33
              Q72 25 97 33
              L103 76
              Q103 86 93 89
              L51 89
              Q41 86 41 76Z
            "
            fill="url(#torchHead)"
            stroke="#91816b"
            strokeWidth="1.4"
          />

          {/* Head side highlights */}

          <path
            d="M48 39 L53 78"
            stroke="#b8a990"
            strokeWidth="2"
            opacity="0.45"
          />

          <path
            d="M96 39 L92 78"
            stroke="#030405"
            strokeWidth="3"
            opacity="0.8"
          />

          {/* Front bezel */}

          <ellipse
            cx="72"
            cy="32"
            rx="31"
            ry="12"
            fill="#08090a"
            stroke="#8d806b"
            strokeWidth="1.5"
          />

          <ellipse
            cx="72"
            cy="30"
            rx="26"
            ry="9"
            fill="#35332f"
            stroke="#c0ab89"
            strokeWidth="1"
          />

          {/* Actual glass lens */}

          <ellipse
            cx="72"
            cy="28"
            rx="21"
            ry="7.3"
            fill="#171817"
          />

          <ellipse
            cx="72"
            cy="27"
            rx="16"
            ry="5.7"
            fill="url(#torchLens)"
          />

          {/* Lens reflection */}

          <path
            d="M61 26 Q70 21 81 25"
            stroke="#fff6e0"
            strokeWidth="1.7"
            strokeLinecap="round"
            opacity="0.85"
            fill="none"
          />

          {/* Outer bezel details */}

          <path
            d="M46 37 Q72 44 98 37"
            stroke="#b6a17e"
            strokeWidth="1"
            opacity="0.55"
            fill="none"
          />

          <circle cx="48" cy="35" r="1.4" fill="#d3bc92" />
          <circle cx="96" cy="35" r="1.4" fill="#d3bc92" />

          {/* Fingers wrapped around the barrel */}

          <path
            d="
              M43 117
              Q47 107 56 111
              Q64 115 62 124
              L57 144
              Q53 151 45 147
              Q38 142 40 132Z
            "
            fill="url(#handGradient)"
            stroke="#57483b"
            strokeWidth="1"
          />

          <path
            d="
              M99 117
              Q94 107 86 111
              Q78 115 80 124
              L85 144
              Q89 151 97 147
              Q104 142 102 132Z
            "
            fill="url(#handGradient)"
            stroke="#57483b"
            strokeWidth="1"
          />

          {/* Finger creases */}

          <path
            d="M43 130 Q50 135 59 129"
            stroke="#776455"
            strokeWidth="1"
            opacity="0.45"
            fill="none"
          />

          <path
            d="M85 129 Q94 135 100 130"
            stroke="#776455"
            strokeWidth="1"
            opacity="0.45"
            fill="none"
          />
        </svg>

        {/* Lens glow follows the rotating torch */}

        <div className="torch-lens-glow" />
      </div>

      {/* HUD */}

      {/* <header className="scene-header">
        <Link href="/" className="brand-mark">
          <span className="brand-symbol">L.</span>
          <span className="brand-name">THE UNKNOWN ROOM</span>
        </Link>

        <div className="header-status">
          <span className="status-light" />
          <span></span>
        </div>
      </header> */}

      {/* INTRODUCTION */}

      <section className="scene-intro">
        <span className="intro-eyebrow">
          HEHEHEHEHEHEHHEEHHEHEHEHEHEEHE
        </span>

        <h1>
          FAIZANNN TERI MAA KA BHOSDAAAAAAA
          <br />
          <span>AAAGGGGGGGGGGGGG</span>
        </h1>

        <p>
          NIGGAAAAA MOOOOOOO-
        </p>
      </section>

      {/* INSTRUCTIONS */}

      <div className="scene-instruction">
        <span className="instruction-icon">✣</span>

        <span>
          MOVE YOUR LIGHT TO KNOW MORE ABOUT ME
        </span>
      </div>

      <footer className="scene-footer">
        <span>MY PORTFOLIO...hehehe</span>
        <span>I like horror HEHEHEHE</span>
      </footer>

      {/* ==========================================
          STYLES
      ========================================== */}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #020203;
        }

        body {
          overflow: hidden;
        }

        a {
          -webkit-tap-highlight-color: transparent;
        }

        /* ======================================
           MAIN SCENE
        ====================================== */

        .horror-portfolio {
          position: relative;
          width: 100%;
          height: 100svh;
          min-height: 600px;
          overflow: hidden;
          isolation: isolate;
          perspective: 1200px;
          background: #050506;
          color: #e7dcc7;
          cursor: none;
          touch-action: none;
          font-family: Arial, Helvetica, sans-serif;
        }

        /* ======================================
           WALL
        ====================================== */

        .wall-surface {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-color: #b6a78b;

          background-image:
            radial-gradient(
              ellipse at 50% 40%,
              rgba(245, 226, 190, 0.27),
              transparent 67%
            ),
            radial-gradient(
              ellipse at 12% 80%,
              rgba(73, 55, 37, 0.15),
              transparent 55%
            ),
            radial-gradient(
              ellipse at 88% 15%,
              rgba(75, 57, 39, 0.12),
              transparent 52%
            ),
            repeating-linear-gradient(
              0deg,
              rgba(75, 58, 42, 0.035) 0px,
              rgba(75, 58, 42, 0.035) 1px,
              transparent 1px,
              transparent 4px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.025) 0px,
              transparent 2px,
              transparent 5px
            );

          box-shadow:
            inset 0 0 140px rgba(44, 31, 19, 0.38),
            inset 0 0 25px rgba(0, 0, 0, 0.25);
        }

        .wall-surface::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.16;
          pointer-events: none;

          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E");
        }

        .wall-surface::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 18%;
          background: linear-gradient(
            0deg,
            rgba(23, 19, 17, 0.35),
            transparent
          );
        }

        .wall-vignette {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;

          background: radial-gradient(
            ellipse at center,
            transparent 40%,
            rgba(0, 0, 0, 0.18) 100%
          );
        }

        /* ======================================
           PORTFOLIO OBJECTS
        ====================================== */

        .portfolio-wall {
          position: absolute;
          inset: 0;
          z-index: 2;
          transform-style: preserve-3d;
        }

        .portfolio-card {
          position: absolute;
          display: block;
          color: #28241e;
          text-decoration: none;
          padding: 0;
          isolation: isolate;
          outline: none;

          filter: drop-shadow(
            10px 23px 16px rgba(0, 0, 0, 0.27)
          );

          transition: filter 0.35s ease;
          cursor: none;
        }

        .portfolio-card:hover,
        .portfolio-card:focus-visible {
          z-index: 20;

          filter: drop-shadow(
            14px 28px 24px rgba(0, 0, 0, 0.4)
          );
        }

        .portfolio-card:focus-visible .card-content {
          outline: 2px solid #e9c991;
          outline-offset: 5px;
        }

        .card-content {
          width: 100%;
          height: 100%;
          position: relative;
          padding: 17px;
          overflow: hidden;

          transition: transform 0.4s cubic-bezier(.2,.8,.2,1);
        }

        .portfolio-card:hover .card-content {
          transform: translateY(-5px) scale(1.015);
        }

        .hanging-thread {
          position: absolute;
          height: 51px;
          width: 1px;
          top: -50px;
          left: 50%;

          background: linear-gradient(
            to bottom,
            rgba(35, 29, 22, 0.9),
            rgba(80, 65, 45, 0.42)
          );

          transform-origin: top;
        }

        .wall-pin {
          position: absolute;
          left: calc(50% - 5px);
          top: -6px;
          z-index: 5;
          width: 11px;
          height: 11px;
          border-radius: 50%;

          background: radial-gradient(
            circle at 35% 30%,
            #e8cf9f,
            #70604b 60%,
            #29231d
          );

          box-shadow: 1px 2px 5px rgba(0, 0, 0, 0.5);
        }

        .wall-pin span {
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          background: #78664a;
        }

        .card-topline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-family: monospace;
          font-size: 8px;
          letter-spacing: 1.25px;
          opacity: 0.72;
        }

        .card-heading h2 {
          margin: 0 0 5px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(17px, 1.65vw, 25px);
          line-height: 1.06;
          font-weight: 500;
          letter-spacing: -0.8px;
        }

        .card-heading p {
          margin: 0;
          font-size: 10px;
          line-height: 1.5;
          opacity: 0.74;
        }

        .card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: absolute;
          left: 17px;
          right: 17px;
          bottom: 12px;
          border-top: 1px solid rgba(42, 35, 27, 0.25);
          padding-top: 8px;
          font-family: monospace;
          font-size: 8px;
          letter-spacing: 1px;
        }

        .card-arrow {
          font-size: 17px;
          line-height: 1;
          transition: transform 0.25s ease;
        }

        .portfolio-card:hover .card-arrow {
          transform: translate(3px, -3px);
        }

        /* ======================================
           ABOUT / PORTRAIT FRAME
        ====================================== */

        .card--about {
          left: 8%;
          top: 21%;
          width: 220px;
          height: 300px;

          background: #d9ccb2;
          border: 8px solid #80715b;

          box-shadow:
            inset 0 0 0 2px #e8dcc7,
            0 0 0 1px rgba(24, 19, 15, 0.5);

          transform: rotate(-2.2deg);

          animation: frame-sway-left 8s ease-in-out infinite alternate;
        }

        .card--about .card-content {
          border: 1px solid rgba(91, 72, 51, 0.26);
          padding: 12px;
        }

        .portrait-art {
          height: 145px;
          position: relative;
          overflow: hidden;

          background: linear-gradient(
            160deg,
            #c5a980 0%,
            #8b795e 50%,
            #514d40 100%
          );

          border: 3px solid #eee0c5;

          box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.3);
        }

        .portrait-window {
          position: absolute;
          left: 15px;
          top: 12px;
          width: 50px;
          height: 72px;
          border: 2px solid rgba(240, 219, 175, 0.4);
          background: rgba(238, 219, 181, 0.1);
        }

        .portrait-sun {
          position: absolute;
          right: 22px;
          top: 19px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #dfc092;
          box-shadow: 0 0 24px rgba(238, 204, 148, 0.35);
        }

        .portrait-person {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 95px;
          height: 115px;
          transform: translateX(-50%);
        }

        .portrait-head {
          position: absolute;
          left: 30px;
          top: 12px;
          width: 38px;
          height: 46px;
          border-radius: 48% 48% 42% 42%;
          background: #292721;
          box-shadow: inset -5px 0 0 rgba(0, 0, 0, 0.25);
        }

        .portrait-body {
          position: absolute;
          bottom: -10px;
          left: 4px;
          width: 88px;
          height: 67px;
          border-radius: 55% 55% 0 0;
          background: #333129;
        }

        .portrait-caption {
          position: absolute;
          left: 9px;
          bottom: 7px;
          color: #f0dfc0;
          font-family: monospace;
          font-size: 7px;
          letter-spacing: 1px;
        }

        .card--about .card-heading {
          padding-top: 10px;
        }

        /* ======================================
           PROJECTS / ARCHIVE FRAME
        ====================================== */

        .card--projects {
          left: 37%;
          top: 15%;
          width: 325px;
          height: 270px;

          color: #eee1c9;
          background: #282927;
          border: 5px solid #7b6e57;

          box-shadow:
            inset 0 0 0 1px #c5b89c,
            0 7px 0 #453d31;

          transform: rotate(1.5deg);

          animation: frame-sway-right 9s ease-in-out infinite alternate;
        }

        .card--projects .card-content {
          padding: 15px;
        }

        .card--projects .card-topline {
          color: #c6b89b;
        }

        .project-collage {
          height: 112px;
          position: relative;
          margin: 5px 0 12px;

          background: linear-gradient(
            140deg,
            #424d49,
            #252e2e 65%,
            #697067
          );

          border: 1px solid #827359;
          overflow: hidden;
        }

        .project-collage::after {
          content: "";
          position: absolute;
          inset: 0;

          background: linear-gradient(
            120deg,
            transparent 20%,
            rgba(255, 255, 255, 0.09),
            transparent 70%
          );
        }

        .project-window {
          position: absolute;
          background: #d3c5a9;
          padding: 5px;
          box-shadow: 4px 5px 12px rgba(0, 0, 0, 0.4);
        }

        .window-one {
          left: 28px;
          top: 15px;
          width: 145px;
          height: 88px;
          transform: rotate(-4deg);
        }

        .window-two {
          right: 18px;
          top: 29px;
          width: 110px;
          height: 75px;
          transform: rotate(4deg);
        }

        .window-bar {
          display: flex;
          gap: 3px;
          height: 9px;
          align-items: center;
          border-bottom: 1px solid #8b806c;
        }

        .window-bar i {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #756951;
        }

        .window-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          padding: 6px 2px;
          height: calc(100% - 9px);
        }

        .window-layout div {
          background: linear-gradient(
            135deg,
            #728377,
            #9b9b7a 55%,
            #d2b68c
          );

          border: 1px solid rgba(51, 53, 42, 0.24);
        }

        .collage-number {
          position: absolute;
          right: 12px;
          bottom: 7px;
          color: #e5d2ad;
          font-family: Georgia, serif;
          font-size: 20px;
          z-index: 2;
        }

        .card--projects .card-heading h2 {
          font-size: 22px;
        }

        .card--projects .card-bottom {
          border-color: rgba(231, 218, 192, 0.28);
        }

        /* ======================================
           SKILLS / CLIPBOARD
        ====================================== */

        .card--skills {
          right: 8%;
          top: 24%;
          width: 230px;
          height: 250px;

          background: #c7b48f;
          border: 2px solid #736047;

          box-shadow:
            inset 0 0 0 5px rgba(248, 231, 197, 0.37),
            0 5px 0 #74634c;

          transform: rotate(2deg);

          animation: frame-sway-left 7.5s ease-in-out infinite alternate;
        }

        .card--skills .card-content {
          padding: 16px;
        }

        .skills-art {
          height: 105px;
          position: relative;
          margin-bottom: 8px;
          border: 1px solid rgba(80, 63, 43, 0.35);
          background: rgba(237, 221, 186, 0.35);
          padding: 10px;
        }

        .skill-label {
          display: block;
          font-family: monospace;
          font-size: 7px;
          letter-spacing: 1.3px;
          margin-bottom: 10px;
          opacity: 0.75;
        }

        .skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          max-width: 150px;
        }

        .skill-tags span {
          font-family: monospace;
          font-size: 8px;
          padding: 5px 6px;
          border: 1px solid rgba(69, 56, 40, 0.44);
          background: rgba(245, 231, 204, 0.6);
        }

        .skill-stamp {
          position: absolute;
          right: 8px;
          bottom: 7px;
          padding: 7px 4px;
          border: 2px solid rgba(116, 56, 44, 0.6);
          color: rgba(116, 56, 44, 0.8);
          font-family: monospace;
          font-weight: bold;
          font-size: 7px;
          line-height: 1.15;
          text-align: center;
          transform: rotate(-8deg);
        }

        /* ======================================
           EXPERIENCE / DOSSIER
        ====================================== */

        .card--experience {
          left: 18%;
          bottom: 12%;
          width: 280px;
          height: 210px;

          background: #e0d4bd;
          border: 1px solid #a18e70;

          box-shadow:
            inset 0 0 0 5px rgba(135, 112, 80, 0.13),
            5px 7px 0 rgba(76, 59, 39, 0.34);

          transform: rotate(-1deg);

          animation: frame-sway-right 10s ease-in-out infinite alternate;
        }

        .timeline-art {
          position: relative;
          height: 99px;
          padding: 3px 0 0 8px;
        }

        .timeline-line {
          position: absolute;
          top: 7px;
          bottom: 7px;
          left: 12px;
          width: 1px;
          background: rgba(91, 72, 49, 0.5);
        }

        .timeline-entry {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          position: relative;
          margin-bottom: 12px;
        }

        .timeline-entry > span {
          flex: 0 0 auto;
          width: 9px;
          height: 9px;
          margin-top: 2px;
          border-radius: 50%;
          background: #74644c;
          border: 2px solid #e0d4bd;
          box-shadow: 0 0 0 1px #74644c;
          z-index: 2;
        }

        .timeline-entry div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .timeline-entry b {
          font-family: monospace;
          font-size: 8px;
          letter-spacing: 0.8px;
        }

        .timeline-entry small {
          font-family: Georgia, serif;
          font-size: 10px;
          opacity: 0.72;
        }

        /* ======================================
           CONTACT / ENVELOPE
        ====================================== */

        .card--contact {
          right: 15%;
          bottom: 13%;
          width: 250px;
          height: 195px;

          background: #e6dcc8;
          border: 2px solid #a08d6f;

          box-shadow:
            inset 0 0 0 4px rgba(129, 107, 78, 0.13),
            7px 9px 0 rgba(68, 51, 33, 0.31);

          transform: rotate(2deg);

          animation: frame-sway-left 8.5s ease-in-out infinite alternate;
        }

        .contact-art {
          height: 83px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .envelope {
          width: 106px;
          height: 62px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid #927b59;
          background: #bca784;
          box-shadow: 0 5px 8px rgba(49, 39, 28, 0.22);
        }

        .envelope::before,
        .envelope::after {
          content: "";
          position: absolute;
          bottom: 0;
          width: 0;
          height: 0;
          border-style: solid;
        }

        .envelope::before {
          left: 0;
          border-width: 0 52px 39px 0;
          border-color: transparent transparent #d3c09f transparent;
        }

        .envelope::after {
          right: 0;
          border-width: 0 0 39px 52px;
          border-color: transparent transparent #c6b18e transparent;
        }

        .envelope-flap {
          position: absolute;
          left: 0;
          top: 0;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 32px 53px 0 53px;
          border-color: #dfceb0 transparent transparent transparent;
          z-index: 2;
        }

        .envelope span {
          position: relative;
          z-index: 3;
          margin-top: 5px;
          font-family: monospace;
          font-size: 7px;
          letter-spacing: 1px;
          color: #514533;
        }

        .contact-mark {
          position: absolute;
          right: 19px;
          top: 8px;
          color: #967c55;
          font-size: 19px;
        }

        /* ======================================
           HANGING MOVEMENT
        ====================================== */

        @keyframes frame-sway-left {
          from {
            translate: 0 0;
          }

          to {
            translate: 0 -3px;
          }
        }

        @keyframes frame-sway-right {
          from {
            translate: 0 -2px;
          }

          to {
            translate: 0 3px;
          }
        }

        /* ======================================
           FLASHLIGHT CANVAS
        ====================================== */

        .flashlight-canvas {
          position: absolute;
          inset: 0;
          z-index: 10;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        /* ======================================
           ACTUAL 3D-STYLE TORCH
        ====================================== */

        .torch-rig {
          position: absolute;
          left: 50%;
          bottom: -26px;

          width: 144px;
          height: 210px;

          z-index: 20;
          pointer-events: none;

          transform-origin: 50% 100%;

          /*
            No transition.
            No CSS easing.
            No delayed animation.

            The torch rotates immediately with the pointer.
          */

          transform:
            translateX(-50%)
            rotate(var(--torch-angle, 0deg))
            scaleY(var(--torch-scale, 1));

          will-change: transform;

          filter: drop-shadow(
            0 -5px 20px rgba(0, 0, 0, 0.85)
          );
        }

        .torch-svg {
          display: block;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .torch-lens-glow {
          position: absolute;
          top: 8px;
          left: 50%;

          width: 45px;
          height: 25px;

          border-radius: 50%;
          transform: translateX(-50%);

          background: rgba(255, 232, 188, 0.35);

          filter: blur(13px);

          box-shadow:
            0 0 24px 10px rgba(255, 218, 157, 0.2);

          pointer-events: none;
        }

        /* ======================================
           HEADER HUD
        ====================================== */

        .scene-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 25;

          padding: 29px 42px;

          display: flex;
          justify-content: space-between;
          align-items: center;

          pointer-events: none;
        }

        .brand-mark {
          display: flex;
          gap: 11px;
          align-items: center;
          color: #d9c9ad;
          text-decoration: none;
          pointer-events: auto;
        }

        .brand-symbol {
          width: 35px;
          height: 35px;

          display: grid;
          place-items: center;

          border: 1px solid rgba(220, 198, 160, 0.52);

          font-family: Georgia, serif;
          font-size: 16px;
        }

        .brand-name {
          font-family: monospace;
          font-size: 9px;
          letter-spacing: 2px;
        }

        .header-status {
          display: flex;
          align-items: center;
          gap: 9px;

          color: rgba(223, 212, 192, 0.56);

          font-family: monospace;
          font-size: 8px;
          letter-spacing: 1.6px;
        }

        .status-light {
          width: 6px;
          height: 6px;

          border-radius: 50%;
          background: #b8a078;

          box-shadow: 0 0 9px #d5b47b;

          animation: status-pulse 2.5s ease-in-out infinite;
        }

        @keyframes status-pulse {
          0%, 100% {
            opacity: 0.45;
          }

          50% {
            opacity: 1;
          }
        }

        /* ======================================
           INTRO
        ====================================== */

        .scene-intro {
          position: absolute;

          left: 50%;
          top: 6%;

          width: 440px;
          max-width: 75%;

          z-index: 12;

          transform: translateX(-50%);

          text-align: center;
          pointer-events: none;

          text-shadow: 0 2px 15px #000;
        }

        .intro-eyebrow {
          color: #b6a281;

          font-family: monospace;
          font-size: 8px;
          letter-spacing: 3px;
        }

        .scene-intro h1 {
          margin: 13px 0 9px;

          color: #e4d9c4;

          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(27px, 3.8vw, 47px);
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: -1.5px;
        }

        .scene-intro h1 span {
          color: #bba782;
          font-style: italic;
        }

        .scene-intro p {
          margin: 0;

          color: rgba(224, 212, 190, 0.57);

          font-size: 10px;
          letter-spacing: 0.25px;
        }

        /* ======================================
           INSTRUCTION
        ====================================== */

        .scene-instruction {
          position: absolute;
          left: 50%;
          bottom: 42px;

          z-index: 25;

          transform: translateX(-50%);

          display: flex;
          align-items: center;
          gap: 10px;

          width: max-content;

          color: rgba(221, 207, 181, 0.7);

          font-family: monospace;
          font-size: 8px;
          letter-spacing: 1.5px;

          pointer-events: none;

          text-shadow: 0 2px 12px #000;
        }

        .instruction-icon {
          font-size: 15px;
          color: #cbb48a;
        }

        .scene-footer {
          position: absolute;
          left: 42px;
          right: 42px;
          bottom: 21px;

          z-index: 25;

          display: flex;
          justify-content: space-between;

          color: rgba(220, 207, 184, 0.32);

          font-family: monospace;
          font-size: 7px;
          letter-spacing: 1.6px;

          pointer-events: none;
        }

        /* ======================================
           TABLETS
        ====================================== */

        @media (max-width: 1050px) {
          .card--about {
            left: 5%;
            top: 23%;
            width: 190px;
            height: 275px;
          }

          .card--projects {
            left: 34%;
            top: 17%;
            width: 290px;
            height: 255px;
          }

          .card--skills {
            right: 4%;
            top: 29%;
            width: 195px;
            height: 235px;
          }

          .card--experience {
            left: 12%;
            bottom: 11%;
          }

          .card--contact {
            right: 9%;
            bottom: 12%;
          }
        }

        /* ======================================
           MOBILE
        ====================================== */

        @media (max-width: 700px) {
          .horror-portfolio {
            min-height: 600px;
          }

          .scene-header {
            padding: 19px 18px;
          }

          .brand-symbol {
            width: 29px;
            height: 29px;
          }

          .brand-name {
            font-size: 7px;
            letter-spacing: 1.2px;
          }

          .header-status {
            font-size: 6px;
            letter-spacing: 0.8px;
          }

          .scene-intro {
            top: 9%;
            max-width: 90%;
          }

          .scene-intro h1 {
            font-size: clamp(26px, 8vw, 37px);
          }

          .scene-intro p {
            font-size: 9px;
          }

          .card-content {
            padding: 10px !important;
          }

          .card-topline {
            font-size: 6px;
            letter-spacing: 0.7px;
            margin-bottom: 7px;
          }

          .card-heading h2 {
            font-size: 16px !important;
          }

          .card-heading p {
            font-size: 8px;
          }

          .card-bottom {
            left: 10px;
            right: 10px;
            bottom: 8px;
            padding-top: 6px;
            font-size: 6px;
          }

          .card-arrow {
            font-size: 14px;
          }

          .hanging-thread {
            height: 34px;
            top: -33px;
          }

          .card--about {
            left: 4%;
            top: 31%;
            width: 42%;
            height: 195px;
            border-width: 5px;
          }

          .portrait-art {
            height: 83px;
          }

          .portrait-person {
            transform: translateX(-50%) scale(0.7);
            transform-origin: bottom;
          }

          .portrait-window {
            transform: scale(0.7);
            transform-origin: top left;
          }

          .portrait-sun {
            transform: scale(0.7);
            transform-origin: top right;
          }

          .card--projects {
            left: auto;
            right: 4%;
            top: 31%;
            width: 44%;
            height: 195px;
            border-width: 4px;
          }

          .project-collage {
            height: 74px;
            margin: 3px 0 8px;
          }

          .window-one {
            left: 9px;
            top: 10px;
            width: 100px;
            height: 60px;
          }

          .window-two {
            right: 7px;
            top: 21px;
            width: 70px;
            height: 50px;
          }

          .card--skills {
            left: 4%;
            right: auto;
            top: 57%;
            width: 42%;
            height: 178px;
          }

          .skills-art {
            height: 76px;
            padding: 6px;
            margin-bottom: 5px;
          }

          .skill-label {
            font-size: 6px;
            margin-bottom: 5px;
          }

          .skill-tags {
            gap: 3px;
            max-width: 120px;
          }

          .skill-tags span {
            font-size: 6px;
            padding: 3px;
          }

          .skill-stamp {
            display: none;
          }

          .card--experience {
            left: auto;
            right: 4%;
            bottom: auto;
            top: 57%;
            width: 44%;
            height: 178px;
          }

          .timeline-art {
            height: 76px;
            padding-top: 2px;
          }

          .timeline-entry {
            gap: 7px;
            margin-bottom: 8px;
          }

          .timeline-entry b {
            font-size: 6px;
          }

          .timeline-entry small {
            font-size: 8px;
          }

          .timeline-entry > span {
            width: 7px;
            height: 7px;
          }

          .card--contact {
            right: auto;
            left: 22%;
            bottom: 5%;
            width: 56%;
            height: 150px;
          }

          .contact-art {
            height: 55px;
          }

          .envelope {
            transform: scale(0.77);
          }

          .contact-mark {
            right: 12px;
            top: 0;
          }

          .scene-instruction {
            bottom: 17px;
            font-size: 7px;
            letter-spacing: 1px;
          }

          .scene-footer {
            display: none;
          }

          .torch-rig {
            bottom: -34px;
            width: 115px;
            height: 168px;
          }

          .torch-lens-glow {
            width: 34px;
            height: 20px;
          }
        }

        /* ======================================
           SHORT DESKTOP SCREENS
        ====================================== */

        @media (max-height: 720px) and (min-width: 701px) {
          .scene-intro {
            top: 4%;
          }

          .card--about {
            top: 24%;
            height: 245px;
          }

          .card--projects {
            top: 16%;
            height: 230px;
          }

          .card--skills {
            top: 25%;
            height: 215px;
          }

          .card--experience {
            bottom: 8%;
            height: 190px;
          }

          .card--contact {
            bottom: 8%;
            height: 180px;
          }
        }

        /* ======================================
           ACCESSIBILITY
        ====================================== */

        @media (prefers-reduced-motion: reduce) {
          .portfolio-card,
          .portfolio-card *,
          .status-light {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
