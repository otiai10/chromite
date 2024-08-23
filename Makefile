
release:
	@echo "\033[0;36mBuilding release version...\033[0m"
	npm install
	npm run build
	npm publish
	@echo "\033[0;36m[SUCCESS]\033[0m Good work! Don't forget to tag and push the changes to the repository."
