.PHONY: start-browser stop-browser

start-browser:
	@echo "Starting Neko browser..."
	@cd t5-browser && docker-compose up -d
	@echo "Neko browser started at http://localhost:8080"

stop-browser:
	@echo "Stopping Neko browser..."
	@cd t5-browser && docker-compose down
	@echo "Neko browser stopped."

setup-supabase:
	cd supabase && sh ./utils/generate-keys.sh

start-supabase:
	cd supabase && docker-compose up -d

build-fe:
	docker-compose build t5-portal-fe

start-fe:
	docker-compose up -d t5-portal-fe

stop-fe:
	docker-compose down t5-portal-fe