import { useRef, useState } from 'react';
import './HorizontalGallery.scss';

/**
 * True infinite marquee gallery — pure CSS animation, no scroll bar.
 * Items are tripled so the loop is seamless regardless of item count.
 * Hover pauses the marquee.
 */
export default function HorizontalGallery({ items = [] }) {
  const [isPaused, setIsPaused] = useState(false);

  // Triple the items so there's always enough content to loop
  const loopedItems = [...items, ...items, ...items];

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
      </div>

      <div className="horizontal-gallery__viewport">
        <div className={`horizontal-gallery__track${isPaused ? ' is-paused' : ''}`}>
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
