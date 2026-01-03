import { EditButton, ShowButton } from "@refinedev/antd";
import { Space, Button, message } from "antd";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import { useMemo, useCallback } from "react";
import { FinanceCheckinRecord } from "../../interfaces";
import { useCreate, useUpdate, useSelect } from "@refinedev/core";

interface FinanceCheckinRecordListTableProps {
    rowData: FinanceCheckinRecord[];
    isLoading: boolean;
}

const CreateButton = (props: any) => {
    return <div className="p-2">
        <Button type="primary" onClick={props.onCreate}>Create</Button>
    </div>;
}

export const FinanceCheckinRecordListTable: React.FC<FinanceCheckinRecordListTableProps> = ({ rowData, isLoading }) => {
    const { mutate: mutateCreate } = useCreate();
    const { mutate: mutateUpdate } = useUpdate();

    const { options: ledgerOptions } = useSelect({
        resource: "ledgers",
        optionLabel: "name",
        optionValue: "id",
    });

    const ledgerSelect = useMemo(() => {
        const options = ledgerOptions || [];
        return {
            names: options.map((p) => p.label),
            map: new Map(options.map((p) => [p.label, p.value])),
        };
    }, [ledgerOptions]);

    const handleCreate = useCallback(() => {
        // Find a default ledger if available, otherwise 1 or null (might error if reference is strict)
        // Ideally we should open a modal, but user asked for "create button like task-list-table" which does immediate create.
        // We will try to create with dummy or first ledger if available.
        const defaultLedgerId = ledgerOptions?.[0]?.value ?? 1; // Fallback to 1

        mutateCreate({
            resource: "finance_checkin_records",
            values: {
                balance: 0,
                currency: "VND", // Default currency
                ledger_id: defaultLedgerId,
            },
            successNotification: () => {
                return {
                    message: `Successfully created record`,
                    description: "Success with no errors",
                    type: "success",
                };
            },
        });
    }, [mutateCreate, ledgerOptions]);

    const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
        const { data, colDef, newValue } = event;

        if (['balance', 'currency'].includes(colDef.field || '')) {
            mutateUpdate({
                resource: "finance_checkin_records",
                id: data.id,
                values: {
                    [colDef.field!]: newValue,
                },
            }, {
                onError: () => {
                    message.error("Failed to update record");
                }
            });
        } else if (colDef.field === 'ledger.name') {
            const newLedgerId = ledgerSelect.map.get(newValue) as number | undefined;
            if (newLedgerId !== undefined) {
                mutateUpdate({
                    resource: "finance_checkin_records",
                    id: data.id,
                    values: {
                        ledger_id: newLedgerId,
                    },
                }, {
                    onError: () => {
                        message.error("Failed to update ledger");
                    }
                });
            }
        }
    }, [mutateUpdate, ledgerSelect]);

    const columnDefs = useMemo<ColDef<FinanceCheckinRecord>[]>(() => [
        {
            field: "id",
            headerName: "ID",
            sortable: true,
            filter: true,
            width: 80
        },
        {
            field: "created_at",
            headerName: "Created At",
            sortable: true,
            filter: true,
            width: 200,
            valueFormatter: (params: any) => {
                return params.value ? new Date(params.value).toLocaleString() : '';
            }
        },
        {
            field: "currency",
            headerName: "Currency",
            editable: true,
            sortable: true,
            filter: true,
            width: 120
        },
        {
            field: "balance",
            headerName: "Balance",
            editable: true,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            width: 150
        },
        {
            field: "ledger.name",
            headerName: "Ledger",
            flex: 1,
            sortable: true,
            filter: true,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ledgerSelect.names,
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
                    </Space>
                );
            },
            width: 100,
            sortable: false,
            filter: false
        }
    ], [ledgerSelect]);

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
