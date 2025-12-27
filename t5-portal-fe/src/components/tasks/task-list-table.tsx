import { EditButton, ShowButton } from "@refinedev/antd";
import { Space, Tag } from "antd";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import { useMemo } from "react";
import { Task } from "../../interfaces";
import { Button } from "antd";

interface TaskListTableProps {
    rowData: Task[];
    isLoading: boolean;
    onCellValueChanged?: (event: CellValueChangedEvent) => void;
}

const CreateButton = () => {
    return <div className="p-2">
        <Button type="primary">Create</Button>
    </div>;
}

export const TaskListTable: React.FC<TaskListTableProps> = ({ rowData, isLoading, onCellValueChanged }) => {
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
        <div style={{ height: 600, width: '100%' }}>
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
                statusBar={{
                    statusPanels: [
                        {
                            statusPanel: CreateButton,
                            align: 'left'
                        }
                    ]
                }}
            />
        </div>
    );
};
