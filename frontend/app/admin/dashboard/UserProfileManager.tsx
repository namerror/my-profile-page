'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { UserRead } from '@/app/page';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UserFormState {
    name: string;
    email: string;
    phoneNumber: string;
    linkedinUrl: string;
    githubUrl: string;
    personalWebsite: string;
    description: string;
}

export default function UserProfileManager() {
    const [user, setUser] = useState<UserRead | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [formState, setFormState] = useState<UserFormState>({
        name: '',
        email: '',
        phoneNumber: '',
        linkedinUrl: '',
        githubUrl: '',
        personalWebsite: '',
        description: '',
    });

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    const authHeaders = useMemo(() => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }), [token]);

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/user/`, { headers: authHeaders });
            if (res.status === 404) {
                // User doesn't exist yet
                setUser(null);
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch user profile');
            const data = await res.json();
            setUser(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
        }
    }, [authHeaders]);

    useEffect(() => {
        if (!token) {
            setError('No authentication token found');
            setLoading(false);
            return;
        }
        fetchUser().finally(() => setLoading(false));
    }, [token, fetchUser]);

    function resetForm() {
        if (user) {
            setFormState({
                name: user.name,
                email: user.email,
                phoneNumber: user.phone_number || '',
                linkedinUrl: user.linkedin_url || '',
                githubUrl: user.github_url || '',
                personalWebsite: user.personal_website || '',
                description: user.description || '',
            });
        } else {
            setFormState({
                name: '',
                email: '',
                phoneNumber: '',
                linkedinUrl: '',
                githubUrl: '',
                personalWebsite: '',
                description: '',
            });
        }
        setEditing(false);
    }

    function handleEdit() {
        if (user) {
            setFormState({
                name: user.name,
                email: user.email,
                phoneNumber: user.phone_number || '',
                linkedinUrl: user.linkedin_url || '',
                githubUrl: user.github_url || '',
                personalWebsite: user.personal_website || '',
                description: user.description || '',
            });
        }
        setEditing(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const payload = {
            name: formState.name,
            email: formState.email,
            phone_number: formState.phoneNumber || null,
            linkedin_url: formState.linkedinUrl || null,
            github_url: formState.githubUrl || null,
            personal_website: formState.personalWebsite || null,
            description: formState.description || null,
        };

        try {
            const method = user ? 'PUT' : 'POST';
            const res = await fetch(`${API_URL}/user/`, {
                method: method,
                headers: authHeaders,
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save user profile');

            await fetchUser();
            resetForm();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save user profile');
        }
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">User Profile</h2>
                {!editing && (
                    <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        {user ? 'Edit Profile' : 'Create Profile'}
                    </button>
                )}
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

            {/* Form */}
            {editing && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-gray-50">
                    <h3 className="text-lg font-semibold mb-3">
                        {user ? 'Edit Profile' : 'Create Profile'}
                    </h3>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={formState.name}
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formState.email}
                            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={formState.description}
                            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                            className="w-full border p-2 rounded"
                            rows={3}
                            placeholder="Brief bio or description"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={formState.phoneNumber}
                            onChange={(e) => setFormState({ ...formState, phoneNumber: e.target.value })}
                            className="w-full border p-2 rounded"
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">GitHub URL</label>
                        <input
                            type="url"
                            value={formState.githubUrl}
                            onChange={(e) => setFormState({ ...formState, githubUrl: e.target.value })}
                            className="w-full border p-2 rounded"
                            placeholder="https://github.com/username"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                        <input
                            type="url"
                            value={formState.linkedinUrl}
                            onChange={(e) => setFormState({ ...formState, linkedinUrl: e.target.value })}
                            className="w-full border p-2 rounded"
                            placeholder="https://linkedin.com/in/username"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Personal Website</label>
                        <input
                            type="url"
                            value={formState.personalWebsite}
                            onChange={(e) => setFormState({ ...formState, personalWebsite: e.target.value })}
                            className="w-full border p-2 rounded"
                            placeholder="https://yourwebsite.com"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            {user ? 'Update' : 'Create'}
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

            {/* Display Profile */}
            {!editing && user && (
                <div className="p-4 border rounded bg-white">
                    <div className="space-y-3">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Name</h3>
                            <p className="text-lg">{user.name}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Email</h3>
                            <p className="text-lg">{user.email}</p>
                        </div>
                        {user.description && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                                <p className="text-lg">{user.description}</p>
                            </div>
                        )}
                        {user.phone_number && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                                <p className="text-lg">{user.phone_number}</p>
                            </div>
                        )}
                        {user.github_url && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">GitHub</h3>
                                <a
                                    href={user.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    {user.github_url}
                                </a>
                            </div>
                        )}
                        {user.linkedin_url && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">LinkedIn</h3>
                                <a
                                    href={user.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    {user.linkedin_url}
                                </a>
                            </div>
                        )}
                        {user.personal_website && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Personal Website</h3>
                                <a
                                    href={user.personal_website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    {user.personal_website}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!editing && !user && (
                <p className="text-gray-500">No user profile yet. Click &quot;Create Profile&quot; to get started.</p>
            )}
        </div>
    );
}
