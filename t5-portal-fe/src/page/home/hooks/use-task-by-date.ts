import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from 'utility';
import { Task } from 'interfaces';
import { formatDuration } from 'utility/time';
import { TaskSummaryDto } from 'interfaces/dto/task';

export const useTaskByDate = (props: { date: string }) => {
    const { data: tasks, isLoading, error } = useQuery<TaskSummaryDto[], Error>({
        queryKey: ['list_task_tracked_by_date', props.date],
        queryFn: async () => {
            const { data, error } = await supabaseClient.rpc("list_task_tracked_by_date", {
                input_date: props.date,
                timezone: "+07:00"
            });

            if (error) {
                throw error;
            }
            return data as TaskSummaryDto[];
        },
        enabled: !!props.date,
    });

    return {
        tasks: tasks || [],
        loading: isLoading,
        error: error as Error | null
    };
};
