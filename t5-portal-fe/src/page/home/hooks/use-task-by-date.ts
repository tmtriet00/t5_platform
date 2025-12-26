import { useState, useEffect } from 'react';
import { HttpError, useList } from '@refinedev/core';
import { Task } from 'interfaces';
import { formatDuration, calculateDuration, formatTime, getDateLabel } from 'utility/time';
import dayjs from 'dayjs';

interface UseTaskByDateProps {
    date: string;
}

interface UseTaskByDateReturn {
    tasks: Task[];
    weekTotal: string;
    loading: boolean;
    error: Error | null;
}

export const useTaskByDate = (props: UseTaskByDateProps): UseTaskByDateReturn => {
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
                time_entries!inner (
                    id,
                    description,
                    tags,
                    start_time,
                    end_time
                )
            `,
        },
        filters: [
            {
                field: 'time_entries.start_time',
                operator: 'gte',
                value: dayjs(props.date).startOf('day').toISOString(),
            },
            {
                field: 'time_entries.start_time',
                operator: 'lte',
                value: dayjs(props.date).endOf('day').toISOString(),
            },
        ],
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
