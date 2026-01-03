-- Part 2: Backfill Foreign Keys

-- Tasks -> Projects
UPDATE tasks t 
SET new_project_id = p.new_id 
FROM projects p 
WHERE t.project_id = p.id;

-- Time Entries -> Tasks
UPDATE time_entries te 
SET new_task_id = t.new_id 
FROM tasks t 
WHERE te.task_id = t.id;

-- Task Estimations -> Tasks
UPDATE task_estimations te 
SET new_task_id = t.new_id 
FROM tasks t 
WHERE te.task_id = t.id;

-- Transactions -> Ledgers
UPDATE transactions tr 
SET new_ledger_id = l.new_id 
FROM ledgers l 
WHERE tr.ledger_id = l.id;

-- Finance Checkin Records -> Ledgers
UPDATE finance_checkin_records fcr 
SET new_ledger_id = l.new_id 
FROM ledgers l 
WHERE fcr.ledger_id = l.id;

-- Wish List Items Track -> Wish List Items
UPDATE wish_list_items_track wlit 
SET new_wish_list_item_id = wli.new_id 
FROM wish_list_items wli 
WHERE wlit.wish_list_item_id = wli.id;
