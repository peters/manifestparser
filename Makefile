ALL_TESTS = $(shell find tests -name '*.test.js')
REPORTER = spec
UI = bdd

all: test

test:
	@./node_modules/.bin/mocha \
                --require should \
                --reporter $(REPORTER) \
                --ui $(UI) \
                --growl \
                $(ALL_TESTS)

clean: 

build: 

.PHONY: test