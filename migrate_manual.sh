#!/bin/bash

# Configuration
MIGRATION_DIR="t5-supabase/supabase/migrations"
CONTAINER_NAME="supabase-db"
DB_USER="postgres"
DB_NAME="postgres"

# Check if running from project root
if [ ! -d "$MIGRATION_DIR" ]; then
    echo "Error: Migration directory '$MIGRATION_DIR' not found."
    echo "Please run this script from the root of the t5_platform project."
    exit 1
fi

echo "Status: Checking container..."
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "Error: Container '$CONTAINER_NAME' is not running."
    exit 1
fi

# Ensure migration tracking table exists
echo "Status: Ensuring migration tracking table exists..."
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "create schema if not exists supabase_migrations; create table if not exists supabase_migrations.schema_migrations (version text primary key);" > /dev/null 2>&1

echo "Starting migration application..."

# Get list of applied migrations
APPLIED_MIGRATIONS=$(docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT version FROM supabase_migrations.schema_migrations")

# Loop through sql files in sorted order
for f in $(ls "$MIGRATION_DIR"/*.sql | sort); do
    filename=$(basename "$f")
    version=$(echo "$filename" | cut -d_ -f1)
    
    # Check if version is in the applied list
    if echo "$APPLIED_MIGRATIONS" | grep -q "$version"; then
        echo "✓ Skipped (already applied): $filename"
    else
        echo "Applying: $filename..."
        # Apply migration
        if cat "$f" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"; then
            # Record success
            docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('$version');" > /dev/null
            echo "✓ Successfully applied: $filename"
        else
            echo "✗ Failed to apply: $filename"
            exit 1 
        fi
    fi
done

echo "Migration process completed."
