import React from "react";
import { Select, Spin } from "antd";
import { useTenant } from "../../contexts/tenant";

export const TenantSwitcher: React.FC = () => {
    const { tenant, setTenant, tenants, loading } = useTenant();

    if (loading && tenants.length === 0) {
        return <Spin size="small" />;
    }

    return (
        <Select
            value={tenant?.code}
            style={{ width: "100%", marginBottom: 16 }}
            onChange={(value) => {
                const selected = tenants.find((t) => t.code === value);
                if (selected) {
                    setTenant(selected);
                }
            }}
            options={tenants.map((t) => ({
                label: t.name || t.code,
                value: t.code,
            }))}
            placeholder="Select Tenant"
            showSearch
            filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
        />
    );
};
