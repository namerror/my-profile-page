'use client';

import { useEffect, useState } from 'react';
import { LearningRead } from '@/app/page';
import { SkillRead } from '@/app/page';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LearningManager() {
    const [learnings, setLearnings] = useState<LearningRead[]>([]);
    const [skills, setSkills] = useState<SkillRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<LearningRead | null>(null);
    const [showForm, setShowForm] = useState(false);

    // form states
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<number[]>([]);

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }

    async function fetchLearnings() {
        try {
            const res = await fetch(`${API_URL}/learnings/`, { headers: authHeaders });
            if (!res.ok) throw new Error('Failed to fetch learnings');
            const data = await res.json();
            setLearnings(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch learnings');
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
        Promise.all([fetchLearnings(), fetchSkills()]).finally(() => setLoading(false));
    }, [token]);

    function resetForm() {
        setTitle('');
        setUrl(null);
        setDescription('');
        setIsCompleted(false);
        setSelectedSkills([]);
        setEditing(null);
        setShowForm(false);
    }

    function handleEdit(learning: LearningRead) {
        setEditing(learning);
        setTitle(learning.title);
        setUrl(learning.url);
        setDescription(learning.description);
        setIsCompleted(learning.is_completed);
        setSelectedSkills(learning.skills.map(skill => skill.id));
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const payload = {
            title: title,
            url: url,
            description: description,
            is_completed: isCompleted,
            skill_ids: selectedSkills, // send array of skill IDs
        };

        try {
            const urlPath = editing ? `${API_URL}/learnings/${editing.id}/` : `${API_URL}/learnings/`;
            const method = editing ? 'PUT' : 'POST';

            const res = await fetch(urlPath, {
                method: method,
                headers: authHeaders,
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save learning');

            await fetchLearnings();
            resetForm();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save learning');
        }
    }

    async function handleDelete(learningId: number) {
        setError(null);
        if (!confirm('Are you sure you want to delete this learning?')) return;

        try {
            const res = await fetch(`${API_URL}/learnings/${learningId}/`, {
                method: 'DELETE',
                headers: authHeaders,
            });
            if (!res.ok) throw new Error('Failed to delete learning');
            await fetchLearnings();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to delete learning');
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
            <h2 className="text-2xl font-bold">Learnings</h2>
            <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
            {showForm ? 'Cancel' : '+ New Learning'}
            </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        {/* Form */}
        {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">
                {editing ? 'Edit Learning' : 'Create Learning'}
            </h3>

            <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-2 rounded"
                required
                />
            </div>

            <div className="mb-3">
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                type="url"
                value={url || ''}
                onChange={(e) => setUrl(e.target.value || null)}
                className="w-full border p-2 rounded"
                placeholder="https://example.com"
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
            {learnings.length === 0 ? (
            <p className="text-gray-500">No learnings yet.</p>
            ) : (
            learnings.map((learning) => (
                <div key={learning.id} className="p-4 border rounded bg-white">
                <div className="flex justify-between items-start mb-2">
                    <div>
                    <h3 className="text-lg font-semibold">{learning.title}</h3>
                    <p className="text-sm text-gray-600">{learning.description}</p>
                    {learning.url && (
                        <a href={learning.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm hover:underline">
                        {learning.url}
                        </a>
                    )}
                    </div>
                    <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(learning)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(learning.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                        Delete
                    </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <span
                    className={`px-2 py-1 rounded ${
                        learning.is_completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                    >
                    {learning.is_completed ? 'Completed' : 'In Progress'}
                    </span>
                    {learning.skills.length > 0 && (
                    <div className="flex gap-1">
                        {learning.skills.map((skill) => (
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