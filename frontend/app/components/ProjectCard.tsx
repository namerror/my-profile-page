import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ProjectRead } from "../page";

export default function ProjectCard({
  id,
  name,
  description,
  is_completed,
  skills,
  image_url,
}: ProjectRead) {
  const statusColor =
    is_completed ? "bg-[#2b2b2a] text-[#fafafa]" : "bg-gray-200 text-[#212121]";

  return (
    <Link href={`/projects/${id}`}>
      <div className="group relative overflow-hidden rounded-2xl shadow hover:shadow-lg transition cursor-pointer h-full min-h-[380px] xs:min-h-[325px] sm:min-h-[325px] lg:min-h-[275px]">

        {/* Background: image layer when image_url is present, solid color otherwise */}
        {image_url ? (
          <>
            <Image
              src={image_url}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Base semi-transparent dark overlay */}
            <div className="absolute inset-0 bg-[#212121]/70 group-hover:bg-[#353535]/70 transition" />
            {/* Gradient overlay: transparent at top-center, solid #212121 at bottom and edges */}
            <div
              className="absolute inset-0 transition"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, #212121cc 60%, #212121 100%), " +
                  "radial-gradient(ellipse at center, transparent 40%, #21212199 100%)",
              }}
            />
          </>
        ) : (
          /* No image: plain solid background matching original style */
          <div className="absolute inset-0 bg-[#212121] group-hover:bg-[#353535] transition" />
        )}

        {/* Card content — sits above all background layers */}
        <div className="relative z-10 p-5 flex flex-col justify-between h-full min-h-[380px] xs:min-h-[325px] sm:min-h-[325px] lg:min-h-[275px]">
          <div>
            <h3 className="text-lg font-bold mb-2 text-[#fafafa]">{name}</h3>
            <p className="text-sm mb-3 line-clamp-7 text-[#fafafa] sm:line-clamp-5">{description}</p>
          </div>

          <div className="mt-auto space-y-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold ${statusColor}`}
            >
              {is_completed ? "Completed" : "On-going"}
            </span>

            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="text-xs bg-[#393939] text-[#fafafa] px-2 py-1 rounded-full"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
