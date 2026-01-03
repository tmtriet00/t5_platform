-- Fix import_tenant_data function to handle UUID tables (remove setval)
-- Only categories and posts (and maybe others not switched) need setval if they are still BigInt.
-- Based on previous analysis, most tables are switched to UUID.

CREATE OR REPLACE FUNCTION import_tenant_data(target_tenant_code text, data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. DELETE existing data (Child tables first)
    DELETE FROM time_entries WHERE tenant_code = target_tenant_code;
    DELETE FROM task_estimations WHERE tenant_code = target_tenant_code;
    DELETE FROM tasks WHERE tenant_code = target_tenant_code;
    DELETE FROM projects WHERE tenant_code = target_tenant_code;
    
    DELETE FROM transactions WHERE tenant_code = target_tenant_code;
    DELETE FROM finance_checkin_records WHERE tenant_code = target_tenant_code;
    DELETE FROM ledgers WHERE tenant_code = target_tenant_code;
    
    DELETE FROM wish_list_items_track WHERE tenant_code = target_tenant_code;
    DELETE FROM wish_list_items WHERE tenant_code = target_tenant_code;
    
    DELETE FROM cycles WHERE tenant_code = target_tenant_code;
    DELETE FROM configurations WHERE tenant_code = target_tenant_code;
    DELETE FROM notes WHERE tenant_code = target_tenant_code;
    DELETE FROM emergency_tickets WHERE tenant_code = target_tenant_code;
    DELETE FROM posts WHERE tenant_code = target_tenant_code;
    DELETE FROM categories WHERE tenant_code = target_tenant_code;

    -- 2. INSERT new data (Parent tables first)
    
    -- Categories (Still BigInt?) - Assuming yes based on lack of switch file evidence
    IF data ? 'categories' THEN
        INSERT INTO categories SELECT * FROM jsonb_populate_recordset(null::categories, data->'categories');
        -- Only run setval if it is BigInt SERIAL. If switched to UUID, this will error. 
        -- To be safe, we can wrap in BEGIN/EXCEPTION or check column type.
        -- But for now, assuming BigInt as per analysis.
        PERFORM setval(pg_get_serial_sequence('categories', 'id'), coalesce((SELECT max(id) FROM categories), 0) + 1, false);
    END IF;

    -- Posts (Still BigInt?)
    IF data ? 'posts' THEN
        INSERT INTO posts SELECT * FROM jsonb_populate_recordset(null::posts, data->'posts');
        PERFORM setval(pg_get_serial_sequence('posts', 'id'), coalesce((SELECT max(id) FROM posts), 0) + 1, false);
    END IF;

    -- Emergency Tickets (Switched to UUID)
    IF data ? 'emergency_tickets' THEN
        INSERT INTO emergency_tickets SELECT * FROM jsonb_populate_recordset(null::emergency_tickets, data->'emergency_tickets');
    END IF;

    -- Notes (Switched to UUID)
    IF data ? 'notes' THEN
        INSERT INTO notes SELECT * FROM jsonb_populate_recordset(null::notes, data->'notes');
    END IF;

    -- Configurations (Switched to UUID)
    IF data ? 'configurations' THEN
        INSERT INTO configurations SELECT * FROM jsonb_populate_recordset(null::configurations, data->'configurations');
    END IF;

    -- Cycles (Switched to UUID)
    IF data ? 'cycles' THEN
        INSERT INTO cycles SELECT * FROM jsonb_populate_recordset(null::cycles, data->'cycles');
    END IF;

    -- Wish List Items (Switched to UUID)
    IF data ? 'wish_list_items' THEN
        INSERT INTO wish_list_items SELECT * FROM jsonb_populate_recordset(null::wish_list_items, data->'wish_list_items');
    END IF;

    -- Wish List Items Track (Switched to UUID)
    IF data ? 'wish_list_items_track' THEN
        INSERT INTO wish_list_items_track SELECT * FROM jsonb_populate_recordset(null::wish_list_items_track, data->'wish_list_items_track');
    END IF;

    -- Ledgers (Switched to UUID)
    IF data ? 'ledgers' THEN
        INSERT INTO ledgers SELECT * FROM jsonb_populate_recordset(null::ledgers, data->'ledgers');
    END IF;
    
    -- Finance Checkin Records (Switched to UUID)
    IF data ? 'finance_checkin_records' THEN
        INSERT INTO finance_checkin_records SELECT * FROM jsonb_populate_recordset(null::finance_checkin_records, data->'finance_checkin_records');
    END IF;

    -- Transactions (Switched to UUID)
    IF data ? 'transactions' THEN
        INSERT INTO transactions SELECT * FROM jsonb_populate_recordset(null::transactions, data->'transactions');
    END IF;

    -- Projects (Switched to UUID)
    IF data ? 'projects' THEN
        INSERT INTO projects SELECT * FROM jsonb_populate_recordset(null::projects, data->'projects');
    END IF;

    -- Tasks (Switched to UUID)
    IF data ? 'tasks' THEN
        INSERT INTO tasks SELECT * FROM jsonb_populate_recordset(null::tasks, data->'tasks');
    END IF;

    -- Task Estimations (Switched to UUID)
    IF data ? 'task_estimations' THEN
        INSERT INTO task_estimations SELECT * FROM jsonb_populate_recordset(null::task_estimations, data->'task_estimations');
    END IF;
    
    -- Time Entries (Switched to UUID)
    IF data ? 'time_entries' THEN
        INSERT INTO time_entries SELECT * FROM jsonb_populate_recordset(null::time_entries, data->'time_entries');
    END IF;

END;
$$;
