'use client';

import React from 'react';
import { useEffect, useRef } from 'react';

export default function ScrollEffect({ children }: { children: React.ReactNode }) {
  const profileRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!profileRef.current || !projectRef.current) return;

      const scrollY = window.scrollY;
      const profileHeight = profileRef.current.offsetHeight;
      const scrollProgress = Math.min(scrollY / profileHeight, 1);

      // Zoom out effect on profile (scale from 1 to 0.8)
      const scale = 1 - scrollProgress * 0.5;
      profileRef.current.style.transform = `scale(${scale})`;
      profileRef.current.style.opacity = `${1 - scrollProgress * 1}`; // Fade out profile

      // Move project section up to cover profile
      const translateY = -scrollProgress * 120;
      projectRef.current.style.transform = `translateY(${translateY}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div ref={profileRef} className="sticky top-0 z-10 origin-center"
        style={{ height: 'fit-content' }}>
        {React.Children.toArray(children)[0] as React.ReactNode}
      </div>
      <section ref={projectRef} className="relative z-20">
        {React.Children.toArray(children)[1] as React.ReactNode}
      </section>
      <div className="relative z-30">
        {React.Children.toArray(children).slice(2)}
      </div>
    </>
  );
}