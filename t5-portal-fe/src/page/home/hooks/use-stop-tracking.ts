import { useCreate, useList, useUpdate, useDataProvider, useInvalidate } from "@refinedev/core";
import { Task, TimeEntry } from "interfaces";
import { useQueryClient } from "@tanstack/react-query";

export const useStopTrackingTask = () => {
    const dataProvider = useDataProvider();
    const invalidate = useInvalidate();
    const queryClient = useQueryClient();

    const { mutate: updateMutate, mutation: updateMutation } = useUpdate<TimeEntry>({
        resource: 'time_entries',
        mutationOptions: {
            onSuccess: () => {
                invalidate({
                    resource: 'tasks',
                    invalidates: ['all'],
                });
                invalidate({
                    resource: 'time_entries',
                    invalidates: ['list'],
                });
                queryClient.invalidateQueries({
                    queryKey: ['list_task_tracked_by_date'],
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