import {
    List,
    useTable,
    EditButton,
    DeleteButton,
    DateField,
} from "@refinedev/antd";
import { Table, Space } from "antd";
import { EmergencyKit } from "interfaces";

export const EmergencyKitList: React.FC = () => {
    const { tableProps } = useTable<EmergencyKit>({
        syncWithLocation: true,
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title="ID" />
                <Table.Column
                    dataIndex="created_at"
                    title="Created At"
                    render={(value) => <DateField value={value} format="YYYY-MM-DD HH:mm" />}
                />
                {/* BlockNote content is JSON, probably not suitable for direct display in table. 
                     Maybe just show a snippet or "View Detail" */}
                {/* <Table.Column dataIndex="reason" title="Reason" /> */}

                <Table.Column<EmergencyKit>
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
