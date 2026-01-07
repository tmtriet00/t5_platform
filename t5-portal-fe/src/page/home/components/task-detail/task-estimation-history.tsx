import { useList } from "@refinedev/core";
import { Table, Typography } from "antd";
import { TaskEstimation } from "interfaces";
import { formatDuration } from "utility/time";
import dayjs from "dayjs";

interface TaskEstimationHistoryProps {
    taskId: number;
}

export const TaskEstimationHistory: React.FC<TaskEstimationHistoryProps> = ({ taskId }) => {
    const { query } = useList<TaskEstimation>({
        resource: "task_estimations",
        filters: [
            {
                field: "task_id",
                operator: "eq",
                value: taskId,
            },
        ],
        sorters: [
            {
                field: "created_at",
                order: "desc",
            }
        ],
        queryOptions: {
            enabled: !!taskId,
        },
    });

    const estimations = query?.data?.data || [];

    const columns = [
        {
            title: "Created At",
            dataIndex: "created_at",
            key: "created_at",
            render: (value: string) => <Typography.Text>{dayjs(value).format("YYYY-MM-DD HH:mm:ss")}</Typography.Text>,
        },
        {
            title: "Estimation Time",
            dataIndex: "estimation_time",
            key: "estimation_time",
            render: (value: number) => <Typography.Text>{formatDuration(value)}</Typography.Text>,
        },
        {
            title: "Type",
            dataIndex: "estimation_type",
            key: "estimation_type",
            render: (value: string) => <Typography.Text style={{ textTransform: 'capitalize' }}>{value || 'Other'}</Typography.Text>,
        },
    ];

    return (
        <Table
            dataSource={estimations}
            columns={columns}
            rowKey="id"
            loading={query?.isLoading}
            pagination={false}
            size="small"
        />
    );
};
