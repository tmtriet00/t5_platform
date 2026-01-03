-- Part 10: Switch Finance Checkin Records to UUID

ALTER TABLE finance_checkin_records DROP COLUMN id CASCADE;
ALTER TABLE finance_checkin_records DROP COLUMN ledger_id CASCADE;
ALTER TABLE finance_checkin_records RENAME COLUMN new_id TO id;
ALTER TABLE finance_checkin_records RENAME COLUMN new_ledger_id TO ledger_id;
ALTER TABLE finance_checkin_records ADD CONSTRAINT finance_checkin_records_pkey PRIMARY KEY (id);
ALTER TABLE finance_checkin_records ADD CONSTRAINT finance_checkin_records_ledger_id_fkey FOREIGN KEY (ledger_id) REFERENCES ledgers(id);
ALTER TABLE finance_checkin_records ALTER COLUMN ledger_id SET NOT NULL;
