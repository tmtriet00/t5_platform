import {
    List,
    useTable,
    EditButton,
    ShowButton,
    DeleteButton,
    getDefaultSortOrder,
    FilterDropdown,
    useSelect,
    DateField,
} from "@refinedev/antd";
import { Table, Space, Select, Tag } from "antd";

import { TimeEntry, Task } from "interfaces";

export const TimeEntryList: React.FC = () => {
    const { tableProps, sorters } = useTable<TimeEntry>({
        sorters: {
            initial: [
                {
                    field: "start_time",
                    order: "desc",
                },
            ],
        },
        meta: {
            select: "*, task:tasks(id, name)",
        },
    });

    const { selectProps: taskSelectProps } = useSelect<Task>({
        resource: "tasks",
        optionLabel: "name",
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
                    key="description"
                    dataIndex="description"
                    title="Description"
                    sorter
                />
                <Table.Column
                    key="task_id"
                    dataIndex={["task", "name"]}
                    title="Task"
                    defaultSortOrder={getDefaultSortOrder("task.name", sorters)}
                    filterDropdown={(props) => (
                        <FilterDropdown {...props}>
                            <Select
                                className="min-w-[200px]"
                                mode="multiple"
                                placeholder="Select Task"
                                {...taskSelectProps}
                            />
                        </FilterDropdown>
                    )}
                />
                <Table.Column
                    key="start_time"
                    dataIndex="start_time"
                    title="Start Time"
                    render={(value) => <DateField value={value} format="YYYY-MM-DD HH:mm:ss" />}
                    sorter
                    defaultSortOrder={getDefaultSortOrder("start_time", sorters)}
                />
                <Table.Column
                    key="end_time"
                    dataIndex="end_time"
                    title="End Time"
                    render={(value) => value ? <DateField value={value} format="YYYY-MM-DD HH:mm:ss" /> : '-'}
                    sorter
                />
                <Table.Column
                    key="tags"
                    dataIndex="tags"
                    title="Tags"
                    render={(tags: string[]) => (
                        <>
                            {tags?.map((tag) => (
                                <Tag key={tag}>{tag}</Tag>
                            ))}
                        </>
                    )}
                />
                <Table.Column<TimeEntry>
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
