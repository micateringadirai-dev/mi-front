import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './LogoIntro.scss';

/**
 * A one-time splash intro: an elegant signature-style flourish draws
 * itself on screen (SVG stroke-dashoffset animation on a real <path>,
 * so getTotalLength works), then the "MI GROUPS" wordmark fades in
 * beneath it and the whole splash dissolves to reveal the site — the
 * same beat as the pen-drawn signature at the start of the reference
 * video.
 */
export default function LogoIntro({ onComplete }) {
  const pathRef = useRef(null);
  const textRef = useRef(null);
  const wrapperRef = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();

    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.set(textRef.current, { opacity: 0, y: 10, letterSpacing: '0.3em' });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(wrapperRef.current, {
          opacity: 0,
          duration: 0.6,
          delay: 0.35,
          onComplete: () => {
            setDone(true);
            onComplete?.();
          },
        });
      },
    });

    tl.to(path, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }).to(
      textRef.current,
      { opacity: 1, y: 0, letterSpacing: '0.15em', duration: 0.7, ease: 'power2.out' },
      '-=0.3'
    );

    return () => tl.kill();
  }, [onComplete]);

  if (done) return null;

  return (
    <div className="logo-intro" ref={wrapperRef}>
      <div className="logo-intro__mark">
        <svg
          className="logo-intro__svg"
          viewBox="0 0 320 140"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Abstract signature flourish - a single continuous stroke */}
          <path
            ref={pathRef}
            d="M20,100 C40,40 60,120 85,70 C100,40 110,90 130,60
               C145,38 150,80 170,55 C185,36 195,75 215,50
               C230,32 245,68 265,45 C278,30 288,50 300,35"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <p className="logo-intro__text" ref={textRef}>
          MI GROUPS
        </p>
      </div>
    </div>
  );
}
