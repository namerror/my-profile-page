import Link from "next/link";
import { ProjectRead } from "../page";
import Image from "next/image";

interface ProjectBarProps {
    project: ProjectRead;
}

export default function ProjectBar({ project }: ProjectBarProps) {
    return (
        <Link href={`/projects/${project.id}`}>
            <div className="relative overflow-hidden bg-white rounded-2xl ring-1 ring-gray-300/50 shadow-lg hover:shadow-xl transition p-5 flex flex-col justify-between cursor-pointer h-full min-h-[150px] group mb-4">
                <Image
                    src="/white_glass.webp"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover group-hover:opacity-80 group-hover:scale-110 transition-all duration-500 ease-in-out"                />
                <div className="absolute inset-0 bg-black/85 group-hover:bg-black/70 transition-colors" />

                <div className="relative z-10">
                    <div>
                        <h3 className="text-lg font-bold mb-2 gradient-white">{project.name}</h3>
                        <p className="text-sm mb-3 gradient-white">{project.description}</p>
                    </div>

                    <div className="mt-auto space-y-2">
                        <span
                            className={`text-xs px-3 py-1 rounded-full font-bold ${project.is_completed ? "bg-[#2b2b2a] text-[#fafafa]" : "bg-gray-200 text-[#212121]"}`}
                        >
                            {project.is_completed ? "Completed" : "On-going"}
                        </span>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {project.skills.map((skill, index) => (
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
