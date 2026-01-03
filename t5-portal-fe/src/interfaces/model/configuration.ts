export interface Configuration {
    id: number;
    config_key: string;
    config_value: string;
    config_category: string;
    description: string;
    tenant_code?: string;
    created_at: string;
}
