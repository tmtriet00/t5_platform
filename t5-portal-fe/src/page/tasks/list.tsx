import {
    List,
    EditButton,
    ShowButton,
} from "@refinedev/antd";
import { useList, useUpdate } from "@refinedev/core";
import { Space, message } from "antd";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
import { useMemo } from "react";
import { Task } from "interfaces";
import { Tag } from "antd";

export const TaskList: React.FC = () => {
    const { query } = useList<Task>({
        resource: "tasks",
        meta: {
            select: "*, project:projects(id, name)",
        },
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


    const { mutate } = useUpdate();

    const rowData = data?.data || [];

    const onCellValueChanged = (event: CellValueChangedEvent) => {
        const { data, colDef, newValue } = event;
        if (colDef.field === 'name') {
            mutate({
                resource: "tasks",
                id: data.id,
                values: {
                    name: newValue,
                },
                mutationMode: "optimistic",
            }, {
                onSuccess: () => {
                    message.success("Task updated successfully");
                },
                onError: () => {
                    message.error("Failed to update task");
                }
            });
        }
    };

    const columnDefs = useMemo<ColDef<Task>[]>(() => [
        {
            field: "id",
            headerName: "ID",
            sortable: true,
            filter: true
        },
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            editable: true,
            sortable: true,
            filter: true
        },
        {
            field: "project.name",
            headerName: "Project",
            flex: 1,
            sortable: true,
            filter: true
        },
        {
            field: "risk_type",
            headerName: "Risk Type",
            sortable: true,
            filter: true,
            rowGroup: true
        },
        {
            field: "status",
            headerName: "Status",
            sortable: true,
            filter: true,
            cellRenderer: (params: any) => {
                if (!params.value) return null;
                let color = "grey"
                switch (params.value) {
                    case "completed":
                        color = "green";
                        break;
                    case "in-progress":
                        color = "yellow";
                        break;
                }

                return <Tag color={color}>{params.value}</Tag>;
            }
        },
        {
            headerName: "Actions",
            field: "id",
            cellRenderer: (params: any) => {
                return (
                    <Space>
                        <EditButton hideText size="small" recordItemId={params.value} />
                        <ShowButton hideText size="small" recordItemId={params.value} />
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
                    onCellValueChanged={onCellValueChanged}
                    sideBar={{
                        toolPanels: ['columns', 'filters'],
                        hiddenByDefault: false
                    }}
                />
            </div>
        </List>
    );
};
