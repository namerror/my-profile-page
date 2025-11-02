import ProjectCard from "@/app/components/ProjectCard";
import ProjectCarousel from "./components/ProjectCarousel";

export default function HomePage() {
  // Placeholder data for now
  const ongoingProjects = [
    {
      title: "Interactive Resume Builder",
      description:
        "A web app that allows users to generate and customize professional resumes dynamically.",
      status: "Ongoing" as const,
      skills: ["React", "Django", "TypeScript"],
    },
    {
      title: "RWA Tracker",
      description:
        "Tracking and visualizing real-world asset performance across blockchain platforms.",
      status: "Ongoing" as const,
      skills: ["Python", "FastAPI", "DeFi"],
    },
    {
      title: "AI Chat Personalities",
      description:
        "Customizable chatbot with multiple AI personalities built using the OpenAI API.",
      status: "Ongoing" as const,
      skills: ["Next.js", "OpenAI API", "UX Design"],
    },
    {
      title: "Portfolio Website",
      description: "A responsive developer portfolio built with Next.js and Tailwind.",
      status: "Ongoing" as const,
      skills: ["Next.js", "Tailwind", "Vercel"],
    },
  ];

  const completedProjects = [
    {
      title: "Stock Prediction App",
      description:
        "Machine learning project predicting stock prices using Prophet and Streamlit.",
      status: "Completed" as const,
      skills: ["Python", "Machine Learning", "Plotly"],
    },
    {
      title: "FoundU Lost & Found",
      description:
        "React-based lost and found web app for students with real-time updates.",
      status: "Completed" as const,
      skills: ["React", "Firebase", "Tailwind"],
    },
    {
      title: "Task Manager CLI",
      description:
        "A simple Java-based app to manage and track personal tasks.",
      status: "Completed" as const,
      skills: ["Java", "OOP"],
    },
    {
      title: "German Article Trainer",
      description: "A web app to practice 'der, die, das' with spaced repetition.",
      status: "Completed" as const,
      skills: ["Python", "JavaScript", "CSS", "HTML", "Webscraping"],
    },
  ];

  return (
    <main className="p-8 min-h-screen">
      {/* Placeholder for Profile */}
      <section className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome👋</h1>
        <p>Here's an overview of Leon's profile</p>
      </section>

      {/* Project Snapshot Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Projects Snapshot</h2>

        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-3 text-green-700">Ongoing</h3>
          <ProjectCarousel projects={ongoingProjects} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Completed</h3>
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
