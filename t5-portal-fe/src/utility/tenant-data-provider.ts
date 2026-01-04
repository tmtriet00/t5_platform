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
            const selectedCodestStr = localStorage.getItem("selected_tenant_codes");
            let tenantCodes: string[] = [];

            if (selectedCodestStr) {
                try {
                    const parsed = JSON.parse(selectedCodestStr);
                    if (Array.isArray(parsed)) {
                        tenantCodes = parsed;
                    } else {
                        // Handling legacy or single string case just in case
                        tenantCodes = [selectedCodestStr];
                    }
                } catch {
                    // Fallback for plain string
                    tenantCodes = [selectedCodestStr];
                }
            } else {
                // Try legacy key
                const legacy = localStorage.getItem("current_tenant_code");
                if (legacy) tenantCodes = [legacy];
            }

            const newFilters = [...(filters || [])];

            // Inject tenant filter if tenantCodes exist
            if (tenantCodes.length > 0 && resource !== "tenants") {
                if (tenantCodes.length === 1) {
                    newFilters.push({
                        field: "tenant_code",
                        operator: "eq",
                        value: tenantCodes[0],
                    });
                } else {
                    newFilters.push({
                        field: "tenant_code",
                        operator: "in",
                        value: tenantCodes,
                    });
                }
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
            return baseDataProvider.getMany!(params);
        },
        create: async ({ resource, variables, meta }) => {
            const selectedCodestStr = localStorage.getItem("selected_tenant_codes");
            let tenantCodes: string[] = [];
            if (selectedCodestStr) {
                try {
                    const parsed = JSON.parse(selectedCodestStr);
                    if (Array.isArray(parsed)) tenantCodes = parsed;
                } catch { }
            }
            // Use first selected tenant for creation if available
            const primaryTenant = tenantCodes.length > 0 ? tenantCodes[0] : localStorage.getItem("current_tenant_code");

            const newVariables = { ...variables };

            if (primaryTenant && resource !== "tenants") {
                if (!Object.prototype.hasOwnProperty.call(newVariables, "tenant_code")) {
                    (newVariables as any).tenant_code = primaryTenant;
                }
            }

            return baseDataProvider.create({
                resource,
                variables: newVariables,
                meta
            })
        },
        update: async (params) => {
            return baseDataProvider.update(params);
        },
    };
};
