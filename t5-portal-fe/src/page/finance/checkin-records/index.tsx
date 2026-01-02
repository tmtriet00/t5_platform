import { List } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { FinanceCheckinRecord } from "../../../interfaces";
import { FinanceCheckinRecordListTable } from "../../../components/finance/checkin-record-list-table";

export const FinanceCheckinRecordList: React.FC = () => {
    const { query } = useList<FinanceCheckinRecord>({
        resource: "finance_checkin_records",
        meta: {
            select: "*, ledger:ledgers(id, name)",
        },
        pagination: {
            mode: "off",
        },
        sorters: [
            {
                field: "created_at",
                order: "desc",
            },
        ],
    });

    const { data: listData, isLoading } = query;

    const rowData = listData?.data || [];

    return (
        <List>
            <FinanceCheckinRecordListTable
                rowData={rowData}
                isLoading={isLoading}
            />
        </List>
    );
};
