import { useState, useEffect } from 'react';
import { HttpError, useList } from '@refinedev/core';
import { TimeEntry, Task, Project, TaskGroup, TaskWithDuration } from '../components/types';
import { formatDuration, calculateDuration, formatTime, getDateLabel } from 'utility/time';

interface UseTaskByDateReturn {
    tasks: Task[];
    weekTotal: string;
    loading: boolean;
    error: Error | null;
}

export const useTaskByDate = (): UseTaskByDateReturn => {
    const [weekTotal, setWeekTotal] = useState<string>('0:00');
    const [tasks, setTasks] = useState<Task[]>([]);

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
            setWeekTotal('0:00');
            return;
        }

        setTasks(data.data);

    }, [data]);

    return {
        tasks,
        weekTotal,
        loading: isLoading,
        error: error as Error | null
    };
};
