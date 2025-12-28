-- Backfill created_by column with specific user ID

-- categories
update "public"."categories" set "created_by" = 'ca933f5e-4fc8-47d4-a97a-e881d617320e';

-- posts
update "public"."posts" set "created_by" = 'ca933f5e-4fc8-47d4-a97a-e881d617320e';

-- tasks
update "public"."tasks" set "created_by" = 'ca933f5e-4fc8-47d4-a97a-e881d617320e';

-- projects
update "public"."projects" set "created_by" = 'ca933f5e-4fc8-47d4-a97a-e881d617320e';

-- time_entries
update "public"."time_entries" set "created_by" = 'ca933f5e-4fc8-47d4-a97a-e881d617320e';

-- task_estimations
update "public"."task_estimations" set "created_by" = 'ca933f5e-4fc8-47d4-a97a-e881d617320e';
