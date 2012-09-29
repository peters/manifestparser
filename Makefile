ALL_TESTS = $(shell find tests -name '*.test.js')
REPORTER = spec
UI = bdd

all: clean build test

test:
	@./node_modules/.bin/mocha \
                --require should \
                --reporter $(REPORTER) \
                --ui $(UI) \
                --growl \
                $(ALL_TESTS)

clean: 
	@node-gyp clean
	
build: 
	@node-gyp configure build -r

build-debug:
	@node-gyp configure build -d

.PHONY: build test
