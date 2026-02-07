'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ManagerConfig<T, F = Record<string, unknown>> {
    entityName: string;
    entityNamePlural: string;
    apiEndpoint: string;
    fetchDependencies?: () => Promise<void>;
    renderForm: (props: FormRenderProps<T, F>) => React.ReactNode;
    renderListItem: (props: ListItemRenderProps<T>) => React.ReactNode;
    getFormData: (formState: F) => Record<string, unknown>;
    setFormData: (item: T, setters: FormSetters<F>) => void;
    resetFormData: (setters: FormSetters<F>) => void;
    getInitialFormState: () => F;
    isSingleton?: boolean; // If true, treats API as singleton (returns single object, not array)
}

export interface FormRenderProps<T, F = Record<string, unknown>> {
    formState: F;
    setFormState: (state: F) => void;
    editing: T | null;
    error: string | null;
}

export interface ListItemRenderProps<T> {
    item: T;
    onEdit: (item: T) => void;
    onDelete: (id: number) => void;
}

export interface FormSetters<F = Record<string, unknown>> {
    setFormState: (state: F) => void;
}

export default function Manager<T extends { id: number }, F = Record<string, unknown>>({ config }: { config: ManagerConfig<T, F> }) {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<T | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formState, setFormState] = useState<F>(config.getInitialFormState());

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    const authHeaders = useMemo(() => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }), [token]);

    const fetchItems = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/${config.apiEndpoint}/`, { headers: authHeaders });
            if (!res.ok) {
                // For singleton, 404 means no item yet, treat as empty
                if (config.isSingleton && res.status === 404) {
                    setItems([]);
                    return;
                }
                throw new Error(`Failed to fetch ${config.entityNamePlural}`);
            }
            const data = await res.json();
            // For singleton, wrap single object in array
            setItems(config.isSingleton ? [data] : data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : `Failed to fetch ${config.entityNamePlural}`);
        }
    }, [config.apiEndpoint, config.entityNamePlural, config.isSingleton, authHeaders]);

    useEffect(() => {
        if (!token) {
            setError('No authentication token found');
            setLoading(false);
            return;
        }
        const loadData = async () => {
            await fetchItems();
            if (config.fetchDependencies) {
                await config.fetchDependencies();
            }
        };
        loadData().finally(() => setLoading(false));
    }, [token, fetchItems, config.fetchDependencies]);

    function resetForm() {
        config.resetFormData({ setFormState });
        setEditing(null);
        setShowForm(false);
    }

    function handleEdit(item: T) {
        setEditing(item);
        config.setFormData(item, { setFormState });
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const payload = config.getFormData(formState);

        try {
            // For singleton, PUT doesn't include ID in URL
            const url = editing && !config.isSingleton
                ? `${API_URL}/${config.apiEndpoint}/${editing.id}/` 
                : `${API_URL}/${config.apiEndpoint}/`;
            const method = editing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: authHeaders,
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`Failed to save ${config.entityName}`);

            await fetchItems();
            resetForm();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : `Failed to save ${config.entityName}`);
        }
    }

    async function handleDelete(itemId: number) {
        setError(null);
        if (!confirm(`Are you sure you want to delete this ${config.entityName}?`)) return;

        try {
            const res = await fetch(`${API_URL}/${config.apiEndpoint}/${itemId}/`, {
                method: 'DELETE',
                headers: authHeaders,
            });
            if (!res.ok) throw new Error(`Failed to delete ${config.entityName}`);
            await fetchItems();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : `Failed to delete ${config.entityName}`);
        }
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{config.entityNamePlural}</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : `+ New ${config.entityName}`}
                </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-gray-50">
                    <h3 className="text-lg font-semibold mb-3">
                        {editing ? `Edit ${config.entityName}` : `Create ${config.entityName}`}
                    </h3>

                    {config.renderForm({ formState, setFormState, editing, error })}

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
                {items.length === 0 ? (
                    <p className="text-gray-500">No {config.entityNamePlural} yet.</p>
                ) : (
                    items.map((item) => (
                        <div key={item.id}>
                            {config.renderListItem({ 
                                item, 
                                onEdit: handleEdit, 
                                onDelete: handleDelete 
                            })}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
