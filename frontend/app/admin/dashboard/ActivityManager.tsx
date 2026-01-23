'use client';

import { useEffect, useState } from 'react';
import { SkillRead } from '@/app/page';
import { ActivityRead } from '@/app/page';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ActivityManager() {
    const [activities, setActivities] = useState<ActivityRead[]>([]);
    const [skills, setSkills] = useState<SkillRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<ActivityRead | null>(null);
    const [showForm, setShowForm] = useState(false);

    // form states
    const [title, setTitle] = useState('');
    const [type, setType] = useState('');
    const [organization, setOrganization] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCurrent, setIsCurrent] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<number[]>([]);

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }

    async function fetchActivities() {
        try {
            const res = await fetch(`${API_URL}/activities/`, { headers: authHeaders });
            if (!res.ok) throw new Error('Failed to fetch activities');
            const data = await res.json();
            setActivities(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch activities');
        }
    }

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
        Promise.all([fetchActivities(), fetchSkills()]).finally(() => setLoading(false));
    }, [token]);

    function resetForm() {
        setTitle('');
        setType('');
        setOrganization('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setIsCurrent(false);
        setSelectedSkills([]);
        setEditing(null);
        setShowForm(false);
    }

    function handleEdit(activity: ActivityRead) {
        setEditing(activity);
        setTitle(activity.title);
        setType(activity.type);
        setOrganization(activity.organization || '');
        setDescription(activity.description || '');
        setStartDate(activity.start_date || '');
        setEndDate(activity.end_date || '');
        setIsCurrent(activity.is_current);
        setSelectedSkills(activity.skills.map(skill => skill.id));
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const payload = {
            title: title,
            type: type,
            organization: organization || null,
            description: description || null,
            start_date: startDate || null,
            end_date: endDate || null,
            is_current: isCurrent,
            skill_ids: selectedSkills,
        };

        try {
            const url = editing ? `${API_URL}/activities/${editing.id}/` : `${API_URL}/activities/`;
            const method = editing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: authHeaders,
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save activity');

            await fetchActivities();
            resetForm();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save activity');
        }
    }

    async function handleDelete(activityId: number) {
        setError(null);
        if (!confirm('Are you sure you want to delete this activity?')) return;

        try {
            const res = await fetch(`${API_URL}/activities/${activityId}/`, {
                method: 'DELETE',
                headers: authHeaders,
            });
            if (!res.ok) throw new Error('Failed to delete activity');
            await fetchActivities();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to delete activity');
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
                <h2 className="text-2xl font-bold">Activities</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : '+ New Activity'}
                </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-gray-50">
                    <h3 className="text-lg font-semibold mb-3">
                        {editing ? 'Edit Activity' : 'Create Activity'}
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
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <input
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Organization</label>
                        <input
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            className="w-full border p-2 rounded"
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

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full border p-2 rounded"
                                disabled={isCurrent}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={isCurrent}
                                onChange={(e) => {
                                    setIsCurrent(e.target.checked);
                                    if (e.target.checked) setEndDate('');
                                }}
                            />
                            <span className="text-sm font-medium">Currently Active</span>
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
                {activities.length === 0 ? (
                    <p className="text-gray-500">No activities yet.</p>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="p-4 border rounded bg-white">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-semibold">{activity.title}</h3>
                                    <p className="text-sm text-gray-600">{activity.organization}</p>
                                    {activity.description && (
                                        <p className="text-sm text-gray-700 mt-1">{activity.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(activity)}
                                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(activity.id)}
                                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                                    activity.type === 'job' ? 'bg-purple-100 text-purple-700' :
                                    activity.type === 'volunteer' ? 'bg-blue-100 text-blue-700' :
                                    activity.type === 'internship' ? 'bg-orange-100 text-orange-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {activity.type}
                                </span>
                                {activity.is_current && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                        Current
                                    </span>
                                )}
                            </div>

                            {(activity.start_date || activity.end_date) && (
                                <p className="text-xs text-gray-500 mb-2">
                                    {activity.start_date && `From: ${activity.start_date}`}
                                    {activity.start_date && activity.end_date && ' — '}
                                    {activity.end_date && `To: ${activity.end_date}`}
                                </p>
                            )}

                            {activity.skills.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                    {activity.skills.map((skill) => (
                                        <span key={skill.id} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
