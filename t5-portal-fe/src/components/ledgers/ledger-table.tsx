import { EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Space, Button, message } from "antd";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent, FirstDataRenderedEvent, IDetailCellRendererParams } from 'ag-grid-community';
import { useMemo, useCallback } from "react";
import { useCreate, useUpdate } from "@refinedev/core";
import { LedgerDetail } from "./ledger-detail";

interface LedgerTableProps {
    rowData: any[];
    isLoading: boolean;
}

const CreateButton = (props: any) => {
    return <div className="p-2">
        <Button type="primary" onClick={props.onCreate}>Create Ledger</Button>
    </div>;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({ rowData, isLoading }) => {
    const { mutate: mutateCreate } = useCreate();
    const { mutate: mutateUpdate } = useUpdate();

    const handleCreate = useCallback(() => {
        mutateCreate({
            resource: "ledgers",
            values: {
                name: "New Ledger",
            },
            successNotification: () => {
                return {
                    message: "Successfully created ledger",
                    description: "Success",
                    type: "success",
                };
            },
        });
    }, [mutateCreate]);

    const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
        const { data, colDef, newValue } = event;
        if (colDef.field === 'name') {
            mutateUpdate({
                resource: "ledgers",
                id: data.id,
                values: {
                    name: newValue,
                },
            }, {
                onError: () => {
                    message.error("Failed to update ledger");
                }
            });
        }
    }, [mutateUpdate]);

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            field: "id",
            headerName: "ID",
            sortable: true,
            filter: true,
            width: 80,
            cellRenderer: 'agGroupCellRenderer'
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
            field: "created_at",
            headerName: "Created At",
            width: 200,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : ''
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

    const detailCellRenderer = useMemo(() => {
        return (params: IDetailCellRendererParams) => {
            return <LedgerDetail data={params.data} />;
        }
    }, []);

    const onFirstDataRendered = useCallback(() => {
        // Optional: expand first row
        // params.api.getDisplayedRowAtIndex(0)?.setExpanded(true);
    }, []);

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
                masterDetail={true}
                detailCellRenderer={detailCellRenderer}
                detailRowHeight={400}
                onFirstDataRendered={onFirstDataRendered}
                sideBar={{
                    toolPanels: ['columns', 'filters'],
                    hiddenByDefault: false
                }}
                statusBar={statusBar}
            />
        </div>
    );
};
