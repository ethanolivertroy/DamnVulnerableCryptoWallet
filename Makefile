DOCKER_COMPOSE = docker-compose


build: ## Build services. Does not start them.
	$(DOCKER_COMPOSE) build --no-cache --force-rm

kill: ## Stops all services and deletes them.
	$(DOCKER_COMPOSE) stop
	$(DOCKER_COMPOSE) rm -f
	$(DOCKER_COMPOSE) down --volumes --remove-orphans
	rm -rf ~/.config/dvcw-desktop-app

start: ## Starts services
	$(DOCKER_COMPOSE) up --force-recreate

install: ## Deploy and start services
install: build start

reset: ## Fresh restart (stops and deletes everything, then builds from scratch)
reset: kill install

stop: ## Stop services. Does not delete anything.
	$(DOCKER_COMPOSE) stop

resume: ## Resumes stopped services
	$(DOCKER_COMPOSE) start

.PHONY: kill install reset start stop

.DEFAULT_GOAL := help
help:
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'
.PHONY: help
