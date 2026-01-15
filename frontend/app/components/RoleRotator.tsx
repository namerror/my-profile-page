'use client';

import { useState, useEffect } from 'react';
import { SkillRead } from '../page';

const ROLES = ['Student', "Developer", "Artist"];

interface RoleRotatorProps {
  skills: SkillRead[];
}

export default function RoleRotator({ skills }: RoleRotatorProps) {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!hovered) {
        setCurrentRoleIndex((prev) => (prev + 1) % ROLES.length);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [hovered]);
  const currentRole = ROLES[currentRoleIndex];

  return (
    <div className="animate-[fadeIn_2s_ease-in-out_1.8s_both] hidden sm:block">
      {/* Rotating Box */}
        <div className='text-center mt-4 cursor-default select-none' onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        {ROLES.map((role, index) => (
            <div key={role} className='inline' onMouseEnter={() => setCurrentRoleIndex(index)}>
            <span
            className={`px-2 py-1 rounded border text-lg md:text-xl lg:text-2xl transition-all duration-500 ${
                index === currentRoleIndex
                ? 'border-black'
                : 'border-transparent'
            }`}
            >
            {role}
            </span>
            {index < ROLES.length - 1 && <span> • </span>}
            </div>
        ))}
        </div>
      {/* Content Tab */}
      <div className="mt-4 px-4 py-3 bg-gray-100 rounded-lg border-l-4 border-black min-h-[60px] flex items-center transition-all duration-500 select-none"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      >
        {currentRole === 'Student' && (
          <p className="text-center text-gray-800">
            BSc Computer Science - University of Massachusetts Amherst (2024 - 2028)
          </p>
        )}

        {currentRole === 'Developer' && (
          <p className="text-center text-gray-800">
            {skills.map(skill => skill.name).join(', ')}
          </p>
        )}

        {currentRole === 'Artist' && (
          <p className="text-center text-gray-800">
            Amateur Filmmaker, 3D/VFX Artist, Game Developer
          </p>
        )}
      </div>
    </div>
  );
}