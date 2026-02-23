export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const labelClass = "block text-sm font-semibold text-slate-700 mb-1";
export const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-slate-400";
export const textareaClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-slate-400";
export const selectClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
export const checkboxClass = "h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200";
export const radioClass = "h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-200";
export const cardClass = "w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm";
export const chipClass = "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700";
export const actionButtonBase = "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold transition";
export const actionButtonEdit = `${actionButtonBase} bg-blue-50 text-blue-700 hover:bg-blue-100`;
export const actionButtonDelete = `${actionButtonBase} bg-rose-50 text-rose-700 hover:bg-rose-100`;
export const linkClass = "text-blue-600 text-sm font-medium hover:underline break-all";
export const listHeaderClass = "flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between";
export const listContentClass = "min-w-0";
export const listActionsClass = "flex shrink-0 flex-wrap gap-2";

// Form State Interfaces
export interface CategoryFormState {
    name: string;
}

export interface SkillFormState {
    name: string;
    parent: number | null;
    category: number | null;
}

export interface ProjectFormState {
    name: string;
    description: string;
    isCompleted: boolean;
    selectedSkills: number[];
    content: string | null;
}

export interface LearningFormState {
    title: string;
    url: string | null;
    description: string;
    isCompleted: boolean;
    selectedSkills: number[];
}

export interface ActivityFormState {
    title: string;
    type: string;
    organization: string;
    description: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    selectedSkills: number[];
}

export interface UserFormState {
    name: string;
    email: string;
    phoneNumber: string;
    linkedinUrl: string;
    githubUrl: string;
    personalWebsite: string;
    description: string;
}
