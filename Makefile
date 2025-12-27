.PHONY: start-browser stop-browser

start-browser:
	@echo "Starting Neko browser..."
	@cd t5-browser && docker-compose up -d
	@echo "Neko browser started at http://localhost:8080"

stop-browser:
	@echo "Stopping Neko browser..."
	@cd t5-browser && docker-compose down
	@echo "Neko browser stopped."
