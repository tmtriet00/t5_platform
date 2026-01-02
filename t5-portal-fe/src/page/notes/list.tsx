
import {
    List,
    EditButton,
    DeleteButton,
    DateField,
} from "@refinedev/antd";
import { Table, Space } from "antd";
import { useTable } from "@refinedev/antd";
import { Note } from "interfaces";

export const NoteList: React.FC = () => {
    const { tableProps } = useTable<Note>({
        syncWithLocation: true,
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title="ID" />
                <Table.Column dataIndex="title" title="Title" />
                <Table.Column
                    dataIndex="content"
                    title="Content"
                    render={(value: string) => {
                        if (!value) return "-";
                        return value.length > 50 ? value.substring(0, 50) + "..." : value;
                    }}
                />
                <Table.Column
                    dataIndex={["created_at"]}
                    title="Created At"
                    render={(value: any) => <DateField value={value} />}
                />
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: Note) => (
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
