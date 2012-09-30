/**
 * (The MIT License)
 *
 * Copyright (c) 2012 Peter Sunde <peter.sunde@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the 'Software'), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

#include <v8.h>
#include <node.h>
#include <node_buffer.h>
#include <plist/plist.h>
#include <stdlib.h>
#include <unistd.h>
#include <inttypes.h>
#include <iostream>

#include "./node_async_shim.h"

// Seriously google?
using v8::Handle;
using v8::String;
using v8::Value;
using v8::TryCatch;
using v8::HandleScope;
using v8::Persistent;
using v8::Function;
using v8::Context;
using v8::Arguments;
using v8::Exception;
using v8::Local;
using v8::Object;
using v8::Undefined;
using v8::Null;

using node::Buffer;
using node::FatalException;

using std::string;

namespace plist {

struct parsexml {
    // Input data, can either be a buffer or a filename
    char* input;
    // Type of the above
    int type;
    // Error message
    std::string ex;
    // Final xml output
    std::string finalXml;
    // Javascript callback
    Persistent<Function> callback;
    // Length of input
    size_t length;
};

const char* INPUT_IS_BINARY = "bplist00";

#define UNWRAP \
        HandleScope scope;

static inline char *V8GetString(v8::Local<v8::Value> value) {
    if (value->IsString()) {
        std::string inputString(*v8::String::Utf8Value(value));
        char *convertedString = reinterpret_cast<char*&>(inputString);
        return convertedString;
    }
    return NULL;
}

async_rtn parse_plist_binary(uv_work_t *req) {
    // Decode unit of work
    parsexml *r = reinterpret_cast<parsexml*>(req->data);

    /// Check if we need to open a file
    if (r->type == 1) {
        // Pointer to file handle
        FILE *iplist = NULL;

        // Actual contents of file
        char *plist_xml = NULL;

        // Converted xml
        char *plist_xml_converted = NULL;

        // Filename
        const char *filename = r->input;

        // Structure for file information
        struct stat fileInfo;

        // Size of plist_xml
        uint32_t size_in = 0;

        // Size of plist_xml_converted
        uint32_t size_out = 0;

        // Plist structure
        plist_t plist = NULL;

        // Make sure that file is available
        if (-1 == stat(filename, &fileInfo)) {
            r->ex = "Unable to stat file";
            return;
        }

        // Size of file contents
        size_in = fileInfo.st_size;

        // Allocate memory for the contents of input file
        plist_xml = reinterpret_cast<char*>(malloc(size_in + 1));

        // Open file for reading
        iplist = fopen(filename, "rb");

        // Read all bytes
        fread(plist_xml, sizeof(plist_xml), size_in, iplist);

        // Close file handle
        fclose(iplist);

        // Check if binary xml
        if (memcmp(plist_xml, INPUT_IS_BINARY, 8) == 0) {
            // Convert binary to plist
            plist_from_bin(plist_xml, size_in, &plist);
            // Convert plist to xml
            plist_to_xml(plist, &plist_xml_converted, &size_out);
            // Output xml
            r->finalXml = plist_xml_converted;
        } else {
            // Output xml
            r->finalXml = plist_xml;
        }

        // Release memory
        plist_free(plist);
        free(plist_xml);

    } else if (r->type == 2) {
        // Plist structure
        plist_t plist = NULL;

        // Parsed content of file
        char *plist_xml = NULL;

        // Actual size of converted xml
        uint32_t size_out = 0;

        // Check if binary xml
        if (memcmp(r->input, INPUT_IS_BINARY, 8) == 0) {
            plist_from_bin(r->input, r->length, &plist);
            plist_to_xml(plist, &plist_xml, &size_out);
            r->finalXml = plist_xml;
        } else {
            // This kinda sux, but it works
            plist_from_xml(r->input, r->length, &plist);
            plist_to_xml(plist, &plist_xml, &size_out);
            r->finalXml = plist_xml;
        }

        // Release memory
        plist_free(plist);
        free(plist_xml);
    }
}

async_rtn parse_plist_binary_AFTER(uv_work_t *req) {
    UNWRAP;

    parsexml *r = reinterpret_cast<parsexml*>(req->data);

    Handle<Value> argv[1];

    // Output error message
    if (r->ex.empty() == false) {
        argv[0] = v8::ThrowException(String::New(r->ex.c_str()));
        argv[1] = Null();
        // Output parsed xml
    } else {
        argv[0] = Null();
        argv[1] = String::New(r->finalXml.c_str());
    }

    // Catch any exceptions
    TryCatch try_catch;

    // Call callback with result
    r->callback->Call(Context::GetCurrent()->Global(), 2, argv);

    // Throw on error
    if (try_catch.HasCaught())
        FatalException(try_catch);

    // Release memory
    r->callback.Dispose();
    delete r;
}

Handle<Value> node_parse_plist(const Arguments& args) {
    UNWRAP;

    // Must be two arguments
    if (args.Length() != 2) {
        THROW(Exception::TypeError, "Excepts two arguments");
    }

    // Last argument must be a callback
    if (!args[1]->IsFunction()) {
        THROW(Exception::TypeError, "Last argument must a valid function.");
    }

    // Our async parser structure
    parsexml *request = new parsexml();

    // Callback when we are finished
    request->callback = Persistent<Function>::New(
            Local<Function>::Cast(args[1]));

    // Check single file
    if (args[0]->IsString()) {
        request->input = V8GetString(args[0]->ToString());
        request->type = 1;
        // Check if buffer
    } else if (Buffer::HasInstance(args[0])) {
        Local<Object> buffer = args[0]->ToObject();
        request->input = Buffer::Data(buffer);
        request->length = (size_t) Buffer::Length(buffer);
        request->type = 2;
    } else {
        THROW(Exception::TypeError, "Must be either string or buffer.");
    }

    BEGIN_ASYNC(request, parse_plist_binary, parse_plist_binary_AFTER);

    return Undefined();
}

void InitPlistParser(Handle<Object> target) {
    UNWRAP;

    // Functions
    NODE_SET_METHOD(target, "parse", node_parse_plist);
}

}  // plist namespace
