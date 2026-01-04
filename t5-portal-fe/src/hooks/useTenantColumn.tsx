import { useTenant } from "../contexts/tenant";
import { ColDef } from 'ag-grid-community';
import { Table } from "antd";

export const useTenantColumn = () => {
    const { selectedTenants } = useTenant();

    // Show column if more than 1 tenant is selected
    const showTenantColumn = selectedTenants.length > 1;

    const getTenantColumnDef = (): ColDef | null => {
        if (!showTenantColumn) return null;

        return {
            field: "tenant_code",
            headerName: "Tenant",
            sortable: true,
            filter: true,
            width: 120,
            editable: false,
        };
    };

    const AntTenantColumn = () => {
        if (!showTenantColumn) return null;
        return <Table.Column dataIndex="tenant_code" title="Tenant" />;
    };

    return {
        showTenantColumn,
        getTenantColumnDef,
        AntTenantColumn
    };
};
