import React, { useEffect, useRef } from 'react';
import { useTenantColumn } from '../../hooks/useTenantColumn';
import { ColDef, GridApi } from 'ag-grid-community';

export const GlobalTableTenantInjector: React.FC = () => {
    const { getTenantColumnDef, showTenantColumn } = useTenantColumn();
    const processedGrids = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!showTenantColumn) {
            return;
        }

        const injectTenantColumn = (api: GridApi, gridId: string) => {
            if (processedGrids.current.has(gridId)) return;

            const existingDefs = api.getGridOption('columnDefs') as ColDef[];
            if (!existingDefs) return;

            const tenantColDef = getTenantColumnDef();
            if (!tenantColDef) return;

            // Check if already exists
            const hasTenantColumn = existingDefs.some((col: any) => col.field === 'tenant_code' || col.colId === 'tenant_code');
            if (hasTenantColumn) {
                processedGrids.current.add(gridId);
                return;
            }

            const newDefs = [...existingDefs];
            // Insert after ID or at start
            const idIndex = newDefs.findIndex((c: any) => c.field === 'id' || c.headerName === 'ID');
            if (idIndex !== -1) {
                newDefs.splice(idIndex + 1, 0, tenantColDef);
            } else {
                newDefs.unshift(tenantColDef);
            }

            api.setGridOption('columnDefs', newDefs);
            processedGrids.current.add(gridId);
            console.log(`[GlobalTableTenantInjector] Injected tenant column into grid: ${gridId}`);
        };

        const findGridApi = (node: HTMLElement): { api: GridApi, id: string } | null => {
            // Traverse Fiber to find properties
            const fiberKey = Object.keys(node).find(key => key.startsWith('__reactFiber$'));
            if (!fiberKey) return null;

            let fiber = (node as any)[fiberKey];
            let gridId = node.id; // Default to DOM ID

            // Traverse up to find AgGridReact component props (where 'id' might be passed)
            // AND to find where the API module might be attached (often on stateNode of the class, or we have to find it via context?)

            // Let's try multiple common locations.
            let api: GridApi | undefined = (node as any).__agComponent?.gridApi;

            if (!api && (node as any).gridOptions?.api) {
                api = (node as any).gridOptions.api;
            }

            // If not directly on node, let's look at the fiber for the "id" prop or "key"
            let current = fiber;
            for (let i = 0; i < 20 && current; i++) {
                // Check props for id
                if (current.memoizedProps && current.memoizedProps.id) {
                    gridId = current.memoizedProps.id;
                }
                // Check fiber key (user preferred)
                if (current.key) {
                    gridId = '' + current.key;
                }

                // Check if `api` is in props (unlikely unless passed)
                if (current.memoizedProps?.api) {
                    api = current.memoizedProps.api;
                }

                // Check stateNode if it is an instance (Class component)
                if (current.stateNode && current.stateNode.api) {
                    api = current.stateNode.api;
                }

                if (api && gridId) break;
                current = current.return;
            }

            if (api && gridId) {
                return { api, id: gridId };
            }
            return null;
        };

        const handleNode = (node: Node) => {
            if (!(node instanceof HTMLElement)) return;

            // Check if it is a grid wrapper
            if (node.classList.contains('ag-root-wrapper')) {
                // It might take a moment for the API to be ready?
                // Let's retry a few times if not found immediately?
                // Or just try now.
                const result = findGridApi(node);
                if (result) {
                    injectTenantColumn(result.api, result.id);
                } else {
                    // Retry logic for async init?
                    setTimeout(() => {
                        const res = findGridApi(node);
                        if (res) injectTenantColumn(res.api, res.id);
                    }, 500);
                    setTimeout(() => {
                        const res = findGridApi(node);
                        if (res) injectTenantColumn(res.api, res.id);
                    }, 2000);
                }
            } else {
                // Search subtree
                const grids = node.querySelectorAll('.ag-root-wrapper');
                grids.forEach(g => {
                    const res = findGridApi(g as HTMLElement);
                    if (res) injectTenantColumn(res.api, res.id);
                });
            }
        };

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    handleNode(node);
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Initial scan
        handleNode(document.body);

        return () => observer.disconnect();
    }, [showTenantColumn, getTenantColumnDef]);

    return null;
};
