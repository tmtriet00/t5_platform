-- Part 11: Switch Wish List Items & Track to UUID

-- Wish List Items
ALTER TABLE wish_list_items DROP COLUMN id CASCADE;
ALTER TABLE wish_list_items RENAME COLUMN new_id TO id;
ALTER TABLE wish_list_items ADD CONSTRAINT wish_list_items_pkey PRIMARY KEY (id);

-- Wish List Items Track
ALTER TABLE wish_list_items_track DROP COLUMN id CASCADE;
ALTER TABLE wish_list_items_track DROP COLUMN wish_list_item_id CASCADE;
ALTER TABLE wish_list_items_track RENAME COLUMN new_id TO id;
ALTER TABLE wish_list_items_track RENAME COLUMN new_wish_list_item_id TO wish_list_item_id;
ALTER TABLE wish_list_items_track ADD CONSTRAINT wish_list_items_track_pkey PRIMARY KEY (id);
ALTER TABLE wish_list_items_track ADD CONSTRAINT wish_list_items_track_wish_list_item_id_fkey FOREIGN KEY (wish_list_item_id) REFERENCES wish_list_items(id);
ALTER TABLE wish_list_items_track ALTER COLUMN wish_list_item_id SET NOT NULL;
