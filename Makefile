docker-build:
	docker compose build
.PHONY: docker-build

docker-start:
	docker compose up
.PHONY: docker-start

docker-stop:
	docker compose stop
.PHONY: docker-stop

docker-clear: 
	docker compose down
.PHONY: docker-clear

docker-fresh-start: docker-clear docker-start
.PHONY: docker-fresh-start

docker-sync: docker-stop docker-build docker-start
.PHONY: docker-sync