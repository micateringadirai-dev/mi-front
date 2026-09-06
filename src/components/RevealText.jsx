import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Wraps text so it sharpens from a blurred/faded state into full focus
 * as it scrolls into view — the effect used on "Express Your Identity
 * With Our Unique Style" in the reference video.
 *
 * Usage: <RevealText as="h2">Freshly Stone-Ground, The Traditional Way</RevealText>
 */
export default function RevealText({ children, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { filter: 'blur(10px)', opacity: 0, y: 24 });

    const anim = gsap.to(el, {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, []);

  return (
    <Tag ref={ref} className={`reveal-text ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
