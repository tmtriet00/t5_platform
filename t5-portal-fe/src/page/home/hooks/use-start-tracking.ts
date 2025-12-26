import { useCreate, useInvalidate } from "@refinedev/core";
import { Task, TimeEntry } from "interfaces";

export const useStartTrackingTask = () => {
    const invalidate = useInvalidate();
    const { mutate: createMutate, mutation: createMutation } = useCreate<TimeEntry>({
        resource: 'time_entries',
        mutationOptions: {
            onSuccess: () => {
                invalidate({
                    resource: 'tasks',
                    invalidates: ['all'],
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
