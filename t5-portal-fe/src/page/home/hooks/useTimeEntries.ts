import { useState, useEffect } from 'react';
import { useList } from '@refinedev/core';
import { TimeEntry, Task, Project, TaskGroup, TaskWithDuration } from '../components/types';

interface UseTimeEntriesReturn {
    groups: TaskGroup[];
    weekTotal: string;
    loading: boolean;
    error: Error | null;
}

// Helper function to format duration in hours:minutes
const formatDuration = (milliseconds: number): string => {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

// Helper function to calculate duration between two timestamps
const calculateDuration = (startTime: string, endTime: string | null): number => {
    if (!endTime) return 0; // Running timer, no duration yet
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return end - start;
};

// Helper function to format time for display (e.g., "1:00 PM")
const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

// Helper function to get date label (Today, Yesterday, or date)
const getDateLabel = (timestamp: string): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time parts for comparison
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === yesterday.getTime()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const useTimeEntries = (): UseTimeEntriesReturn => {
    const [groups, setGroups] = useState<TaskGroup[]>([]);
    const [weekTotal, setWeekTotal] = useState<string>('0:00');

    // Use refine's useList hook for data fetching
    // Based on type definitions, useList returns { query, result } in this setup
    const { query } = useList<any>({
        resource: 'time_entries',
        sorters: [
            {
                field: 'start_time',
                order: 'desc',
            },
        ],
        meta: {
            select: `
                id,
                description,
                task_id,
                tags,
                start_time,
                end_time,
                task:tasks (
                    id,
                    name,
                    project_id,
                    project:projects (
                        id,
                        name,
                        color
                    )
                )
            `,
        },
        pagination: {
            mode: "off",
        }
    });

    const { data: listData, isLoading, isError, error } = query;
    const data = listData; // Alias to match previous logic

    useEffect(() => {
        if (!data?.data) {
            setGroups([]);
            setWeekTotal('0:00');
            return;
        }

        const entries = data.data;

        if (entries.length === 0) {
            setGroups([]);
            setWeekTotal('0:00');
            return;
        }

        // Process entries: group by task, calculate durations
        const taskMap = new Map<number, TaskWithDuration>();
        let totalWeekDuration = 0;

        entries.forEach((entry: any) => {
            const duration = calculateDuration(entry.start_time, entry.end_time);
            totalWeekDuration += duration;

            // Handle potential missing task (though schema should enforce it, UI might be cleaner if we check)
            if (!entry.task) return;

            const taskId = entry.task.id;

            if (!taskMap.has(taskId)) {
                taskMap.set(taskId, {
                    id: taskId,
                    name: entry.task.name,
                    project: entry.task.project,
                    tags: [], // Initialize tags
                    totalDuration: '0:00',
                    timeEntries: [],
                    startTime: '',
                    endTime: '',
                });
            }

            const taskData = taskMap.get(taskId)!;
            taskData.timeEntries.push(entry);

            // Merge unique tags
            if (entry.tags) {
                entry.tags.forEach((tag: string) => {
                    if (!taskData.tags.includes(tag)) {
                        taskData.tags.push(tag);
                    }
                });
            }
        });

        // Calculate aggregated data for each task
        taskMap.forEach((task) => {
            let totalTaskDuration = 0;
            let earliestStartStr: string | null = null;
            let latestEndStr: string | null = null;

            task.timeEntries.forEach((entry) => {
                const duration = calculateDuration(entry.start_time, entry.end_time);
                totalTaskDuration += duration;

                const startDate = new Date(entry.start_time);
                const endDate = entry.end_time ? new Date(entry.end_time) : null;

                if (!earliestStartStr || startDate < new Date(earliestStartStr)) {
                    earliestStartStr = entry.start_time;
                }
                if (endDate && entry.end_time && (!latestEndStr || endDate > new Date(latestEndStr))) {
                    latestEndStr = entry.end_time;
                }
            });

            task.totalDuration = formatDuration(totalTaskDuration);
            task.startTime = earliestStartStr ? formatTime(earliestStartStr) : '';
            task.endTime = latestEndStr ? formatTime(latestEndStr) : '';
        });

        // Group tasks by date
        const dateGroups = new Map<string, TaskWithDuration[]>();

        taskMap.forEach((task) => {
            // Use the earliest time entry for date grouping - assuming tasks belong to one day mostly or standard logic
            // Ideally we group *entries* by date, then by task.
            // But preserving existing logic: "Use the earliest time entry for date grouping"
            if (task.timeEntries.length > 0) {
                const dateLabel = getDateLabel(task.timeEntries[0].start_time);

                if (!dateGroups.has(dateLabel)) {
                    dateGroups.set(dateLabel, []);
                }
                dateGroups.get(dateLabel)!.push(task);
            }
        });

        // Convert to TaskGroup array
        const taskGroups: TaskGroup[] = Array.from(dateGroups.entries()).map(([dateLabel, tasks]) => {
            let totalDayDuration = 0;

            tasks.forEach((task) => {
                task.timeEntries.forEach((entry) => {
                    totalDayDuration += calculateDuration(entry.start_time, entry.end_time);
                });
            });

            return {
                dateLabel,
                totalDuration: formatDuration(totalDayDuration),
                tasks,
            };
        });

        setGroups(taskGroups);
        setWeekTotal(formatDuration(totalWeekDuration));

    }, [data]);

    return {
        groups,
        weekTotal,
        loading: isLoading,
        error: error as Error | null
    };
};
