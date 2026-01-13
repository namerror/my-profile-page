'use client';

import { useRef, MouseEvent, useState, useEffect } from 'react';

export default function TiltSection({ children }: { children: React.ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  useEffect(() => {
    // Check if device is desktop (not touch-enabled)
    const isTouchDevice = () => {
      return (
        (typeof window !== 'undefined' &&
          ('ontouchstart' in window ||
            (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)))
      );
    };
    
    setIsDesktop(!isTouchDevice());
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;

    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5; // Max 7deg tilt
    const rotateY = ((x - centerX) / centerX) * 5;

    sectionRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!sectionRef.current) return;
    sectionRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  };

  return (
    <section
      ref={sectionRef}
      className="px-12 py-16 text-center transition-transform duration-200 ease-out"
      onMouseMove={isDesktop ? handleMouseMove : undefined}
      onMouseLeave={isDesktop ? handleMouseLeave : undefined}
      style={{ transformStyle: 'preserve-3d' }}
    >
        {children}
    </section>
  );
}