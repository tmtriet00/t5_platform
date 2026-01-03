CREATE TYPE transaction_category AS ENUM  ('transfer_only', 'default');

alter table transactions add column category transaction_category default 'default';