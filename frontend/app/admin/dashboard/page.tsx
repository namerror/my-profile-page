'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Manager from './Manager';
import UserProfileManager from './UserProfileManager';
import {
  categoryConfig,
  createSkillConfig,
  createProjectConfig,
  createLearningConfig,
  createActivityConfig,
  useSkillsData,
  useCategoriesData,
} from './managerConfigs';

export default function AdminDashboard() {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'skills' | 'learnings' | 'categories' | 'activities' | 'user'>('projects');

  const { skills, fetchSkills } = useSkillsData();
  const { categories, fetchCategories } = useCategoriesData();

  // Memoize configs to prevent unnecessary re-renders
  const projectConfig = useMemo(() => createProjectConfig(skills), [skills]);
  const skillConfig = useMemo(() => createSkillConfig(skills, categories), [skills, categories]);
  const learningConfig = useMemo(() => createLearningConfig(skills), [skills]);
  const activityConfig = useMemo(() => createActivityConfig(skills), [skills]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    setOk(true);
    fetchSkills();
    fetchCategories();
  }, [router, fetchSkills, fetchCategories]);

  if (!ok) return <div className="p-8">Checking authentication...</div>;

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem('admin_token');
            router.push('/admin/login');
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'projects'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'skills'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Skills
        </button>

        <button
          onClick={() => setActiveTab('learnings')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'learnings'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Learnings
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'categories'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Categories
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'activities'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Activities
        </button>

        <button
          onClick={() => setActiveTab('user')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'user'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          User Profile
        </button>
      </div>



      {/* Tab Content */}
      {activeTab === 'projects' && <Manager config={projectConfig} />}
      {activeTab === 'skills' && <Manager config={skillConfig} />}
      {activeTab === 'learnings' && <Manager config={learningConfig} />}
      {activeTab === 'categories' && <Manager config={categoryConfig} />}
      {activeTab === 'activities' && <Manager config={activityConfig} />}
      {activeTab === 'user' && <UserProfileManager />}
    </main>
  );
}