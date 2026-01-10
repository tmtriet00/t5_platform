import { DataProvider } from "@refinedev/core";
import { supabaseClient } from "./supabaseClient";
import { dataProvider as supabaseDataProvider } from "@refinedev/supabase";

export const tenantDataProvider = (
    client: typeof supabaseClient
): DataProvider => {
    const baseDataProvider = supabaseDataProvider(client);

    return {
        ...baseDataProvider,
        getList: async ({ resource, pagination, filters, sorters, meta }) => {
            const tenantCode = localStorage.getItem("current_tenant_code");

            const newFilters = [...(filters || [])];

            // Inject tenant filter if tenantCode exists
            // We assume all resources need filtering. 
            // If some don't (like 'tenants' itself), we should skip.
            if (tenantCode && resource !== "tenants" && resource !== "cron") {
                newFilters.push({
                    field: "tenant_code",
                    operator: "eq",
                    value: tenantCode,
                });
            }

            return baseDataProvider.getList({
                resource,
                pagination,
                filters: newFilters,
                sorters,
                meta,
            });
        },
        getMany: async (params) => {
            // Supabase data provider usually implements getMany by ID.
            // It might not be necessary to filter by tenant here if IDs are unique globally.
            // But for security/completeness, we could verify. 
            // However, standard getMany usually just fetches by ID.
            // Let's stick to base implementation for now for getMany, 
            // as refetching lists is where filtering allows "switching view".
            // If we need strict security, RLS is better. Frontend filtering is mostly for UI.
            return baseDataProvider.getMany!(params);
        },
        // We should also wrap other methods if we want to ensure data creation/updates are tenant-aware (e.g. inject tenant_code on create)
        create: async ({ resource, variables, meta }) => {
            const tenantCode = localStorage.getItem("current_tenant_code");
            const newVariables = { ...variables };

            if (tenantCode && resource !== "tenants" && resource !== "cron") {
                // Check if tenant_code is already in variables to avoid overwrite if passed explicitly
                if (!Object.prototype.hasOwnProperty.call(newVariables, "tenant_code")) {
                    (newVariables as any).tenant_code = tenantCode;
                }
            }

            return baseDataProvider.create({
                resource,
                variables: newVariables,
                meta
            })
        },
        update: async (params) => {
            // Update usually targets an ID. 
            // If we change tenant_code on update, it moves the item.
            // Typically we don't need to inject tenant_code on update unless we want to "fix" it?
            // Let's leave update as is.
            return baseDataProvider.update(params);
        },
        // ... wrap other methods if needed
    };
};
