'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Popup from './Popup';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// T is the type of the entity being managed (e.g. Skill, Project, etc.)
// F is the type of the form state (e.g. { name: string, description: string })
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
    usePopup?: boolean; // If true, shows create/edit form in a popup instead of inline
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
    onRefresh: () => Promise<void>;
}

export interface FormSetters<F = Record<string, unknown>> {
    setFormState: (state: F) => void;
}

export default function Manager<T extends { id: number }, F = Record<string, unknown>>({ config }: { config: ManagerConfig<T, F> }) {
    const headerButtonClass = "inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800";
    const primaryButtonClass = "inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700";
    const secondaryButtonClass = "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50";
    const dangerButtonClass = "inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100";

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

    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Loading {config.entityNamePlural}...</p>
            </div>
        );
    }

    return (
        <section className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Manager
                    </p>
                    <h2 className="text-2xl font-semibold text-slate-900">
                        {config.entityNamePlural}
                    </h2>
                </div>
                <button
                    onClick={() => {
                        if (config.usePopup) {
                            config.resetFormData({ setFormState });
                            setEditing(null);
                            setShowForm(true);
                        } else {
                            setShowForm(!showForm);
                        }
                    }}
                    className={headerButtonClass}
                >
                    {config.usePopup ? `+ New ${config.entityName}` : (showForm ? 'Close form' : `+ New ${config.entityName}`)}
                </button>
            </div>

            {error && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {/* Form for creating new items (only show when not editing, and not using popup) */}
            {!config.usePopup && showForm && !editing && (
                <form onSubmit={handleSubmit} className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Create {config.entityName}
                        </h3>
                        <p className="text-sm text-slate-500">
                            Fill out the details below and save when you are ready.
                        </p>
                    </div>

                    {config.renderForm({ formState, setFormState, editing, error })}

                    <div className="flex flex-wrap gap-2 pt-2">
                        <button
                            type="submit"
                            className={primaryButtonClass}
                        >
                            Create
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className={secondaryButtonClass}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* List */}
            <div className="mt-6 min-w-0 space-y-4">
                {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                        No {config.entityNamePlural} yet. Create one to get started.
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id}>
                            {config.renderListItem({
                                item,
                                onEdit: handleEdit,
                                onDelete: handleDelete,
                                onRefresh: fetchItems,
                            })}
                            
                            {/* Form for editing - appears under the item being edited (only when not using popup) */}
                            {!config.usePopup && editing && editing.id === item.id && showForm && (
                                <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-slate-900">
                                            Edit {config.entityName}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            Update the fields below, then save your changes.
                                        </p>
                                    </div>

                                    {config.renderForm({ formState, setFormState, editing, error })}

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <button
                                            type="submit"
                                            className={primaryButtonClass}
                                        >
                                            Update
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className={dangerButtonClass}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Popup for create/edit (when usePopup is true) */}
            {config.usePopup && showForm && (
                <Popup
                    title={editing ? `Edit ${config.entityName}` : `Create ${config.entityName}`}
                    subtitle={editing ? 'Update the fields below, then save your changes.' : 'Fill out the details below and save when you are ready.'}
                    onClose={resetForm}
                >
                    <form onSubmit={handleSubmit}>
                        {config.renderForm({ formState, setFormState, editing, error })}
                        <div className="flex flex-wrap gap-2 pt-2">
                            <button
                                type="submit"
                                className={primaryButtonClass}
                            >
                                {editing ? 'Update' : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className={editing ? dangerButtonClass : secondaryButtonClass}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </Popup>
            )}
        </section>
    );
}
