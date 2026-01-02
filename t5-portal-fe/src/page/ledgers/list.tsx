import { List } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { LedgerTable } from "../../components/ledgers/ledger-table";

export const LedgerList = () => {
    const { query } = useList({
        resource: "ledgers",
        sorters: [
            {
                field: "created_at",
                order: "desc",
            },
        ],
    });

    const { data, isLoading } = query;

    return (
        <List>
            <LedgerTable rowData={data?.data || []} isLoading={isLoading} />
        </List>
    );
};
