import { ManagerConfig } from '../Manager';
import { LearningRead, SkillRead } from '@/app/page';
import {
    LearningFormState,
    labelClass,
    inputClass,
    textareaClass,
    checkboxClass,
    cardClass,
    chipClass,
    actionButtonEdit,
    actionButtonDelete,
    linkClass,
    listHeaderClass,
    listContentClass,
    listActionsClass,
} from './shared';

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
