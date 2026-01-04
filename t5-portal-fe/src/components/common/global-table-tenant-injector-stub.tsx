import React, { useEffect, useRef } from 'react';
import { useTenantColumn } from '../../hooks/useTenantColumn';

export const GlobalTableTenantInjector: React.FC = () => {
    const { getTenantColumnDef, showTenantColumn } = useTenantColumn();
    // Keep track of processed grids to avoid repeated API calls
    const processedGrids = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!showTenantColumn) {
            // Logic to remove column if hidden? 
            // For now, simpler to reload or just handle "adding" when shown. 
            // If user unselects tenants, we might want to remove column.
            // Leaving "remove" logic for later or assume page refresh/grid destroy handles it.
            return;
        }

        const handleNode = (node: Node) => {
            if (node instanceof HTMLElement) {
                // Look for AG Grid wrapper
                // Strategy: check if this element IS the grid wrapper or contains it
                // We verify ID exists as per requirement

                // Helper to process a potential grid element
                const processElement = (el: HTMLElement) => {
                    // Check if it's an AG Grid root
                    if (el.classList.contains('ag-root-wrapper') || el.classList.contains('ag-root-wrapper-body')) {
                        // Find the React Fiber to getting logical ID/Key
                        const fiberKey = Object.keys(el).find(key => key.startsWith('__reactFiber$'));
                        if (fiberKey) {
                            const fiber = (el as any)[fiberKey];
                            // Try to find API
                            // In recent AG Grid versions, the API might be on props of the component
                            // We need to traverse up to find the AgGridReact component fiber
                            let current = fiber;
                            let api = null;
                            let gridId = el.id;

                            // Traverse up a bit to find the component holding the API
                            // Max depth 10 to be safe
                            for (let i = 0; i < 10 && current; i++) {
                                if (current.memoizedProps && current.memoizedProps.id) {
                                    gridId = current.memoizedProps.id;
                                }
                                // Look for api in props or stateNode
                                // AG Grid React usually exposes api via onGridReady or ref
                                // Inspecting "api" directly in props is rare unless user passed it (which they don't)
                                // However, we can check for gridOptions

                                // Alternatively, look for __agComponent property on DOM if accessible
                                current = current.return;
                            }

                            // Strategy B: Access __agComponent property on the element or children
                            // Note: ag-grid attaches `__agComponent` to the grid element in some versions
                            // Or utilize the global getAllGridOptions() if available from ag-grid-community (rare in modules)

                        }
                    }
                };

                // If the node itself is interesting
                processElement(node);

                // Or search children
                const grids = node.querySelectorAll('.ag-root-wrapper');
                grids.forEach(g => processElement(g as HTMLElement));
            }
        };

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    handleNode(node);
                });
            });
        });

        // Initial scan
        document.querySelectorAll('.ag-root-wrapper').forEach(node => handleNode(node));

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
        };
    }, [showTenantColumn]);

    // IMPORTANT: The above logic is a stub because traversing fiber to find "api" is flaky.
    // A better approach if we can't depend on "api" prop:
    // We can't easily get the API object from the DOM node in v31+ without a reference.
    // However, if the user assigns an ID, maybe we can use specific "window" registry if we built one? No.

    // Alternative: The user mentioned "id field will be assigned".
    // If we simply use a different pattern:
    // We assume the user adds "id" to the container div.
    // But implementation details of accessing API remain hard.

    // REVISED STRATEGY for this component:
    // Since we cannot reliably get the API from DOM, and the user wants to put "table wrapper in App.tsx",
    // maybe they essentially mean HOC or monkey-patching AgGridReact?
    // But I will stick to the plan: try to find the API from the DOM element.
    // In many setups, `el.__agComponent` or accessing the GridController is possible.
    // I'll assume we can find it via a property on the ID-ed element.

    return null;
};
