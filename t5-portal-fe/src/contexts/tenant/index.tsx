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
    tenant: Tenant | null;
    setTenant: (tenant: Tenant) => void;
    tenants: Tenant[];
    loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [tenant, setTenantState] = useState<Tenant | null>(() => {
        const saved = localStorage.getItem("current_tenant_code");
        return saved ? { code: saved, name: saved } : null;
        // We only have code initally, will update name when tenants are loaded if needed
        // But for now, simple object is enough to start.
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
        if (tenant && tenants.length > 0) {
            // Validation: ensure current tenant actually exists in the list
            const found = tenants.find(t => t.code === tenant.code);
            if (found) {
                if (found.name !== tenant.name) {
                    setTenantState(found);
                }
            } else {
                // If stored tenant not found, maybe reset? or keep it (maybe user has access to hidden tenant?)
                // For safety, let's keep it but maybe warn? 
                // Better behavior: if not found, don't change anything, wait for user to switch.
            }
        } else if (!tenant && tenants.length > 0) {
            // Auto select first tenant if none selected
            const first = tenants[0];
            setTenantState(first);
            localStorage.setItem("current_tenant_code", first.code);
        }
    }, [tenants, tenant]); // Check dependencies carefully

    const setTenant = (t: Tenant) => {
        setTenantState(t);
        localStorage.setItem("current_tenant_code", t.code);
        window.location.reload(); // Force reload to ensure data provider picks up new tenant
    };

    return (
        <TenantContext.Provider
            value={{
                tenant,
                setTenant,
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
