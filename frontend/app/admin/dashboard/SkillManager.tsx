'use client';

import { useEffect, useMemo, useState } from 'react';
import { SkillRead } from '@/app/page';

const API_URL = 'http://localhost:8000';

export default function SkillManager() {
    const [skills, setSkills] = useState<SkillRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<SkillRead | null>(null);
    const [showForm, setShowForm] = useState(false);

    const skillsMap = useMemo(() => {
        const map = new Map<number, SkillRead>();
        skills.forEach(skill => map.set(skill.id, skill));
        return map;
    }, [skills]);

    // form states
    const [name, setName] = useState('');
    const [parent, setParent] = useState<number | null>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }

    async function fetchSkills() {
        try {
            const res = await fetch(`${API_URL}/skills/`, { headers: authHeaders });
            if (!res.ok) throw new Error('Failed to fetch skills');
            const skillArray = (await res.json()) as SkillRead[];
            setSkills(skillArray);
        } catch (err: any) {
            setError(err.message);
        }
    }

    useEffect(() => {
        fetchSkills().finally(() => setLoading(false));
    }, []);

    function resetForm() {
        setName('');
        setParent(null);
        setEditing(null);
        setShowForm(false);
    }

    function handleEdit(skill: SkillRead) {
        setEditing(skill);
        setName(skill.name);
        setParent(skill.parent_id ?? null);
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = {
            name: name,
            parent_id: parent
        };

        try {
            const url = editing ? `${API_URL}/skills/${editing.id}/` : `${API_URL}/skills/`;
            const method = editing ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method: method,
                headers: authHeaders,
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save skill');
            await fetchSkills();
            resetForm();
        } catch (err: any) {
            setError(err.message);
        }
    }

    async function handleDelete(skillId: number) {
        if (!confirm('Are you sure you want to delete this skill?')) return;

        try {
            const res = await fetch(`${API_URL}/skills/${skillId}/`, {
                method: 'DELETE',
                headers: authHeaders,
            });

            if (!res.ok) throw new Error('Failed to delete skill');
            await fetchSkills();
        } catch (err: any) {
            setError(err.message);
        }
    }

    function chooseParent(skillId: number) {
        if (parent === skillId) {
            setParent(null);
        } else {
            setParent(skillId);
        }

    }

    if (loading) return <div>Loading...</div>;

    return (
        <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Skills</h2>
            <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
            {showForm ? 'Cancel' : '+ New Skill'}
            </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        {/* Form */}
        {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">
                {editing ? 'Edit Skill' : 'Create Skill'}
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
                <label className="block text-sm font-medium mb-1">Parent</label>
                <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <label key={skill.id} className="flex items-center gap-1 text-sm">
                    <input
                        type="radio"
                        checked={parent === skill.id}
                        onChange={() => chooseParent(skill.id)}
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
            {skills.length === 0 ? (
            <p className="text-gray-500">No skills yet.</p>
            ) : (
            skills.map((skill) => (
                <div key={skill.id} className="p-4 border rounded bg-white">
                <div className="flex justify-between items-start mb-2">
                    <div>
                    <h3 className="text-lg font-semibold">{skill.name}</h3>
                    </div>
                    <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(skill)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(skill.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                        Delete
                    </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    {skill.parent_id ? (
                    <span className="px-2 py-1 bg-gray-200 rounded">
                        Parent: {skillsMap.get(skill.parent_id)?.name || 'Unknown'}
                    </span>
                    ) : (
                    <span className="px-2 py-1 bg-gray-200 rounded">No Parent</span>
                    )}
                </div>
                </div>
            ))
            )}
        </div>
        </div>
    )
}