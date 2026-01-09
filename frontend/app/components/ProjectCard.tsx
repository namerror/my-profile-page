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
    is_completed ? "bg-white text-black" : "bg-[#2b2b2a] text-white";

  return (
    <Link href={`/projects/${id}`}>
      <div className="bg-[#fafafa] hover:bg-white rounded-2xl shadow hover:shadow-lg transition p-5 flex flex-col justify-between cursor-pointer h-full">
        <div>
          <h3 className="text-lg font-bold mb-2">{name}</h3>
          <p className="text-sm mb-3 line-clamp-3">{description}</p>
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
                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
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
