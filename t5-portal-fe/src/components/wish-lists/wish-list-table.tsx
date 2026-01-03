
import { EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Space, Button, message } from "antd";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent, FirstDataRenderedEvent, IDetailCellRendererParams } from 'ag-grid-community';
import { useMemo, useCallback } from "react";
import { useCreate, useUpdate } from "@refinedev/core";
import { WishListDetail } from "./wish-list-detail";

interface WishListTableProps {
    rowData: any[];
    isLoading: boolean;
}

const CreateButton = (props: any) => {
    return <div className="p-2">
        <Button type="primary" onClick={props.onCreate}>Create Item</Button>
    </div>;
}

export const WishListTable: React.FC<WishListTableProps> = ({ rowData, isLoading }) => {
    const { mutate: mutateCreate } = useCreate();
    const { mutate: mutateUpdate } = useUpdate();

    const handleCreate = useCallback(() => {
        mutateCreate({
            resource: "wish_list_items",
            values: {
                title: "New Item",
            },
            successNotification: () => {
                return {
                    message: "Successfully created wish list item",
                    description: "Success",
                    type: "success",
                };
            },
        });
    }, [mutateCreate]);

    const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
        const { data, colDef, newValue } = event;
        if (colDef.field === 'title') {
            mutateUpdate({
                resource: "wish_list_items",
                id: data.id,
                values: {
                    title: newValue,
                },
            }, {
                onError: () => {
                    message.error("Failed to update item");
                }
            });
        } else if (colDef.field === 'status') {
            mutateUpdate({
                resource: "wish_list_items",
                id: data.id,
                values: {
                    status: newValue,
                },
            }, {
                onError: () => {
                    message.error("Failed to update status");
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
            field: "title",
            headerName: "Title",
            flex: 1,
            editable: true,
            sortable: true,
            filter: true
        },
        {
            field: "status",
            headerName: "Status",
            width: 150,
            editable: true,
            sortable: true,
            filter: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['not_started', 'in_progress', 'completed', 'canceled']
            },
            valueFormatter: (params) => {
                if (!params.value) return '';
                return params.value.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
            }
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
            return <WishListDetail data={params.data} />;
        }
    }, []);

    const onFirstDataRendered = useCallback(() => {
        // Arbitrarily expand the first row to demonstrate, or leave collapsed
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
                onFirstDataRendered={onFirstDataRendered} // Optional
                sideBar={{
                    toolPanels: ['columns', 'filters'],
                    hiddenByDefault: false
                }}
                statusBar={statusBar}
            />
        </div>
    );
};
