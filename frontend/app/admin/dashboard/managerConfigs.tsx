import { ManagerConfig } from './Manager';
import { ActivityRead, CategoryRead, LearningRead, ProjectRead, SkillRead } from '@/app/page';
import { useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Form State Interfaces
interface CategoryFormState {
    name: string;
}

interface SkillFormState {
    name: string;
    parent: number | null;
    category: number | null;
}

interface ProjectFormState {
    name: string;
    description: string;
    isCompleted: boolean;
    selectedSkills: number[];
    content: string | null;
}

interface LearningFormState {
    title: string;
    url: string | null;
    description: string;
    isCompleted: boolean;
    selectedSkills: number[];
}

interface ActivityFormState {
    title: string;
    type: string;
    organization: string;
    description: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    selectedSkills: number[];
}

// Category Manager Config
export const categoryConfig: ManagerConfig<CategoryRead, CategoryFormState> = {
    entityName: 'Category',
    entityNamePlural: 'Categories',
    apiEndpoint: 'categories',
    getInitialFormState: () => ({ name: '' }),
    resetFormData: ({ setFormState }) => {
        setFormState({ name: '' } as Record<string, unknown>);
    },
    setFormData: (item, { setFormState }) => {
        setFormState({ name: item.name } as Record<string, unknown>);
    },
    getFormData: (formState) => ({
        name: formState.name,
    }),
    renderForm: ({ formState, setFormState }) => (
        <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                className="w-full border p-2 rounded"
                required
            />
        </div>
    ),
    renderListItem: ({ item, onEdit, onDelete }) => (
        <div className="p-4 border rounded bg-white">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(item)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    ),
};

// Helper hook for skill-based managers
export function useSkillsData() {
    const [skills, setSkills] = useState<SkillRead[]>([]);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    const fetchSkills = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/skills/`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch skills');
            const skillArray = (await res.json()) as SkillRead[];
            setSkills(skillArray);
        } catch (err: unknown) {
            console.error(err);
        }
    }, [token]);

    return { skills, fetchSkills };
}

// Helper hook for categories data
export function useCategoriesData() {
    const [categories, setCategories] = useState<CategoryRead[]>([]);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/categories/`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch categories');
            const categoryArray = (await res.json()) as CategoryRead[];
            setCategories(categoryArray);
        } catch (err: unknown) {
            console.error(err);
        }
    }, [token]);

    return { categories, fetchCategories };
}

// Skill Manager Config Factory
export function createSkillConfig(skills: SkillRead[], categories: CategoryRead[]): ManagerConfig<SkillRead, SkillFormState> {
    const skillsMap = new Map<number, SkillRead>();
    skills.forEach(skill => skillsMap.set(skill.id, skill));

    const categoriesMap = new Map<number, CategoryRead>();
    categories.forEach(category => categoriesMap.set(category.id, category));

    return {
        entityName: 'Skill',
        entityNamePlural: 'Skills',
        apiEndpoint: 'skills',
        getInitialFormState: () => ({
            name: '',
            parent: null,
            category: null,
        }),
        resetFormData: ({ setFormState }) => {
            setFormState({ name: '', parent: null, category: null } as Record<string, unknown>);
        },
        setFormData: (item, { setFormState }) => {
            setFormState({
                name: item.name,
                parent: item.parent_id ?? null,
                category: item.category_id ?? null,
            } as Record<string, unknown>);
        },
        getFormData: (formState) => ({
            name: formState.name,
            parent_id: formState.parent,
            category_id: formState.category,
        }),
        renderForm: ({ formState, setFormState }) => {
            const chooseParent = (skillId: number) => {
                setFormState({
                    ...formState,
                    parent: formState.parent === skillId ? null : skillId,
                });
            };

            return (
                <>
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            value={formState.name}
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
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
                                        checked={formState.parent === skill.id}
                                        onChange={() => chooseParent(skill.id)}
                                    />
                                    {skill.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                            value={formState.category ?? ''}
                            onChange={(e) =>
                                setFormState({
                                    ...formState,
                                    category: e.target.value ? Number(e.target.value) : null,
                                })
                            }
                            className="w-full border p-2 rounded"
                        >
                            <option value="">No Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            );
        },
        renderListItem: ({ item, onEdit, onDelete }) => (
            <div className="p-4 border rounded bg-white">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(item)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(item.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    {item.parent_id ? (
                        <span className="px-2 py-1 bg-gray-200 rounded">
                            Parent: {skillsMap.get(item.parent_id)?.name || 'Unknown'}
                        </span>
                    ) : (
                        <span className="px-2 py-1 bg-gray-200 rounded">No Parent</span>
                    )}
                </div>

                <div className="flex items-center gap-2 text-sm mt-2">
                    {item.category_id ? (
                        <span className="px-2 py-1 bg-gray-200 rounded">
                            Category: {categoriesMap.get(item.category_id)?.name || 'Unknown'}
                        </span>
                    ) : (
                        <span className="px-2 py-1 bg-gray-200 rounded">No Category</span>
                    )}
                </div>
            </div>
        ),
    };
}

// Project Manager Config Factory
export function createProjectConfig(skills: SkillRead[]): ManagerConfig<ProjectRead, ProjectFormState> {
    return {
        entityName: 'Project',
        entityNamePlural: 'Projects',
        apiEndpoint: 'projects',
        getInitialFormState: () => ({
            name: '',
            description: '',
            isCompleted: false,
            selectedSkills: [],
            content: null,
        }),
        resetFormData: ({ setFormState }) => {
            setFormState({
                name: '',
                description: '',
                isCompleted: false,
                selectedSkills: [],
                content: null,
            } as Record<string, unknown>);
        },
        setFormData: (item, { setFormState }) => {
            setFormState({
                name: item.name,
                description: item.description,
                isCompleted: item.is_completed,
                content: item.content,
                selectedSkills: item.skills.map((skill) => skill.id),
            } as Record<string, unknown>);
        },
        getFormData: (formState) => ({
            name: formState.name,
            description: formState.description,
            is_completed: formState.isCompleted,
            content: formState.content,
            skill_ids: formState.selectedSkills,
        }),
        renderForm: ({ formState, setFormState }) => {
            const toggleSkill = (skill: SkillRead) => {
                const newSkills = formState.selectedSkills.includes(skill.id)
                    ? formState.selectedSkills.filter((id: number) => id !== skill.id)
                    : [...formState.selectedSkills, skill.id];
                setFormState({ ...formState, selectedSkills: newSkills });
            };

            return (
                <>
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            value={formState.name}
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
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
                        />
                    </div>

                    <div className="mb-3">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formState.isCompleted}
                                onChange={(e) =>
                                    setFormState({ ...formState, isCompleted: e.target.checked })
                                }
                            />
                            <span className="text-sm font-medium">Completed</span>
                        </label>
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Content</label>
                        <textarea
                            value={formState.content || ''}
                            onChange={(e) => setFormState({ ...formState, content: e.target.value })}
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
                                        checked={formState.selectedSkills.includes(skill.id)}
                                        onChange={() => toggleSkill(skill)}
                                    />
                                    {skill.name}
                                </label>
                            ))}
                        </div>
                    </div>
                </>
            );
        },
        renderListItem: ({ item, onEdit, onDelete }) => (
            <div className="p-4 border rounded bg-white">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(item)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(item.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <span
                        className={`px-2 py-1 rounded ${
                            item.is_completed
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                        {item.is_completed ? 'Completed' : 'Ongoing'}
                    </span>
                    {item.skills.length > 0 && (
                        <div className="flex gap-1">
                            {item.skills.map((skill) => (
                                <span
                                    key={skill.id}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        ),
    };
}

// Learning Manager Config Factory
export function createLearningConfig(skills: SkillRead[]): ManagerConfig<LearningRead, LearningFormState> {
    return {
        entityName: 'Learning',
        entityNamePlural: 'Learnings',
        apiEndpoint: 'learnings',
        getInitialFormState: () => ({
            title: '',
            url: null,
            description: '',
            isCompleted: false,
            selectedSkills: [],
        }),
        resetFormData: ({ setFormState }) => {
            setFormState({
                title: '',
                url: null,
                description: '',
                isCompleted: false,
                selectedSkills: [],
            } as Record<string, unknown>);
        },
        setFormData: (item, { setFormState }) => {
            setFormState({
                title: item.title,
                url: item.url,
                description: item.description,
                isCompleted: item.is_completed,
                selectedSkills: item.skills.map((skill) => skill.id),
            } as Record<string, unknown>);
        },
        getFormData: (formState) => ({
            title: formState.title,
            url: formState.url,
            description: formState.description,
            is_completed: formState.isCompleted,
            skill_ids: formState.selectedSkills,
        }),
        renderForm: ({ formState, setFormState }) => {
            const toggleSkill = (skill: SkillRead) => {
                const newSkills = formState.selectedSkills.includes(skill.id)
                    ? formState.selectedSkills.filter((id: number) => id !== skill.id)
                    : [...formState.selectedSkills, skill.id];
                setFormState({ ...formState, selectedSkills: newSkills });
            };

            return (
                <>
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            value={formState.title}
                            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">URL</label>
                        <input
                            type="url"
                            value={formState.url || ''}
                            onChange={(e) =>
                                setFormState({ ...formState, url: e.target.value || null })
                            }
                            className="w-full border p-2 rounded"
                            placeholder="https://example.com"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={formState.description}
                            onChange={(e) =>
                                setFormState({ ...formState, description: e.target.value })
                            }
                            className="w-full border p-2 rounded"
                            rows={3}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formState.isCompleted}
                                onChange={(e) =>
                                    setFormState({ ...formState, isCompleted: e.target.checked })
                                }
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
                                        checked={formState.selectedSkills.includes(skill.id)}
                                        onChange={() => toggleSkill(skill)}
                                    />
                                    {skill.name}
                                </label>
                            ))}
                        </div>
                    </div>
                </>
            );
        },
        renderListItem: ({ item, onEdit, onDelete }) => (
            <div className="p-4 border rounded bg-white">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        {item.url && (
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 text-sm hover:underline"
                            >
                                {item.url}
                            </a>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(item)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(item.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <span
                        className={`px-2 py-1 rounded ${
                            item.is_completed
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                        {item.is_completed ? 'Completed' : 'In Progress'}
                    </span>
                    {item.skills.length > 0 && (
                        <div className="flex gap-1">
                            {item.skills.map((skill) => (
                                <span
                                    key={skill.id}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        ),
    };
}

// Activity Manager Config Factory
export function createActivityConfig(skills: SkillRead[]): ManagerConfig<ActivityRead, ActivityFormState> {
    return {
        entityName: 'Activity',
        entityNamePlural: 'Activities',
        apiEndpoint: 'activities',
        getInitialFormState: () => ({
            title: '',
            type: '',
            organization: '',
            description: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            selectedSkills: [],
        }),
        resetFormData: ({ setFormState }) => {
            setFormState({
                title: '',
                type: '',
                organization: '',
                description: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
                selectedSkills: [],
            } as Record<string, unknown>);
        },
        setFormData: (item, { setFormState }) => {
            setFormState({
                title: item.title,
                type: item.type,
                organization: item.organization || '',
                description: item.description || '',
                startDate: item.start_date || '',
                endDate: item.end_date || '',
                isCurrent: item.is_current,
                selectedSkills: item.skills.map((skill) => skill.id),
            } as Record<string, unknown>);
        },
        getFormData: (formState) => ({
            title: formState.title,
            type: formState.type,
            organization: formState.organization || null,
            description: formState.description || null,
            start_date: formState.startDate || null,
            end_date: formState.endDate || null,
            is_current: formState.isCurrent,
            skill_ids: formState.selectedSkills,
        }),
        renderForm: ({ formState, setFormState }) => {
            const toggleSkill = (skill: SkillRead) => {
                const newSkills = formState.selectedSkills.includes(skill.id)
                    ? formState.selectedSkills.filter((id: number) => id !== skill.id)
                    : [...formState.selectedSkills, skill.id];
                setFormState({ ...formState, selectedSkills: newSkills });
            };

            return (
                <>
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            value={formState.title}
                            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <input
                            value={formState.type}
                            onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Organization</label>
                        <input
                            value={formState.organization}
                            onChange={(e) =>
                                setFormState({ ...formState, organization: e.target.value })
                            }
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={formState.description}
                            onChange={(e) =>
                                setFormState({ ...formState, description: e.target.value })
                            }
                            className="w-full border p-2 rounded"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <input
                                type="date"
                                value={formState.startDate}
                                onChange={(e) =>
                                    setFormState({ ...formState, startDate: e.target.value })
                                }
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">End Date</label>
                            <input
                                type="date"
                                value={formState.endDate}
                                onChange={(e) =>
                                    setFormState({ ...formState, endDate: e.target.value })
                                }
                                className="w-full border p-2 rounded"
                                disabled={formState.isCurrent}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formState.isCurrent}
                                onChange={(e) => {
                                    setFormState({
                                        ...formState,
                                        isCurrent: e.target.checked,
                                        endDate: e.target.checked ? '' : formState.endDate,
                                    });
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
                                        checked={formState.selectedSkills.includes(skill.id)}
                                        onChange={() => toggleSkill(skill)}
                                    />
                                    {skill.name}
                                </label>
                            ))}
                        </div>
                    </div>
                </>
            );
        },
        renderListItem: ({ item, onEdit, onDelete }) => (
            <div className="p-4 border rounded bg-white">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.organization}</p>
                        {item.description && (
                            <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(item)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(item.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm mb-2">
                    <span
                        className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                            item.type === 'job'
                                ? 'bg-purple-100 text-purple-700'
                                : item.type === 'volunteer'
                                ? 'bg-blue-100 text-blue-700'
                                : item.type === 'internship'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                        }`}
                    >
                        {item.type}
                    </span>
                    {item.is_current && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                            Current
                        </span>
                    )}
                </div>

                {(item.start_date || item.end_date) && (
                    <p className="text-xs text-gray-500 mb-2">
                        {item.start_date && `From: ${item.start_date}`}
                        {item.start_date && item.end_date && ' — '}
                        {item.end_date && `To: ${item.end_date}`}
                    </p>
                )}

                {item.skills.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                        {item.skills.map((skill) => (
                            <span
                                key={skill.id}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                                {skill.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        ),
    };
}
