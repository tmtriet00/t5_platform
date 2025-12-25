import { useState, useEffect } from 'react';
import { supabaseClient } from '../../../utility';
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
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchTimeEntries = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch time entries with related task and project data
                const { data: entries, error: fetchError } = await supabaseClient
                    .from('time_entries')
                    .select(`
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
          `)
                    .order('start_time', { ascending: false });

                if (fetchError) throw fetchError;

                if (!entries || entries.length === 0) {
                    setGroups([]);
                    setWeekTotal('0:00');
                    setLoading(false);
                    return;
                }

                // Process entries: group by task, calculate durations
                const taskMap = new Map<number, TaskWithDuration>();
                let totalWeekDuration = 0;

                entries.forEach((entry: any) => {
                    const duration = calculateDuration(entry.start_time, entry.end_time);
                    totalWeekDuration += duration;

                    const taskId = entry.task.id;

                    if (!taskMap.has(taskId)) {
                        taskMap.set(taskId, {
                            id: taskId,
                            name: entry.task.name,
                            project: entry.task.project,
                            tags: [],
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
                    // Use the earliest time entry for date grouping
                    const dateLabel = getDateLabel(task.timeEntries[0].start_time);

                    if (!dateGroups.has(dateLabel)) {
                        dateGroups.set(dateLabel, []);
                    }
                    dateGroups.get(dateLabel)!.push(task);
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
            } catch (err) {
                console.error('Error fetching time entries:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchTimeEntries();
    }, []);

    return { groups, weekTotal, loading, error };
};
