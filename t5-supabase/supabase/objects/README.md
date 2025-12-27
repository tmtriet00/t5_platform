# Supabase Objects Directory

This directory contains the "source of truth" definitions for repeatable database objects, such as Functions, Views, Triggers, and Stored Procedures.

## Purpose

Standard Supabase migrations (`supabase/migrations`) are strictly versioned and immutable once applied. This works well for table schemas (CREATE TABLE, ALTER TABLE), but poorly for code-like objects (Functions, Views) where you often want to see the *current* definition rather than digging through history to find the latest version.

## Structure

```
supabase/objects/
├── functions/      # SQL files for CREATE OR REPLACE FUNCTION
├── views/          # SQL files for CREATE OR REPLACE VIEW
├── triggers/       # SQL files for CREATE OR REPLACE TRIGGER
└── procedures/     # SQL files for CREATE PROCEDURE
```

## Workflow

1.  **Edit**: Modify the SQL file in this directory (e.g., `functions/my_function.sql`).
2.  **Generate Migration**: Run the helper script to create a versioned migration file from your changes.

    ```bash
    npm run db:new-migration -- --target supabase/objects/functions/my_function.sql
    ```
    
    *Note: The `--name` argument is optional. If omitted, it defaults to `update_<type>_<filename>` (e.g., `update_function_my_function`).*


3.  **Apply**: The new migration file in `supabase/migrations/` will be picked up by Supabase.

This workflow ensures you have a clean history of changes while maintaining a readable, current state of your business logic.
