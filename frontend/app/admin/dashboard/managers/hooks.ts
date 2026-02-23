import { useState, useCallback } from 'react';
import { SkillRead, CategoryRead } from '@/app/page';
import { API_URL } from './shared';

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
