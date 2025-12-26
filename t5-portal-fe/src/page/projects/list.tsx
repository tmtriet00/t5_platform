import {
    List,
    useTable,
    EditButton,
    ShowButton,
    getDefaultSortOrder,
} from "@refinedev/antd";
import { Table, Space, Tag } from "antd";

import { Project } from "interfaces";

export const ProjectList: React.FC = () => {
    const { tableProps, sorters } = useTable<Project>({
        sorters: {
            initial: [
                {
                    field: "id",
                    order: "asc",
                },
            ],
        },
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
                    key="color"
                    dataIndex="color"
                    title="Color"
                    render={(value) => <Tag color={value}>{value}</Tag>}
                />
                <Table.Column<Project>
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
