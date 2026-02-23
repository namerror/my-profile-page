import { ManagerConfig } from './Manager';
import { ActivityRead, CategoryRead, LearningRead, ProjectRead, SkillRead, UserRead } from '@/app/page';
import { useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const labelClass = "block text-sm font-semibold text-slate-700 mb-1";
const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-slate-400";
const textareaClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-slate-400";
const selectClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const checkboxClass = "h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200";
const radioClass = "h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-200";
const cardClass = "w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm";
const chipClass = "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700";
const actionButtonBase = "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold transition";
const actionButtonEdit = `${actionButtonBase} bg-blue-50 text-blue-700 hover:bg-blue-100`;
const actionButtonDelete = `${actionButtonBase} bg-rose-50 text-rose-700 hover:bg-rose-100`;
const linkClass = "text-blue-600 text-sm font-medium hover:underline break-all";
const listHeaderClass = "flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between";
const listContentClass = "min-w-0";
const listActionsClass = "flex shrink-0 flex-wrap gap-2";

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

interface UserFormState {
    name: string;
    email: string;
    phoneNumber: string;
    linkedinUrl: string;
    githubUrl: string;
    personalWebsite: string;
    description: string;
}

// Category Manager Config
export const categoryConfig: ManagerConfig<CategoryRead, CategoryFormState> = {
    entityName: 'Category',
    entityNamePlural: 'Categories',
    apiEndpoint: 'categories',
    getInitialFormState: () => ({ name: '' }),
    resetFormData: ({ setFormState }) => {
        setFormState({ name: '' });
    },
    setFormData: (item, { setFormState }) => {
        setFormState({ name: item.name });
    },
    getFormData: (formState) => ({
        name: formState.name,
    }),
    renderForm: ({ formState, setFormState }) => (
        <div className="mb-3">
            <label className={labelClass}>Name</label>
            <input
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                className={inputClass}
                required
            />
        </div>
    ),
    renderListItem: ({ item, onEdit, onDelete }) => (
        <div className={cardClass}>
            <div className={listHeaderClass}>
                <div className={listContentClass}>
                    <h3 className="text-lg font-semibold text-slate-900 break-words">{item.name}</h3>
                </div>
                <div className={listActionsClass}>
                    <button
                        onClick={() => onEdit(item)}
                        className={actionButtonEdit}
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className={actionButtonDelete}
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

    const fetchSkills = useCallback(async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
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
    }, []);

    return { skills, fetchSkills };
}

// Helper hook for categories data
export function useCategoriesData() {
    const [categories, setCategories] = useState<CategoryRead[]>([]);

    const fetchCategories = useCallback(async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
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
    }, []);

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
            setFormState({ name: '', parent: null, category: null });
        },
        setFormData: (item, { setFormState }) => {
            setFormState({
                name: item.name,
                parent: item.parent_id ?? null,
                category: item.category_id ?? null,
            });
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
                        <label className={labelClass}>Name</label>
                        <input
                            value={formState.name}
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                            className={inputClass}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className={labelClass}>Parent</label>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <label key={skill.id} className="flex items-center gap-2 text-sm text-slate-700">
                                    <input
                                        type="radio"
                                        checked={formState.parent === skill.id}
                                        onChange={() => chooseParent(skill.id)}
                                        className={radioClass}
                                    />
                                    {skill.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className={labelClass}>Category</label>
                        <select
                            value={formState.category ?? ''}
                            onChange={(e) =>
                                setFormState({
                                    ...formState,
                                    category: e.target.value ? Number(e.target.value) : null,
                                })
                            }
                            className={selectClass}
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
        <div className={cardClass}>
            <div className={`${listHeaderClass} mb-2`}>
                <div className={listContentClass}>
                    <h3 className="text-lg font-semibold text-slate-900 break-words">{item.name}</h3>
                </div>
                <div className={listActionsClass}>
                    <button
                        onClick={() => onEdit(item)}
                        className={actionButtonEdit}
                    >
                        Edit
                        </button>
                        <button
                            onClick={() => onDelete(item.id)}
                            className={actionButtonDelete}
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    {item.parent_id ? (
                        <span className={chipClass}>
                            Parent: {skillsMap.get(item.parent_id)?.name || 'Unknown'}
                        </span>
                    ) : (
                        <span className={chipClass}>No Parent</span>
                    )}
                </div>

                <div className="flex items-center gap-2 text-sm mt-2">
                    {item.category_id ? (
                        <span className={chipClass}>
                            Category: {categoriesMap.get(item.category_id)?.name || 'Unknown'}
                        </span>
                    ) : (
                        <span className={chipClass}>No Category</span>
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
            });
        },
        setFormData: (item, { setFormState }) => {
            setFormState({
                name: item.name,
                description: item.description,
                isCompleted: item.is_completed,
                content: item.content,
                selectedSkills: item.skills.map((skill) => skill.id),
            });
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
                        <label className={labelClass}>Name</label>
                        <input
                            value={formState.name}
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                            className={inputClass}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className={labelClass}>Description</label>
                        <textarea
                            value={formState.description}
                            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                            className={textareaClass}
                            rows={3}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={formState.isCompleted}
                                onChange={(e) =>
                                    setFormState({ ...formState, isCompleted: e.target.checked })
                                }
                                className={checkboxClass}
                            />
                            <span className="text-sm font-semibold">Completed</span>
                        </label>
                    </div>

                    <div className="mb-3">
                        <label className={labelClass}>Content</label>
                        <textarea
                            value={formState.content || ''}
                            onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                            className={textareaClass}
                            rows={4}
                        />
                    </div>

                    <div className="mb-3">
                        <label className={labelClass}>Skills</label>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <label key={skill.id} className="flex items-center gap-2 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={formState.selectedSkills.includes(skill.id)}
                                        onChange={() => toggleSkill(skill)}
                                        className={checkboxClass}
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
        <div className={cardClass}>
            <div className={`${listHeaderClass} mb-2`}>
                <div className={listContentClass}>
                    <h3 className="text-lg font-semibold text-slate-900 break-words">{item.name}</h3>
                    <p className="text-sm text-slate-600 break-words">{item.description}</p>
                </div>
                <div className={listActionsClass}>
                    <button
                        onClick={() => onEdit(item)}
                        className={actionButtonEdit}
                    >
                        Edit
                        </button>
                        <button
                            onClick={() => onDelete(item.id)}
                            className={actionButtonDelete}
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.is_completed
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                        }`}
                    >
                        {item.is_completed ? 'Completed' : 'Ongoing'}
                    </span>
                    {item.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {item.skills.map((skill) => (
                                <span
                                    key={skill.id}
                                    className={chipClass}
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
            });
        },
        setFormData: (item, { setFormState }) => {
            setFormState({
                title: item.title,
                url: item.url,
                description: item.description,
                isCompleted: item.is_completed,
                selectedSkills: item.skills.map((skill) => skill.id),
            });
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
                        <label className={labelClass}>Title</label>
                        <input
                            value={formState.title}
                            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                            className={inputClass}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className={labelClass}>URL</label>
                        <input
                            type="url"
                            value={formState.url || ''}
                            onChange={(e) =>
                                setFormState({ ...formState, url: e.target.value || null })
                            }
                            className={inputClass}
                            placeholder="https://example.com"
                        />
                    </div>

                    <div className="mb-3">
                        <label className={labelClass}>Description</label>
                        <textarea
                            value={formState.description}
                            onChange={(e) =>
                                setFormState({ ...formState, description: e.target.value })
                            }
                            className={textareaClass}
                            rows={3}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={formState.isCompleted}
                                onChange={(e) =>
                                    setFormState({ ...formState, isCompleted: e.target.checked })
                                }
                                className={checkboxClass}
                            />
                            <span className="text-sm font-semibold">Completed</span>
                        </label>
                    </div>

                    <div className="mb-3">
                        <label className={labelClass}>Skills</label>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <label key={skill.id} className="flex items-center gap-2 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={formState.selectedSkills.includes(skill.id)}
                                        onChange={() => toggleSkill(skill)}
                                        className={checkboxClass}
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
        <div className={cardClass}>
            <div className={`${listHeaderClass} mb-2`}>
                <div className={listContentClass}>
                    <h3 className="text-lg font-semibold text-slate-900 break-words">{item.title}</h3>
                    <p className="text-sm text-slate-600 break-words">{item.description}</p>
                    {item.url && (
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClass}
                        >
                            {item.url}
                        </a>
                    )}
                </div>
                <div className={listActionsClass}>
                    <button
                        onClick={() => onEdit(item)}
                        className={actionButtonEdit}
                    >
                        Edit
                        </button>
                        <button
                            onClick={() => onDelete(item.id)}
                            className={actionButtonDelete}
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.is_completed
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                        }`}
                    >
                        {item.is_completed ? 'Completed' : 'In Progress'}
                    </span>
                    {item.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {item.skills.map((skill) => (
                                <span
                                    key={skill.id}
                                    className={chipClass}
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
            });
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
            });
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
                        <label className={labelClass}>Title</label>
                        <input
                            value={formState.title}
                            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                            className={inputClass}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className={labelClass}>Type</label>
                        <input
                            value={formState.type}
                            onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                            className={inputClass}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className={labelClass}>Organization</label>
                        <input
                            value={formState.organization}
                            onChange={(e) =>
                                setFormState({ ...formState, organization: e.target.value })
                            }
                            className={inputClass}
                        />
                    </div>

                    <div className="mb-3">
                        <label className={labelClass}>Description</label>
                        <textarea
                            value={formState.description}
                            onChange={(e) =>
                                setFormState({ ...formState, description: e.target.value })
                            }
                            className={textareaClass}
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-3 mb-3 md:grid-cols-2">
                        <div>
                            <label className={labelClass}>Start Date</label>
                            <input
                                type="date"
                                value={formState.startDate}
                                onChange={(e) =>
                                    setFormState({ ...formState, startDate: e.target.value })
                                }
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>End Date</label>
                            <input
                                type="date"
                                value={formState.endDate}
                                onChange={(e) =>
                                    setFormState({ ...formState, endDate: e.target.value })
                                }
                                className={inputClass}
                                disabled={formState.isCurrent}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
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
                                className={checkboxClass}
                            />
                            <span className="text-sm font-semibold">Currently Active</span>
                        </label>
                    </div>

                    <div className="mb-3">
                        <label className={labelClass}>Skills</label>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <label key={skill.id} className="flex items-center gap-2 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={formState.selectedSkills.includes(skill.id)}
                                        onChange={() => toggleSkill(skill)}
                                        className={checkboxClass}
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
        <div className={cardClass}>
            <div className={`${listHeaderClass} mb-2`}>
                <div className={listContentClass}>
                    <h3 className="text-lg font-semibold text-slate-900 break-words">{item.title}</h3>
                    <p className="text-sm text-slate-600 break-words">{item.organization}</p>
                    {item.description && (
                        <p className="text-sm text-slate-700 mt-1 break-words">{item.description}</p>
                    )}
                </div>
                <div className={listActionsClass}>
                    <button
                        onClick={() => onEdit(item)}
                        className={actionButtonEdit}
                    >
                        Edit
                        </button>
                        <button
                            onClick={() => onDelete(item.id)}
                            className={actionButtonDelete}
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm mb-2">
                    <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            item.type === 'job'
                                ? 'bg-indigo-100 text-indigo-700'
                                : item.type === 'volunteer'
                                ? 'bg-sky-100 text-sky-700'
                                : item.type === 'internship'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                        }`}
                    >
                        {item.type}
                    </span>
                    {item.is_current && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                            Current
                        </span>
                    )}
                </div>

                {(item.start_date || item.end_date) && (
                    <p className="text-xs text-slate-500 mb-2">
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
                                className={chipClass}
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

// User Profile Manager Config
export const userConfig: ManagerConfig<UserRead, UserFormState> = {
    entityName: 'User Profile',
    entityNamePlural: 'User Profile',
    apiEndpoint: 'user',
    isSingleton: true,
    getInitialFormState: () => ({
        name: '',
        email: '',
        phoneNumber: '',
        linkedinUrl: '',
        githubUrl: '',
        personalWebsite: '',
        description: '',
    }),
    resetFormData: ({ setFormState }) => {
        setFormState({
            name: '',
            email: '',
            phoneNumber: '',
            linkedinUrl: '',
            githubUrl: '',
            personalWebsite: '',
            description: '',
        });
    },
    setFormData: (item, { setFormState }) => {
        setFormState({
            name: item.name,
            email: item.email,
            phoneNumber: item.phone_number || '',
            linkedinUrl: item.linkedin_url || '',
            githubUrl: item.github_url || '',
            personalWebsite: item.personal_website || '',
            description: item.description || '',
        });
    },
    getFormData: (formState) => ({
        name: formState.name,
        email: formState.email,
        phone_number: formState.phoneNumber || null,
        linkedin_url: formState.linkedinUrl || null,
        github_url: formState.githubUrl || null,
        personal_website: formState.personalWebsite || null,
        description: formState.description || null,
    }),
    renderForm: ({ formState, setFormState }) => (
        <>
            <div className="mb-3">
                <label className={labelClass}>
                    Name <span className="text-red-500">*</span>
                </label>
                <input
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className={inputClass}
                    required
                />
            </div>

            <div className="mb-3">
                <label className={labelClass}>
                    Email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className={inputClass}
                    required
                />
            </div>

            <div className="mb-3">
                <label className={labelClass}>Description</label>
                <textarea
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    className={textareaClass}
                    rows={3}
                    placeholder="Brief bio or description"
                />
            </div>

            <div className="mb-3">
                <label className={labelClass}>Phone Number</label>
                <input
                    type="tel"
                    value={formState.phoneNumber}
                    onChange={(e) => setFormState({ ...formState, phoneNumber: e.target.value })}
                    className={inputClass}
                    placeholder="+1 (555) 123-4567"
                />
            </div>

            <div className="mb-3">
                <label className={labelClass}>GitHub URL</label>
                <input
                    type="url"
                    value={formState.githubUrl}
                    onChange={(e) => setFormState({ ...formState, githubUrl: e.target.value })}
                    className={inputClass}
                    placeholder="https://github.com/username"
                />
            </div>

            <div className="mb-3">
                <label className={labelClass}>LinkedIn URL</label>
                <input
                    type="url"
                    value={formState.linkedinUrl}
                    onChange={(e) => setFormState({ ...formState, linkedinUrl: e.target.value })}
                    className={inputClass}
                    placeholder="https://linkedin.com/in/username"
                />
            </div>

            <div className="mb-3">
                <label className={labelClass}>Personal Website</label>
                <input
                    type="url"
                    value={formState.personalWebsite}
                    onChange={(e) => setFormState({ ...formState, personalWebsite: e.target.value })}
                    className={inputClass}
                    placeholder="https://yourwebsite.com"
                />
            </div>
        </>
    ),
    renderListItem: ({ item, onEdit }) => (
        <div className={cardClass}>
            <div className={`${listHeaderClass} mb-2`}>
                <div className={listContentClass}>
                    <h3 className="text-lg font-semibold text-slate-900 break-words">{item.name}</h3>
                    <p className="text-sm text-slate-600 break-words">{item.email}</p>
                    {item.description && (
                        <p className="text-sm text-slate-700 mt-2 break-words">{item.description}</p>
                    )}
                </div>
                <div className={listActionsClass}>
                    <button
                        onClick={() => onEdit(item)}
                        className={actionButtonEdit}
                    >
                        Edit
                    </button>
                </div>
            </div>

            <div className="mt-3 space-y-2">
                {item.phone_number && (
                    <div className="text-sm">
                        <span className="font-medium text-slate-500">Phone:</span>{' '}
                        <span className="text-slate-800">{item.phone_number}</span>
                    </div>
                )}
                {item.github_url && (
                    <div className="text-sm">
                        <span className="font-medium text-slate-500">GitHub:</span>{' '}
                        <a
                            href={item.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClass}
                        >
                            {item.github_url}
                        </a>
                    </div>
                )}
                {item.linkedin_url && (
                    <div className="text-sm">
                        <span className="font-medium text-slate-500">LinkedIn:</span>{' '}
                        <a
                            href={item.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClass}
                        >
                            {item.linkedin_url}
                        </a>
                    </div>
                )}
                {item.personal_website && (
                    <div className="text-sm">
                        <span className="font-medium text-slate-500">Website:</span>{' '}
                        <a
                            href={item.personal_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClass}
                        >
                            {item.personal_website}
                        </a>
                    </div>
                )}
            </div>
        </div>
    ),
};
