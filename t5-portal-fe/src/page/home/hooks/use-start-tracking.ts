import { DataProvider, useCreate, useDataProvider, useInvalidate } from "@refinedev/core";
import { Task, TaskEstimation, TimeEntry } from "interfaces";
import { useQueryClient } from "@tanstack/react-query";
import { App, message } from 'antd';

const validateBeforeStartTracking = async ({ dataProviderInstance, task }: { dataProviderInstance: DataProvider, task: Task }) => {
    const { data: activeTimeEntries } = await dataProviderInstance.getList<TimeEntry>({
        resource: 'time_entries',
        filters: [
            { field: 'end_time', operator: 'null', value: null },
        ],
    });

    const { data: taskEstimations } = await dataProviderInstance.getList<TaskEstimation>({
        resource: 'task_estimations',
        filters: [
            { field: 'task_id', operator: 'eq', value: task.id },
        ],
    });

    if (activeTimeEntries?.length) {
        return {
            isValid: false,
            confirmObject: undefined,
            note: `You're having active time entry. Please stop it before starting a new one`,
        };
    }

    if (!taskEstimations?.length) {
        return {
            isValid: true,
            note: `You don't have estimation for this task. Please consider adding an estimation before starting to track`,
            confirmObject: ({ startTrack }: { startTrack: () => Promise<void> }) => {
                return {
                    title: 'Add estimation',
                    content: null,
                    onOk() {
                        startTrack()
                    },
                }
            }
        };
    }

    return {
        isValid: true,
        confirmObject: undefined,
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
            const { isValid, note, confirmObject } = await validateBeforeStartTracking({ dataProviderInstance, task });
            const startTrackingPayload = {
                task_id: task.id,
                start_time: new Date().toISOString(),
            }

            if (!isValid) {
                message.error(note);
                return;
            }

            if (confirmObject) {
                modal.confirm(confirmObject({
                    startTrack: async () => {
                        createMutate({ values: startTrackingPayload });
                    }
                }));
            } else {
                createMutate({ values: startTrackingPayload });
            }

        },
        mutation: createMutation,
    };
}
