import { ManagerConfig } from '../Manager';
import { SkillRead, CategoryRead } from '@/app/page';
import {
    SkillFormState,
    labelClass,
    inputClass,
    selectClass,
    radioClass,
    cardClass,
    chipClass,
    actionButtonEdit,
    actionButtonDelete,
    listHeaderClass,
    listContentClass,
    listActionsClass,
} from './shared';

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
