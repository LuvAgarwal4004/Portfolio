"use client";

import { useEffect, useRef, useState } from "react";
import HorrorRoomShell from "@/components/horror/HorrorRoomShell";
import PhysicsTiltCard from "@/components/horror/PhysicsTiltCard";

const MILESTONES = [
  {
    id: "beginning",
    code: "ENTRY / 01",
    era: "THE BEGINNING",
    subtitle: "Ideas & curiosity",
    summary:
      "Started out pulling apart how websites actually render, animate, and communicate behind the browser window.",
    notes: [
      "Mastered core JavaScript, DOM mechanics, CSS spatial layouts, and responsive design fundamentals.",
      "Built early interactive prototypes to understand frame timing, vector math, and state transitions.",
      "Discovered a passion for atmospheric UI where visual storytelling and engineering meet.",
    ],
    tags: ["HTML / CSS", "JAVASCRIPT", "CANVAS", "UI FOUNDATIONS"],
  },
  {
    id: "building",
    code: "ENTRY / 02",
    era: "BUILDING THINGS",
    subtitle: "Projects & experiments",
    summary:
      "Moved into full-stack web engineering and real-time 3D graphics—shipping complete apps with authentication, databases, and WebGL scenes.",
    notes: [
      "Architected HITK Stationary with Next.js App Router, NextAuth (Google + Credentials), OTP email verification, and MongoDB.",
      "Created Three.js interactive environments featuring procedural canvas textures, real-time shadows, particle systems, and spring physics.",
      "Explored applied AI/ML tooling, backend Express APIs, and robust error handling across client and server boundaries.",
    ],
    tags: ["NEXT.JS", "REACT", "NODE.JS", "MONGODB", "THREE.JS"],
  },
  {
    id: "next",
    code: "ENTRY / 03",
    era: "WHAT'S NEXT?",
    subtitle: "The story continues",
    summary:
      "Pushing deeper into high-craft interactive experiences, scalable full-stack architecture, and AI-augmented products.",
    notes: [
      "Designing richer WebGL worlds with realistic physics simulations and tactile interaction.",
      "Open to ambitious engineering teams, collaborations, and building products that stand apart.",
      "Continuing to experiment, measure, refine, and ship meaningful work.",
    ],
    tags: ["WEBGL", "SYSTEM DESIGN", "AI / ML", "OPEN FOR COLLAB"],
  },
];

export default function ExperienceView() {
  const [expandedId, setExpandedId] = useState("building");
  const railFillRef = useRef(null);
  const railBeadRef = useRef(null);

  // Spring-damped vertical trail follower synced to page scroll.
  useEffect(() => {
    let current = 0;
    let velocity = 0;
    let rafId = 0;
    let prev = performance.now();

    const step = (now) => {
      const dt = Math.min((now - prev) / 1000, 0.035);
      prev = now;

      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const target = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      const accel = 55 * (target - current) - 11 * velocity;
      velocity += accel * dt;
      current += velocity * dt;

      const pct = Math.max(0, Math.min(100, current * 100));
      if (railFillRef.current) {
        railFillRef.current.style.height = `${pct.toFixed(2)}%`;
      }
      if (railBeadRef.current) {
        railBeadRef.current.style.top = `${pct.toFixed(2)}%`;
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <HorrorRoomShell
      activeId="experience"
      code="FIELD NOTES / 004"
      eyebrow="FIELD NOTES / 004 · TIMELINE ARCHIVE"
      title="The journey."
      subtitle="Field notes."
    >
      <div className="timeline-shell">
        <div className="trail-rail" aria-hidden="true">
          <div ref={railFillRef} className="trail-rail-fill" />
          <div ref={railBeadRef} className="trail-bead" />
        </div>

        <div className="milestones-col">
          {MILESTONES.map((item) => {
            const isOpen = expandedId === item.id;
            return (
              <div key={item.id} className="milestone-row">
                <div
                  className={`milestone-node ${isOpen ? "is-open" : ""}`}
                  aria-hidden="true"
                />
                <PhysicsTiltCard
                  pinned={false}
                  onClick={() =>
                    setExpandedId((cur) => (cur === item.id ? "" : item.id))
                  }
                  className="milestone-card"
                >
                  <div className="milestone-pad">
                    <div className="milestone-head">
                      <span className="milestone-code">{item.code}</span>
                      <span className="milestone-toggle">
                        {isOpen ? "COLLAPSE [-]" : "INSPECT NOTES [+]"}
                      </span>
                    </div>

                    <h2 className="milestone-era">{item.era}</h2>
                    <p className="milestone-sub">{item.subtitle}</p>
                    <p className="milestone-summary">{item.summary}</p>

                    <div className={`notes-drawer ${isOpen ? "is-open" : ""}`}>
                      <div className="notes-inner">
                        <ul className="notes-list">
                          {item.notes.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                        <div className="notes-tags">
                          {item.tags.map((tag) => (
                            <span key={tag} className="note-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </PhysicsTiltCard>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .timeline-shell {
          position: relative;
          padding-left: 44px;
        }
        .trail-rail {
          position: absolute;
          left: 14px;
          top: 12px;
          bottom: 12px;
          width: 2px;
          background: rgba(208, 186, 148, 0.16);
        }
        .trail-rail-fill {
          width: 100%;
          height: 0%;
          background: linear-gradient(180deg, #751820, #c79f64);
        }
        .trail-bead {
          position: absolute;
          left: 50%;
          top: 0%;
          width: 10px;
          height: 10px;
          transform: translate(-50%, -50%) rotate(45deg);
          background: #d4b684;
          box-shadow: 0 0 12px rgba(212, 182, 132, 0.75);
        }
        .milestones-col {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .milestone-row {
          position: relative;
        }
        .milestone-node {
          position: absolute;
          left: -36px;
          top: 32px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(208, 186, 148, 0.55);
          background: #120f0d;
          transition: background 0.25s ease, border-color 0.25s ease,
            box-shadow 0.25s ease;
        }
        .milestone-node.is-open {
          border-color: #d0786c;
          background: #7c1820;
          box-shadow: 0 0 16px rgba(176, 36, 44, 0.65);
        }
        .milestone-pad {
          padding: 26px 28px;
        }
        .milestone-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        .milestone-code {
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 2px;
          color: #a99068;
        }
        .milestone-toggle {
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.6px;
          color: #cf7268;
        }
        .milestone-era {
          margin: 0 0 4px;
          font: 600 18px var(--font-geist-mono), monospace;
          letter-spacing: 2.2px;
          color: #f0e3cb;
        }
        .milestone-sub {
          margin: 0 0 14px;
          font: italic 22px Georgia, serif;
          color: #bfa882;
        }
        .milestone-summary {
          margin: 0;
          font-size: 14px;
          line-height: 1.72;
          color: rgba(224, 212, 190, 0.76);
        }
        .notes-drawer {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.36s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .notes-drawer.is-open {
          grid-template-rows: 1fr;
        }
        .notes-inner {
          overflow: hidden;
        }
        .notes-list {
          margin: 20px 0 18px;
          padding: 18px 0 0 18px;
          border-top: 1px solid rgba(208, 186, 148, 0.16);
          font-size: 13.5px;
          line-height: 1.72;
          color: rgba(232, 221, 200, 0.84);
        }
        .notes-list li + li {
          margin-top: 8px;
        }
        .notes-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .note-tag {
          padding: 4px 9px;
          border: 1px solid rgba(208, 186, 148, 0.24);
          background: rgba(20, 17, 14, 0.85);
          font: 8px var(--font-geist-mono), monospace;
          letter-spacing: 1.4px;
          color: #d6c4a3;
        }
        @media (max-width: 680px) {
          .timeline-shell {
            padding-left: 28px;
          }
          .trail-rail {
            left: 6px;
          }
          .milestone-node {
            left: -28px;
            width: 12px;
            height: 12px;
          }
          .milestone-pad {
            padding: 20px 18px;
          }
        }
      `}</style>
    </HorrorRoomShell>
  );
}
