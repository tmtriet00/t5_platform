import { EditButton, ShowButton } from "@refinedev/antd";
import { Space, Tag, Button, message } from "antd";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import { useMemo, useCallback, useState } from "react";
import { Task } from "../../interfaces";
import { useCreate, useUpdate } from "@refinedev/core";
import { FilterOutlined } from "@ant-design/icons";
import { Segmented } from "antd";

interface TaskListTableProps {
    rowData: Task[];
    isLoading: boolean;
    projectId?: number;
}

const CreateButton = (props: any) => {
    return <div className="p-2">
        <Button type="primary" onClick={props.onCreate}>Create</Button>
    </div>;
}

export const TaskListTable: React.FC<TaskListTableProps> = ({ rowData, isLoading, projectId }) => {
    const { mutate: mutateCreate } = useCreate();
    const { mutate: mutateUpdate } = useUpdate();
    const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

    const handleCreate = useCallback(() => {
        mutateCreate({
            resource: "tasks",
            values: {
                name: "New Task",
                project_id: projectId ?? null,
                status: "new",
                risk_type: "low"
            },
            successNotification: (data: any) => {
                return {
                    message: `Successfully created task`,
                    description: "Success with no errors",
                    type: "success",
                };
            },
        });
    }, [mutateCreate, projectId]);

    const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
        const { data, colDef, newValue } = event;
        // Fields that can be edited: name, risk_type, status, task_type
        if (['name', 'risk_type', 'status', 'task_type'].includes(colDef.field || '')) {
            mutateUpdate({
                resource: "tasks",
                id: data.id,
                values: {
                    [colDef.field!]: newValue,
                },
                // mutationMode: "optimistic",
            }, {
                onSuccess: () => {
                    // Optional: Silent success or small notification
                },
                onError: () => {
                    message.error("Failed to update task");
                }
            });
        }
    }, [mutateUpdate]);

    const columnDefs = useMemo<ColDef<Task>[]>(() => [
        {
            field: "id",
            headerName: "ID",
            sortable: true,
            filter: true,
            width: 80
        },
        {
            field: "name",
            headerName: "Name",
            flex: 2,
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
            field: "task_type",
            headerName: "Type",
            sortable: true,
            filter: true,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['work', 'break'],
            },
            width: 100,
            cellRenderer: (params: any) => {
                if (!params.value) return <Tag color="blue">work</Tag>;
                return <Tag color={params.value === 'break' ? 'orange' : 'blue'}>{params.value}</Tag>;
            }
        },
        {
            field: "risk_type",
            headerName: "Risk Type",
            sortable: true,
            filter: true,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['low', 'medium', 'high'],
            },
            width: 120
        },
        {
            field: "status",
            headerName: "Status",
            sortable: true,
            filter: true,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['new', 'in_progress', 'completed', 'canceled', 'blocked']
            },
            width: 120,
            cellRenderer: (params: any) => {
                if (!params.value) return null;
                let color = "default";
                switch (params.value) {
                    case "completed":
                        color = "green";
                        break;
                    case "in_progress": // Fixed typo: in-progress -> in_progress to match values
                        color = "processing";
                        break;
                    case "new":
                        color = "blue";
                        break;
                    case "blocked":
                        color = "red";
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
            width: 100,
            sortable: false,
            filter: false
        }
    ], []);

    const defaultColDef = useMemo(() => ({
        resizable: true,
    }), []);

    const statusBar = useMemo(() => ({
        statusPanels: [
            {
                statusPanel: CreateButton,
                align: 'left',
                statusPanelParams: {
                    onCreate: handleCreate
                }
            }
        ]
    }), [handleCreate]);

    return (
        <div style={{ height: 600, width: '100%' }}>
            <Segmented
                options={[
                    { label: 'List', value: 'list', icon: <FilterOutlined /> },
                    { label: 'Timeline', value: 'timeline', icon: <FilterOutlined /> },
                ]}
                value={viewMode}
                onChange={(value) => setViewMode(value as 'list' | 'timeline')}
            />
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
                statusBar={statusBar}
            />
        </div>
    );
};
