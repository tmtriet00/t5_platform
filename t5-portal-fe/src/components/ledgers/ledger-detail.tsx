
import { Table, Button } from "antd";
import { useList } from "@refinedev/core";
import dayjs from "dayjs";
import { useRef } from "react";
import { AddTransactionModal, AddTransactionModalRef } from "../modals";

interface LedgerDetailProps {
    data: any;
}

export const LedgerDetail: React.FC<LedgerDetailProps> = ({ data }) => {
    const addTransactionModalRef = useRef<AddTransactionModalRef>(null);

    const { query } = useList({
        resource: "transactions",
        filters: [
            {
                field: "ledger_id",
                operator: "eq",
                value: data.id,
            },
        ],
        pagination: {
            mode: "off",
        },
        sorters: [
            {
                field: "created_at",
                order: "desc",
            },
        ]
    });

    const { data: transactionsData, isLoading } = query || {};

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            width: 100,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (value: string) => <span style={{ color: value === 'credit' ? 'green' : 'red', textTransform: 'capitalize' }}>{value}</span>
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
        },
    ];

    return (
        <div className="p-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h4 style={{ margin: 0 }}>Transactions</h4>
                <Button type="primary" size="small" onClick={() => addTransactionModalRef.current?.open(data.id)}>
                    Add Transaction
                </Button>
            </div>
            <Table
                loading={isLoading}
                dataSource={transactionsData?.data || []}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="small"
                scroll={{ y: 280 }}
            />
            <AddTransactionModal ref={addTransactionModalRef} />
        </div>
    );
};
