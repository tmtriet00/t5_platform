.PHONY: start-browser stop-browser

start-browser:
	@echo "Starting Neko browser..."
	@cd t5-browser && docker compose up -d
	@echo "Neko browser started at http://localhost:8080"

stop-browser:
	@echo "Stopping Neko browser..."
	@cd t5-browser && docker compose down
	@echo "Neko browser stopped."

setup-supabase:
	cd supabase && sh ./utils/generate-keys.sh

start-supabase:
	cd supabase && unset POSTGRES_PASSWORD && unset POSTGRES_HOST && docker compose up -d

stop-supabase:
	cd supabase && docker compose down

build-fe:
	docker compose build t5-portal-fe

start-fe:
	docker compose up -d t5-portal-fe

stop-fe:
	docker compose down t5-portal-fe