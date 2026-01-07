import { ProjectRead } from "@/app/page"
import Link from "next/dist/client/link";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function markdownToHtml(markdown: string): Promise<string> {
    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(rehypeStringify)
        .process(markdown);
    return String(result);
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const res = await fetch(`${API_URL}/projects/${id}/`, { next: { revalidate: 0 }, cache: "no-store" });
    if (!res.ok) {
        return <div className="p-8">Failed to load project.</div>;
    }
    const project = (await res.json()) as ProjectRead;
    const htmlContent = project.content ? await markdownToHtml(project.content) : "<p>No content available.</p>";

    return (
        <main className="max-w-3xl mx-auto p-8">
            <Link href="/" className="inline-flex items-center gap-2 bg-gray-100 hover:bg-white text-gray-700 font-semibold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-4">{project.name}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
                {project.skills.map(skill => (
                    <span
                        key={skill.id}
                        className="text-md bg-blue-50 text-gray-500 px-3 py-1 rounded-md font-semibold transition-transform hover:-translate-y-0.5 cursor-pointer shadow-sm hover:shadow-md"
                    >
                        {skill.name}
                    </span>
                ))}
            </div>
            <div className="mt-6 border border-gray-300 rounded-lg p-4 mb-6">
                <p className="text-gray-600">{project.description}</p>
            </div>
            <article className="prose prose-lg prose-indigo" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </main>
    );
}