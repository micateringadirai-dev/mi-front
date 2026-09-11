import { useRef, useState } from 'react';
import './HorizontalGallery.scss';

/**
 * Continuous luxury photo reel that auto-scrolls smoothly without scroll-pinning,
 * eliminating any scroll lock/stuck issues when scrolling up or down the page.
 * Includes hover-pause, smooth navigation arrows, and touch swiping.
 */
export default function HorizontalGallery({ items = [] }) {
  const viewportRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate items so the continuous marquee loops seamlessly
  const loopedItems = [...items, ...items];

  const handlePrev = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="horizontal-gallery"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container horizontal-gallery__bar">
        <span className="horizontal-gallery__tagline">
          ✦ Handcrafted with passion • Hover to pause
        </span>
        <div className="horizontal-gallery__nav">
          <button
            type="button"
            className="gallery-nav-btn"
            onClick={handlePrev}
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button
            type="button"
            className="gallery-nav-btn"
            onClick={handleNext}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      <div className="horizontal-gallery__viewport" ref={viewportRef}>
        <div className={`horizontal-gallery__track ${isPaused ? 'is-paused' : ''}`}>
          {loopedItems.map((item, i) => (
            <figure className="horizontal-gallery__item" key={i}>
              <img src={item.src} alt={item.caption || `Gallery item ${i + 1}`} loading="lazy" />
              {item.caption && <figcaption>{item.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
