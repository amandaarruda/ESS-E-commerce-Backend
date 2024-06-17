docker-build:
	docker compose build
.PHONY: docker-build

docker-start:
	docker compose up
.PHONY: docker-start

docker-stop:
	docker compose down
.PHONY: docker-stop

docker-clear: docker-stop
	docker compose rm
	docker volume rm ess-e-commerce-backend_db
.PHONY: docker-clear

docker-fresh-start: docker-clear docker-start
.PHONY: docker-fresh-start

docker-sync: docker-stop docker-build docker-start
.PHONY: docker-sync