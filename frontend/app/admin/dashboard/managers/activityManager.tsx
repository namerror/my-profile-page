import { ManagerConfig } from '../Manager';
import { ActivityRead, SkillRead } from '@/app/page';
import {
    ActivityFormState,
    labelClass,
    inputClass,
    textareaClass,
    checkboxClass,
    cardClass,
    chipClass,
    actionButtonEdit,
    actionButtonDelete,
    listHeaderClass,
    listContentClass,
    listActionsClass,
} from './shared';

export function createActivityConfig(skills: SkillRead[]): ManagerConfig<ActivityRead, ActivityFormState> {
    return {
        entityName: 'Activity',
        entityNamePlural: 'Activities',
        apiEndpoint: 'activities',
        usePopup: true,
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
