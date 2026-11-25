"use client";

import { Mail, Phone, Clock, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import HorrorRoomShell from "@/components/horror/HorrorRoomShell";
import PhysicsTiltCard from "@/components/horror/PhysicsTiltCard";

export default function ContactView() {
  const copyChannel = async (label, value) => {
    try {
      await navigator.clipboard?.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      // Clipboard may be blocked in restricted contexts; ignore silently.
    }
  };

  return (
    <HorrorRoomShell
      activeId="contact"
      code="TRANSMISSION / 005"
      eyebrow="TRANSMISSION / 005 · OPEN CHANNEL"
      title="Let's talk."
      subtitle="Leave a message."
    >
      <div className="contact-dossier">
        {/* Left Side — Exact content preserved from original /contact */}
        <PhysicsTiltCard pinned={false} maxTilt={4.5} className="contact-panel-left">
          <div className="left-inner">
            <span className="panel-eyebrow">SIGNAL / PRIMARY</span>
            <h2 className="left-heading">Contact Us</h2>

            <p className="left-copy">
              Have questions about a bug in website or a error or anything?!
              We&apos;d love to hear from you.
            </p>

            <div className="left-channels">
              <div
                className="left-item"
                role="button"
                tabIndex={0}
                data-interactive="true"
                onClick={() => copyChannel("Email", "luvag0707@gmail.com")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    copyChannel("Email", "luvag0707@gmail.com");
                  }
                }}
              >
                <span className="icon-badge icon-amber">
                  <Mail size={20} />
                </span>
                <div>
                  <p className="item-label">Email</p>
                  <p className="item-value break-all">luvag0707@gmail.com</p>
                </div>
              </div>

              <div
                className="left-item"
                role="button"
                tabIndex={0}
                data-interactive="true"
                onClick={() => copyChannel("Phone", "+91 7278717660")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    copyChannel("Phone", "+91 7278717660");
                  }
                }}
              >
                <span className="icon-badge icon-crimson">
                  <Phone size={20} />
                </span>
                <div>
                  <p className="item-label">Phone</p>
                  <p className="item-value">+91 7278717660</p>
                </div>
              </div>

              <div className="left-item">
                <span className="icon-badge icon-brass">
                  <Clock size={20} />
                </span>
                <div>
                  <p className="item-label">Business Hours</p>
                  <p className="item-value">Monday - Saturday</p>
                  <p className="item-sub">9:00 AM – 8:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </PhysicsTiltCard>

        {/* Right Side — Exact content preserved from original /contact */}
        <div className="contact-panel-right">
          <span className="panel-eyebrow">DIRECT SUPPORT DISPATCH</span>
          <h2 className="right-heading">Get In Touch</h2>

          <p className="right-copy">
            Whether you have a question about your rent or sells, buys, etc,
            we&apos;re here to help.
          </p>

          <div className="right-cards">
            <PhysicsTiltCard
              onClick={() => copyChannel("Email Support", "luvag0707@gmail.com")}
              className="support-card"
            >
              <div className="support-pad">
                <span className="icon-badge icon-amber">
                  <Mail size={19} />
                </span>
                <div>
                  <p className="support-title">Email Support</p>
                  <p className="support-detail break-all">luvag0707@gmail.com</p>
                </div>
              </div>
            </PhysicsTiltCard>

            <PhysicsTiltCard
              onClick={() => copyChannel("Phone Support", "+91 9874448947")}
              className="support-card"
            >
              <div className="support-pad">
                <span className="icon-badge icon-crimson">
                  <Phone size={19} />
                </span>
                <div>
                  <p className="support-title">Phone Support</p>
                  <p className="support-detail">+91 9874448947</p>
                </div>
              </div>
            </PhysicsTiltCard>

            <PhysicsTiltCard className="support-card">
              <div className="support-pad">
                <span className="icon-badge icon-brass">
                  <MapPin size={19} />
                </span>
                <div>
                  <p className="support-title">Service Area</p>
                  <p className="support-detail">Available across India 🇮🇳</p>
                </div>
              </div>
            </PhysicsTiltCard>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-dossier {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 28px;
          align-items: stretch;
        }
        .left-inner {
          padding: 34px 32px;
          background: radial-gradient(
            circle at 12% 10%,
            rgba(92, 16, 22, 0.22),
            rgba(10, 9, 10, 0.6) 65%
          );
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .panel-eyebrow {
          display: inline-block;
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 2.4px;
          color: #b49a70;
          margin-bottom: 10px;
        }
        .left-heading {
          margin: 0 0 12px;
          font: 400 34px Georgia, serif;
          color: #f3e7d1;
        }
        .left-copy {
          margin: 0 0 30px;
          font-size: 14.5px;
          line-height: 1.72;
          color: rgba(224, 212, 190, 0.72);
        }
        .left-channels {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .left-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px 12px;
          margin: -10px -12px;
          border: 1px solid transparent;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .left-item[role="button"]:hover {
          border-color: rgba(208, 186, 148, 0.26);
          background: rgba(255, 232, 196, 0.03);
        }
        .icon-badge {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(208, 186, 148, 0.28);
          background: rgba(20, 17, 15, 0.9);
          flex-shrink: 0;
        }
        .icon-amber {
          color: #dfc392;
        }
        .icon-crimson {
          color: #cf6e64;
          border-color: rgba(168, 42, 48, 0.45);
        }
        .icon-brass {
          color: #c2a46f;
        }
        .item-label {
          margin: 0 0 2px;
          font: 9px var(--font-geist-mono), monospace;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: rgba(212, 185, 138, 0.62);
        }
        .item-value {
          margin: 0;
          font-size: 15px;
          font-weight: 500;
          color: #efe3cb;
        }
        .item-sub {
          margin: 3px 0 0;
          font-size: 13px;
          color: rgba(224, 212, 190, 0.68);
        }
        .contact-panel-right {
          padding: 34px 30px;
          border: 1px solid rgba(208, 186, 148, 0.22);
          background: linear-gradient(
            160deg,
            rgba(22, 19, 17, 0.88),
            rgba(11, 10, 10, 0.94)
          );
          box-shadow: 0 24px 52px rgba(0, 0, 0, 0.72);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .right-heading {
          margin: 0 0 10px;
          font: 400 32px Georgia, serif;
          color: #f1e5cf;
        }
        .right-copy {
          margin: 0 0 28px;
          font-size: 14.5px;
          line-height: 1.72;
          color: rgba(224, 212, 190, 0.68);
        }
        .right-cards {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .support-pad {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 18px 20px;
        }
        .support-title {
          margin: 0 0 3px;
          font: 600 14px Georgia, serif;
          letter-spacing: 0.4px;
          color: #f0e3cc;
        }
        .support-detail {
          margin: 0;
          font-size: 13.5px;
          color: rgba(224, 212, 190, 0.72);
        }
        @media (max-width: 860px) {
          .contact-dossier {
            grid-template-columns: 1fr;
          }
          .left-inner,
          .contact-panel-right {
            padding: 26px 22px;
          }
        }
      `}</style>
    </HorrorRoomShell>
  );
}
