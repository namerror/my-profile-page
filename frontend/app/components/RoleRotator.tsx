'use client';

import { useState, useEffect } from 'react';

const ROLES = [
  { title: 'Student', content: 'Continuously learning new technologies and concepts' },
  { title: 'Developer', content: 'Building projects and solving problems with code' },
  { title: 'Artist', content: 'Creating visual experiences and creative designs' }
];

export default function RoleRotator() {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentRole = ROLES[currentRoleIndex];

  return (
    <div className="animate-[fadeIn_2s_ease-in-out_1.8s_both]">
      {/* Rotating Box */}
        <div className='text-center mt-4'>
        {ROLES.map((role, index) => (
            <div key={role.title} className='inline'>
            <span
            className={`px-2 py-1 rounded border text-lg md:text-xl lg:text-2xl transition-all duration-500 ${
                index === currentRoleIndex
                ? 'border-black'
                : 'border-transparent'
            }`}
            >
            {role.title}
            </span>
            {index < ROLES.length - 1 && <span> • </span>}
            </div>
        ))}
        </div>
      {/* Content Tab */}
      <div className="mt-4 px-4 py-3 bg-gray-100 rounded-lg border-l-4 border-black min-h-[60px] flex items-center transition-all duration-500">
        <p className="text-gray-700 italic">{currentRole.content}</p>
      </div>
    </div>
  );
}