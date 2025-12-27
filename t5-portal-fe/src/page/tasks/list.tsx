import {
    List,
} from "@refinedev/antd";
import { useList, useUpdate } from "@refinedev/core";
import { message } from "antd";
import { CellValueChangedEvent } from 'ag-grid-community';
import { Task } from "interfaces";
import { TaskListTable } from "../../components/tasks/task-list-table";

export const TaskList: React.FC = () => {
    const { query } = useList<Task>({
        resource: "tasks",
        meta: {
            select: "*, project:projects(id, name)",
        },
        pagination: {
            mode: "off",
        },
        sorters: [
            {
                field: "id",
                order: "desc",
            },
        ],
    });

    const { data, isLoading } = query;


    const { mutate } = useUpdate();

    const rowData = data?.data || [];

    const onCellValueChanged = (event: CellValueChangedEvent) => {
        const { data, colDef, newValue } = event;
        if (colDef.field === 'name') {
            mutate({
                resource: "tasks",
                id: data.id,
                values: {
                    name: newValue,
                },
                mutationMode: "optimistic",
            }, {
                onSuccess: () => {
                    message.success("Task updated successfully");
                },
                onError: () => {
                    message.error("Failed to update task");
                }
            });
        }
    };

    return (
        <List>
            <TaskListTable
                rowData={rowData}
                isLoading={isLoading}
                onCellValueChanged={onCellValueChanged}
            />
        </List>
    );
};
