import ProjectCarousel from "./components/ProjectCarousel";

interface SkillBase {
  name: string;
  parent_id: number | null;
}

interface ProjectBase {
  name: string;
  description: string;
  is_completed: boolean;
  content: string | null;
}

export type SkillRead = SkillBase & {
  id: number;
}

export type SkillCreate = SkillBase

export type ProjectRead = ProjectBase & {
  id: number;
  skills: SkillRead[];
}

export type ProjectCreate = ProjectBase & {
  skills: number[]; // array of skill IDs
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchProjects(): Promise<ProjectRead[]> {
  const res = await fetch(`${API_URL}/projects/`, {next: { revalidate: 0}, cache:"no-store"});
  if (!res.ok) {
    console.error("Failed to fetch projects")
    return [];
  }
  return (await res.json()) as ProjectRead[];
}

// returns an array of skills
async function fetchSkills(): Promise<SkillRead[]> {
  const res = await fetch(`${API_URL}/skills/`, {next: { revalidate: 0}, cache:"no-store"});
  if (!res.ok) {
    console.error("Failed to fetch skills")
    return [];
  }
  const skillsArray = (await res.json()) as SkillRead[];
  return skillsArray;
}

export default async function HomePage() {

  const allProjects = await fetchProjects();
  const ongoingProjects = allProjects.filter(p => !p.is_completed);
  const completedProjects = allProjects.filter(p => p.is_completed);
  const skills = await fetchSkills();

  return (
    <main className="p-8 min-h-screen">
      {/* Placeholder for Profile */}
      <section className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-2">Leon Long</h1>
        <p>Here&apos;s an overview of Leon&apos;s profile</p>
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
          <ProjectCarousel projects={completedProjects}/>
        </div>
      </section>

      {/* Placeholders for other sections */}
      <section className="text-gray-500 italic">
        <h2 className="text-2xl font-semibold mb-6">More features coming soon</h2>
        <p>[Skills Progress Section Placeholder]</p>
        <p>[Readings Section Placeholder]</p>
        <p>[Dashboard Stats Placeholder]</p>
      </section>
    </main>
  );
}
