"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "./ProjectCard";
import {ProjectRead, SkillRead} from "../page"


interface ProjectCarouselProps {
  projects: ProjectRead[];
  itemsPerPage?: number;
  autoplayInterval?: number;
}

export default function ProjectCarousel({ projects, itemsPerPage = 3, autoplayInterval = 5000 }: ProjectCarouselProps) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for next page (to the right)

  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const startIdx = page * itemsPerPage;
  const visibleProjects = projects.slice(startIdx, startIdx + itemsPerPage);

  const handleNext = () => {
    setDirection(1);
    setPage((prev) => (prev + 1) % totalPages);
  }
  const handlePrev = () => {
    setDirection(0);
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  }

  // Autoplay the slides
  useEffect(() => {
    const timer = setInterval(() => handleNext(), autoplayInterval);
    return () => clearInterval(timer);
  }, [page, autoplayInterval])

  return (
    <div className="relative m-1.5">
      {/* Project cards */}
      <div className="overflow-hidden p-5">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            // swiping left and right have different animations
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: dir === 1 ? 100 : -100, // enter from the right if next, vice versa
                opacity: 0,
              }),
              center: {
                x: 0,
                opacity: 1,
              },
              exit: (dir: number) => ({
                x: dir === 1 ? -100 : 100, // move to the left if next, vice versa
                opacity: 0,
              })
            }}

            // drag/swipe motion
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;

              if (swipe < -1000) handleNext();   // swiped left
              if (swipe > 1000) handlePrev();    // swiped right
            }}

            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
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

      {/* Pagination dots with active progress bar */}
      <div className="flex justify-center mt-3 space-x-2 items-center">
        {Array.from({ length: totalPages }).map((_, i) => {
          const isActive = i === page;

          return (
            <button
              key={i}
              onClick={() => setPage(i)}
              className="relative h-2 w-2 flex items-center justify-center"
            >
              {/* Inactive dot */}
              {!isActive && (
                <div className="h-2 w-2 rounded-full bg-gray-300" />
              )}

              {/* Active progress bar */}
              {isActive && (
                <div className="h-2 w-6 rounded-full bg-gray-300 overflow-hidden">
                  <motion.div
                    key={page}  // restart animation every page change
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: autoplayInterval / 1000, ease: "linear" }}
                    className="h-full bg-gray-950"
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
