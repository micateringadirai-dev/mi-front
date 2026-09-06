import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HorizontalGallery.scss';

gsap.registerPlugin(ScrollTrigger);

/**
 * A row of images that scrolls sideways as the page scrolls down —
 * the "lookbook strip" effect used for the model-photo gallery in the
 * reference video. Pass an array of { src, caption }.
 */
export default function HorizontalGallery({ items = [] }) {
  const trackRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    const scrollDistance = track.scrollWidth - section.offsetWidth;
    if (scrollDistance <= 0) return;

    const anim = gsap.to(track, {
      x: -scrollDistance,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${scrollDistance}`,
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
      },
    });

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [items]);

  return (
    <div className="horizontal-gallery" ref={sectionRef}>
      <div className="horizontal-gallery__track" ref={trackRef}>
        {items.map((item, i) => (
          <figure className="horizontal-gallery__item" key={i}>
            <img src={item.src} alt={item.caption || `Gallery item ${i + 1}`} loading="lazy" />
            {item.caption && <figcaption>{item.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </div>
  );
}
