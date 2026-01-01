-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Add tenant_code to all tables with Foreign Key constraint
ALTER TABLE IF EXISTS tasks ADD COLUMN IF NOT EXISTS tenant_code TEXT REFERENCES tenants(code) DEFAULT NULL;
ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS tenant_code TEXT REFERENCES tenants(code) DEFAULT NULL;
ALTER TABLE IF EXISTS time_entries ADD COLUMN IF NOT EXISTS tenant_code TEXT REFERENCES tenants(code) DEFAULT NULL;
ALTER TABLE IF EXISTS task_estimations ADD COLUMN IF NOT EXISTS tenant_code TEXT REFERENCES tenants(code) DEFAULT NULL;
ALTER TABLE IF EXISTS emergency_tickets ADD COLUMN IF NOT EXISTS tenant_code TEXT REFERENCES tenants(code) DEFAULT NULL;

-- These tables appear to be from catchup/examples, but adding for completeness as planned
ALTER TABLE IF EXISTS categories ADD COLUMN IF NOT EXISTS tenant_code TEXT REFERENCES tenants(code) DEFAULT NULL;
ALTER TABLE IF EXISTS posts ADD COLUMN IF NOT EXISTS tenant_code TEXT REFERENCES tenants(code) DEFAULT NULL;
