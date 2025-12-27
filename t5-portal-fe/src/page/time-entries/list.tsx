import {
    List,
    EditButton,
    DeleteButton,
    DateField,
} from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Space, Tag } from "antd";
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useMemo } from "react";

import { TimeEntry } from "interfaces";

export const TimeEntryList: React.FC = () => {
    const { query } = useList<TimeEntry>({
        resource: "time_entries",
        meta: {
            select: "*, task:tasks(id, name)",
        },
        pagination: {
            mode: "off",
        },
        sorters: [
            {
                field: "start_time",
                order: "desc",
            },
        ],
    });

    const { data, isLoading } = query;
    const rowData = data?.data || [];

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            field: "id",
            headerName: "ID",
            sortable: true,
            filter: true
        },
        {
            field: "description",
            headerName: "Description",
            flex: 1,
            sortable: true,
            filter: true
        },
        {
            field: "task.name",
            headerName: "Task",
            width: 150,
            sortable: true,
            filter: true
        },
        {
            field: "start_time",
            headerName: "Start Time",
            width: 200,
            sortable: true,
            filter: true,
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
    ], []);

    const defaultColDef = useMemo(() => ({
        resizable: true,
    }), []);

    return (
        <List>
            <div style={{ height: 600, flex: 1 }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    paginationPageSize={10}
                    loading={isLoading}
                    sideBar={{
                        toolPanels: ['columns', 'filters'],
                        hiddenByDefault: false
                    }}
                />
            </div>
        </List>
    );
};
