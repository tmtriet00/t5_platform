import {
    List,
    EditButton,
    DeleteButton,
} from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Space } from "antd";
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useMemo } from "react";

import { TaskEstimation } from "interfaces";

export const TaskEstimationList: React.FC = () => {
    const { query } = useList<TaskEstimation>({
        resource: "task_estimations",
        meta: {
            select: "*, tasks(name)",
        },
        sorters: [
            {
                field: "id",
                order: "asc",
            },
        ],
    });

    const { data, isLoading } = query;
    const rowData = data?.data || [];

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            field: "id",
            headerName: "ID",
            sortable: true,
            filter: true
        },
        {
            field: "tasks.name",
            headerName: "Task",
            flex: 1,
            sortable: true,
            filter: true
        },
        {
            field: "estimation_time",
            headerName: "Estimation Time",
            width: 150,
            sortable: true,
            filter: true
        },
        {
            headerName: "Actions",
            field: "id",
            cellRenderer: (params: any) => {
                return (
                    <Space>
                        <EditButton hideText size="small" recordItemId={params.value} />
                        <DeleteButton hideText size="small" recordItemId={params.value} />
                    </Space>
                );
            },
            width: 120,
            sortable: false,
            filter: false
        }
    ], []);

    const defaultColDef = useMemo(() => ({
        resizable: true,
    }), []);

    return (
        <List>
            <div style={{ height: 600, flex: 1 }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    paginationPageSize={10}
                    loading={isLoading}
                    sideBar={{
                        toolPanels: ['columns', 'filters'],
                        hiddenByDefault: false
                    }}
                />
            </div>
        </List>
    );
};
