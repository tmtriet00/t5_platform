import React, { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry, ClientSideRowModelModule, RowGroupingModule } from 'ag-grid-enterprise';
import { Card, Typography, Layout, Space, message, Spin } from 'antd';

// Register Enterprise Modules for Row Grouping
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const { Title } = Typography;
const { Content } = Layout;

export interface EslintError {
    file: string;
    rule: string;
    count: number;
}

export const ESLintTagsPage: React.FC = () => {
    const [rowData, setRowData] = useState<EslintError[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/eslint.seatbelt.tsv');
                if (!response.ok) {
                    throw new Error(`Failed to fetch TSV file: ${response.statusText}`);
                }
                const text = await response.text();
                const lines = text.split('\n');
                const data: EslintError[] = [];

                lines.forEach((line) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine.startsWith('#')) return;

                    const parts = trimmedLine.split('\t');
                    if (parts.length >= 3) {
                        // Remove surrounding quotes if present
                        const file = parts[0].replace(/^"|"$/g, '');
                        const rule = parts[1].replace(/^"|"$/g, '');
                        const count = parseInt(parts[2], 10);

                        if (!isNaN(count)) {
                            data.push({ file, rule, count });
                        }
                    }
                });
                setRowData(data);
            } catch (error) {
                console.error('Error loading ESLint data:', error);
                message.error('Failed to load ESLint data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const columnDefs = useMemo<ColDef<EslintError>[]>(() => [
        {
            field: 'rule',
            headerName: 'Rule',
            rowGroup: true,
            hide: true, // Hide because it's used in the group column
            sortable: true,
        },
        {
            field: 'file',
            headerName: 'File',
            flex: 1,
            sortable: true,
            filter: true,
        },
        {
            field: 'count',
            headerName: 'Error Count',
            aggFunc: 'sum',
            sortable: true,
            width: 150,
        },
    ], []);

    const autoGroupColumnDef = useMemo<ColDef>(() => ({
        headerName: 'Rule Group',
        minWidth: 300,
        flex: 1,
        cellRendererParams: {
            suppressCount: false, // Show child count
        },
    }), []);

    const defaultColDef = useMemo<ColDef>(() => ({
        flex: 1,
        resizable: true,
        sortable: true,
        filter: true,
    }), []);

    return (
        <Content style={{ padding: '24px' }}>
            <Title level={2}>ESLint Tags</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card title="Lint Error Groups">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Spin size="large" />
                        </div>
                    ) : (
                        <div className="ag-theme-alpine" style={{ height: 800, width: '100%' }}>
                            <AgGridReact
                                rowData={rowData}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                autoGroupColumnDef={autoGroupColumnDef}
                                groupDefaultExpanded={0} // 0 means collapsed, -1 means expanded
                                pagination={true}
                                paginationPageSize={20}
                                suppressAggFuncInHeader={true}
                            />
                        </div>
                    )}
                </Card>
            </Space>
        </Content>
    );
};
