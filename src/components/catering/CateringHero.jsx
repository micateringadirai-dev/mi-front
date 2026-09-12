import { useEffect, useRef, useState } from 'react';
import miCateringLogo from '../../assets/mi-catering-logo.png';

export default function CateringHero({ cookingAnnouncements, onSelectAnnouncement }) {
  const [phase, setPhase] = useState(0);
  // phase 0 = hidden, 1 = ring radiates, 2 = logo scales in, 3 = text reveals

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);   // ring starts
    const t2 = setTimeout(() => setPhase(2), 600);   // logo fades in
    const t3 = setTimeout(() => setPhase(3), 1100);  // text slides up
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <>
      <style>{`
        /* ── Cinematic Logo Reveal ── */
        @keyframes ch-ring-pulse {
          0%   { transform: translate(-50%,-50%) scale(0.3); opacity: 0.9; }
          100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
        }
        @keyframes ch-ring2-pulse {
          0%   { transform: translate(-50%,-50%) scale(0.3); opacity: 0.6; }
          100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
        }
        @keyframes ch-logo-in {
          0%   { opacity: 0; transform: scale(0.55); filter: drop-shadow(0 0 0px rgba(207,161,68,0)); }
          60%  { opacity: 1; transform: scale(1.08); filter: drop-shadow(0 0 55px rgba(207,161,68,0.85)); }
          100% { opacity: 1; transform: scale(1);    filter: drop-shadow(0 14px 30px rgba(0,0,0,0.45)); }
        }
        @keyframes ch-glow-fade {
          0%   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%,-50%) scale(1.6); }
        }
        @keyframes ch-text-up {
          0%   { opacity: 0; transform: translateY(28px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes ch-logo-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-7px); }
        }

        /* ── Idea 2: Continuous pulsing gold aura rings ── */
        @keyframes ch-aura {
          0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.7; }
          100% { transform: translate(-50%,-50%) scale(2);   opacity: 0; }
        }

        .ch-aura-ring {
          position: absolute;
          top: 50%; left: 50%;
          width: 145px; height: 145px;
          border-radius: 50%;
          border: 2px solid rgba(207,161,68,0.65);
          pointer-events: none;
          opacity: 0;
          transform: translate(-50%,-50%) scale(1);
        }
        .ch-aura-ring.is-active {
          animation: ch-aura 2.4s ease-out infinite;
        }
        .ch-aura-ring--2.is-active { animation-delay: 0.8s; }
        .ch-aura-ring--3.is-active { animation-delay: 1.6s; }

        .ch-logo-stage {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 1.5rem;
          height: 195px;
        }

        /* Outer radiating ring */
        .ch-ring {
          position: absolute;
          top: 50%; left: 50%;
          width: 170px; height: 170px;
          border-radius: 50%;
          border: 2.5px solid rgba(207,161,68,0.75);
          pointer-events: none;
          opacity: 0;
        }
        .ch-ring--1.is-active {
          animation: ch-ring-pulse 1.1s cubic-bezier(0.2,0.6,0.4,1) forwards;
        }
        .ch-ring--2.is-active {
          animation: ch-ring2-pulse 1.1s 0.18s cubic-bezier(0.2,0.6,0.4,1) forwards;
        }

        /* Glow burst behind logo */
        .ch-glow {
          position: absolute;
          top: 50%; left: 50%;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(207,161,68,0.55) 0%, transparent 70%);
          pointer-events: none;
          opacity: 0;
          transform: translate(-50%,-50%) scale(1);
        }
        .ch-glow.is-active {
          animation: ch-glow-fade 1.2s 0.5s ease-out forwards;
        }

        /* Logo itself */
        .ch-logo {
          position: relative;
          z-index: 2;
          max-height: 180px;
          max-width: min(90vw, 360px);
          width: auto;
          object-fit: contain;
          opacity: 0;
        }
        .ch-logo.is-visible {
          animation:
            ch-logo-in 0.9s cubic-bezier(0.22,1,0.36,1) forwards,
            ch-logo-float 3.6s 1s ease-in-out infinite;
        }

        /* Text content */
        .ch-content {
          opacity: 0;
        }
        .ch-content.is-visible {
          animation: ch-text-up 0.75s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        @media (max-width: 768px) {
          .ch-logo-stage { height: 155px; }
          .ch-logo.is-visible { max-height: 140px; }
        }
        @media (max-width: 480px) {
          .ch-logo-stage { height: 125px; }
          .ch-logo.is-visible { max-height: 110px; }
        }
      `}</style>

      <section className="business-hero">
        <div className="container">
          {/* FSSAI license badge */}
          <div className="fssai-badge">
            <span className="fssai-badge__label">FSSAI Lic. No.</span>
            <span className="fssai-badge__number">XXXXXXXXXXXXXXXX</span>
          </div>

          {/* ── Cinematic logo reveal stage ── */}
          <div className="ch-logo-stage">
            {/* Intro burst rings */}
            <span className={`ch-ring ch-ring--1${phase >= 1 ? ' is-active' : ''}`} aria-hidden="true" />
            <span className={`ch-ring ch-ring--2${phase >= 1 ? ' is-active' : ''}`} aria-hidden="true" />
            {/* Glow burst */}
            <span className={`ch-glow${phase >= 2 ? ' is-active' : ''}`} aria-hidden="true" />
            {/* Continuous pulsing aura rings (Idea 2) */}
            <span className={`ch-aura-ring ch-aura-ring--1${phase >= 3 ? ' is-active' : ''}`} aria-hidden="true" />
            <span className={`ch-aura-ring ch-aura-ring--2${phase >= 3 ? ' is-active' : ''}`} aria-hidden="true" />
            <span className={`ch-aura-ring ch-aura-ring--3${phase >= 3 ? ' is-active' : ''}`} aria-hidden="true" />
            {/* Logo */}
            <img
              src={miCateringLogo}
              alt="MI Catering Services Logo"
              className={`ch-logo${phase >= 2 ? ' is-visible' : ''}`}
            />
          </div>

          {/* ── Reveal text ── */}
          <div className={`ch-content${phase >= 3 ? ' is-visible' : ''}`}>
            <span className="eyebrow">MI Catering Services</span>
            <h1>Authentic Flavors for Every Celebration</h1>
            <p>
              Weddings, housewarmings, corporate banquets &amp; scheduled signature feast pre-orders —
              cooked with wood-fire care.
            </p>
            <div className="business-hero__ctas">
              {cookingAnnouncements.length > 0 && (
                <button
                  type="button"
                  className="btn btn--primary btn--hero-preorder"
                  onClick={() => onSelectAnnouncement(cookingAnnouncements[0], true)}
                >
                  🔥 Pre-Order Daily Special ({cookingAnnouncements.length})
                </button>
              )}
              <a href="#quotation" className="btn btn--primary">
                📋 Request Quotation
              </a>
              <a href="tel:+919842096814" className="btn btn--outline">
                📞 +91 98420 96814
              </a>
            </div>
          </div>
        </div>

        <div className="business-hero__curve" aria-hidden="true">
          <svg viewBox="0 0 1440 50" fill="none" preserveAspectRatio="none">
            <path
              d="M0,0 C360,50 1080,50 1440,0 L1440,50 L0,50 Z"
              fill="#fdfbf7"
            />
          </svg>
        </div>
      </section>
    </>
  );
}
