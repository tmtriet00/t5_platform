import {
    List,
} from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Configuration } from "../../interfaces";
import { ConfigurationListTable } from "../../components/configurations/configuration-list-table";

export const ConfigurationList: React.FC = () => {
    const { query } = useList<Configuration>({
        resource: "configurations",
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
            <ConfigurationListTable
                rowData={rowData}
                isLoading={isLoading}
            />
        </List>
    );
};
