import { ManagerConfig } from '../Manager';
import { ProjectRead, SkillRead } from '@/app/page';
import { useState, ChangeEvent } from 'react';
import {
    ProjectFormState,
    API_URL,
    labelClass,
    inputClass,
    textareaClass,
    checkboxClass,
    cardClass,
    chipClass,
    actionButtonBase,
    actionButtonEdit,
    actionButtonDelete,
    listHeaderClass,
    listContentClass,
    listActionsClass,
} from './shared';

// Image upload/remove controls for a single project
function ProjectImageControls({ item, onRefresh }: { item: ProjectRead; onRefresh: () => Promise<void> }) {
    const [uploading, setUploading] = useState(false);
    const [imgError, setImgError] = useState<string | null>(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setImgError(null);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch(`${API_URL}/projects/${item.id}/image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error((data as { detail?: string })?.detail || 'Upload failed');
            }
            await onRefresh();
        } catch (err: unknown) {
            setImgError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    }

    async function handleRemoveImage() {
        if (!confirm('Remove this project image?')) return;
        setUploading(true);
        setImgError(null);
        try {
            const res = await fetch(`${API_URL}/projects/${item.id}/image`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to remove image');
            await onRefresh();
        } catch (err: unknown) {
            setImgError(err instanceof Error ? err.message : 'Failed to remove image');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="mt-3 border-t border-slate-100 pt-3">
            {item.image_url && (
                <div className="mb-2 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={item.image_url!}
                        alt="Project image"
                        className="h-16 w-24 rounded-lg object-cover border border-slate-200"
                    />
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={uploading}
                        className={`${actionButtonDelete} disabled:opacity-50`}
                    >
                        Remove Image
                    </button>
                </div>
            )}
            <label className={`${actionButtonBase} cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploading ? 'Uploading...' : item.image_url ? 'Replace Image' : 'Upload Image'}
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleUpload}
                    className="sr-only"
                    disabled={uploading}
                />
            </label>
            {imgError && <p className="mt-1 text-xs text-rose-600">{imgError}</p>}
        </div>
    );
}

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
        renderListItem: ({ item, onEdit, onDelete, onRefresh }) => (
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

                <div className="flex items-center gap-2 text-sm">
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
                        <div className="flex gap-1">
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

                <ProjectImageControls item={item} onRefresh={onRefresh} />
            </div>
        ),
    };
}
