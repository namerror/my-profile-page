import Link from 'next/link';
import { ActivityRead } from "@/app/page";
import { SkillRead } from "@/app/page";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function compareDateDesc(a?: string | null, b?: string | null) {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    return new Date(b).getTime() - new Date(a).getTime();
}

function sortActivities(list: ActivityRead[]) {
    return [...list].sort((a, b) => {
        if (a.is_current !== b.is_current) return a.is_current ? -1 : 1;
        if (a.is_current && b.is_current) {
            return compareDateDesc(a.start_date, b.start_date);
        }
        const byEnd = compareDateDesc(a.end_date, b.end_date);
        if (byEnd !== 0) return byEnd;
        return compareDateDesc(a.start_date, b.start_date);
    });
}

function formatDate(date?: string | null) {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

async function fetchActivities(): Promise<ActivityRead[]> {
    const res = await fetch(`${API_URL}/activities/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load activities');
    return res.json();
}

export default async function ActivitiesPage() {
    let activities: ActivityRead[] = [];
    try {
        activities = await fetchActivities();
    } catch (e) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-4">Activities</h1>
                <div className="p-4 rounded bg-red-100 text-red-700">Failed to load activities.</div>
            </div>
        );
    }

    const sorted = sortActivities(activities);

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className='mb-6'>
                <h1 className="text-3xl font-bold text-center mb-2">Activities</h1>
                <p className='text-center text-gray-600'>Follow my current and past activities</p>
            </div>
            

            {sorted.length === 0 ? (
                <p className="text-gray-600">No activities yet.</p>
            ) : (
                <div className="space-y-4">
                    {sorted.map((activity) => {
                        const start = formatDate(activity.start_date);
                        const end = activity.is_current ? 'Present' : formatDate(activity.end_date);
                        return (
                            <div
                                key={activity.id}
                                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex flex-wrap items-start gap-3 justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-semibold">{activity.title}</h2>
                                            <span
                                                className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 capitalize"
                                            >
                                                {activity.type}
                                            </span>
                                            {activity.is_current && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                    Currently active
                                                </span>
                                            )}
                                        </div>
                                        {activity.organization && (
                                            <p className="text-sm text-gray-600 mt-1">{activity.organization}</p>
                                        )}
                                        {(start || end) && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                {start || '—'} {start || end ? '–' : ''} {end || '—'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {activity.description && (
                                    <p className="text-gray-700 mt-3 whitespace-pre-wrap">{activity.description}</p>
                                )}

                                {activity.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {activity.skills.map((skill) => (
                                            <span
                                                key={skill.id}
                                                className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                                            >
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}