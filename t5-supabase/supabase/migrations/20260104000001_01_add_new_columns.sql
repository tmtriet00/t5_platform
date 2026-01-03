-- Part 1: Add new UUID columns for IDs and Foreign Keys

ALTER TABLE projects ADD COLUMN new_id uuid DEFAULT gen_random_uuid();
ALTER TABLE tasks ADD COLUMN new_id uuid DEFAULT gen_random_uuid();
ALTER TABLE tasks ADD COLUMN new_project_id uuid;
ALTER TABLE time_entries ADD COLUMN new_id uuid DEFAULT gen_random_uuid();
ALTER TABLE time_entries ADD COLUMN new_task_id uuid;
ALTER TABLE task_estimations ADD COLUMN new_id uuid DEFAULT gen_random_uuid();
ALTER TABLE task_estimations ADD COLUMN new_task_id uuid;
ALTER TABLE ledgers ADD COLUMN new_id uuid DEFAULT gen_random_uuid();
ALTER TABLE transactions ADD COLUMN new_id uuid DEFAULT gen_random_uuid();
ALTER TABLE transactions ADD COLUMN new_ledger_id uuid;
ALTER TABLE finance_checkin_records ADD COLUMN new_id uuid DEFAULT gen_random_uuid();
ALTER TABLE finance_checkin_records ADD COLUMN new_ledger_id uuid;
ALTER TABLE wish_list_items ADD COLUMN new_id uuid DEFAULT gen_random_uuid();
ALTER TABLE wish_list_items_track ADD COLUMN new_id uuid DEFAULT gen_random_uuid();
ALTER TABLE wish_list_items_track ADD COLUMN new_wish_list_item_id uuid;
ALTER TABLE notes ADD COLUMN new_id uuid DEFAULT gen_random_uuid();
ALTER TABLE cycles ADD COLUMN new_id uuid DEFAULT gen_random_uuid();
ALTER TABLE configurations ADD COLUMN new_id uuid DEFAULT gen_random_uuid();
ALTER TABLE emergency_tickets ADD COLUMN new_id uuid DEFAULT gen_random_uuid();
