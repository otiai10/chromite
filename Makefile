
release:
	@echo "\033[0;36mBuilding release version...\033[0m"
	npm install
	npm run build
	npm publish
