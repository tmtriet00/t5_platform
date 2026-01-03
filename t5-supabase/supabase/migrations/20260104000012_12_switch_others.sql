-- Part 12: Switch Other Tables to UUID

-- Notes
ALTER TABLE notes DROP COLUMN id CASCADE;
ALTER TABLE notes RENAME COLUMN new_id TO id;
ALTER TABLE notes ADD CONSTRAINT notes_pkey PRIMARY KEY (id);

-- Cycles
ALTER TABLE cycles DROP COLUMN id CASCADE;
ALTER TABLE cycles RENAME COLUMN new_id TO id;
ALTER TABLE cycles ADD CONSTRAINT cycles_pkey PRIMARY KEY (id);

-- Configurations
ALTER TABLE configurations DROP COLUMN id CASCADE;
ALTER TABLE configurations RENAME COLUMN new_id TO id;
ALTER TABLE configurations ADD CONSTRAINT configurations_pkey PRIMARY KEY (id);

-- Emergency Tickets
ALTER TABLE emergency_tickets DROP COLUMN id CASCADE;
ALTER TABLE emergency_tickets RENAME COLUMN new_id TO id;
ALTER TABLE emergency_tickets ADD CONSTRAINT emergency_tickets_pkey PRIMARY KEY (id);
