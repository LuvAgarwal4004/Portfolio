"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import HorrorRoomShell from "@/components/horror/HorrorRoomShell";
import PhysicsTiltCard from "@/components/horror/PhysicsTiltCard";

const PRINCIPLES = [
  {
    code: "LOG / A",
    title: "Craft & Atmosphere",
    body: "Interfaces shouldn't feel disposable. I build dark, tactile worlds where light, motion, and typography pull you into the story.",
  },
  {
    code: "LOG / B",
    title: "Full-Stack Engineering",
    body: "From Next.js App Router and NextAuth authentication flows to MongoDB schemas, REST APIs, and production deployments.",
  },
  {
    code: "LOG / C",
    title: "Real-Time 3D & Physics",
    body: "Procedural canvas textures, Three.js dynamic shadows, Verlet particles, spring-damper rigs, and responsive 60fps interaction.",
  },
  {
    code: "LOG / D",
    title: "Relentless Iteration",
    body: "Start with curiosity, break things on purpose, measure every edge case, and polish until the interaction feels alive.",
  },
];

export default function AboutView() {
  const plateRef = useRef(null);
  const uvRef = useRef(null);
  const pendulumState = useRef({ angle: 0.14, vel: 0 });
  const [nudgeCount, setNudgeCount] = useState(0);

  // Real angular pendulum physics for the pinned identity dossier plate.
  useEffect(() => {
    const plate = plateRef.current;
    if (!plate) return;

    let rafId = 0;
    let prev = performance.now();

    const step = (now) => {
      const dt = Math.min((now - prev) / 1000, 0.035);
      prev = now;

      const s = pendulumState.current;
      const draft = Math.sin(now / 1100) * 0.12;
      const torque = -18 * Math.sin(s.angle) - 1.35 * s.vel + draft;
      s.vel += torque * dt;
      s.angle += s.vel * dt;

      plate.style.transform = `rotate(${(s.angle * 180) / Math.PI}deg)`;
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Flashlight UV reveal layer tracking pointer inside the classified block.
  useEffect(() => {
    const box = uvRef.current;
    if (!box) return;

    const handleMove = (event) => {
      const rect = box.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      box.style.setProperty("--uv-x", `${x}px`);
      box.style.setProperty("--uv-y", `${y}px`);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  const nudgePlate = (direction = 1) => {
    pendulumState.current.vel += direction * (1.8 + Math.random() * 0.9);
    setNudgeCount((c) => c + 1);
  };

  return (
    <HorrorRoomShell
      activeId="about"
      code="IDENTITY / 001"
      eyebrow="IDENTITY / 001 · SUBJECT DOSSIER"
      title="Behind the screen."
      subtitle="A person behind the pixels."
    >
      <div className="about-grid">
        <div className="swing-stage">
          <div className="pin-nail" aria-hidden="true" />
          <div
            ref={plateRef}
            className="hanging-plate"
            onClick={() => nudgePlate(nudgeCount % 2 === 0 ? 1 : -1)}
            data-interactive="true"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                nudgePlate(1);
              }
            }}
          >
            <div className="plate-wire" aria-hidden="true" />
            <div className="plate-card">
              <div className="plate-head">
                <span>ARCHIVE / 01</span>
                <span className="plate-stamp">VERIFIED</span>
              </div>
              <div className="silhouette-frame" aria-hidden="true">
                <div className="silhouette-glow" />
                <div className="silhouette-head" />
                <div className="silhouette-shoulders" />
                <div className="silhouette-scanline" />
              </div>
              <h2 className="plate-name">Luv Agarwal</h2>
              <p className="plate-role">
                FULL-STACK &amp; INTERACTIVE 3D DEVELOPER
              </p>
              <p className="plate-meta">
                Heritage Institute of Technology · Kolkata, India
              </p>
              <span className="plate-hint">CLICK BADGE TO SWING</span>
            </div>
          </div>
        </div>

        <div className="about-narrative">
          <PhysicsTiltCard pinned={false} className="dossier-card">
            <div className="dossier-pad">
              <div className="dossier-kicker">SUBJECT OVERVIEW</div>
              <p className="dossier-lead">
                I build web products that bridge sturdy full-stack engineering with
                moody, real-time interactive worlds. From campus commerce platforms
                powered by Next.js and MongoDB to custom WebGL rooms with
                procedural textures and spring physics.
              </p>
              <p className="dossier-sub">
                Whether architecting authentication flows, tuning shaders, or
                debugging subtle edge cases, my focus stays simple: make the
                experience unforgettable without sacrificing reliability.
              </p>

              <div ref={uvRef} className="uv-note-box">
                <div className="uv-note-header">
                  <span>CLASSIFIED MARGIN NOTE · MOVE LIGHT OVER TEXT</span>
                </div>
                <p className="uv-secret-text">
                  &ldquo;Clean architecture under the hood, atmospheric tension on
                  the surface. Every pixel, shadow, and millisecond of motion is
                  intentional.&rdquo;
                </p>
              </div>

              <div className="about-actions">
                <Link
                  href="/projects"
                  className="horror-btn"
                  data-interactive="true"
                >
                  INSPECT CASE FILES →
                </Link>
                <Link
                  href="/contact"
                  className="horror-btn horror-btn-ghost"
                  data-interactive="true"
                >
                  SEND TRANSMISSION
                </Link>
              </div>
            </div>
          </PhysicsTiltCard>
        </div>
      </div>

      <section className="principles-section">
        <div className="section-label">OPERATING PRINCIPLES</div>
        <div className="principles-grid">
          {PRINCIPLES.map((item) => (
            <PhysicsTiltCard key={item.code} className="principle-card">
              <div className="principle-pad">
                <span className="principle-code">{item.code}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </PhysicsTiltCard>
          ))}
        </div>
      </section>

      <style jsx>{`
        .about-grid {
          display: grid;
          grid-template-columns: minmax(260px, 340px) 1fr;
          gap: 36px;
          align-items: start;
        }
        .swing-stage {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 12px;
        }
        .pin-nail {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #d6bc8e, #59462d 78%);
          box-shadow: 0 3px 10px #000;
          z-index: 3;
        }
        .hanging-plate {
          transform-origin: top center;
          will-change: transform;
          display: flex;
          flex-direction: column;
          align-items: center;
          outline: none;
        }
        .plate-wire {
          width: 1px;
          height: 28px;
          background: linear-gradient(
            180deg,
            rgba(212, 185, 138, 0.75),
            rgba(212, 185, 138, 0.25)
          );
        }
        .plate-card {
          width: 100%;
          max-width: 310px;
          padding: 20px;
          border: 1px solid rgba(208, 186, 148, 0.34);
          background: linear-gradient(
            165deg,
            rgba(32, 27, 22, 0.94),
            rgba(14, 12, 11, 0.96)
          );
          box-shadow: 0 28px 55px rgba(0, 0, 0, 0.85);
          transition: border-color 0.25s ease;
        }
        .hanging-plate:hover .plate-card {
          border-color: rgba(212, 185, 138, 0.65);
        }
        .plate-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 2px;
          color: rgba(220, 204, 176, 0.65);
          margin-bottom: 14px;
        }
        .plate-stamp {
          color: #cf6b60;
          border: 1px solid rgba(176, 48, 56, 0.6);
          padding: 2px 6px;
        }
        .silhouette-frame {
          position: relative;
          height: 175px;
          border: 1px solid rgba(208, 186, 148, 0.2);
          background: #1b1713;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .silhouette-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 50% 42%,
            rgba(233, 211, 170, 0.38),
            rgba(34, 28, 22, 0.92) 72%
          );
        }
        .silhouette-head {
          position: absolute;
          top: 34px;
          left: 50%;
          transform: translateX(-50%);
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #171512;
        }
        .silhouette-shoulders {
          position: absolute;
          bottom: -36px;
          left: 50%;
          transform: translateX(-50%);
          width: 144px;
          height: 105px;
          border-radius: 50%;
          background: #171512;
        }
        .silhouette-scanline {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(255, 232, 196, 0.03) 0px,
            rgba(255, 232, 196, 0.03) 1px,
            transparent 1px,
            transparent 4px
          );
        }
        .plate-name {
          margin: 0 0 6px;
          font: 400 24px Georgia, serif;
          color: #efe4cf;
        }
        .plate-role {
          margin: 0 0 8px;
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 1.6px;
          color: #bba47d;
        }
        .plate-meta {
          margin: 0 0 14px;
          font-size: 12px;
          color: rgba(224, 212, 190, 0.62);
        }
        .plate-hint {
          display: block;
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.8px;
          color: rgba(203, 180, 138, 0.52);
          border-top: 1px dashed rgba(208, 186, 148, 0.2);
          padding-top: 10px;
        }
        .dossier-pad {
          padding: 28px 30px;
        }
        .dossier-kicker {
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 2.5px;
          color: #b6a281;
          margin-bottom: 14px;
        }
        .dossier-lead {
          margin: 0 0 16px;
          font: 400 20px / 1.55 Georgia, serif;
          color: #ece1cc;
        }
        .dossier-sub {
          margin: 0 0 24px;
          font-size: 14px;
          line-height: 1.75;
          color: rgba(224, 212, 190, 0.72);
        }
        .uv-note-box {
          position: relative;
          padding: 18px 20px;
          border: 1px dashed rgba(176, 48, 56, 0.45);
          background: rgba(18, 10, 11, 0.72);
          margin-bottom: 24px;
          overflow: hidden;
        }
        .uv-note-box::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            190px circle at var(--uv-x, 50%) var(--uv-y, 50%),
            rgba(255, 224, 168, 0.14),
            rgba(3, 3, 5, 0.72) 78%
          );
        }
        .uv-note-header {
          position: relative;
          z-index: 2;
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 2px;
          color: #cf7268;
          margin-bottom: 8px;
        }
        .uv-secret-text {
          position: relative;
          z-index: 2;
          margin: 0;
          font: italic 16px / 1.6 Georgia, serif;
          color: #e4d4b7;
        }
        .about-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .horror-btn {
          display: inline-flex;
          align-items: center;
          padding: 11px 18px;
          border: 1px solid rgba(212, 185, 138, 0.55);
          background: rgba(88, 18, 24, 0.48);
          color: #f4e6cf;
          font: 10px var(--font-geist-mono), monospace;
          letter-spacing: 1.8px;
          text-decoration: none;
          transition: background 0.2s ease, border-color 0.2s ease,
            transform 0.2s ease;
        }
        .horror-btn:hover {
          background: rgba(126, 24, 32, 0.65);
          border-color: #ebd6af;
          transform: translateY(-2px);
        }
        .horror-btn-ghost {
          background: rgba(14, 13, 12, 0.75);
          border-color: rgba(212, 185, 138, 0.28);
        }
        .principles-section {
          margin-top: 52px;
        }
        .section-label {
          font: 10px var(--font-geist-mono), monospace;
          letter-spacing: 2.6px;
          color: rgba(212, 185, 138, 0.72);
          margin-bottom: 22px;
        }
        .principles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 22px;
        }
        .principle-pad {
          padding: 24px 22px;
        }
        .principle-code {
          display: block;
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 2px;
          color: #a68c64;
          margin-bottom: 10px;
        }
        .principle-pad h3 {
          margin: 0 0 10px;
          font: 400 20px Georgia, serif;
          color: #efe3cb;
        }
        .principle-pad p {
          margin: 0;
          font-size: 13px;
          line-height: 1.68;
          color: rgba(224, 212, 190, 0.68);
        }
        @media (max-width: 820px) {
          .about-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </HorrorRoomShell>
  );
}
