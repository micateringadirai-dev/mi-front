import { useEffect, useState } from 'react';
import adCardImg from '../assets/AD.jpg';

const WHATSAPP_NUMBER = '919942272631'; // no + or spaces
const INSTAGRAM_URL   = 'https://www.instagram.com/onestepbeyond_osb';

export default function AdPopup() {
  const [visible, setVisible]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [leaving, setLeaving]   = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }, 3000);

    return () => clearTimeout(showTimer);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      setMounted(false);
    }, 400);
  };

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

        .ad-popup {
          position: fixed;
          bottom: 1.8rem;
          right: 1.8rem;
          z-index: 99999;
          width: 300px;
          border-radius: 20px;
          overflow: hidden;
          background: #fff;
          box-shadow:
            0 25px 60px rgba(0,0,0,0.22),
            0 0 0 1px rgba(207,161,68,0.25),
            0 0 40px rgba(207,161,68,0.08);
          font-family: 'Inter', sans-serif;
          transform: translateY(120%) scale(0.92);
          opacity: 0;
          transition:
            transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
            opacity   0.4s ease;
        }

        .ad-popup.is-visible {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        .ad-popup.is-leaving {
          transform: translateY(120%) scale(0.9);
          opacity: 0;
        }

        @media (max-width: 480px) {
          .ad-popup {
            width: calc(100vw - 2.4rem);
            left: 50%;
            right: auto;
            bottom: 1.2rem;
            transform: translateX(-50%) translateY(120%) scale(0.92);
          }
          .ad-popup.is-visible {
            transform: translateX(-50%) translateY(0) scale(1);
          }
          .ad-popup.is-leaving {
            transform: translateX(-50%) translateY(120%) scale(0.9);
          }
        }

        .ad-popup__img-wrap {
          position: relative;
          width: 100%;
        }

        .ad-popup__img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }

        .ad-popup__badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: linear-gradient(135deg, #cfa144, #e8943a);
          color: #fff;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 0.28rem 0.75rem;
          border-radius: 100px;
          box-shadow: 0 3px 12px rgba(207,161,68,0.45);
        }

        .ad-popup__close {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(6px);
          border: none;
          color: #fff;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.25s;
          line-height: 1;
        }

        .ad-popup__close:hover {
          background: rgba(200,50,50,0.75);
          transform: scale(1.12) rotate(90deg);
        }

        .ad-popup__footer {
          padding: 0.85rem 1rem 1rem;
          background: #fff;
        }

        .ad-popup__promo {
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          border-radius: 10px;
          padding: 0.65rem 0.85rem;
          margin-bottom: 0.7rem;
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .ad-popup__promo-icon {
          font-size: 1.3rem;
          flex-shrink: 0;
          filter: drop-shadow(0 0 6px rgba(150,120,255,0.6));
        }

        .ad-popup__promo-text {
          flex: 1;
        }

        .ad-popup__promo-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.1rem;
          line-height: 1.25;
        }

        .ad-popup__promo-title span {
          background: linear-gradient(90deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ad-popup__promo-sub {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.55);
          margin: 0;
          line-height: 1.3;
        }

        .ad-popup__label {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #b0a090;
          margin-bottom: 0.6rem;
          margin-top: 0;
          text-align: center;
        }

        .ad-popup__ctas {
          display: flex;
          gap: 0.55rem;
        }

        .ad-popup__btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.6rem 0.5rem;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
          border: none;
          cursor: pointer;
        }

        .ad-popup__btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow: 0 6px 18px rgba(0,0,0,0.15);
        }

        .ad-popup__btn:active {
          transform: translateY(0);
        }

        .ad-popup__btn--wa {
          background: linear-gradient(135deg, #25d366, #128c4e);
          color: #fff;
          box-shadow: 0 4px 14px rgba(37,211,102,0.3);
        }

        .ad-popup__btn--ig {
          background: linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4);
          color: #fff;
          box-shadow: 0 4px 14px rgba(221,42,123,0.3);
        }
      `}</style>

      <div
        className={`ad-popup${visible ? ' is-visible' : ''}${leaving ? ' is-leaving' : ''}`}
        role="dialog"
        aria-label="Promotional offer"
      >
        {/* Visiting card image */}
        <div className="ad-popup__img-wrap">
          <img
            src={adCardImg}
            alt="MI Groups – Visiting Card"
            className="ad-popup__img"
            onError={(e) => {
              if (!e.currentTarget.src.endsWith('/AD.jpg')) {
                e.currentTarget.src = '/AD.jpg';
              }
            }}
          />
          <span className="ad-popup__badge">✦ Connect With Us</span>
          <button
            className="ad-popup__close"
            onClick={dismiss}
            aria-label="Close promotion"
          >
            ✕
          </button>
        </div>

        {/* CTA buttons */}
        <div className="ad-popup__footer">

          {/* Promo pitch */}
          <div className="ad-popup__promo">
            <span className="ad-popup__promo-icon">💻</span>
            <div className="ad-popup__promo-text">
              <p className="ad-popup__promo-title">
                Want a <span>website like this</span>?
              </p>
              <p className="ad-popup__promo-sub">We build it for your business! — OSB</p>
            </div>
          </div>

          <p className="ad-popup__label">Reach us directly</p>
          <div className="ad-popup__ctas">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20visited%20your%20website%20and%20would%20like%20to%20know%20more%20about%20MI%20Groups.`}
              target="_blank"
              rel="noopener noreferrer"
              className="ad-popup__btn ad-popup__btn--wa"
              aria-label="Chat on WhatsApp"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>

            {/* Instagram */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ad-popup__btn ad-popup__btn--ig"
              aria-label="Follow on Instagram"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              Instagram
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
