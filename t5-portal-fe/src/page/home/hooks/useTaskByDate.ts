import { useState, useEffect } from 'react';
import { HttpError, useList } from '@refinedev/core';
import { TimeEntry, Task, Project, TaskGroup, TaskWithDuration } from '../components/types';
import { formatDuration, calculateDuration, formatTime, getDateLabel } from 'utility/time';

interface UseTaskByDateReturn {
    groups: TaskGroup[];
    weekTotal: string;
    loading: boolean;
    error: Error | null;
}

export const useTaskByDate = (): UseTaskByDateReturn => {
    const [groups, setGroups] = useState<TaskGroup[]>([]);
    const [weekTotal, setWeekTotal] = useState<string>('0:00');

    const { query } = useList<Task, HttpError>({
        resource: 'tasks',
        meta: {
            select: `
                id,
                name,
                project_id,
                project:projects (
                    id,
                    name,
                    color
                ),
                time_entries (
                    id,
                    description,
                    tags,
                    start_time,
                    end_time
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

        // Flatten tasks into entries to preserve existing logic
        const entries: TimeEntry[] = [];
        data.data.forEach((task) => {
            if (task.time_entries) {
                task.time_entries.forEach((entry) => {
                    entries.push({
                        ...entry,
                        task: {
                            id: task.id,
                            name: task.name,
                            project: task.project,
                            project_id: task.project_id
                        }
                    } as TimeEntry);
                });
            }
        });

        // Sort entries by start_time desc to match previous behavior
        entries.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

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
