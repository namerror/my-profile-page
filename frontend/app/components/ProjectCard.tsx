import React from "react";
import Link from "next/link";
import { ProjectRead } from "../page";

export default function ProjectCard({
  id,
  name,
  description,
  is_completed,
  skills,
}: ProjectRead) {
  const statusColor =
    is_completed ? "bg-[#2b2b2a] text-[#fafafa]" : "bg-gray-200 text-[#212121]";

  return (
    <Link href={`/projects/${id}`}>
      <div className="bg-[#212121] hover:bg-[#353535] rounded-2xl shadow hover:shadow-lg transition p-5 flex flex-col justify-between cursor-pointer h-full min-h-[380px] xs:min-h-[300px] sm:min-h-[275px] lg:min-h-[250px]">
        <div>
          <h3 className="text-lg font-bold mb-2 gradient-white">{name}</h3>
          <p className="text-sm mb-3 line-clamp-7 gradient-white sm:line-clamp-5">{description}</p>
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
    </Link>
  );
}
