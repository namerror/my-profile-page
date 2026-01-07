'use client';

import { useEffect, useState } from 'react';
import { ProjectRead } from '@/app/page';
import { SkillRead } from '@/app/page';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ProjectManager() {
    const [projects, setProjects] = useState<ProjectRead[]>([]);
    const [skills, setSkills] = useState<SkillRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<ProjectRead | null>(null);
    const [showForm, setShowForm] = useState(false);

    // form states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
    const [content, setContent] = useState<string | null>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }

    async function fetchProjects() {
        try {
            const res = await fetch(`${API_URL}/projects/`, { headers: authHeaders });
            if (!res.ok) throw new Error('Failed to fetch projects');
            const data = await res.json();
            setProjects(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch projects');
        }
    }

    // Fetch skills and populate skillsMap
    async function fetchSkills() {
        try {
            const res = await fetch(`${API_URL}/skills/`, { headers: authHeaders });
            if (!res.ok) throw new Error('Failed to fetch skills');
            const skillArray = (await res.json()) as SkillRead[];
            setSkills(skillArray);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch skills');
        }
    }

    useEffect(() => {
        if (!token) {
            setError('No authentication token found');
            setLoading(false);
            return;
        }
        Promise.all([fetchProjects(), fetchSkills()]).finally(() => setLoading(false));
    }, [token]);

    function resetForm() {
        setName('');
        setDescription('');
        setIsCompleted(false);
        setSelectedSkills([]);
        setContent(null);
        setEditing(null);
        setShowForm(false);
    }

    function handleEdit(project: ProjectRead) {
        setEditing(project);
        setName(project.name);
        setDescription(project.description);
        setIsCompleted(project.is_completed);
        setContent(project.content);
        setSelectedSkills(project.skills.map(skill => skill.id));
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const payload = {
            name: name,
            description: description,
            is_completed: isCompleted,
            content: content,
            skill_ids: selectedSkills, // send array of skill IDs
        };

        try {
            const url = editing ? `${API_URL}/projects/${editing.id}/` : `${API_URL}/projects/`;
            const method = editing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: authHeaders,
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save project');

            await fetchProjects();
            resetForm();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save project');
        }
    }

    async function handleDelete(projectId: number) {
        setError(null);
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const res = await fetch(`${API_URL}/projects/${projectId}/`, {
                method: 'DELETE',
                headers: authHeaders,
            });
            if (!res.ok) throw new Error('Failed to delete project');
            await fetchProjects();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to delete project');
        }
    }

    function toggleSkill(skill: SkillRead) {
        setSelectedSkills((prev) =>
            prev.includes(skill.id)
                ? prev.filter((id) => id !== skill.id)
                : [...prev, skill.id]
        );
    }
    
    if (loading) return <div>Loading...</div>;

    return (
        <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Projects</h2>
            <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
            {showForm ? 'Cancel' : '+ New Project'}
            </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        {/* Form */}
        {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">
                {editing ? 'Edit Project' : 'Create Project'}
            </h3>

            <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded"
                required
                />
            </div>

            <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-2 rounded"
                rows={3}
                />
            </div>

            <div className="mb-3">
                <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => setIsCompleted(e.target.checked)}
                />
                <span className="text-sm font-medium">Completed</span>
                </label>
            </div>

            <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                value={content || ''}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border p-2 rounded"
                rows={4}
                />
            </div>

            <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Skills</label>
                <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <label key={skill.id} className="flex items-center gap-1 text-sm">
                    <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill.id)}
                        onChange={() => toggleSkill(skill)}
                    />
                    {skill.name} 
                    </label>
                ))}
                </div>
            </div>

            <div className="flex gap-2">
                <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                {editing ? 'Update' : 'Create'}
                </button>
                <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                Cancel
                </button>
            </div>
            </form>
        )}

        {/* List */}
        <div className="space-y-3">
            {projects.length === 0 ? (
            <p className="text-gray-500">No projects yet.</p>
            ) : (
            projects.map((project) => (
                <div key={project.id} className="p-4 border rounded bg-white">
                <div className="flex justify-between items-start mb-2">
                    <div>
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.description}</p>
                    </div>
                    <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(project)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(project.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                        Delete
                    </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <span
                    className={`px-2 py-1 rounded ${
                        project.is_completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                    >
                    {project.is_completed ? 'Completed' : 'Ongoing'}
                    </span>
                    {project.skills.length > 0 && (
                    <div className="flex gap-1">
                        {project.skills.map((skill) => (
                        <span key={skill.id} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {skill.name}
                        </span>
                        ))}
                    </div>
                    )}
                </div>
                </div>
            ))
            )}
        </div>
        </div>
    )

}