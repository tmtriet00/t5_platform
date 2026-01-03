import { Button, message, Segmented } from "antd";
import { useList, useUpdate } from "@refinedev/core";
import { DeleteButton } from "@refinedev/antd";
import { useRef, useMemo, useCallback, useState } from "react";
import { AddTransactionModal, AddTransactionModalRef } from "components/modals";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import { formatCurrency } from "utility/number";
import { useCycleTransactions } from "../hooks/use-cycle-transactions";

interface CycleTransactionTableProps {
    cycleStartTime?: string;
    cycleEndTime?: string;
    displayCurrency: string;
}

export const CycleTransactionTable: React.FC<CycleTransactionTableProps> = ({
    cycleStartTime,
    cycleEndTime,
    displayCurrency
}) => {
    const addTransactionModalRef = useRef<AddTransactionModalRef>(null);
    const { mutate: mutateUpdate } = useUpdate();
    const [transactionType, setTransactionType] = useState<'debit' | 'credit'>('debit');

    const { transactions, loading } = useCycleTransactions({
        cycleStartTime,
        cycleEndTime
    });

    console.log("transactions", transactions, loading, cycleStartTime, cycleEndTime);

    // Fetch ledgers for displaying ledger names
    const ledgersQuery = useList({
        resource: "ledgers",
        pagination: {
            mode: "off",
        },
    });

    const ledgersMap = useMemo(() => {
        const map = new Map();
        ledgersQuery.query.data?.data?.forEach((ledger: any) => {
            map.set(ledger.id, ledger.name);
        });
        return map;
    }, [ledgersQuery.query.data]);

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

    // Filter transactions by type
    const filteredTransactions = useMemo(() => {
        return transactions.filter((t: any) => t.type === transactionType);
    }, [transactions, transactionType]);

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            field: "transaction_time",
            headerName: "Transaction Time",
            width: 180,
            editable: true,
            sortable: true,
            cellEditor: 'agDateStringCellEditor',
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : ''
        },
        {
            field: "description",
            headerName: "Description",
            editable: true,
            flex: 1,
        },
        {
            field: "amount",
            headerName: "Amount",
            editable: true,
            width: 150,
            sortable: true,
            valueFormatter: (params) => {
                if (!params.value) return '';
                return formatCurrency({
                    amount: params.value,
                    currency: params.data.currency || displayCurrency
                });
            },
            valueParser: (params) => {
                return Number(params.newValue);
            }
        },
        {
            field: "ledger_id",
            headerName: "Ledger Name",
            width: 150,
            editable: true,
            valueFormatter: (params) => {
                return ledgersMap.get(params.value) || 'Unknown';
            },
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: Array.from(ledgersMap.keys())
            },
        },
        {
            headerName: "Actions",
            field: "id",
            cellRenderer: (params: any) => {
                return <DeleteButton hideText size="small" recordItemId={params.value} resource="transactions" />;
            },
            width: 100,
            sortable: false,
            filter: false
        }
    ], [ledgersMap, displayCurrency]);

    const defaultColDef = useMemo(() => ({
        resizable: true,
    }), []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
                <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                        const ledgerId = ledgersQuery.query.data?.data?.[0]?.id as number;
                        if (ledgerId) {
                            addTransactionModalRef.current?.open(ledgerId);
                        }
                    }}
                >
                    Add Transaction
                </Button>
                <Segmented
                    options={[
                        { label: 'Debit', value: 'debit' },
                        { label: 'Credit', value: 'credit' },
                    ]}
                    value={transactionType}
                    onChange={(value) => setTransactionType(value as 'debit' | 'credit')}
                />
            </div>
            <div style={{ height: 300, width: '100%' }} className="ag-theme-alpine">
                <AgGridReact
                    rowData={filteredTransactions}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    loading={loading}
                    onCellValueChanged={onCellValueChanged}
                    domLayout="normal"
                    suppressPaginationPanel={true}
                />
            </div>
            <AddTransactionModal ref={addTransactionModalRef} />
        </div>
    );
};
