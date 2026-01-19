"use client";

import { ProjectRead } from "../page";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectBar from "../components/ProjectBar";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRead[]>([]);
  const [activeTab, setActiveTab] = useState<"ongoing" | "completed">("ongoing");
  const [direction, setDirection] = useState(1); // 1 for left swipe, -1 for right swipe

  async function fetchProjects() {
    const res = await fetch(`${API_URL}/projects`, { next: { revalidate: 0 }, cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as ProjectRead[];
      setProjects(data);
    } else {
      console.error("Failed to fetch projects");
    }
  }
  
  useEffect(() => {
    fetchProjects();
  }, []);

  const ongoingProjects = projects.filter(p => !p.is_completed);
  const completedProjects = projects.filter(p => p.is_completed);

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x) * velocity.x;

    if (swipe < -1000) {
      // swiped left
      setDirection(1);
      setActiveTab(activeTab === "ongoing" ? "completed" : "ongoing");
    }
    if (swipe > 1000) {
      // swiped right
      setDirection(-1);
      setActiveTab(activeTab === "ongoing" ? "completed" : "ongoing");
    }
  };

  const TabContent = ({ projects }: { projects: ProjectRead[] }) => (
    <div className="space-y-3">
      {projects.map(project => (
        <ProjectBar key={project.id} project={project} />
      ))}
    </div>
  );

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-12 text-center border-b-2 border-[#212121] pb-2">Projects</h1>
      
      {/* Desktop: Two Column Layout */}
      <div className="hidden lg:grid grid-cols-2 gap-8">
        {/* Ongoing Projects */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ongoing</h2>
          <TabContent projects={ongoingProjects} />
        </div>

        {/* Completed Projects */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Completed</h2>
          <TabContent projects={completedProjects} />
        </div>
      </div>

      {/* Mobile: Tab Layout */}
      <div className="lg:hidden">
        {/* Tab Switch */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setDirection(1);
              setActiveTab("ongoing");
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
              activeTab === "ongoing"
                ? "bg-[#212121] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => {
              setDirection(1);
              setActiveTab("completed");
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
              activeTab === "completed"
                ? "bg-[#212121] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Swipeable Tab Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: dir === 1 ? 100 : -100, // enter from right if swiped left, from left if swiped right
                opacity: 0,
              }),
              center: {
                x: 0,
                opacity: 1,
              },
              exit: (dir: number) => ({
                x: dir === 1 ? -100 : 100, // exit to left if swiped left, to right if swiped right
                opacity: 0,
              })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={handleDragEnd}
          >
            {activeTab === "ongoing" ? (
              <TabContent projects={ongoingProjects} />
            ) : (
              <TabContent projects={completedProjects} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
