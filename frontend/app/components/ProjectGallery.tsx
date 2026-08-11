'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import type { ProjectGalleryImageRead } from '@/app/page';

interface ProjectGalleryProps {
  images: ProjectGalleryImageRead[];
}

export default function ProjectGallery({ images }: ProjectGalleryProps) {
  const orderedImages = useMemo(
    () => [...images].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    [images]
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : orderedImages[activeIndex];
  const activePhotoNumber = activeIndex === null ? 0 : activeIndex + 1;
  const hasMultipleImages = orderedImages.length > 1;

  const showPrevious = useCallback(() => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) return currentIndex;
      return (currentIndex - 1 + orderedImages.length) % orderedImages.length;
    });
  }, [orderedImages.length]);

  const showNext = useCallback(() => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) return currentIndex;
      return (currentIndex + 1) % orderedImages.length;
    });
  }, [orderedImages.length]);

  useEffect(() => {
    if (activeIndex !== null && activeIndex >= orderedImages.length) {
      setActiveIndex(null);
    }
  }, [activeIndex, orderedImages.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveIndex(null);
      }
      if (event.key === 'ArrowLeft' && hasMultipleImages) {
        showPrevious();
      }
      if (event.key === 'ArrowRight' && hasMultipleImages) {
        showNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, hasMultipleImages, showNext, showPrevious]);

  if (orderedImages.length === 0) {
    return null;
  }

  return (
    <section className="my-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold text-[#131313]">Project photos</h2>
        <span className="text-sm font-medium text-gray-500">
          {orderedImages.length} {orderedImages.length === 1 ? 'photo' : 'photos'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {orderedImages.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            aria-label={`Open project photo ${index + 1}`}
          >
            <Image
              src={image.image_url}
              alt={image.description || `Project photo ${index + 1}`}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
          </button>
        ))}
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-[#131313]/95 px-4 py-4 text-white md:px-8"
          role="dialog"
          aria-modal="true"
          aria-label="Project photo viewer"
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close photo viewer"
            title="Close"
          >
            <FaTimes aria-hidden="true" />
          </button>

          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white md:left-6"
                aria-label="Previous photo"
                title="Previous"
              >
                <FaChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white md:right-6"
                aria-label="Next photo"
                title="Next"
              >
                <FaChevronRight aria-hidden="true" />
              </button>
            </>
          )}

          <div className="mx-auto flex h-full max-w-6xl flex-col">
            <div className="relative min-h-0 flex-1">
              <Image
                src={activeImage.image_url}
                alt={activeImage.description || `Project photo ${activePhotoNumber}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            <div className="mx-auto w-full max-w-3xl pt-4">
              {activeImage.description && (
                <p className="text-center text-sm leading-6 text-white/85 md:text-base">
                  {activeImage.description}
                </p>
              )}

              {hasMultipleImages && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {orderedImages.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border transition focus:outline-none focus:ring-2 focus:ring-white ${
                        activeIndex === index
                          ? 'border-white opacity-100'
                          : 'border-white/20 opacity-55 hover:opacity-90'
                      }`}
                      aria-label={`Open project photo ${index + 1}`}
                    >
                      <Image
                        src={image.image_url}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
