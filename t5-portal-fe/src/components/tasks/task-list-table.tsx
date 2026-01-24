import { EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Space, Tag, Button, message, Tabs, Modal, Form, Input } from "antd";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent, GridApi, ICellRendererParams, FilterModel, FilterChangedEvent } from 'ag-grid-community';
import { useMemo, useCallback, useState, useEffect } from "react";
import { Task } from "../../interfaces";
import { useCreate, useUpdate, useSelect } from "@refinedev/core";
import dayjs from "dayjs";
import { TaskDetail } from './task-detail';

interface TaskListTableProps {
    rowData: Task[];
    isLoading: boolean;
    projectId?: number;
}

type FilterOperator = 'eq' | 'neq' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual' | 'inRange';

interface FilterCondition {
    id: string;
    field: keyof Task;
    operator: FilterOperator;
    value: unknown;
    valueTo?: unknown; // For 'inRange'
}

interface FilterDefinition {
    id: string;
    name: string;
    isCustom: boolean;
    conditions: FilterCondition[];
}

const DEFAULT_FILTERS: FilterDefinition[] = [
    {
        id: 'high_risk',
        name: 'High Risk',
        isCustom: false,
        conditions: [
            { id: '1', field: 'risk_type', operator: 'eq', value: 'high' },
            { id: '2', field: 'status', operator: 'neq', value: 'completed' }
        ]
    },
    {
        id: 'medium_risk',
        name: 'Medium Risk',
        isCustom: false,
        conditions: [
            { id: '1', field: 'risk_type', operator: 'eq', value: 'medium' },
            { id: '2', field: 'status', operator: 'neq', value: 'completed' }
        ]
    },
    {
        id: 'low_risk',
        name: 'Low Risk',
        isCustom: false,
        conditions: [
            { id: '1', field: 'risk_type', operator: 'eq', value: 'low' },
            { id: '2', field: 'status', operator: 'neq', value: 'completed' }
        ]
    },
    {
        id: 'in_progress',
        name: 'In Progress Task',
        isCustom: false,
        conditions: [
            { id: '1', field: 'status', operator: 'eq', value: 'in_progress' }
        ]
    },
    {
        id: 'completed',
        name: 'Completed Task',
        isCustom: false,
        conditions: [
            { id: '1', field: 'status', operator: 'eq', value: 'completed' }
        ]
    },
    {
        id: 'not_completed',
        name: 'Not Completed Task',
        isCustom: false,
        conditions: [
            { id: '1', field: 'status', operator: 'neq', value: 'completed' }
        ]
    },
    {
        id: 'all',
        name: 'All Task',
        isCustom: false,
        conditions: []
    }
];

const CUSTOM_FILTERS_KEY = 'task-list-custom-filters';

const ActionsRenderer = (props: { onCreate: () => void; onReset: () => void; }) => {
    return <div className="p-2">
        <Space>
            <Button type="primary" onClick={props.onCreate}>Create</Button>
            <Button onClick={props.onReset}>Reset State</Button>
        </Space>
    </div>;
}

interface FilterEditorModalProps {
    open: boolean;
    onCancel: () => void;
    onSave: (filter: FilterDefinition) => void;
}

const FilterEditorModal: React.FC<FilterEditorModalProps> = ({ open, onCancel, onSave }) => {
    const [form] = Form.useForm();

    const handleOk = () => {
        form.validateFields().then(values => {
            const newFilter: FilterDefinition = {
                id: `custom_${Date.now()}`,
                name: values.name,
                isCustom: true,
                conditions: []
            };
            onSave(newFilter);
            form.resetFields();
        });
    };

    return (
        <Modal title="Create New Filter" open={open} onOk={handleOk} onCancel={onCancel}>
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Filter Name" rules={[{ required: true, message: 'Please enter a name' }]}>
                    <Input placeholder="My Custom Filter" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export const TaskListTable: React.FC<TaskListTableProps> = ({ rowData, isLoading, projectId }) => {
    const { mutate: mutateCreate } = useCreate();
    const { mutate: mutateUpdate } = useUpdate();

    // State for filters
    const [activeFilterId, setActiveFilterId] = useState<string>('high_risk');
    const [customFilters, setCustomFilters] = useState<FilterDefinition[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Load custom filters on mount
    useEffect(() => {
        const saved = localStorage.getItem(CUSTOM_FILTERS_KEY);
        if (saved) {
            try {
                setCustomFilters(JSON.parse(saved));
            } catch (e: unknown) {
                console.error("Failed to parse custom filters", e);
            }
        }
    }, []);

    // Save custom filters when changed
    const updateCustomFilters = (newFilters: FilterDefinition[]) => {
        setCustomFilters(newFilters);
        localStorage.setItem(CUSTOM_FILTERS_KEY, JSON.stringify(newFilters));
    };

    const handleSaveCustomFilter = (filter: FilterDefinition) => {
        const newFilters = [...customFilters, filter];
        updateCustomFilters(newFilters);
        setActiveFilterId(filter.id);
        setIsModalOpen(false);
    };

    const [gridApi, setGridApi] = useState<GridApi | null>(null);

    const DetailCellRenderer = useCallback(({ data }: { data: Task }) => {
        return (
            <div className="bg-gray-50 h-full p-4 border-t border-gray-200">
                <TaskDetail taskId={data.id} />
            </div>
        );
    }, []);

    const allFilters = useMemo(() => [...DEFAULT_FILTERS, ...customFilters], [customFilters]);

    const currentFilter = useMemo(() =>
        allFilters.find(f => f.id === activeFilterId) || DEFAULT_FILTERS[0],
        [allFilters, activeFilterId]);

    // Map internal operators to AG Grid types
    const mapOperatorToAgGrid = (op: FilterOperator) => {
        switch (op) {
            case 'eq': return 'equals';
            case 'neq': return 'notEqual';
            case 'contains': return 'contains';
            case 'notContains': return 'notContains';
            case 'startsWith': return 'startsWith';
            case 'endsWith': return 'endsWith';
            case 'greaterThan': return 'greaterThan';
            case 'lessThan': return 'lessThan';
            case 'greaterThanOrEqual': return 'greaterThanOrEqual';
            case 'lessThanOrEqual': return 'lessThanOrEqual';
            case 'inRange': return 'inRange';
            default: return 'equals';
        }
    };

    // Apply filters to AG Grid
    useEffect(() => {
        if (!gridApi) return;

        const filter = currentFilter;

        // If it's a new custom filter (empty), clear the grid
        if (filter.conditions.length === 0) {
            // Only clear if grid currently has filters (optimization)
            if (Object.keys(gridApi.getFilterModel()).length > 0) {
                gridApi.setFilterModel(null);
            }
            return;
        }

        const model: FilterModel = {};

        // Group conditions by field
        const conditionsByField: Record<string, FilterCondition[]> = {};
        filter.conditions.forEach(c => {
            if (!conditionsByField[c.field]) {
                conditionsByField[c.field] = [];
            }
            conditionsByField[c.field].push(c);
        });

        Object.keys(conditionsByField).forEach(field => {
            const conditions = conditionsByField[field];

            const createFilterCondition = (c: FilterCondition) => {
                const type = mapOperatorToAgGrid(c.operator);
                return {
                    filterType: (c.field === 'id' || c.field === 'priority_score') ? 'number' : 'text',
                    type: type,
                    filter: c.value,
                    filterTo: c.valueTo // Only used for inRange
                };
            };

            if (conditions.length === 1) {
                model[field] = createFilterCondition(conditions[0]);
            } else {
                if (conditions.length === 2) {
                    model[field] = {
                        filterType: (field === 'id' || field === 'priority_score') ? 'number' : 'text',
                        operator: 'AND',
                        condition1: createFilterCondition(conditions[0]),
                        condition2: createFilterCondition(conditions[1])
                    };
                } else {
                    console.warn('AG Grid standard filter only supports 2 conditions per column. Using first two.');
                    model[field] = {
                        filterType: (field === 'id' || field === 'priority_score') ? 'number' : 'text',
                        operator: 'AND',
                        condition1: createFilterCondition(conditions[0]),
                        condition2: createFilterCondition(conditions[1])
                    };
                }
            }
        });

        // Deep compare to avoid redundant updates which might cause loops or flickering
        const currentGridModel = gridApi.getFilterModel();

        // Simple JSON stringify comparison is usually enough for this
        if (JSON.stringify(model) !== JSON.stringify(currentGridModel)) {
            setTimeout(() => {
                gridApi.setFilterModel(model);
            }, 0);
        }

    }, [gridApi, currentFilter]);

    const handleGridFilterChanged = useCallback((event: FilterChangedEvent) => {
        if (!currentFilter.isCustom) return;

        const model = event.api.getFilterModel();
        const newConditions: FilterCondition[] = [];

        Object.keys(model).forEach(field => {
            // Function to map AG Grid item to FilterCondition
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mapAgGridItem = (item: any, idx: number): FilterCondition => {
                let op: FilterOperator = 'eq';
                switch (item.type) {
                    case 'equals': op = 'eq'; break;
                    case 'notEqual': op = 'neq'; break;
                    case 'contains': op = 'contains'; break;
                    case 'notContains': op = 'notContains'; break;
                    case 'startsWith': op = 'startsWith'; break;
                    case 'endsWith': op = 'endsWith'; break;
                    case 'greaterThan': op = 'greaterThan'; break;
                    case 'lessThan': op = 'lessThan'; break;
                    case 'greaterThanOrEqual': op = 'greaterThanOrEqual'; break;
                    case 'lessThanOrEqual': op = 'lessThanOrEqual'; break;
                    case 'inRange': op = 'inRange'; break;
                }

                return {
                    id: `${Date.now()}_${field}_${idx}`,
                    field: field as keyof Task,
                    operator: op,
                    value: item.filter,
                    valueTo: item.filterTo
                };
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filterItem = model[field] as any;

            if (filterItem.operator) {
                // Combined filter (AND/OR)
                // Note: AG Grid usually uses AND
                if (filterItem.condition1) {
                    newConditions.push(mapAgGridItem(filterItem.condition1, 1));
                }
                if (filterItem.condition2) {
                    newConditions.push(mapAgGridItem(filterItem.condition2, 2));
                }
            } else {
                newConditions.push(mapAgGridItem(filterItem, 1));
            }
        });

        // Update state if different
        setCustomFilters(prev => {
            const updated = prev.map(f => {
                if (f.id === currentFilter.id) {
                    // Check if conditions actually changed to avoid loop
                    if (JSON.stringify(f.conditions) === JSON.stringify(newConditions)) {
                        return f;
                    }
                    return { ...f, conditions: newConditions };
                }
                return f;
            });

            // Only update local storage if actually changed
            const targetFilter = updated.find(f => f.id === currentFilter.id);
            const originalFilter = prev.find(f => f.id === currentFilter.id);

            if (JSON.stringify(targetFilter) !== JSON.stringify(originalFilter)) {
                localStorage.setItem(CUSTOM_FILTERS_KEY, JSON.stringify(updated));
                return updated;
            }
            return prev;
        });

    }, [currentFilter]);

    const { options } = useSelect({
        resource: "projects",
        optionLabel: "name",
        optionValue: "id",
    });

    const projectSelect = useMemo(() => {
        const projectOptions = options || [];
        return {
            names: projectOptions.map((p) => p.label),
            map: new Map(projectOptions.map((p) => [p.label, p.value])),
        };
    }, [options]);

    const handleCreate = useCallback(() => {
        // Intelligence to set default values based on current active filter
        let defaultRisk = "low";
        let defaultStatus = "new";

        // Try to infer from conditions of current filter
        currentFilter.conditions.forEach(c => {
            if (c.field === 'risk_type' && c.operator === 'eq') {
                defaultRisk = c.value as string;
            }
            if (c.field === 'status' && c.operator === 'eq') {
                defaultStatus = c.value as string;
            }
        });

        mutateCreate({
            resource: "tasks",
            values: {
                name: "New Task",
                project_id: projectId ?? null,
                status: defaultStatus,
                risk_type: defaultRisk
            },
            successNotification: () => {
                return {
                    message: `Successfully created task`,
                    description: "Success with no errors",
                    type: "success",
                };
            },
        });
    }, [mutateCreate, projectId, currentFilter]);

    const handleReset = useCallback(() => {
        localStorage.removeItem('task-list-table-column-state');
        window.location.reload();
    }, []);

    const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
        const { data, colDef, newValue } = event;
        // Fields that can be edited: name, risk_type, status, task_type, remaining_time, priority_score, due_time, start_time, rrule
        if (['name', 'risk_type', 'status', 'task_type', 'remaining_time', 'priority_score', 'due_time', 'start_time', 'rrule'].includes(colDef.field || '')) {
            let valueToUpdate = newValue;
            if (colDef.field === 'due_time' || colDef.field === 'start_time') {
                valueToUpdate = newValue ? dayjs(newValue).toISOString() : null;
            }
            mutateUpdate({
                resource: "tasks",
                id: data.id,
                values: {
                    [colDef.field!]: valueToUpdate,
                },
                // mutationMode: "optimistic",
            }, {
                onSuccess: () => {
                    // Optional: Silent success or small notification
                },
                onError: () => {
                    message.error("Failed to update task");
                }
            });
        } else if (colDef.field === 'project.name') {
            const newProjectId = projectSelect.map.get(newValue) as number | undefined;
            if (newProjectId !== undefined) {
                mutateUpdate({
                    resource: "tasks",
                    id: data.id,
                    values: {
                        project_id: newProjectId,
                    },
                }, {
                    onError: () => {
                        message.error("Failed to update project");
                    }
                });
            }
        }
    }, [mutateUpdate, projectSelect]);

    const columnDefs = useMemo<ColDef<Task>[]>(() => [
        {
            field: "id",
            headerName: "ID",
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 80
        },
        {
            field: "name",
            headerName: "Name",
            flex: 2,
            editable: true,
            sortable: true,
            filter: 'agTextColumnFilter',
            cellRenderer: 'agGroupCellRenderer',
        },
        {
            field: "project.name",
            headerName: "Project",
            flex: 1,
            sortable: true,
            filter: 'agTextColumnFilter',
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: projectSelect.names,
            },
        },
        {
            field: "task_type",
            headerName: "Type",
            sortable: true,
            filter: 'agTextColumnFilter',
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['work', 'break'],
            },
            width: 100,
            cellRenderer: (params: ICellRendererParams) => {
                if (!params.value) return <Tag color="blue">work</Tag>;
                return <Tag color={params.value === 'break' ? 'orange' : 'blue'}>{params.value}</Tag>;
            }
        },
        {
            field: "risk_type",
            headerName: "Risk Type",
            sortable: true,
            filter: 'agTextColumnFilter',
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['low', 'medium', 'high'],
            },
            width: 120
        },
        {
            field: "start_time",
            headerName: "Start Time",
            width: 200,
            sortable: true,
            filter: 'agTextColumnFilter',
            editable: true,
            valueGetter: (params) => {
                if (!params.data || !params.data.start_time) return '';
                return dayjs(params.data.start_time).format('YYYY-MM-DD HH:mm:ss');
            },
        },
        {
            field: "due_time",
            headerName: "Due Time",
            width: 200,
            sortable: true,
            filter: 'agTextColumnFilter',
            editable: true,
            valueGetter: (params) => {
                if (!params.data || !params.data.due_time) return '';
                return dayjs(params.data.due_time).format('YYYY-MM-DD HH:mm:ss');
            },
        },
        {
            field: "rrule",
            headerName: "RRule",
            width: 150,
            sortable: true,
            filter: 'agTextColumnFilter',
            editable: true,
            valueGetter: (params) => {
                if (!params.data || !params.data.rrule) return '';
                return params.data.rrule;
            },
        },
        {
            field: "remaining_time",
            headerName: "Remaining Time",
            width: 150,
            sortable: true,
            filter: 'agTextColumnFilter',
            editable: true,
        },
        {
            field: "priority_score",
            headerName: "Priority Score",
            width: 130,
            sortable: true,
            filter: 'agNumberColumnFilter',
            editable: true,
        },
        {
            field: "status",
            headerName: "Status",
            sortable: true,
            filter: 'agTextColumnFilter',
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['new', 'in_progress', 'completed', 'canceled', 'blocked']
            },
            width: 120,
            cellRenderer: (params: ICellRendererParams) => {
                if (!params.value) return null;
                let color = "default";
                switch (params.value) {
                    case "completed":
                        color = "green";
                        break;
                    case "in_progress": // Fixed typo: in-progress -> in_progress to match values
                        color = "processing";
                        break;
                    case "new":
                        color = "blue";
                        break;
                    case "blocked":
                        color = "red";
                        break;
                    case "canceled":
                        color = "default";
                        break;
                    case "active":
                        color = "cyan"; // Added for filter editor consistency if needed later
                        break;
                }

                return <Tag color={color}>{params.value}</Tag>;
            }
        },
        {
            headerName: "Actions",
            field: "id",
            cellRenderer: (params: ICellRendererParams) => {
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
    ], [projectSelect]);

    const defaultColDef = useMemo(() => ({
        resizable: true,
    }), []);

    useEffect(() => {
        if (gridApi) {
            const savedState = localStorage.getItem('task-list-table-column-state');
            if (savedState) {
                gridApi.applyColumnState({
                    state: JSON.parse(savedState),
                    applyOrder: true
                });
            }
        }
    }, [gridApi, columnDefs]);

    const statusBar = useMemo(() => ({
        statusPanels: [
            {
                statusPanel: ActionsRenderer,
                align: 'left',
                statusPanelParams: {
                    onCreate: handleCreate,
                    onReset: handleReset
                }
            }
        ]
    }), [handleCreate, handleReset]);

    const onEditTab = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
        if (action === 'add') {
            setIsModalOpen(true);
        } else {
            // Remove
            const newFilters = customFilters.filter(f => f.id !== targetKey);
            updateCustomFilters(newFilters);
            if (activeFilterId === targetKey) {
                setActiveFilterId('high_risk');
            }
        }
    };

    return (
        <div style={{ height: 600, width: '100%' }}>
            <FilterEditorModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSave={handleSaveCustomFilter}
            />
            <Tabs
                type="editable-card"
                onChange={setActiveFilterId}
                activeKey={activeFilterId}
                onEdit={onEditTab}
                items={allFilters.map(f => ({
                    label: f.name,
                    key: f.id,
                    closable: f.isCustom,
                }))}
            />

            <AgGridReact
                rowData={rowData || []}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={10}
                loading={isLoading}
                onCellValueChanged={onCellValueChanged}
                onFilterChanged={handleGridFilterChanged}
                sideBar={{
                    toolPanels: ['columns', 'filters'],
                    hiddenByDefault: false
                }}
                masterDetail={true}
                detailCellRenderer={DetailCellRenderer}
                detailRowHeight={600}
                statusBar={statusBar}
                onGridReady={(params) => {
                    setGridApi(params.api);
                    const savedState = localStorage.getItem('task-list-table-column-state');
                    if (savedState) {
                        params.api.applyColumnState({
                            state: JSON.parse(savedState),
                            applyOrder: true
                        });
                    }
                }}
                onColumnResized={(params) => {
                    if (params.finished) {
                        const state = params.api.getColumnState();
                        localStorage.setItem('task-list-table-column-state', JSON.stringify(state));
                    }
                }}
                onColumnMoved={(params) => {
                    const state = params.api.getColumnState();
                    localStorage.setItem('task-list-table-column-state', JSON.stringify(state));
                }}
                onColumnVisible={(params) => {
                    const state = params.api.getColumnState();
                    localStorage.setItem('task-list-table-column-state', JSON.stringify(state));
                }}
                onColumnPinned={(params) => {
                    const state = params.api.getColumnState();
                    localStorage.setItem('task-list-table-column-state', JSON.stringify(state));
                }}
                onSortChanged={(params) => {
                    const state = params.api.getColumnState();
                    localStorage.setItem('task-list-table-column-state', JSON.stringify(state));
                }}
            />
        </div>
    );
};
