"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "./ProjectCard";


interface Project {
  title: string;
  description: string;
  status: "Ongoing" | "Completed";
  skills: string[];
}

interface ProjectCarouselProps {
  projects: Project[];
  itemsPerPage?: number;
}

export default function ProjectCarousel({ projects, itemsPerPage = 3 }: ProjectCarouselProps) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const startIdx = page * itemsPerPage;
  const visibleProjects = projects.slice(startIdx, startIdx + itemsPerPage);

  const handleNext = () => setPage((prev) => (prev + 1) % totalPages);
  const handlePrev = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);

  return (
    <div className="relative m-1.5">
      {/* Project cards */}
      <div className="overflow-hidden p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visibleProjects.map((project, idx) => (
              <ProjectCard key={idx} {...project} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Navigation buttons - overlayed next to the cards */}
      <button
        onClick={handlePrev}
        aria-label="Previous page"
        className="absolute left-3 top-1/2 -translate-y-1/2 -translate-x-full z-10 text-gray-500 hover:text-black transition bg-white/80 rounded-full p-2 shadow"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
      </button>

      <button
        onClick={handleNext}
        aria-label="Next page"
        className="absolute right-3 top-1/2 -translate-y-1/2 translate-x-full z-10 text-gray-500 hover:text-black transition bg-white/80 rounded-full p-2 shadow"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right-icon lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </button>

      {/* Pagination dots */}
      <div className="flex justify-center mt-3 space-x-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`h-2 w-2 rounded-full ${
              i === page ? "bg-indigo-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
