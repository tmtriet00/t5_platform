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
        if (['name', 'description', 'start_time', 'end_time'].includes(colDef.field || '')) {
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
            field: "description",
            headerName: "Description",
            flex: 3,
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
            valueFormatter: (params) => params.value ? dayjs(params.value).format('YYYY-MM-DD HH:mm') : '',
            cellEditor: 'agDateStringCellEditor',
            // Note: ag-grid date editor might need config, but for now simple text or standard editor. 
            // For better experience we might need custom cell editor but sticking to simple for now as requested like task (which uses selects).
            // Task uses agSelectCellEditor. For date, standard text edit is prone to error.
            // But let's stick to basic editable for now or just text.
            // Actually, let's keep it simple text editable for now, user can input ISO or strict format.
            // Or better, let's just make it editable text.
        },
        {
            field: "end_time",
            headerName: "End Time",
            flex: 1,
            sortable: true,
            filter: true,
            editable: true,
            valueFormatter: (params) => params.value ? dayjs(params.value).format('YYYY-MM-DD HH:mm') : '',
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
