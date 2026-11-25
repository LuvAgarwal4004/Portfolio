"use client";

import { useEffect, useState } from "react";
import HorrorRoomShell from "@/components/horror/HorrorRoomShell";
import PhysicsTiltCard from "@/components/horror/PhysicsTiltCard";

const CASE_FILES = [
  {
    id: "unknown-room",
    code: "CASE / 001",
    category: "3D / WEBGL",
    filterKey: "3d",
    title: "The Unknown Room — Interactive 3D Portfolio",
    tagline: "First-person Three.js horror room with dynamic lighting & physics.",
    summary:
      "A bespoke WebGL experience where visitors sweep a handheld flashlight across a stained plaster wall, draw and fire a realistic pistol with slide blowback and spring-damped recoil, shatter hanging archive boards into 3D shards, and transition via a swarming flock of bats.",
    highlights: [
      "Procedural 2048px aged plaster, crack, and blood-stain canvas textures",
      "Real-time shadow-casting spotlight, volumetric cone beam, and smoke/casing particles",
      "Underdamped spring recoil, chamber-check draw animation, and exponential hero-bat lunge",
    ],
    stack: ["NEXT.JS", "THREE.JS", "WEBGL", "CUSTOM PHYSICS"],
    status: "LIVE EXPERIENCE",
  },
  {
    id: "hitk-stationary",
    code: "CASE / 002",
    category: "FULL-STACK",
    filterKey: "fullstack",
    title: "HITK Stationary — Campus Commerce & Rentals",
    tagline: "End-to-end campus marketplace with OTP verification & OAuth.",
    summary:
      "A full-stack campus platform built for Heritage Institute of Technology students to buy, sell, and rent essential supplies. Features secure multi-provider authentication, hashed OTP signup and password recovery flows, and MongoDB-backed user carts.",
    highlights: [
      "NextAuth JWT sessions supporting Google OAuth and bcrypt-secured credentials",
      "Nodemailer OTP verification with attempt throttling and expiry TTL indexes",
      "Mongoose persistence, Cloudinary media pipeline, and responsive UI components",
    ],
    stack: ["NEXT.JS", "MONGODB", "NEXTAUTH", "NODEMAILER", "TAILWIND"],
    status: "PRODUCTION ARCHITECTURE",
  },
  {
    id: "neural-field-notes",
    code: "CASE / 003",
    category: "AI / TOOLS",
    filterKey: "ai",
    title: "Neural Field Notes — AI & Vision Lab",
    tagline: "Experimental inference workflows and interactive ML tooling.",
    summary:
      "A suite of applied AI/ML prototypes exploring semantic search, image preprocessing, and lightweight inference pipelines wrapped in responsive web interfaces.",
    highlights: [
      "Embedding-driven document indexing and fast similarity retrieval",
      "Node.js API orchestration with streaming status telemetry",
      "Clean visual diagnostics for inspecting model confidence and latency",
    ],
    stack: ["AI / ML", "REACT", "NODE.JS", "EXPRESS"],
    status: "RESEARCH LAB",
  },
  {
    id: "kinetic-ui",
    code: "CASE / 004",
    category: "3D / WEBGL",
    filterKey: "3d",
    title: "Kinetic UI Engine — Spring & Verlet Lab",
    tagline: "Deterministic Newtonian primitives for web interfaces.",
    summary:
      "A reusable collection of second-order spring-damper cards, Verlet string-pinned evidence boards, angular pendulums, and aerodynamic particle layers tuned for zero-jank 60fps interaction.",
    highlights: [
      "Wake-on-demand RAF physics loops that sleep cleanly when settled",
      "Interactive 2D pegboard with Hooke's law edge tension and fling velocity",
      "Touch-safe pointer capture and automatic GPU geometry/texture disposal",
    ],
    stack: ["REACT", "CANVAS 2D", "THREE.JS", "UI / UX"],
    status: "ACTIVE TOOLKIT",
  },
];

const FILTERS = [
  { key: "all", label: "ALL CASES" },
  { key: "fullstack", label: "FULL-STACK" },
  { key: "3d", label: "3D / WEBGL" },
  { key: "ai", label: "AI / TOOLS" },
];

export default function ProjectsView() {
  const [filter, setFilter] = useState("all");
  const [activeCase, setActiveCase] = useState(null);

  useEffect(() => {
    if (!activeCase) return;
    const handleKey = (event) => {
      if (event.key === "Escape") setActiveCase(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeCase]);

  const visibleCases =
    filter === "all"
      ? CASE_FILES
      : CASE_FILES.filter((item) => item.filterKey === filter);

  return (
    <HorrorRoomShell
      activeId="projects"
      code="CASE FILES / 002"
      eyebrow="CASE FILES / 002 · SELECTED EXPERIMENTS"
      title="Things I've built."
      subtitle="Selected experiments."
    >
      <div className="filter-bar" role="tablist" aria-label="Filter case files">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            data-interactive="true"
            onClick={() => setFilter(f.key)}
            className={`filter-btn ${filter === f.key ? "is-active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="cases-grid">
        {visibleCases.map((item, idx) => (
          <PhysicsTiltCard
            key={item.id}
            onClick={() => setActiveCase(item)}
            className="case-card"
            style={{ animationDelay: `${idx * 70}ms` }}
          >
            <article className="case-pad">
              <div className="case-top">
                <span className="case-code">{item.code}</span>
                <span className="case-cat">{item.category}</span>
              </div>

              <h2 className="case-title">{item.title}</h2>
              <p className="case-tagline">{item.tagline}</p>
              <p className="case-summary">{item.summary}</p>

              <div className="case-stack">
                {item.stack.map((tech) => (
                  <span key={tech} className="stack-chip">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="case-footer">
                <span className="case-status">{item.status}</span>
                <span className="case-open">OPEN CASE FILE →</span>
              </div>
            </article>
          </PhysicsTiltCard>
        ))}
      </div>

      {activeCase && (
        <div
          className="case-modal-backdrop"
          onClick={() => setActiveCase(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-modal-title"
        >
          <div
            className="case-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="case-code">{activeCase.code}</span>
                <span className="modal-sep">·</span>
                <span className="case-cat">{activeCase.category}</span>
              </div>
              <button
                type="button"
                data-interactive="true"
                onClick={() => setActiveCase(null)}
                className="modal-close"
              >
                CLOSE [ESC]
              </button>
            </div>

            <h2 id="case-modal-title" className="modal-title">
              {activeCase.title}
            </h2>
            <p className="modal-summary">{activeCase.summary}</p>

            <div className="modal-section-label">EVIDENCE &amp; ARCHITECTURE</div>
            <ul className="modal-list">
              {activeCase.highlights.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>

            <div className="case-stack">
              {activeCase.stack.map((tech) => (
                <span key={tech} className="stack-chip">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 30px;
        }
        .filter-btn {
          padding: 9px 16px;
          border: 1px solid rgba(208, 186, 148, 0.22);
          background: rgba(14, 13, 12, 0.78);
          color: rgba(224, 212, 190, 0.7);
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 1.8px;
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease,
            transform 0.18s ease;
        }
        .filter-btn:hover {
          border-color: rgba(212, 185, 138, 0.55);
          color: #f4e6cf;
          transform: translateY(-1px);
        }
        .filter-btn.is-active {
          border-color: rgba(182, 46, 54, 0.8);
          background: rgba(84, 16, 22, 0.45);
          color: #f6ead4;
        }
        .cases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 26px;
        }
        .case-pad {
          padding: 26px 24px;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .case-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .case-code {
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 2px;
          color: #b6a078;
        }
        .case-cat {
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.6px;
          color: #d0786c;
          border: 1px solid rgba(168, 42, 48, 0.5);
          padding: 3px 7px;
        }
        .case-title {
          margin: 0 0 8px;
          font: 400 22px / 1.25 Georgia, serif;
          color: #efe4cf;
        }
        .case-tagline {
          margin: 0 0 12px;
          font: italic 14px Georgia, serif;
          color: #bfa982;
        }
        .case-summary {
          margin: 0 0 18px;
          font-size: 13px;
          line-height: 1.68;
          color: rgba(224, 212, 190, 0.7);
        }
        .case-stack {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: auto;
        }
        .stack-chip {
          padding: 4px 8px;
          border: 1px solid rgba(208, 186, 148, 0.22);
          background: rgba(25, 22, 19, 0.85);
          color: #d6c5a7;
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.4px;
        }
        .case-footer {
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid rgba(208, 186, 148, 0.14);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.6px;
        }
        .case-status {
          color: rgba(224, 212, 190, 0.45);
        }
        .case-open {
          color: #d9bf94;
        }
        .case-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(2, 2, 4, 0.82);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: modal-fade 0.22s ease both;
        }
        @keyframes modal-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .case-modal-panel {
          width: 100%;
          max-width: 640px;
          padding: 28px 30px;
          border: 1px solid rgba(212, 185, 138, 0.42);
          background: linear-gradient(
            160deg,
            rgba(22, 19, 17, 0.98),
            rgba(10, 9, 10, 0.99)
          );
          box-shadow: 0 35px 80px rgba(0, 0, 0, 0.92);
          animation: modal-rise 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes modal-rise {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .modal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .modal-sep {
          margin: 0 8px;
          color: rgba(212, 185, 138, 0.4);
        }
        .modal-close {
          padding: 6px 12px;
          border: 1px solid rgba(208, 186, 148, 0.3);
          background: rgba(18, 15, 13, 0.85);
          color: #dccaa9;
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 1.5px;
        }
        .modal-close:hover {
          border-color: rgba(186, 46, 54, 0.8);
          color: #fff;
        }
        .modal-title {
          margin: 0 0 12px;
          font: 400 28px / 1.2 Georgia, serif;
          color: #f3e7d1;
        }
        .modal-summary {
          margin: 0 0 22px;
          font-size: 14px;
          line-height: 1.72;
          color: rgba(224, 212, 190, 0.78);
        }
        .modal-section-label {
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 2px;
          color: #b8a078;
          margin-bottom: 10px;
        }
        .modal-list {
          margin: 0 0 22px;
          padding-left: 18px;
          color: rgba(232, 221, 200, 0.85);
          font-size: 13px;
          line-height: 1.7;
        }
        .modal-list li + li {
          margin-top: 6px;
        }
      `}</style>
    </HorrorRoomShell>
  );
}
