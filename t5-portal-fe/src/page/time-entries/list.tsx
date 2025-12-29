import { List } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { TimeEntryListTable } from "../../components/time-entries/time-entry-list-table";
import { TimeEntry } from "interfaces";



export const TimeEntryList: React.FC = () => {
    const { query } = useList<TimeEntry>({
        resource: "time_entries",
        meta: {
            select: "*, task:tasks(id, name)",
        },
        pagination: {
            mode: "off",
        },
        sorters: [
            {
                field: "start_time",
                order: "desc",
            },
        ],
    });

    const { data, isLoading } = query;
    const rowData = data?.data || [];

    return (
        <List>
            <TimeEntryListTable rowData={rowData} isLoading={isLoading} />
        </List>
    );
};
