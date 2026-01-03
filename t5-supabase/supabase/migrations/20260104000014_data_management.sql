-- Create function to export tenant data
CREATE OR REPLACE FUNCTION export_tenant_data(target_tenant_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'configurations', (SELECT coalesce(jsonb_agg(t ORDER BY id), '[]'::jsonb) FROM (SELECT * FROM configurations WHERE tenant_code = target_tenant_code) t),
        'cycles', (SELECT coalesce(jsonb_agg(t ORDER BY id), '[]'::jsonb) FROM (SELECT * FROM cycles WHERE tenant_code = target_tenant_code) t),
        'ledgers', (SELECT coalesce(jsonb_agg(t ORDER BY id), '[]'::jsonb) FROM (SELECT * FROM ledgers WHERE tenant_code = target_tenant_code) t),
        'transactions', (SELECT coalesce(jsonb_agg(t ORDER BY id), '[]'::jsonb) FROM (SELECT * FROM transactions WHERE tenant_code = target_tenant_code) t),
        'finance_checkin_records', (SELECT coalesce(jsonb_agg(t ORDER BY id), '[]'::jsonb) FROM (SELECT * FROM finance_checkin_records WHERE tenant_code = target_tenant_code) t),
        'wish_list_items', (SELECT coalesce(jsonb_agg(t ORDER BY id), '[]'::jsonb) FROM (SELECT * FROM wish_list_items WHERE tenant_code = target_tenant_code) t),
        'wish_list_items_track', (SELECT coalesce(jsonb_agg(t ORDER BY id), '[]'::jsonb) FROM (SELECT * FROM wish_list_items_track WHERE tenant_code = target_tenant_code) t),
        'projects', (SELECT coalesce(jsonb_agg(t ORDER BY id), '[]'::jsonb) FROM (SELECT * FROM projects WHERE tenant_code = target_tenant_code) t),
        'tasks', (SELECT coalesce(jsonb_agg(t ORDER BY id), '[]'::jsonb) FROM (SELECT * FROM tasks WHERE tenant_code = target_tenant_code) t),
        'task_estimations', (SELECT coalesce(jsonb_agg(t ORDER BY id), '[]'::jsonb) FROM (SELECT * FROM task_estimations WHERE tenant_code = target_tenant_code) t),
        'time_entries', (SELECT coalesce(jsonb_agg(t ORDER BY id), '[]'::jsonb) FROM (SELECT * FROM time_entries WHERE tenant_code = target_tenant_code) t),
        'notes', (SELECT coalesce(jsonb_agg(t ORDER BY id), '[]'::jsonb) FROM (SELECT * FROM notes WHERE tenant_code = target_tenant_code) t),
        'emergency_tickets', (SELECT coalesce(jsonb_agg(t ORDER BY id), '[]'::jsonb) FROM (SELECT * FROM emergency_tickets WHERE tenant_code = target_tenant_code) t),
        'posts', (SELECT coalesce(jsonb_agg(t ORDER BY id), '[]'::jsonb) FROM (SELECT * FROM posts WHERE tenant_code = target_tenant_code) t),
        'categories', (SELECT coalesce(jsonb_agg(t ORDER BY id), '[]'::jsonb) FROM (SELECT * FROM categories WHERE tenant_code = target_tenant_code) t)
    ) INTO result;

    RETURN result;
END;
$$;

-- Create function to import tenant data (WIPE AND REPLACE)
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
    IF data ? 'categories' THEN
        INSERT INTO categories SELECT * FROM jsonb_populate_recordset(null::categories, data->'categories');
        PERFORM setval(pg_get_serial_sequence('categories', 'id'), coalesce((SELECT max(id) FROM categories), 0) + 1, false);
    END IF;

    IF data ? 'posts' THEN
        INSERT INTO posts SELECT * FROM jsonb_populate_recordset(null::posts, data->'posts');
        PERFORM setval(pg_get_serial_sequence('posts', 'id'), coalesce((SELECT max(id) FROM posts), 0) + 1, false);
    END IF;

    IF data ? 'emergency_tickets' THEN
        INSERT INTO emergency_tickets SELECT * FROM jsonb_populate_recordset(null::emergency_tickets, data->'emergency_tickets');
        PERFORM setval(pg_get_serial_sequence('emergency_tickets', 'id'), coalesce((SELECT max(id) FROM emergency_tickets), 0) + 1, false);
    END IF;

    IF data ? 'notes' THEN
        INSERT INTO notes SELECT * FROM jsonb_populate_recordset(null::notes, data->'notes');
        PERFORM setval(pg_get_serial_sequence('notes', 'id'), coalesce((SELECT max(id) FROM notes), 0) + 1, false);
    END IF;

    IF data ? 'configurations' THEN
        INSERT INTO configurations SELECT * FROM jsonb_populate_recordset(null::configurations, data->'configurations');
        PERFORM setval(pg_get_serial_sequence('configurations', 'id'), coalesce((SELECT max(id) FROM configurations), 0) + 1, false);
    END IF;

    IF data ? 'cycles' THEN
        INSERT INTO cycles SELECT * FROM jsonb_populate_recordset(null::cycles, data->'cycles');
        PERFORM setval(pg_get_serial_sequence('cycles', 'id'), coalesce((SELECT max(id) FROM cycles), 0) + 1, false);
    END IF;

    IF data ? 'wish_list_items' THEN
        INSERT INTO wish_list_items SELECT * FROM jsonb_populate_recordset(null::wish_list_items, data->'wish_list_items');
        PERFORM setval(pg_get_serial_sequence('wish_list_items', 'id'), coalesce((SELECT max(id) FROM wish_list_items), 0) + 1, false);
    END IF;

    IF data ? 'wish_list_items_track' THEN
        INSERT INTO wish_list_items_track SELECT * FROM jsonb_populate_recordset(null::wish_list_items_track, data->'wish_list_items_track');
        PERFORM setval(pg_get_serial_sequence('wish_list_items_track', 'id'), coalesce((SELECT max(id) FROM wish_list_items_track), 0) + 1, false);
    END IF;

    IF data ? 'ledgers' THEN
        INSERT INTO ledgers SELECT * FROM jsonb_populate_recordset(null::ledgers, data->'ledgers');
        PERFORM setval(pg_get_serial_sequence('ledgers', 'id'), coalesce((SELECT max(id) FROM ledgers), 0) + 1, false);
    END IF;
    
    IF data ? 'finance_checkin_records' THEN
        INSERT INTO finance_checkin_records SELECT * FROM jsonb_populate_recordset(null::finance_checkin_records, data->'finance_checkin_records');
         PERFORM setval(pg_get_serial_sequence('finance_checkin_records', 'id'), coalesce((SELECT max(id) FROM finance_checkin_records), 0) + 1, false);
    END IF;

    IF data ? 'transactions' THEN
        INSERT INTO transactions SELECT * FROM jsonb_populate_recordset(null::transactions, data->'transactions');
        PERFORM setval(pg_get_serial_sequence('transactions', 'id'), coalesce((SELECT max(id) FROM transactions), 0) + 1, false);
    END IF;

    IF data ? 'projects' THEN
        INSERT INTO projects SELECT * FROM jsonb_populate_recordset(null::projects, data->'projects');
        PERFORM setval(pg_get_serial_sequence('projects', 'id'), coalesce((SELECT max(id) FROM projects), 0) + 1, false);
    END IF;

    IF data ? 'tasks' THEN
        INSERT INTO tasks SELECT * FROM jsonb_populate_recordset(null::tasks, data->'tasks');
        PERFORM setval(pg_get_serial_sequence('tasks', 'id'), coalesce((SELECT max(id) FROM tasks), 0) + 1, false);
    END IF;

    IF data ? 'task_estimations' THEN
        INSERT INTO task_estimations SELECT * FROM jsonb_populate_recordset(null::task_estimations, data->'task_estimations');
        PERFORM setval(pg_get_serial_sequence('task_estimations', 'id'), coalesce((SELECT max(id) FROM task_estimations), 0) + 1, false);
    END IF;
    
    IF data ? 'time_entries' THEN
        INSERT INTO time_entries SELECT * FROM jsonb_populate_recordset(null::time_entries, data->'time_entries');
        PERFORM setval(pg_get_serial_sequence('time_entries', 'id'), coalesce((SELECT max(id) FROM time_entries), 0) + 1, false);
    END IF;

END;
$$;
