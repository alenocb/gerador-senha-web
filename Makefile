.PHONY: install run test

install:
	npm install --package-lock=false

run:
	npm start

test:
	npm test
