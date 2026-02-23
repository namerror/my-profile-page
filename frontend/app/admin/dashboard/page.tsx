'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Manager from './Manager';
import {
  categoryConfig,
  createSkillConfig,
  createProjectConfig,
  createLearningConfig,
  createActivityConfig,
  userConfig,
  useSkillsData,
  useCategoriesData,
} from './managerConfigs';

export default function AdminDashboard() {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'skills' | 'learnings' | 'categories' | 'activities' | 'user'>('projects');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const navItems = [
    { id: 'projects' as const, label: 'Projects' },
    { id: 'skills' as const, label: 'Skills' },
    { id: 'learnings' as const, label: 'Learnings' },
    { id: 'categories' as const, label: 'Categories' },
    { id: 'activities' as const, label: 'Activities' },
    { id: 'user' as const, label: 'User Profile' },
  ];

  const activeLabel = navItems.find((item) => item.id === activeTab)?.label ?? 'Dashboard';

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm"
        >
          Menu
        </button>
        <div className="text-sm font-semibold text-slate-800">{activeLabel}</div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
        >
          Logout
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</p>
                <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
              >
                Close
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-3 py-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <aside className="hidden md:fixed md:left-0 md:top-16 md:z-20 md:flex md:h-[calc(100vh-4rem)] md:w-64 md:flex-col md:border-r md:border-slate-200 md:bg-white">
        <div className="border-b border-slate-200 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</p>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-200 px-6 py-5">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="w-full min-w-0 px-4 pb-10 pt-6 md:ml-64 md:w-[calc(100%-16rem)] md:max-w-[calc(100%-16rem)] md:px-10">
        <div className="mb-6 hidden min-w-0 items-center justify-between md:flex">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</p>
            <h2 className="text-3xl font-semibold text-slate-900">{activeLabel}</h2>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-100"
          >
            Logout
          </button>
        </div>

        {activeTab === 'projects' && <Manager config={projectConfig} />}
        {activeTab === 'skills' && <Manager config={skillConfig} />}
        {activeTab === 'learnings' && <Manager config={learningConfig} />}
        {activeTab === 'categories' && <Manager config={categoryConfig} />}
        {activeTab === 'activities' && <Manager config={activityConfig} />}
        {activeTab === 'user' && <Manager config={userConfig} />}
      </div>
    </main>
  );
}
