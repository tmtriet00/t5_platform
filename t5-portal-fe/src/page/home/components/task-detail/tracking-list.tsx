import React from "react";
import { useTable, DeleteButton } from "@refinedev/antd";
import { Table, Space } from "antd";
import { TimeEntry } from "interfaces/model/time-entry";
import { formatDuration } from "utility/time";
import dayjs from "dayjs";

interface TrackingListProps {
    taskId: string;
}

export const TrackingList: React.FC<TrackingListProps> = ({ taskId }) => {
    const { tableProps } = useTable<TimeEntry>({
        resource: "time_entries",
        syncWithLocation: false,
        filters: {
            permanent: [
                {
                    field: "task_id",
                    operator: "eq",
                    value: taskId,
                },
            ],
        },
        sorters: {
            initial: [
                {
                    field: "start_time",
                    order: "desc",
                },
            ],
        },
    });

    const columns = [
        {
            title: "Start Time",
            dataIndex: "start_time",
            key: "start_time",
            render: (value: string) => value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-",
        },
        {
            title: "End Time",
            dataIndex: "end_time",
            key: "end_time",
            render: (value: string) => value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-",
        },
        {
            title: "Duration",
            key: "duration",
            render: (_: any, record: TimeEntry) => {
                if (!record.end_time) return "Running...";
                const start = dayjs(record.start_time);
                const end = dayjs(record.end_time);
                const diffInSeconds = end.diff(start, "second");
                return formatDuration(diffInSeconds);
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_: any, record: TimeEntry) => (
                <Space size="middle">
                    <DeleteButton hideText size="small" recordItemId={record.id} resource="time_entries" />
                </Space>
            ),
        },
    ];

    return (
        <Table
            {...tableProps}
            columns={columns}
            rowKey="id"
            pagination={{
                ...tableProps.pagination,
                pageSize: 5,
                showSizeChanger: false,
            }}
        />
    );
};
