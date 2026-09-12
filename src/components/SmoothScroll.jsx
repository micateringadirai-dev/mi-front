import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Wraps the public app in silky inertia/smooth scrolling and keeps GSAP's
// ScrollTrigger perfectly in sync with it. Also smoothly handles route
// changes and in-page anchor links (e.g. #businesses, #quotation).
export default function SmoothScroll({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const lenisRef = useRef(null);

  useEffect(() => {
    if (isAdmin) return;

    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;
    window.__lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Smoothly intercept in-page anchor clicks (e.g. #businesses, #quotation)
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (!target) return;
      const hash = target.getAttribute('href');
      if (!hash || hash === '#') return;

      const targetEl = document.querySelector(hash);
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl, {
          offset: -75,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
      gsap.ticker.remove(tickerCallback);
      lenisRef.current = null;
      window.__lenis = null;
    };
  }, [isAdmin]);

  // Smooth scroll to top on route navigation
  useEffect(() => {
    if (lenisRef.current && !location.hash) {
      lenisRef.current.scrollTo(0, { immediate: false, duration: 0.75 });
    }
  }, [location.pathname]);

  return children;
}
