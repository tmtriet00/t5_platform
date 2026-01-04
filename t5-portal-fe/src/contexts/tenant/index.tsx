import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { useList } from "@refinedev/core";

export interface Tenant {
    code: string;
    name: string;
}

interface TenantContextType {
    selectedTenants: Tenant[];
    setSelectedTenants: (tenants: Tenant[]) => void;
    tenants: Tenant[];
    loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [selectedTenants, setSelectedTenantsState] = useState<Tenant[]>(() => {
        const saved = localStorage.getItem("selected_tenant_codes");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    return parsed.map((code: string) => ({ code, name: code }));
                }
            } catch (e) {
                // Fallback to legacy single tenant if JSON parse fails
                return [{ code: saved, name: saved }];
            }
        }

        // Fallback for migration from single tenant key
        const singleSaved = localStorage.getItem("current_tenant_code");
        if (singleSaved) {
            return [{ code: singleSaved, name: singleSaved }];
        }

        return [];
    });

    const { query } = useList<Tenant>({
        resource: "tenants",
        pagination: {
            mode: "off"
        }
    });

    const { data, isLoading } = query;
    const tenants = data?.data || [];

    useEffect(() => {
        if (selectedTenants.length > 0 && tenants.length > 0) {
            // Update names of selected tenants from the loaded list
            const updatedSelection = selectedTenants.map(selected => {
                const found = tenants.find(t => t.code === selected.code);
                return found ? found : selected;
            });

            // Only update if names changed
            const hasChanges = updatedSelection.some((u, i) => u.name !== selectedTenants[i].name);
            if (hasChanges) {
                setSelectedTenantsState(updatedSelection);
            }
        } else if (selectedTenants.length === 0 && tenants.length > 0) {
            // Auto select first tenant if none selected
            const first = tenants[0];
            setSelectedTenantsState([first]);
            localStorage.setItem("selected_tenant_codes", JSON.stringify([first.code]));
        }
    }, [tenants, selectedTenants]);

    const setSelectedTenants = (t: Tenant[]) => {
        setSelectedTenantsState(t);
        const codes = t.map(tenant => tenant.code);
        localStorage.setItem("selected_tenant_codes", JSON.stringify(codes));
        // Remove legacy key to avoid confusion
        localStorage.removeItem("current_tenant_code");
        window.location.reload();
    };

    return (
        <TenantContext.Provider
            value={{
                selectedTenants,
                setSelectedTenants,
                tenants,
                loading: isLoading,
            }}
        >
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error("useTenant must be used within a TenantProvider");
    }
    return context;
};
