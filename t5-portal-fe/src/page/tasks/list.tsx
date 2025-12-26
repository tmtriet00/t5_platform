import {
    List,
    useTable,
    EditButton,
    ShowButton,
    getDefaultSortOrder,
    FilterDropdown,
    useSelect,
} from "@refinedev/antd";
import { Table, Space, Select } from "antd";

import { Task, Project } from "interfaces";

export const TaskList: React.FC = () => {
    const { tableProps, sorters } = useTable<Task>({
        sorters: {
            initial: [
                {
                    field: "id",
                    order: "asc",
                },
            ],
        },
        meta: {
            select: "*, project:projects(id, name)",
        },
    });

    const { selectProps } = useSelect<Project>({
        resource: "projects",
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
                <Table.Column key="name" dataIndex="name" title="Name" sorter />
                <Table.Column
                    key="project_id"
                    dataIndex={["project", "name"]}
                    title="Project"
                    defaultSortOrder={getDefaultSortOrder("project.name", sorters)}
                    filterDropdown={(props) => (
                        <FilterDropdown {...props}>
                            <Select
                                className="min-w-[200px]"
                                mode="multiple"
                                placeholder="Select Project"
                                {...selectProps}
                            />
                        </FilterDropdown>
                    )}
                />
                <Table.Column<Task>
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record) => (
                        <Space>
                            <EditButton hideText size="small" recordItemId={record.id} />
                            <ShowButton hideText size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};
