import { ManagerConfig } from '../Manager';
import { UserRead } from '@/app/page';
import {
    UserFormState,
    labelClass,
    inputClass,
    textareaClass,
    cardClass,
    actionButtonEdit,
    linkClass,
    listHeaderClass,
    listContentClass,
    listActionsClass,
} from './shared';

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
