import {
    List,
    EditButton,
    ShowButton,
} from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Space, Tag } from "antd";
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useMemo } from "react";

import { Project } from "interfaces";

export const ProjectList: React.FC = () => {
    const { query } = useList<Project>({
        resource: "projects",
        sorters: [
            {
                field: "id",
                order: "asc",
            },
        ],
    });

    const { data, isLoading } = query;
    const rowData = data?.data || [];

    const columnDefs = useMemo<ColDef<Project>[]>(() => [
        {
            field: "id",
            headerName: "ID",
            sortable: true,
            filter: true
        },
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            sortable: true,
            filter: true
        },
        {
            field: "color",
            headerName: "Color",
            width: 150,
            sortable: true,
            filter: true,
            cellRenderer: (params: any) => {
                if (!params.value) return null;
                return <Tag color={params.value}>{params.value}</Tag>;
            }
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
