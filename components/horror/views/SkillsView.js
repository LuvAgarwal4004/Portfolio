"use client";

import { useState } from "react";
import HorrorRoomShell from "@/components/horror/HorrorRoomShell";
import PhysicsTiltCard from "@/components/horror/PhysicsTiltCard";
import PhysicsSkillBoard from "@/components/horror/PhysicsSkillBoard";

const SKILLS_CATALOG = [
  {
    id: "REACT",
    category: "frontend",
    categoryLabel: "FRONTEND",
    level: 92,
    note: "Component architecture, hooks, state choreography, and concurrent UI rendering.",
  },
  {
    id: "NEXT.JS",
    category: "frontend",
    categoryLabel: "FULL-STACK FRAMEWORK",
    level: 94,
    note: "App Router, server/client boundaries, route handlers, and optimized production builds.",
  },
  {
    id: "NODE.JS",
    category: "backend",
    categoryLabel: "BACKEND RUNTIME",
    level: 90,
    note: "Async API services, auth integrations, mailers, and server tooling.",
  },
  {
    id: "MONGODB",
    category: "backend",
    categoryLabel: "DATABASE",
    level: 89,
    note: "Schema modeling with Mongoose, TTL expiry indexing, and connection caching.",
  },
  {
    id: "THREE.JS",
    category: "frontend",
    categoryLabel: "3D / WEBGL",
    level: 88,
    note: "Real-time lighting, shadow maps, procedural canvas textures, and custom 3D motion.",
  },
  {
    id: "AI / ML",
    category: "ai",
    categoryLabel: "INTELLIGENCE",
    level: 82,
    note: "Applied ML workflows, semantic retrieval, and intelligent interactive tooling.",
  },
  {
    id: "UI / UX",
    category: "design",
    categoryLabel: "DESIGN CRAFT",
    level: 89,
    note: "Atmospheric dark interfaces, responsive spatial layouts, and tactile micro-interactions.",
  },
  {
    id: "EXPRESS",
    category: "backend",
    categoryLabel: "API LAYER",
    level: 87,
    note: "REST routing, middleware pipelines, validation, and session security.",
  },
];

const CATEGORIES = [
  { key: "all", label: "ALL TOOLS" },
  { key: "frontend", label: "FRONTEND & 3D" },
  { key: "backend", label: "BACKEND & DATA" },
  { key: "ai", label: "AI / ML" },
  { key: "design", label: "UI / UX" },
];

export default function SkillsView() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedId, setSelectedId] = useState("THREE.JS");
  const [impulseTick, setImpulseTick] = useState(0);
  const [resetTick, setResetTick] = useState(0);

  const selectedSkill =
    SKILLS_CATALOG.find((s) => s.id === selectedId) || SKILLS_CATALOG[0];

  const filteredSkills =
    activeCategory === "all"
      ? SKILLS_CATALOG
      : SKILLS_CATALOG.filter((s) => s.category === activeCategory);

  return (
    <HorrorRoomShell
      activeId="skills"
      code="TOOLS / 003"
      eyebrow="TOOLS / 003 · INTERACTIVE EVIDENCE BOARD"
      title="My toolkit."
      subtitle="Tools of the trade."
    >
      <div className="board-controls">
        <div className="filter-group" role="tablist" aria-label="Skill categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.key}
              data-interactive="true"
              onClick={() => setActiveCategory(cat.key)}
              className={`ctrl-btn ${activeCategory === cat.key ? "is-active" : ""}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="physics-actions">
          <button
            type="button"
            data-interactive="true"
            onClick={() => setImpulseTick((t) => t + 1)}
            className="ctrl-btn ctrl-action"
          >
            SHAKE BOARD
          </button>
          <button
            type="button"
            data-interactive="true"
            onClick={() => setResetTick((t) => t + 1)}
            className="ctrl-btn"
          >
            RESET PINS
          </button>
        </div>
      </div>

      <div className="board-layout">
        <div>
          <PhysicsSkillBoard
            activeCategory={activeCategory}
            selectedId={selectedId}
            onSelectSkill={(id) => {
              if (SKILLS_CATALOG.some((s) => s.id === id)) {
                setSelectedId(id);
              }
            }}
            impulseTick={impulseTick}
            resetTick={resetTick}
          />
          <p className="board-caption">
            DRAG OR FLING ANY PINNED TAG · STRINGS REACT WITH SPRING-TENSION PHYSICS
          </p>
        </div>

        <PhysicsTiltCard className="inspector-card">
          <div className="inspector-pad">
            <span className="inspector-kicker">SELECTED ARTIFACT</span>
            <h2 className="inspector-title">{selectedSkill.id}</h2>
            <span className="inspector-cat">{selectedSkill.categoryLabel}</span>
            <p className="inspector-note">{selectedSkill.note}</p>

            <div className="meter-row">
              <span>PROFICIENCY</span>
              <span>{selectedSkill.level}%</span>
            </div>
            <div className="meter-track">
              <div
                className="meter-fill"
                style={{ width: `${selectedSkill.level}%` }}
              />
            </div>
          </div>
        </PhysicsTiltCard>
      </div>

      <section className="skills-grid-section">
        <div className="section-label">CORE ARCHIVE SPECIFICATIONS</div>
        <div className="skills-grid">
          {filteredSkills.map((skill) => (
            <PhysicsTiltCard
              key={skill.id}
              onClick={() => setSelectedId(skill.id)}
              className="skill-card"
            >
              <div className="skill-pad">
                <div className="skill-head">
                  <h3>{skill.id}</h3>
                  <span>{skill.level}%</span>
                </div>
                <span className="skill-cat">{skill.categoryLabel}</span>
                <p>{skill.note}</p>
                <div className="meter-track">
                  <div
                    className="meter-fill"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            </PhysicsTiltCard>
          ))}
        </div>
      </section>

      <style jsx>{`
        .board-controls {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .filter-group,
        .physics-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .ctrl-btn {
          padding: 8px 14px;
          border: 1px solid rgba(208, 186, 148, 0.22);
          background: rgba(14, 13, 12, 0.78);
          color: rgba(224, 212, 190, 0.7);
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 1.6px;
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
        }
        .ctrl-btn:hover {
          border-color: rgba(212, 185, 138, 0.55);
          color: #f4e6cf;
        }
        .ctrl-btn.is-active {
          border-color: rgba(182, 46, 54, 0.8);
          background: rgba(84, 16, 22, 0.45);
          color: #f6ead4;
        }
        .ctrl-action {
          border-color: rgba(212, 185, 138, 0.42);
          color: #e4cfa9;
        }
        .board-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
          align-items: start;
        }
        .board-caption {
          margin: 10px 0 0;
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.8px;
          color: rgba(212, 185, 138, 0.56);
        }
        .inspector-pad {
          padding: 24px 22px;
        }
        .inspector-kicker {
          display: block;
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 2px;
          color: #cf7268;
          margin-bottom: 10px;
        }
        .inspector-title {
          margin: 0 0 6px;
          font: 400 26px Georgia, serif;
          color: #f2e6cf;
        }
        .inspector-cat {
          display: inline-block;
          margin-bottom: 14px;
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.6px;
          color: #b49c74;
        }
        .inspector-note {
          margin: 0 0 22px;
          font-size: 13px;
          line-height: 1.68;
          color: rgba(224, 212, 190, 0.74);
        }
        .meter-row {
          display: flex;
          justify-content: space-between;
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.5px;
          color: rgba(212, 185, 138, 0.78);
          margin-bottom: 8px;
        }
        .meter-track {
          height: 5px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(208, 186, 148, 0.16);
          overflow: hidden;
        }
        .meter-fill {
          height: 100%;
          background: linear-gradient(90deg, #751820, #c79f64);
          transition: width 0.55s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .skills-grid-section {
          margin-top: 48px;
        }
        .section-label {
          font: 10px var(--font-geist-mono), monospace;
          letter-spacing: 2.6px;
          color: rgba(212, 185, 138, 0.72);
          margin-bottom: 22px;
        }
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }
        .skill-pad {
          padding: 22px 20px;
        }
        .skill-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
        }
        .skill-head h3 {
          margin: 0;
          font: 600 14px var(--font-geist-mono), monospace;
          letter-spacing: 1.6px;
          color: #efe2ca;
        }
        .skill-head span {
          font: 11px var(--font-geist-mono), monospace;
          color: #cfa972;
        }
        .skill-cat {
          display: block;
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.6px;
          color: rgba(207, 114, 104, 0.82);
          margin-bottom: 10px;
        }
        .skill-pad p {
          margin: 0 0 16px;
          font-size: 12.5px;
          line-height: 1.62;
          color: rgba(224, 212, 190, 0.68);
        }
        @media (max-width: 920px) {
          .board-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </HorrorRoomShell>
  );
}
