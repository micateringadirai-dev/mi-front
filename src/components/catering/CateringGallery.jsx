import { useEffect, useRef, useState } from 'react';
import api from '../../api/client';

/* ─────────────────────────────────────────
   Section-level 3-D tilt (whole grid tilts)
───────────────────────────────────────── */
function useSectionTilt(strength = 12) {
  const stageRef = useRef(null);
  const gridRef  = useRef(null);
  const raf      = useRef(null);
  const current  = useRef({ rx: 0, ry: 0 });
  const target   = useRef({ rx: 0, ry: 0 });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onMove = (e) => {
      const { left, top, width, height } = stage.getBoundingClientRect();
      const x = (e.clientX - left) / width  - 0.5;
      const y = (e.clientY - top)  / height - 0.5;
      target.current = { rx: -y * strength, ry: x * strength };
    };
    const onLeave = () => { target.current = { rx: 0, ry: 0 }; };

    const animate = () => {
      const t = 0.06;
      current.current.rx += (target.current.rx - current.current.rx) * t;
      current.current.ry += (target.current.ry - current.current.ry) * t;
      if (gridRef.current) {
        gridRef.current.style.transform =
          `perspective(1200px) rotateX(${current.current.rx}deg) rotateY(${current.current.ry}deg)`;
      }
      raf.current = requestAnimationFrame(animate);
    };

    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', onLeave);
    raf.current = requestAnimationFrame(animate);

    return () => {
      stage.removeEventListener('mousemove', onMove);
      stage.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [strength]);

  return { stageRef, gridRef };
}

/* ─────────────────────────────────────────
   Individual dish card
───────────────────────────────────────── */
function DishCard({ item, idx, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`pg-card${hovered ? ' pg-card--up' : ''}`}
      style={{ '--i': idx }}
      onClick={() => onClick(idx)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(idx)}
      aria-label={`View ${item.name}`}
    >
      <div className="pg-img-wrap">
        <img src={item.imageUrl} alt={item.name} loading="lazy" className="pg-img" />
        <div className="pg-img-shade" />
      </div>
      <span className="pg-tag">{String(idx + 1).padStart(2, '0')}</span>
      <div className="pg-info">
        <p className="pg-name">{item.name}</p>
        {item.description && <p className="pg-desc">{item.description}</p>}
      </div>
      <div className="pg-ring" />
      <div className="pg-shadow-layer" />
    </div>
  );
}

/* ─────────────────────────────────────────
   Floating ember particles
───────────────────────────────────────── */
function Sparks() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const sparks = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.4 + 0.08),
      alpha: Math.random() * 0.6,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparks.forEach((s) => {
        s.x += s.vx; s.y += s.vy;
        s.alpha += (Math.random() - 0.5) * 0.025;
        s.alpha = Math.max(0.04, Math.min(0.65, s.alpha));
        if (s.y < 0) { s.y = canvas.height; s.x = Math.random() * canvas.width; }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,148,58,${s.alpha})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="pg-sparks" />;
}

/* ─────────────────────────────────────────
   Main
───────────────────────────────────────── */
export default function CateringGallery() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [lb,      setLb]      = useState(null);
  const { stageRef, gridRef } = useSectionTilt(12);

  useEffect(() => {
    api.get('/catering/gallery')
      .then((res) => {
        if (Array.isArray(res.data?.data) && res.data.data.length > 0)
          setItems(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape')     setLb(null);
      if (e.key === 'ArrowRight' && lb !== null) setLb((i) => (i + 1) % items.length);
      if (e.key === 'ArrowLeft'  && lb !== null) setLb((i) => (i - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [lb, items.length]);

  if (loading || items.length === 0) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

        .pg-section {
          position: relative; padding: 6rem 0 8rem; overflow: hidden; user-select: none;
          background: linear-gradient(160deg, #070301 0%, #0f0602 50%, #070301 100%);
        }
        .pg-section::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 75% 55% at 10%  5%,  rgba(220,95,10,0.22)  0%, transparent 55%),
            radial-gradient(ellipse 55% 50% at 90% 95%,  rgba(160,50,5,0.28)   0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 55% 40%,  rgba(240,150,20,0.09) 0%, transparent 50%);
          animation: pg-aura 7s ease-in-out infinite alternate;
        }
        @keyframes pg-aura { from { opacity:.75; } to { opacity:1; } }

        .pg-section::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 40%;
          background-image:
            linear-gradient(rgba(232,148,58,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,148,58,0.07) 1px, transparent 1px);
          background-size: 55px 55px;
          transform: perspective(450px) rotateX(58deg); transform-origin: bottom center;
          mask-image: linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 100%);
          pointer-events: none;
        }

        .pg-sparks {
          position: absolute; inset: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 1;
        }

        .pg-container { position: relative; z-index: 2; max-width: 1340px; margin: 0 auto; padding: 0 1.5rem; }

        .pg-header { text-align: center; margin-bottom: 3.5rem; }
        .pg-eyebrow {
          display: inline-flex; align-items: center; gap: .55rem;
          font-family: 'Inter', sans-serif; font-size: .68rem; font-weight: 600;
          letter-spacing: .28em; text-transform: uppercase; color: #e8943a;
          background: rgba(232,148,58,.1); border: 1px solid rgba(232,148,58,.28);
          padding: .42rem 1.15rem; border-radius: 100px; margin-bottom: 1.5rem;
          backdrop-filter: blur(6px);
        }
        .pg-dot {
          width: 6px; height: 6px; background: #e8943a; border-radius: 50%;
          box-shadow: 0 0 7px #e8943a; animation: pg-pulse 2s ease-in-out infinite;
        }
        @keyframes pg-pulse {
          0%,100% { transform:scale(1);   opacity:1; }
          50%      { transform:scale(.5); opacity:.3; }
        }
        .pg-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(2.8rem, 5.5vw, 4.4rem); font-weight: 700;
          margin: 0 0 1rem; line-height: 1.05; letter-spacing: -.02em;
          background: linear-gradient(130deg, #fff 15%, #f5c96a 60%, #e8943a 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .pg-subtitle {
          font-family: 'Inter', sans-serif; font-size: 1rem; color: rgba(255,255,255,.38);
          max-width: 500px; margin: 0 auto; line-height: 1.75; font-weight: 300;
        }
        .pg-subtitle em { color: #e8943a; font-style: italic; }

        .pg-stage { width: 100%; padding: 60px 0 80px; position: relative; }

        .pg-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 1.6rem; transform-origin: center center; will-change: transform;
          transform: perspective(1200px) rotateX(4deg) rotateY(0deg);
        }

        .pg-card {
          position: relative; border-radius: 18px; overflow: hidden; cursor: pointer; outline: none;
          background: #100805;
          box-shadow: 0 6px 24px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.05);
          /* rise in, then loop float — float starts after rise ends */
          animation:
            pg-rise .65s cubic-bezier(.22,1,.36,1) both,
            pg-float 3.8s ease-in-out infinite;
          /* rise delay staggered; float delay = rise-delay + rise-duration + unique phase offset */
          animation-delay:
            calc(var(--i,0) * .06s),
            calc(var(--i,0) * .06s + .65s + var(--i,0) * .42s);
        }
        @keyframes pg-rise {
          from { opacity:0; transform:translateY(50px) scale(.94); }
          to   { opacity:1; transform:translateY(0)    scale(1);   }
        }

        /* ── continuous float ── */
        @keyframes pg-float {
          0%,100% { transform: translateY(0px)   scale(1); }
          50%      { transform: translateY(-12px) scale(1.015); }
        }
        @keyframes pg-float-shadow {
          0%,100% { opacity:.55; transform: translateX(-50%) scaleX(1)    scaleY(1); }
          50%      { opacity:.25; transform: translateX(-50%) scaleX(.75) scaleY(.6); }
        }

        .pg-card:focus-visible { box-shadow: 0 0 0 3px #e8943a, 0 12px 40px rgba(232,148,58,.3); }
        .pg-card--up {
          /* pause float, apply sharp lift instead */
          animation-play-state: paused, paused !important;
          transform: translateY(-18px) scale(1.04) !important;
          box-shadow: 0 32px 65px rgba(0,0,0,.78), 0 0 0 1px rgba(232,148,58,.45), 0 0 45px rgba(232,148,58,.2);
          z-index: 10;
        }

        .pg-img-wrap { position: relative; width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #1a0e06; }
        .pg-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform .7s cubic-bezier(.25,.46,.45,.94), filter .5s;
          filter: brightness(.88) saturate(1.12);
        }
        .pg-card--up .pg-img { transform: scale(1.1); filter: brightness(.72) saturate(1.3); }
        .pg-img-shade {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 30%, rgba(8,3,1,.88) 100%);
        }

        .pg-tag {
          position: absolute; top: 13px; left: 13px;
          font-family: 'Inter', sans-serif; font-size: .6rem; font-weight: 700; letter-spacing: .15em;
          color: #e8943a; background: rgba(6,2,1,.75); border: 1px solid rgba(232,148,58,.45);
          padding: .22rem .65rem; border-radius: 100px; backdrop-filter: blur(10px);
          box-shadow: 0 0 14px rgba(232,148,58,.22);
        }

        .pg-info { position: absolute; bottom: 0; left: 0; right: 0; padding: 1.15rem 1rem .95rem; }
        .pg-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.08rem; font-weight: 700; color: #fff; margin: 0 0 .2rem; line-height: 1.2;
          text-shadow: 0 2px 10px rgba(0,0,0,.7);
        }
        .pg-desc {
          font-family: 'Inter', sans-serif; font-size: .7rem; color: rgba(255,255,255,.48);
          margin: 0; line-height: 1.45;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }

        .pg-ring {
          position: absolute; inset: 0; border-radius: 18px;
          border: 1.5px solid rgba(232,148,58,0); pointer-events: none;
          transition: border-color .3s, box-shadow .3s;
        }
        .pg-card--up .pg-ring {
          border-color: rgba(232,148,58,.55);
          box-shadow: inset 0 0 30px rgba(232,148,58,.08);
        }

        .pg-shadow-layer {
          position: absolute;
          bottom: -16px; left: 50%; transform: translateX(-50%);
          width: 80%; height: 22px;
          background: radial-gradient(ellipse, rgba(0,0,0,.6) 0%, transparent 70%);
          border-radius: 50%; filter: blur(8px);
          pointer-events: none;
          /* always shown, pulsing in sync with the float */
          animation: pg-float-shadow 3.8s ease-in-out infinite;
          animation-delay: calc(var(--i,0) * .42s + .65s);
        }
        .pg-card--up .pg-shadow-layer {
          animation-play-state: paused;
          opacity: .2;
          transform: translateX(-50%) scaleX(.72) scaleY(.55);
        }

        .pg-hint {
          text-align: center; margin-top: 2.2rem;
          font-family: 'Inter', sans-serif; font-size: .7rem;
          color: rgba(255,255,255,.2); letter-spacing: .12em; text-transform: uppercase;
        }
        .pg-hint span { color: rgba(232,148,58,.45); }

        /* LIGHTBOX */
        .pg-lb {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(3,1,0,.97); backdrop-filter: blur(22px);
          display: flex; align-items: center; justify-content: center; padding: 1.5rem;
          animation: pg-lb-in .3s ease both;
        }
        @keyframes pg-lb-in { from { opacity:0; } to { opacity:1; } }
        .pg-lb-box {
          position: relative; max-width: 880px; width: 100%; border-radius: 22px; overflow: hidden;
          box-shadow: 0 0 0 1px rgba(232,148,58,.2), 0 55px 140px rgba(0,0,0,.88), 0 0 90px rgba(232,148,58,.1);
          animation: pg-lb-zoom .42s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes pg-lb-zoom {
          from { transform:scale(.86) translateY(28px); opacity:0; }
          to   { transform:scale(1)   translateY(0);    opacity:1; }
        }
        .pg-lb-img { width:100%; max-height:76vh; object-fit:cover; display:block; }
        .pg-lb-cap {
          position: absolute; bottom:0; left:0; right:0;
          background: linear-gradient(0deg, rgba(3,1,0,.97) 0%, transparent 100%);
          padding: 3.5rem 2rem 1.8rem;
        }
        .pg-lb-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.8rem; font-weight: 700; color: #fff; display: block; margin-bottom: .4rem;
        }
        .pg-lb-txt { font-family: 'Inter', sans-serif; font-size: .85rem; color: rgba(255,255,255,.55); margin: 0; }
        .pg-lb-nav {
          position: fixed; top: 50%; transform: translateY(-50%);
          width: 52px; height: 52px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,.14); background: rgba(15,8,3,.7);
          color: #fff; font-size: 1.55rem;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          backdrop-filter: blur(10px); transition: background .22s, border-color .22s, transform .22s;
          z-index: 10001;
        }
        .pg-lb-nav:hover {
          background: rgba(232,148,58,.3); border-color: rgba(232,148,58,.6);
          transform: translateY(-50%) scale(1.12);
        }
        .pg-lb-prev { left: 1.3rem; } .pg-lb-next { right: 1.3rem; }
        .pg-lb-close {
          position: fixed; top: 1.3rem; right: 1.3rem; width: 42px; height: 42px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,.14); background: rgba(15,8,3,.7);
          color: #fff; font-size: 1.05rem;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          backdrop-filter: blur(10px); transition: background .2s, transform .3s; z-index: 10001;
        }
        .pg-lb-close:hover { background: rgba(200,50,50,.35); transform: scale(1.1) rotate(90deg); }
        .pg-lb-dots {
          position: fixed; bottom: 1.8rem; left: 50%; transform: translateX(-50%);
          display: flex; gap: .4rem; z-index: 10001;
        }
        .pg-lb-dot {
          width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,.22);
          transition: background .22s, transform .22s;
        }
        .pg-lb-dot.on { background: #e8943a; transform: scale(1.45); box-shadow: 0 0 7px rgba(232,148,58,.75); }

        @media (max-width: 640px) {
          .pg-grid { grid-template-columns: 1fr 1fr; gap: .9rem; }
          .pg-lb-nav { display: none; }
          .pg-stage { padding: 30px 0 50px; }
        }
      `}</style>

      <section className="pg-section" ref={stageRef}>
        <Sparks />
        <div className="pg-container">
          <header className="pg-header">
            <div className="pg-eyebrow">
              <span className="pg-dot" />
              Our Signature Dishes
            </div>
            <h2 className="pg-title">What We Cook</h2>
            <p className="pg-subtitle">
              Authentic flavours cooked with care —&nbsp;
              <em>wood-fire traditions</em> passed down through generations.
            </p>
          </header>

          <div className="pg-stage">
            <div className="pg-grid" ref={gridRef}>
              {items.map((item, idx) => (
                <DishCard key={item._id} item={item} idx={idx} onClick={setLb} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {lb !== null && (
        <div className="pg-lb" onClick={() => setLb(null)}>
          <div className="pg-lb-box" onClick={(e) => e.stopPropagation()}>
            <img src={items[lb].imageUrl} alt={items[lb].name} className="pg-lb-img" />
            <div className="pg-lb-cap">
              <strong className="pg-lb-name">{items[lb].name}</strong>
              {items[lb].description && <p className="pg-lb-txt">{items[lb].description}</p>}
            </div>
          </div>
          {items.length > 1 && (
            <>
              <button className="pg-lb-nav pg-lb-prev"
                onClick={(e) => { e.stopPropagation(); setLb((i) => (i - 1 + items.length) % items.length); }}
                aria-label="Previous">‹</button>
              <button className="pg-lb-nav pg-lb-next"
                onClick={(e) => { e.stopPropagation(); setLb((i) => (i + 1) % items.length); }}
                aria-label="Next">›</button>
            </>
          )}
          <button className="pg-lb-close" onClick={() => setLb(null)} aria-label="Close">✕</button>
          <div className="pg-lb-dots">
            {items.map((_, i) => (
              <span key={i} className={`pg-lb-dot${i === lb ? ' on' : ''}`} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
