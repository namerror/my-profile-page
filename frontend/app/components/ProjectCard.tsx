import React from "react";

interface ProjectCardProps {
  title: string;
  description: string;
  status: "Ongoing" | "Completed";
  skills: string[];
}

export default function ProjectCard({
  title,
  description,
  status,
  skills,
}: ProjectCardProps) {
  const statusColor =
    status === "Ongoing" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";

  return (
    <div className="rounded-2xl shadow hover:shadow-lg transition p-5 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm mb-3 line-clamp-3">{description}</p>
      </div>

      <div className="mt-auto space-y-2">
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor}`}
        >
          {status}
        </span>

        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
