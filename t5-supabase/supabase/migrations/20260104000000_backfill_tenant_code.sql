-- Backfill tenant_code with 't5_platform' for all tables where tenant_code is NULL
-- This migration ensures all existing records have a tenant_code value

-- Update tasks table
UPDATE tasks 
SET tenant_code = 't5_platform' 
WHERE tenant_code IS NULL;

-- Update projects table
UPDATE projects 
SET tenant_code = 't5_platform' 
WHERE tenant_code IS NULL;

-- Update time_entries table
UPDATE time_entries 
SET tenant_code = 't5_platform' 
WHERE tenant_code IS NULL;

-- Update task_estimations table
UPDATE task_estimations 
SET tenant_code = 't5_platform' 
WHERE tenant_code IS NULL;

-- Update emergency_tickets table
UPDATE emergency_tickets 
SET tenant_code = 't5_platform' 
WHERE tenant_code IS NULL;

-- Update categories table
UPDATE categories 
SET tenant_code = 't5_platform' 
WHERE tenant_code IS NULL;

-- Update posts table
UPDATE posts 
SET tenant_code = 't5_platform' 
WHERE tenant_code IS NULL;

-- Update notes table
UPDATE notes 
SET tenant_code = 't5_platform' 
WHERE tenant_code IS NULL;

-- Update wish_list_items table
UPDATE wish_list_items 
SET tenant_code = 't5_platform' 
WHERE tenant_code IS NULL;

-- Update wish_list_items_track table
UPDATE wish_list_items_track 
SET tenant_code = 't5_platform' 
WHERE tenant_code IS NULL;

-- Update ledgers table
UPDATE ledgers 
SET tenant_code = 't5_platform' 
WHERE tenant_code IS NULL;

-- Update transactions table
UPDATE transactions 
SET tenant_code = 't5_platform' 
WHERE tenant_code IS NULL;

-- Update finance_checkin_records table
UPDATE finance_checkin_records 
SET tenant_code = 't5_platform' 
WHERE tenant_code IS NULL;

-- Update configurations table
UPDATE configurations 
SET tenant_code = 't5_platform' 
WHERE tenant_code IS NULL;

-- Update cycles table
UPDATE cycles 
SET tenant_code = 't5_platform' 
WHERE tenant_code IS NULL;
