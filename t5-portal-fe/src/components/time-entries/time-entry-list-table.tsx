
import {
    EditButton,
    DeleteButton,
    DateField,
} from "@refinedev/antd";
import { useCreate, useUpdate, useSelect } from "@refinedev/core";
import { Space, Tag, Button, message } from "antd";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import { useMemo, useCallback } from "react";
import dayjs from "dayjs";

import { TimeEntry } from "interfaces";

interface TimeEntryListTableProps {
    rowData: TimeEntry[];
    isLoading: boolean;
}

const CreateButton = (props: any) => {
    return <div className="p-2">
        <Button type="primary" onClick={props.onCreate}>Create</Button>
    </div>;
}

export const TimeEntryListTable: React.FC<TimeEntryListTableProps> = ({ rowData, isLoading }) => {
    const { mutate: mutateCreate } = useCreate();
    const { mutate: mutateUpdate } = useUpdate();

    const { options } = useSelect({
        resource: "tasks",
        optionLabel: "name",
        optionValue: "id",
    });

    const taskSelect = useMemo(() => {
        const taskOptions = options || [];
        return {
            names: taskOptions.map((p) => p.label),
            map: new Map(taskOptions.map((p) => [p.label, p.value])),
        };
    }, [options]);

    const handleCreate = useCallback(() => {
        const defaultTaskId = options?.[0]?.value;
        if (!defaultTaskId) {
            message.error("No tasks available to create a time entry for.");
            return;
        }

        mutateCreate({
            resource: "time_entries",
            values: {
                start_time: dayjs().toISOString(),
                description: "",
                tags: [],
                task_id: defaultTaskId,
            },
            successNotification: () => {
                return {
                    message: `Successfully created time entry`,
                    description: "Success with no errors",
                    type: "success",
                };
            },
        });
    }, [mutateCreate, options]);

    const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
        const { data, colDef, newValue } = event;

        if (colDef.field === 'task.name') {
            const newTaskId = taskSelect.map.get(newValue);
            if (newTaskId !== undefined) {
                mutateUpdate({
                    resource: "time_entries",
                    id: data.id,
                    values: {
                        task_id: newTaskId,
                    },
                    successNotification: () => ({
                        message: `Successfully updated task`,
                        description: "Success with no errors",
                        type: "success",
                    }),
                }, {
                    onError: () => {
                        message.error("Failed to update task");
                    }
                });
            }
        } else if (['description', 'start_time', 'end_time'].includes(colDef.field || '')) {
            let valueToUpdate = newValue;

            if (['start_time', 'end_time'].includes(colDef.field || '') && newValue) {
                valueToUpdate = dayjs(newValue).toISOString();
            }

            mutateUpdate({
                resource: "time_entries",
                id: data.id,
                values: {
                    [colDef.field!]: valueToUpdate,
                },
                successNotification: () => ({
                    message: `Successfully updated ${colDef.headerName}`,
                    description: "Success with no errors",
                    type: "success",
                }),
            }, {
                onError: () => {
                    message.error(`Failed to update ${colDef.headerName}`);
                }
            });
        }
    }, [mutateUpdate, taskSelect]);

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            field: "id",
            headerName: "ID",
            sortable: true,
            filter: true,
            width: 80
        },
        {
            field: "description",
            headerName: "Description",
            flex: 1,
            sortable: true,
            filter: true,
            editable: true,
        },
        {
            field: "task.name",
            headerName: "Task",
            width: 150,
            sortable: true,
            filter: true,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: taskSelect.names,
            },
        },
        {
            field: "start_time",
            headerName: "Start Time",
            width: 200,
            sortable: true,
            filter: true,
            editable: true,
            cellRenderer: (params: any) => {
                if (!params.value) return null;
                return <DateField value={params.value} format="YYYY-MM-DD HH:mm:ss" />;
            }
        },
        {
            field: "end_time",
            headerName: "End Time",
            width: 200,
            sortable: true,
            filter: true,
            editable: true,
            cellRenderer: (params: any) => {
                if (!params.value) return '-';
                return <DateField value={params.value} format="YYYY-MM-DD HH:mm:ss" />;
            }
        },
        {
            field: "tags",
            headerName: "Tags",
            width: 200,
            sortable: true,
            filter: true,
            cellRenderer: (params: any) => {
                const tags = params.value as string[];
                if (!tags) return null;
                return (
                    <>
                        {tags.map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                        ))}
                    </>
                );
            }
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
    ], [taskSelect]);

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
