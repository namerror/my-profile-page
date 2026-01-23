'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProjectManager from './ProjectManager';
import SkillManager from './SkillManager';
import LearningManager from './LearningManager';
import CategoryManager from './CategoryManager';
import ActivityManager from './ActivityManager';

export default function AdminDashboard() {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'skills' | 'learnings' | 'categories' | 'activities'>('projects');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    setOk(true);
  }, [router]);

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
      </div>



      {/* Tab Content */}
      {activeTab === 'projects' && <ProjectManager />}
      {activeTab === 'skills' && <SkillManager />}
      {activeTab === 'learnings' && <LearningManager />}
      {activeTab === 'categories' && <CategoryManager />}
      {activeTab === 'activities' && <ActivityManager />}
    </main>
  );
}