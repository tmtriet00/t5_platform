
import { Button, message } from "antd";
import { useList, useUpdate } from "@refinedev/core";
import { DeleteButton } from "@refinedev/antd";
import { useRef, useMemo, useCallback } from "react";
import { AddTransactionModal, AddTransactionModalRef } from "../modals";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';

interface LedgerDetailProps {
    data: any;
}

export const LedgerDetail: React.FC<LedgerDetailProps> = ({ data }) => {
    const addTransactionModalRef = useRef<AddTransactionModalRef>(null);
    const { mutate: mutateUpdate } = useUpdate();

    const { query } = useList({
        resource: "transactions",
        filters: [
            {
                field: "ledger_id",
                operator: "eq",
                value: data.id,
            },
        ],
        pagination: {
            mode: "off",
        },
        sorters: [
            {
                field: "transaction_time",
                order: "desc",
            },
        ]
    });

    const { data: transactionsData, isLoading } = query || {};

    const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
        const { data: rowData, colDef, newValue } = event;
        const field = colDef.field;

        if (field) {
            mutateUpdate({
                resource: "transactions",
                id: rowData.id,
                values: {
                    [field]: newValue,
                },
            }, {
                onError: () => {
                    message.error("Failed to update transaction");
                }
            });
        }
    }, [mutateUpdate]);

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            field: "id",
            headerName: "ID",
            width: 80,
            sortable: true,
            filter: true,
        },
        {
            field: "amount",
            headerName: "Amount",
            editable: true,
            sortable: true,
            filter: true,
            valueFormatter: (params) => {
                // Combine amount and currency for display if needed, but for editing keep it simple or separate?
                // The user asked for inline editing "by amount, currency...".
                // If we format it here, editing might be tricky if not handled. 
                // Let's just format the number. The currency is in another column.
                // Wait, the previous request was to "render with attached currency".
                // Now they want inline editing. If I separate them, I satisfy both?
                // Or I can use a valueGetter/Setter?
                // Use simple formatting for display.
                return params.value ? Number(params.value).toLocaleString() : '';
            }
        },
        {
            field: "currency",
            headerName: "Currency",
            editable: true,
            width: 100,
        },
        {
            field: "type",
            headerName: "Type",
            editable: true,
            width: 100,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['credit', 'debit']
            },
            cellStyle: (params) => {
                return { color: params.value === 'credit' ? 'green' : 'red', textTransform: 'capitalize' };
            }
        },
        {
            field: "category",
            headerName: "Category",
            editable: true,
            width: 120,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['default', 'transfer_only']
            },
        },
        {
            field: "description",
            headerName: "Description",
            editable: true,
            flex: 1,
        },
        {
            field: "transaction_time",
            headerName: "Transaction Time",
            width: 180,
            editable: true,
            cellEditor: 'agDateStringCellEditor',
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : ''
        },
        {
            field: "created_at",
            headerName: "Created At",
            width: 180,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : ''
        },
        {
            headerName: "Actions",
            field: "id",
            cellRenderer: (params: any) => {
                return <DeleteButton hideText size="small" recordItemId={params.value} resource="transactions" />
            },
            width: 80,
            sortable: false,
            filter: false
        }
    ], []);

    const defaultColDef = useMemo(() => ({
        resizable: true,
    }), []);

    return (
        <div className="p-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h4 style={{ margin: 0 }}>Transactions</h4>
                <Button type="primary" size="small" onClick={() => addTransactionModalRef.current?.open(data.id)}>
                    Add Transaction
                </Button>
            </div>
            <div style={{ height: 300, width: '100%' }} className="ag-theme-alpine">
                <AgGridReact
                    rowData={transactionsData?.data || []}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    loading={isLoading}
                    onCellValueChanged={onCellValueChanged}
                    pagination={true}
                    paginationPageSize={5}
                />
            </div>
            <AddTransactionModal ref={addTransactionModalRef} />
        </div>
    );
};
