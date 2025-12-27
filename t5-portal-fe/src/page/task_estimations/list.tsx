import {
    List,
    useTable,
    EditButton,
    getDefaultSortOrder,
    FilterDropdown,
    useSelect,
    DeleteButton,
} from "@refinedev/antd";
import { Table, Space, Select } from "antd";

import { TaskEstimation, Task } from "interfaces";

export const TaskEstimationList: React.FC = () => {
    const { tableProps, sorters } = useTable<TaskEstimation>({
        sorters: {
            initial: [
                {
                    field: "id",
                    order: "asc",
                },
            ],
        },
        meta: {
            select: "*, tasks(name)",
        },
    });

    const { selectProps } = useSelect<Task>({
        resource: "tasks",
        optionLabel: "name",
        optionValue: "id",
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column
                    key="id"
                    dataIndex="id"
                    title="ID"
                    sorter
                    defaultSortOrder={getDefaultSortOrder("id", sorters)}
                />
                <Table.Column
                    key="task_id"
                    dataIndex={["tasks", "name"]}
                    title="Task"
                    filterDropdown={(props) => (
                        <FilterDropdown {...props}>
                            <Select
                                style={{ minWidth: 200 }}
                                mode="multiple"
                                placeholder="Select Task"
                                {...selectProps}
                            />
                        </FilterDropdown>
                    )}
                />
                <Table.Column key="estimation_time" dataIndex="estimation_time" title="Estimation Time" sorter />
                <Table.Column<TaskEstimation>
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record) => (
                        <Space>
                            <EditButton hideText size="small" recordItemId={record.id} />
                            <DeleteButton hideText size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};
