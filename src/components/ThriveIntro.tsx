import { useEffect, useRef, useState } from 'react';

interface ThriveIntroProps {
  onComplete: () => void;
}

export function ThriveIntro({ onComplete }: ThriveIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [gsapLoaded, setGsapLoaded] = useState(false);

  // Load GSAP from CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js';
    script.async = true;
    script.onload = () => setGsapLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Run animation once GSAP is loaded
  useEffect(() => {
    if (!gsapLoaded || !containerRef.current) return;

    // @ts-expect-error - GSAP loaded from CDN
    const gsap = window.gsap;
    if (!gsap) return;

    const container = containerRef.current;
    const loadingLetters = container.querySelectorAll('.thrive__letter');
    const revealBox = container.querySelector('.thrive-reveal__box');
    const headingStart = container.querySelector('.thrive__h1-start');
    const headingEnd = container.querySelector('.thrive__h1-end');
    const overlay = container.querySelector('.thrive-overlay');

    const tl = gsap.timeline({
      defaults: { ease: 'expo.inOut' },
      onComplete: () => {
        setTimeout(() => {
          setIsHidden(true);
          onComplete();
        }, 100);
      }
    });

    // Letters slide up from below
    tl.from(loadingLetters, {
      yPercent: 100,
      stagger: 0.03,
      duration: 1.2
    });

    // Reveal box expands horizontally and vertically
    tl.fromTo(revealBox, 
      { width: '0em', height: '0.8em' }, 
      { width: '1.2em', height: '0.85em', duration: 1.2 }, 
      '-=0.2'
    );

    // Letters spread apart slightly
    tl.fromTo(headingStart, 
      { x: '0em' }, 
      { x: '-0.08em', duration: 1.2 }, 
      '<'
    );
    tl.fromTo(headingEnd, 
      { x: '0em' }, 
      { x: '0.08em', duration: 1.2 }, 
      '<'
    );

    // Pause to let user see the peek
    tl.to({}, { duration: 0.8 });

    // Expand reveal box to fullscreen (both directions)
    tl.to(revealBox, { 
      width: '100vw', 
      height: '100vh', 
      duration: 1.8,
      ease: 'expo.inOut'
    });

    // Fade out letters as box expands
    tl.to(loadingLetters, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '<');

    // Fade out the overlay background
    tl.to(overlay, { 
      opacity: 0, 
      duration: 0.8, 
      ease: 'power2.inOut' 
    }, '-=0.6');

  }, [gsapLoaded, onComplete]);

  if (isHidden) return null;

  return (
    <section
      ref={containerRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
    >
      {/* Solid overlay that covers the site */}
      <div className="thrive-overlay absolute inset-0 bg-[#f4f4f4]" />
      
      {/* Centered text with reveal box */}
      <div className="absolute inset-0 flex items-center justify-center text-[#201d1d] z-10">
        <div className="thrive__h1 whitespace-nowrap flex justify-center items-center text-[4rem] sm:text-[7rem] md:text-[9rem] lg:text-[12rem] font-medium leading-none relative">
          
          {/* THR */}
          <div className="thrive__h1-start flex justify-end overflow-hidden relative z-20">
            <span className="thrive__letter block">T</span>
            <span className="thrive__letter block">h</span>
            <span className="thrive__letter block">r</span>
          </div>

          {/* Reveal Box - this is a "window" that shows through to the site behind */}
          <div 
            className="thrive-reveal__box relative z-10 overflow-hidden"
            style={{ 
              width: 0, 
              height: '0.8em',
              /* This creates the "window" effect - clips to show content behind */
              clipPath: 'inset(0)'
            }}
          >
            {/* This is transparent - the actual site shows through */}
            <div className="w-full h-full" />
          </div>

          {/* IVE */}
          <div className="thrive__h1-end flex justify-start overflow-hidden relative z-20">
            <span className="thrive__letter block">i</span>
            <span className="thrive__letter block">v</span>
            <span className="thrive__letter block">e</span>
          </div>
        </div>
      </div>
    </section>
  );
}