import ProjectCard from "@/app/components/ProjectCard";
import ProjectCarousel from "./components/ProjectCarousel";

export type SkillFromApi = {
  name: string;
  parent: SkillFromApi | null;
}

export type ProjectFromApi = {
  id: number;
  name: string;
  description: string;
  is_completed: boolean;
  skills: number[]; // currently as skill ID's
}

async function fetchProjects(): Promise<ProjectFromApi[]> {
  const res = await fetch("http://localhost:8000/projects/", {next: { revalidate: 0}, cache:"no-store"});
  if (!res.ok) {
    console.error("Failed to fetch projects")
    return [];
  }
  return (await res.json()) as ProjectFromApi[];
}

export default async function HomePage() {

  const allProjects = await fetchProjects();
  const ongoingProjects = allProjects.filter(p => !p.is_completed);
  const completedProjects = allProjects.filter(p => p.is_completed);

  return (
    <main className="p-8 min-h-screen">
      {/* Placeholder for Profile */}
      <section className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-2">Leon Long</h1>
        <p>Here's an overview of Leon's profile</p>
      </section>

      {/* Project Snapshot Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Projects</h2>

        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-3">Ongoing</h3>
          <ProjectCarousel projects={ongoingProjects} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Completed</h3>
          <ProjectCarousel projects={completedProjects} />
        </div>
      </section>

      {/* Placeholders for other sections */}
      <section className="text-gray-500 italic">
        <p>[Skills Progress Section Placeholder]</p>
        <p>[Readings Section Placeholder]</p>
        <p>[Dashboard Stats Placeholder]</p>
      </section>
    </main>
  );
}
