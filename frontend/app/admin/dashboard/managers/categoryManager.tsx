import { ManagerConfig } from '../Manager';
import { CategoryRead } from '@/app/page';
import {
    CategoryFormState,
    labelClass,
    inputClass,
    cardClass,
    actionButtonEdit,
    actionButtonDelete,
    listHeaderClass,
    listContentClass,
    listActionsClass,
} from './shared';

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
