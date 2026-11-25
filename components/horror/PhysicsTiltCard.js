"use client";

import { useEffect, useRef } from "react";

export default function PhysicsTiltCard({
  children,
  className = "",
  onClick,
  pinned = true,
  maxTilt = 7,
  interactive = true,
  style,
}) {
  const cardRef = useRef(null);
  const sheenRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    const sheen = sheenRef.current;
    if (!el) return;

    const state = {
      rx: 0,
      ry: 0,
      tz: 0,
      vrx: 0,
      vry: 0,
      vtz: 0,
      targetRx: 0,
      targetRy: 0,
      targetTz: 0,
      mx: 50,
      my: 50,
      hovering: false,
      rafId: 0,
      lastTime: 0,
    };

    const STIFFNESS = 190;
    const DAMPING = 18;

    const step = (now) => {
      const dt = Math.min((now - (state.lastTime || now)) / 1000, 0.035);
      state.lastTime = now;

      const arx = STIFFNESS * (state.targetRx - state.rx) - DAMPING * state.vrx;
      const ary = STIFFNESS * (state.targetRy - state.ry) - DAMPING * state.vry;
      const atz = 260 * (state.targetTz - state.tz) - 22 * state.vtz;

      state.vrx += arx * dt;
      state.vry += ary * dt;
      state.vtz += atz * dt;

      state.rx += state.vrx * dt;
      state.ry += state.vry * dt;
      state.tz += state.vtz * dt;

      el.style.transform = `perspective(1000px) translate3d(0, 0, ${state.tz.toFixed(2)}px) rotateX(${state.rx.toFixed(3)}deg) rotateY(${state.ry.toFixed(3)}deg)`;

      if (sheen) {
        sheen.style.opacity = state.hovering ? "1" : "0";
        sheen.style.background = `radial-gradient(260px circle at ${state.mx.toFixed(1)}% ${state.my.toFixed(1)}%, rgba(255, 224, 168, 0.14), rgba(140, 26, 34, 0.06) 45%, transparent 72%)`;
      }

      const settled =
        Math.abs(state.targetRx - state.rx) < 0.01 &&
        Math.abs(state.targetRy - state.ry) < 0.01 &&
        Math.abs(state.targetTz - state.tz) < 0.02 &&
        Math.abs(state.vrx) < 0.01 &&
        Math.abs(state.vry) < 0.01 &&
        Math.abs(state.vtz) < 0.02;

      if (!settled) {
        state.rafId = requestAnimationFrame(step);
      } else {
        state.rafId = 0;
        if (state.targetRx === 0 && state.targetRy === 0 && state.targetTz === 0) {
          el.style.transform = "perspective(1000px) translate3d(0, 0, 0px) rotateX(0deg) rotateY(0deg)";
        }
      }
    };

    const wake = () => {
      if (!state.rafId) {
        state.lastTime = performance.now();
        state.rafId = requestAnimationFrame(step);
      }
    };

    const handleMove = (event) => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      state.mx = nx * 100;
      state.my = ny * 100;
      state.hovering = true;
      state.targetRy = (nx - 0.5) * 2 * maxTilt;
      state.targetRx = (0.5 - ny) * 2 * maxTilt;
      state.targetTz = 8;
      wake();
    };

    const handleLeave = () => {
      state.hovering = false;
      state.targetRx = 0;
      state.targetRy = 0;
      state.targetTz = 0;
      wake();
    };

    const handleDown = () => {
      state.vtz -= 160;
      state.vrx += (Math.random() - 0.5) * 22;
      state.vry += (Math.random() - 0.5) * 22;
      wake();
    };

    el.addEventListener("pointermove", handleMove, { passive: true });
    el.addEventListener("pointerleave", handleLeave, { passive: true });
    el.addEventListener("pointerdown", handleDown, { passive: true });

    return () => {
      if (state.rafId) cancelAnimationFrame(state.rafId);
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", handleLeave);
      el.removeEventListener("pointerdown", handleDown);
    };
  }, [maxTilt]);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      data-interactive={interactive ? "true" : undefined}
      style={style}
      className={`physics-card ${className}`}
    >
      {pinned && (
        <span className="card-pin-wrap" aria-hidden="true">
          <span className="card-pin-wire" />
          <span className="card-pin-head" />
        </span>
      )}
      <div ref={sheenRef} className="card-sheen" aria-hidden="true" />
      <div className="card-inner">{children}</div>

      <style jsx>{`
        .physics-card {
          position: relative;
          border: 1px solid rgba(208, 186, 148, 0.22);
          background: linear-gradient(
            155deg,
            rgba(22, 19, 17, 0.90) 0%,
            rgba(12, 11, 11, 0.94) 100%
          );
          box-shadow: 0 22px 48px rgba(0, 0, 0, 0.72),
            inset 0 1px 0 rgba(255, 232, 196, 0.06);
          will-change: transform;
          transform-style: preserve-3d;
          transition: border-color 0.25s ease;
        }
        .physics-card:hover {
          border-color: rgba(212, 185, 138, 0.45);
        }
        .card-pin-wrap {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none;
          z-index: 4;
        }
        .card-pin-wire {
          width: 1px;
          height: 11px;
          background: rgba(185, 162, 122, 0.55);
        }
        .card-pin-head {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #d9c093, #6a5639 75%);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.85);
        }
        .card-sheen {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 1;
        }
        .card-inner {
          position: relative;
          z-index: 2;
        }
      `}</style>
    </div>
  );
}
