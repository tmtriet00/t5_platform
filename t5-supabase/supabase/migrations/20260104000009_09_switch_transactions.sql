-- Part 9: Switch Transactions to UUID

ALTER TABLE transactions DROP COLUMN id CASCADE;
ALTER TABLE transactions DROP COLUMN ledger_id CASCADE;
ALTER TABLE transactions RENAME COLUMN new_id TO id;
ALTER TABLE transactions RENAME COLUMN new_ledger_id TO ledger_id;
ALTER TABLE transactions ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);
ALTER TABLE transactions ADD CONSTRAINT transactions_ledger_id_fkey FOREIGN KEY (ledger_id) REFERENCES ledgers(id);
ALTER TABLE transactions ALTER COLUMN ledger_id SET NOT NULL;
