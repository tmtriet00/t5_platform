import { useCreate, useInvalidate } from "@refinedev/core";
import { Task, TimeEntry } from "interfaces";
import { useQueryClient } from "@tanstack/react-query";

export const useStartTrackingTask = () => {
    const invalidate = useInvalidate();
    const queryClient = useQueryClient();

    const { mutate: createMutate, mutation: createMutation } = useCreate<TimeEntry>({
        resource: 'time_entries',
        mutationOptions: {
            onSuccess: () => {
                invalidate({
                    resource: 'tasks',
                    invalidates: ['all'],
                });
                queryClient.invalidateQueries({
                    queryKey: ['list_task_tracked_by_date'],
                });
            },
        }
    });

    return {
        mutate: ({ task }: { task: Task }) => {
            createMutate({
                values: {
                    task_id: task.id,
                    start_time: new Date().toISOString(),
                },
            });

        },
        mutation: createMutation,
    };
}
