import { EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Space, Button, message, DatePicker } from "antd";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import { useMemo, useCallback, useState } from "react";
import { Cycle } from "../../interfaces";
import { useCreate, useUpdate } from "@refinedev/core";
import { FilterOutlined } from "@ant-design/icons";
import { Segmented } from "antd";
import dayjs from "dayjs";

interface CycleListTableProps {
    rowData: Cycle[];
    isLoading: boolean;
}

const CreateButton = (props: any) => {
    return <div className="p-2">
        <Button type="primary" onClick={props.onCreate}>Create</Button>
    </div>;
}

export const CycleListTable: React.FC<CycleListTableProps> = ({ rowData, isLoading }) => {
    const { mutate: mutateCreate } = useCreate();
    const { mutate: mutateUpdate } = useUpdate();
    const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

    const handleCreate = useCallback(() => {
        const now = dayjs();
        mutateCreate({
            resource: "cycles",
            values: {
                name: "New Cycle",
                description: "",
                start_time: now.toISOString(),
                end_time: now.add(1, 'month').toISOString(),
            },
            successNotification: () => {
                return {
                    message: `Successfully created cycle`,
                    description: "Success with no errors",
                    type: "success",
                };
            },
        });
    }, [mutateCreate]);

    const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
        const { data, colDef, newValue } = event;
        // Fields that can be edited: name, description, start_time, end_time
        if (['name', 'description', 'status'].includes(colDef.field || '')) {
            mutateUpdate({
                resource: "cycles",
                id: data.id,
                values: {
                    [colDef.field!]: newValue,
                },
            }, {
                onSuccess: () => {
                    // Optional: Silent success
                },
                onError: () => {
                    message.error("Failed to update cycle");
                }
            });
        } else if (['start_time', 'end_time'].includes(colDef.field || '')) {
            if (newValue) {
                const isoDate = dayjs(newValue).toISOString();
                mutateUpdate({
                    resource: "cycles",
                    id: data.id,
                    values: {
                        [colDef.field!]: isoDate,
                    },
                }, {
                    onSuccess: () => {
                        // Optional: Silent success
                    },
                    onError: () => {
                        message.error("Failed to update cycle");
                    }
                });
            }
        }
    }, [mutateUpdate]);

    const columnDefs = useMemo<ColDef<Cycle>[]>(() => [
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
            field: "status",
            headerName: "Status",
            flex: 1,
            editable: true,
            sortable: true,
            filter: true
        },
        {
            field: "description",
            headerName: "Description",
            flex: 2,
            editable: true,
            sortable: true,
            filter: true
        },
        {
            field: "start_time",
            headerName: "Start Time",
            flex: 1,
            sortable: true,
            filter: true,
            editable: true,
            valueGetter: (params) => {
                if (!params.data || !params.data.start_time) return '';
                return dayjs(params.data.start_time).format('YYYY-MM-DD HH:mm');
            },
        },
        {
            field: "end_time",
            headerName: "End Time",
            flex: 1,
            sortable: true,
            filter: true,
            editable: true,
            valueGetter: (params) => {
                if (!params.data || !params.data.end_time) return '';
                return dayjs(params.data.end_time).format('YYYY-MM-DD HH:mm');
            },
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
