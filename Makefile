ALL_TESTS = $(shell find tests -name '*.test.js')
REPORTER = spec
UI = bdd

all: build test

test:
	@./node_modules/.bin/mocha \
                --require should \
                --reporter $(REPORTER) \
                --ui $(UI) \
                --growl \
                $(ALL_TESTS)

clean: 
	
build: 
	node-gyp configure build

.PHONY: build test
