'use client';

import { useEffect, useState } from 'react';
import { CategoryRead } from '@/app/page';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CategoryManager() {
    const [categories, setCategories] = useState<CategoryRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<CategoryRead | null>(null);
    const [showForm, setShowForm] = useState(false);

    // form state
    const [name, setName] = useState('');

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }

    async function fetchCategories() {
        try {
            const res = await fetch(`${API_URL}/categories/`, { headers: authHeaders });
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data = await res.json();
            setCategories(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        }
    }

    useEffect(() => {
        if (!token) {
            setError('No authentication token found');
            setLoading(false);
            return;
        }
        fetchCategories().finally(() => setLoading(false));
    }, [token]);

    function resetForm() {
        setName('');
        setEditing(null);
        setShowForm(false);
    }

    function handleEdit(category: CategoryRead) {
        setEditing(category);
        setName(category.name);
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const payload = {
            name: name,
        };

        try {
            const url = editing ? `${API_URL}/categories/${editing.id}/` : `${API_URL}/categories/`;
            const method = editing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: authHeaders,
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save category');

            await fetchCategories();
            resetForm();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save category');
        }
    }

    async function handleDelete(categoryId: number) {
        setError(null);
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const res = await fetch(`${API_URL}/categories/${categoryId}/`, {
                method: 'DELETE',
                headers: authHeaders,
            });
            if (!res.ok) throw new Error('Failed to delete category');
            await fetchCategories();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to delete category');
        }
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Categories</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : '+ New Category'}
                </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-gray-50">
                    <h3 className="text-lg font-semibold mb-3">
                        {editing ? 'Edit Category' : 'Create Category'}
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
                {categories.length === 0 ? (
                    <p className="text-gray-500">No categories yet.</p>
                ) : (
                    categories.map((category) => (
                        <div key={category.id} className="p-4 border rounded bg-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold">{category.name}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}