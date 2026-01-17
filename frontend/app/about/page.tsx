import { div } from "framer-motion/client";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

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

export default async function AboutPage() {
    const aboutMarkdown = `
# About Me

Welcome to my website! I'm a computer enthusiast currently pursuing my Bachelor's degree in Computer Science at UMass Amherst. 

I started with programming at 11 and I'm still passionate about learning new things in this field. My recent interests include: AI, Blockchain, Game Development, Robotics

I started this website as a reward system to motivate myself to complete my projects and learn new skills. Now I use it to share my profile and connect with like-minded people. I hope you find it interesting.

*Edited Jan 17. 2026*
`;


    const aboutHtml = await markdownToHtml(aboutMarkdown);

    return (
        <main className="max-w-3xl mx-auto p-8">
            <article className="prose prose-lg prose-indigo" dangerouslySetInnerHTML={{ __html: aboutHtml }} />
        </main>
    );
}