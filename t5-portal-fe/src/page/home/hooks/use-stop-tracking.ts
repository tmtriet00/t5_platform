import { useCreate, useList, useUpdate, useDataProvider, useInvalidate } from "@refinedev/core";
import { Task, TimeEntry } from "interfaces";

export const useStopTrackingTask = () => {
    const dataProvider = useDataProvider();
    const invalidate = useInvalidate();
    const { mutate: updateMutate, mutation: updateMutation } = useUpdate<TimeEntry>({
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
        mutate: async ({ task }: { task: Task }) => {
            const { data } = await dataProvider().getList<TimeEntry>({
                resource: 'time_entries',
                filters: [
                    { field: 'end_time', operator: 'null', value: null },
                    { field: 'task_id', operator: 'eq', value: task.id },
                ],
            });

            if (data.length > 0) {
                updateMutate({
                    id: data[0].id,
                    values: {
                        end_time: new Date().toISOString(),
                    },
                });
            }
        },
        mutation: updateMutation,
    };
}