import { EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Space, Button, message } from "antd";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import { useMemo, useCallback } from "react";
import { Configuration } from "../../interfaces";
import { useCreate, useUpdate } from "@refinedev/core";

interface ConfigurationListTableProps {
    rowData: any[];
    isLoading: boolean;
}

const CreateButton = (props: any) => {
    return <div className="p-2">
        <Button type="primary" onClick={props.onCreate}>Create</Button>
    </div>;
}

export const ConfigurationListTable: React.FC<ConfigurationListTableProps> = ({ rowData, isLoading }) => {
    const { mutate: mutateCreate } = useCreate();
    const { mutate: mutateUpdate } = useUpdate();

    const handleCreate = useCallback(() => {
        mutateCreate({
            resource: "configurations",
            values: {
                config_key: "new_key",
                config_value: "new_value",
                config_category: "default",
                description: "New configuration"
            },
            successNotification: () => {
                return {
                    message: `Successfully created configuration`,
                    description: "Success with no errors",
                    type: "success",
                };
            },
        });
    }, [mutateCreate]);

    const onCellValueChanged = useCallback((event: any) => {
        const { data, colDef, newValue } = event;
        // Fields that can be edited
        if (['config_key', 'config_value', 'config_category', 'description'].includes(colDef.field || '')) {
            mutateUpdate({
                resource: "configurations",
                id: data.id,
                values: {
                    [colDef.field!]: newValue,
                },
            }, {
                onSuccess: () => {
                    // silently succeed
                },
                onError: () => {
                    message.error("Failed to update configuration");
                }
            });
        }
    }, [mutateUpdate]);

    const columnDefs = useMemo<ColDef<Configuration>[]>(() => [
        {
            field: "id",
            headerName: "ID",
            sortable: true,
            filter: true,
            width: 80
        },
        {
            field: "config_key",
            headerName: "Key",
            flex: 1,
            editable: true,
            sortable: true,
            filter: true
        },
        {
            field: "config_value",
            headerName: "Value",
            flex: 2,
            editable: true,
            sortable: true,
            filter: true
        },
        {
            field: "config_category",
            headerName: "Category",
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
