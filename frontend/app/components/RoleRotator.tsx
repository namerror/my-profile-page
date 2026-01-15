'use client';

import { useState, useEffect, useMemo } from 'react';
import { CategoryRead, SkillRead } from '../page';
import { div } from 'framer-motion/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ROLES = ['Student', "Developer", "Artist"];

interface RoleRotatorProps {
  skills: SkillRead[];
  categories: CategoryRead[];
}

export default function RoleRotator({ skills, categories }: RoleRotatorProps) {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const skillsByCategory = useMemo(() => {
    const map = new Map<number, SkillRead[]>();
    skills.forEach(skill => {
      if (!skill.category_id) return;
      if (!map.has(skill.category_id)) {
        map.set(skill.category_id, []);
      }
      map.get(skill.category_id)!.push(skill);
    });
    return map;
  }, [skills, categories]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!hovered) {
        setCurrentRoleIndex((prev) => (prev + 1) % ROLES.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [hovered]);
  const currentRole = ROLES[currentRoleIndex];

  return (
    <div className="animate-[fadeIn_2s_ease-in-out_1.8s_both] hidden sm:block min-h-[200px]">
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
          <div className="w-full">
            {categories.map(cat => (
              <div key={cat.id} className='flex items-center gap-2 mb-2'>
                <span className="px-2 py-1 bg-gray-200 rounded text-sm whitespace-nowrap">
                  {cat.name}
                </span>
                <div className="flex flex-wrap gap-2">
                  {(skillsByCategory.get(cat.id) || []).map(skill => (
                    <span
                      key={skill.id}
                      className="px-2 py-1 bg-gray-300 rounded-full text-sm"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
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