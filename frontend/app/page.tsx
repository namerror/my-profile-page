import ProjectCarousel from "./components/ProjectCarousel";
import RoleRotator from "./components/RoleRotator";
import TiltSection from "./components/TiltSection";
import Link from 'next/link'; // Import Link from next/link
import { FaLinkedin, FaGithub } from "react-icons/fa";
import Image from "next/image";
import ScrollEffect from "./components/ScrollEffect";

interface SkillBase {
  name: string;
  parent_id: number | null;
  category_id: number | null;
}

interface ProjectBase {
  name: string;
  description: string;
  is_completed: boolean;
  content: string | null;
}

interface LearningBase {
  title: string;
  url: string | null;
  description: string;
  is_completed: boolean;
}

interface CategoryBase {
  name: string;
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

export type LearningRead = LearningBase & {
  id: number;
  skills: SkillRead[];
}

export type LearningCreate = LearningBase & {
  skill_ids: number[]; // array of skill IDs
}

export type CategoryRead = CategoryBase & {
  id: number;
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
export async function fetchSkills(): Promise<SkillRead[]> {
  const res = await fetch(`${API_URL}/skills/`, {next: { revalidate: 0}, cache:"no-store"});
  if (!res.ok) {
    console.error("Failed to fetch skills")
    return [];
  }
  const skillsArray = (await res.json()) as SkillRead[];
  return skillsArray;
}

async function fetchLearnings(): Promise<LearningRead[]> {
  const res = await fetch(`${API_URL}/learnings/`, {next: { revalidate: 0}, cache:"no-store"});
  if (!res.ok) {
    console.error("Failed to fetch learnings")
    return [];
  }
  const learningsArray = (await res.json()) as LearningRead[];
  return learningsArray;
}

async function fetchCategories(): Promise<CategoryRead[]> {
  try {
      const res = await fetch(`${API_URL}/categories/`, {next: { revalidate: 0}, cache:"no-store"});
      if (!res.ok) {
        console.error("Failed to fetch categories")
        return [];
      }
      const data = await res.json();
      return data as CategoryRead[];
  } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : 'Failed to fetch categories');
      return [];
  }
}

export default async function HomePage() {

  const allProjects = await fetchProjects();
  const ongoingProjects = allProjects.filter(p => !p.is_completed);
  const completedProjects = allProjects.filter(p => p.is_completed);
  const skills = await fetchSkills();
  const learnings = await fetchLearnings();
  const categories = await fetchCategories();
  return (
    <main className="min-h-screen max-w-7xl mx-auto p-8">
      <div className="flex justify-end">
            <Link href="https://www.linkedin.com/in/leon-long-89a595317/" className="ml-4" target="_blank" rel="noopener noreferrer">
              <FaLinkedin size={24} />
            </Link> 
            <Link href="https://github.com/namerror/" className="ml-4" target="_blank" rel="noopener noreferrer">
              <FaGithub size={24} />
            </Link>
      </div>
      <ScrollEffect>
      {/* Placeholder for Profile */}
      <TiltSection>
        <h1 className="text-4xl md:text-6xl lg:text-9xl font-bold mb-2 animate-[slideInTop_2s_ease-in-out]">Leon Long</h1>
        <p className="mt-3 mb-3 animate-[fadeIn_2s_ease-in-out_0.9s_both]">Welcome to my profile page</p>
        <RoleRotator skills={skills} categories={categories} />
        <div className="lg:hidden md:hidden animate-[fadeIn_2s_ease-in-out_1.8s_both]">Student • Developer • Artist</div>
      </TiltSection>
      {/* Project Snapshot Section */}
      <section className="relative overflow-hidden p-6 bg-white rounded-xl ring-1 ring-gray-300/50 shadow-md">
        <Image 
          src="/white_glass.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/80" />
        <section className="relative z-10">
          <h2 className="text-3xl font-bold mb-8 gradient-gray text-center">Projects</h2>

          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-4 gradient-gray pb-2 text-center">Ongoing</h3>
            <ProjectCarousel projects={ongoingProjects} />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 gradient-gray pb-2 text-center">Completed</h3>
            <ProjectCarousel projects={completedProjects}/>
          </div>
        </section>
      </section>
      {/* Learning Section */}
      <section className="mb-16 bg-[#fafafa] p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learnings.map((learning) => (
            <a
              key={learning.id}
              href={learning.url || '#'}
              target={learning.url ? "_blank" : undefined}
              rel={learning.url ? "noopener noreferrer" : undefined}
              className={`block p-4 bg-[#f2f3f3] hover:bg-[#fafafa] rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                learning.url ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">{learning.title}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    learning.is_completed
                      ? 'bg-white text-black'
                      : 'bg-[#2b2b2a] text-white'
                  }`}
                >
                  {learning.is_completed ? 'Completed' : 'Ongoing'}
                </span>
              </div>
              <p className="text-gray-700 mb-3">{learning.description}</p>
              {learning.skills && learning.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {learning.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      </section>
        

      {/* Placeholders for other sections */}
      <section className="text-gray-500 italic">
        <h2 className="text-2xl font-semibold mb-6">More features coming soon</h2>
      </section>
      </ScrollEffect>
    </main>
  );
}
