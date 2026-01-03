-- Part 8: Switch Ledgers to UUID

ALTER TABLE ledgers DROP COLUMN id CASCADE;
ALTER TABLE ledgers RENAME COLUMN new_id TO id;
ALTER TABLE ledgers ADD CONSTRAINT ledgers_pkey PRIMARY KEY (id);
