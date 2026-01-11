import { EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Space, Tag, Button, message } from "antd";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import { useMemo, useCallback, useState } from "react";
import { Task } from "../../interfaces";
import { useCreate, useUpdate, useSelect } from "@refinedev/core";
import { FilterOutlined } from "@ant-design/icons";
import { Segmented } from "antd";
import dayjs from "dayjs";

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
    const [filterType, setFilterType] = useState<string>('high_risk');

    const filteredData = useMemo(() => {
        if (!rowData) return [];

        return rowData.filter((task) => {
            if (filterType === 'all') return true;

            const isCompleted = task.status === 'completed';

            // Risk filters (High, Medium, Low) - exclude completed tasks
            if (filterType === 'high_risk') return task.risk_type === 'high' && !isCompleted;
            if (filterType === 'medium_risk') return task.risk_type === 'medium' && !isCompleted;
            if (filterType === 'low_risk') return task.risk_type === 'low' && !isCompleted;

            // Status filters
            if (filterType === 'in_progress') return task.status === 'in_progress';
            if (filterType === 'completed') return task.status === 'completed';

            return true;
        });
    }, [rowData, filterType]);

    const { options } = useSelect({
        resource: "projects",
        optionLabel: "name",
        optionValue: "id",
    });

    const projectSelect = useMemo(() => {
        const projectOptions = options || [];
        return {
            names: projectOptions.map((p) => p.label),
            map: new Map(projectOptions.map((p) => [p.label, p.value])),
        };
    }, [options]);

    const handleCreate = useCallback(() => {
        let defaultRisk = "low";
        let defaultStatus = "new";

        if (filterType === 'high_risk') defaultRisk = "high";
        else if (filterType === 'medium_risk') defaultRisk = "medium";
        else if (filterType === 'low_risk') defaultRisk = "low";

        if (filterType === 'in_progress') defaultStatus = "in_progress";

        mutateCreate({
            resource: "tasks",
            values: {
                name: "New Task",
                project_id: projectId ?? null,
                status: defaultStatus,
                risk_type: defaultRisk
            },
            successNotification: () => {
                return {
                    message: `Successfully created task`,
                    description: "Success with no errors",
                    type: "success",
                };
            },
        });
    }, [mutateCreate, projectId, filterType]);

    const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
        const { data, colDef, newValue } = event;
        // Fields that can be edited: name, risk_type, status, task_type, remaining_time, priority_score, due_time, start_time, rrule
        if (['name', 'risk_type', 'status', 'task_type', 'remaining_time', 'priority_score', 'due_time', 'start_time', 'rrule'].includes(colDef.field || '')) {
            let valueToUpdate = newValue;
            if (colDef.field === 'due_time' || colDef.field === 'start_time') {
                valueToUpdate = newValue ? dayjs(newValue).toISOString() : null;
            }
            mutateUpdate({
                resource: "tasks",
                id: data.id,
                values: {
                    [colDef.field!]: valueToUpdate,
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
        } else if (colDef.field === 'project.name') {
            const newProjectId = projectSelect.map.get(newValue) as number | undefined;
            if (newProjectId !== undefined) {
                mutateUpdate({
                    resource: "tasks",
                    id: data.id,
                    values: {
                        project_id: newProjectId,
                    },
                }, {
                    onError: () => {
                        message.error("Failed to update project");
                    }
                });
            }
        }
    }, [mutateUpdate, projectSelect]);

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
            filter: true,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: projectSelect.names,
            },
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
            field: "start_time",
            headerName: "Start Time",
            width: 200,
            sortable: true,
            filter: true,
            editable: true,
            valueGetter: (params) => {
                if (!params.data || !params.data.start_time) return '';
                return dayjs(params.data.start_time).format('YYYY-MM-DD HH:mm:ss');
            },
        },
        {
            field: "due_time",
            headerName: "Due Time",
            width: 200,
            sortable: true,
            filter: true,
            editable: true,
            valueGetter: (params) => {
                if (!params.data || !params.data.due_time) return '';
                return dayjs(params.data.due_time).format('YYYY-MM-DD HH:mm:ss');
            },
        },
        {
            field: "rrule",
            headerName: "RRule",
            width: 150,
            sortable: true,
            filter: true,
            editable: true,
        },
        {
            field: "remaining_time",
            headerName: "Remaining Time",
            width: 150,
            sortable: true,
            filter: true,
            editable: true,
        },
        {
            field: "priority_score",
            headerName: "Priority Score",
            width: 130,
            sortable: true,
            filter: true,
            editable: true,
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
                    case "canceled":
                        color = "default";
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
                        <DeleteButton hideText size="small" recordItemId={params.value} />
                    </Space>
                );
            },
            width: 100,
            sortable: false,
            filter: false
        }
    ], [projectSelect]);

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
                    { label: 'High Risk', value: 'high_risk' },
                    { label: 'Medium Risk', value: 'medium_risk' },
                    { label: 'Low Risk', value: 'low_risk' },
                    { label: 'In Progress Task', value: 'in_progress' },
                    { label: 'Completed Task', value: 'completed' },
                    { label: 'All Task', value: 'all' },
                ]}
                value={filterType}
                onChange={(value) => setFilterType(value as string)}
            />
            <AgGridReact
                rowData={filteredData}
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
