create type wish_list_item_status as enum ('not_started', 'in_progress', 'completed', 'canceled');

alter table wish_list_items add column status wish_list_item_status default 'in_progress';

alter table wish_list_items_track add currency text default 'VND';