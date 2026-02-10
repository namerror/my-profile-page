"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "./ProjectCard";
import { ProjectRead } from "../page"


interface ProjectCarouselProps {
  projects: ProjectRead[];
  autoplayInterval?: number;
}

export default function ProjectCarousel({ projects, autoplayInterval = 5000 }: ProjectCarouselProps) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for next page (to the right)
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1); // mobile
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2); // tablet
      } else {
        setItemsPerPage(3); // desktop
      }
    };

    handleResize(); // Set initial itemsPerPage based on current window size
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const startIdx = page * itemsPerPage;
  const visibleProjects = projects.slice(startIdx, startIdx + itemsPerPage);

  const handleNext = useCallback(() => {
    setDirection(1);
    setPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);
  
  const handlePrev = () => {
    setDirection(0);
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  }

  // Autoplay the slides
  useEffect(() => {
    const timer = setInterval(() => handleNext(), autoplayInterval);
    return () => clearInterval(timer);
  }, [page, autoplayInterval, handleNext])

  return (
    <div className="relative m-1.5">
      {/* Project cards */}
      <div className="overflow-hidden p-2 sm:p-5">
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
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-h-[420px] xs:min-h-[340px] sm:min-h-[315px] lg:min-h-[290px]"
          >
            {visibleProjects.map((project, idx) => (
              <ProjectCard key={idx} {...project} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons - below the cards */}
      <div className="flex justify-center items-center gap-4 mt-2 sm:mt-4 md:mt-6"> 
        <button
          onClick={handlePrev}
          aria-label="Previous page"
          className="text-gray-500 hover:text-black transition bg-white/80 rounded-full p-2 shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </button>

        {/* Pagination dots with active progress bar */}
        <div className="flex justify-center space-x-2 items-center">
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

        <button
          onClick={handleNext}
          aria-label="Next page"
          className="text-gray-500 hover:text-black transition bg-white/80 rounded-full p-2 shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right-icon lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
}
