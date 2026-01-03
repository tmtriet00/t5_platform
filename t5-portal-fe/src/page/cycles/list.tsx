import {
    List,
} from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Cycle } from "../../interfaces";
import { CycleListTable } from "../../components/cycles/cycle-list-table";

export const CycleList: React.FC = () => {
    const { query } = useList<Cycle>({
        resource: "cycles",
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
            <CycleListTable
                rowData={rowData}
                isLoading={isLoading}
            />
        </List>
    );
};
