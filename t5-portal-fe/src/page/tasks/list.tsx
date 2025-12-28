import {
    List,
} from "@refinedev/antd";
import { useList } from "@refinedev/core";
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

    const rowData = data?.data || [];

    return (
        <List>
            <TaskListTable
                rowData={rowData}
                isLoading={isLoading}
            />
        </List>
    );
};
