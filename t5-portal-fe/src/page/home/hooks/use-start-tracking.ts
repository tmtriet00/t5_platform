import { DataProvider, useCreate, useDataProvider, useInvalidate } from "@refinedev/core";
import { Task, TimeEntry } from "interfaces";
import { useQueryClient } from "@tanstack/react-query";
import { App, message } from 'antd';

const validateBeforeStartTracking = async ({ task, dataProviderInstance }: { task: Task, dataProviderInstance: DataProvider }) => {
    const { data: activeTimeEntries } = await dataProviderInstance.getList<TimeEntry>({
        resource: 'time_entries',
        filters: [
            { field: 'end_time', operator: 'null', value: null },
        ],
    });

    if (activeTimeEntries?.length) {
        return {
            isValid: false,
            requireConfirm: false,
            note: `You're having active time entry. Please stop it before starting a new one`,
        };
    }


    return {
        isValid: true,
        requireConfirm: false,
        note: 'You can start tracking this task',
    };
}

export const useStartTrackingTask = () => {
    const invalidate = useInvalidate();
    const queryClient = useQueryClient();
    const { modal, message } = App.useApp();
    const dataProvider = useDataProvider();
    const dataProviderInstance = dataProvider();



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
        mutate: async ({ task }: { task: Task }) => {
            const { isValid, note, requireConfirm } = await validateBeforeStartTracking({ task, dataProviderInstance });
            const startTrackingPayload = {
                task_id: task.id,
                start_time: new Date().toISOString(),
            }

            if (!isValid) {
                message.error(note);
                return;
            }

            if (requireConfirm) {
                modal.confirm({
                    title: 'Need confirmation',
                    content: note,
                    onOk() {
                        createMutate({ values: startTrackingPayload });
                    },
                });
            } else {
                createMutate({ values: startTrackingPayload });
            }

        },
        mutation: createMutation,
    };
}
