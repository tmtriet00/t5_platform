import React from "react";
import { Select, Spin } from "antd";
import { useTenant } from "../../contexts/tenant";

export const TenantSwitcher: React.FC = () => {
    const { selectedTenants, setSelectedTenants, tenants, loading } = useTenant();

    if (loading && tenants.length === 0) {
        return <Spin size="small" />;
    }

    return (
        <Select
            mode="multiple"
            value={selectedTenants.map(t => t.code)}
            style={{ width: "100%", marginBottom: 16 }}
            onChange={(values: string[]) => {
                const selected = tenants.filter((t) => values.includes(t.code));
                // Ensure at least one tenant is selected, or allow empty?
                // Context handles empty check on init, but user might want to clear all?
                // Plan says "Default to picking the first available tenant if none selected".
                // But interactively letting user clear all might be weird.
                // Let's allow clear for now, context will auto-select if empty on reload if specific logic triggers,
                // but setState won't trigger the "init" logic again. 
                // Let's just update.
                setSelectedTenants(selected);
            }}
            options={tenants.map((t) => ({
                label: t.name || t.code,
                value: t.code,
            }))}
            placeholder="Select Tenant"
            showSearch
            maxTagCount="responsive"
            filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
        />
    );
};
