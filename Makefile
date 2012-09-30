ALL_TESTS = $(shell find tests -name '*.test.js')
ALL_SRC_FILES = $(shell find src -type f -name '*.h' -print -o -name '*.cc' -print | tr '\n' ' ')
REPORTER = spec
UI = bdd

all: clean build test

lint-cpp: 
	@./tools/cpplint.py $(ALL_SRC_FILES)

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
