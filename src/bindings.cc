#include <v8.h>
#include <node.h>

using namespace v8;
using namespace node;

namespace plist {

void InitPlistParser(Handle<Object>);

void Initialize(Handle<Object> target) {
	HandleScope scope;

	InitPlistParser(target);
}

} // manifestparser namespace

NODE_MODULE(bindings, plist::Initialize);
