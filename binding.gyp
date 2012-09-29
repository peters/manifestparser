{
    "targets": [
        {
            "target_name": "bindings", 
            "sources": [
                "src/bindings.cc",
                "src/node_manifestparser_plist.cc"
            ],
	   "conditions": [
	          ['OS=="linux"', {
			    "cflags" : ["-g", "-D__STDC_CONSTANT_MACROS", "-D_FILE_OFFSET_BITS=64", "-D_LARGEFILE_SOURCE", "-Wall"],
	    	    "libraries" : ["-lplist"]
          	  }]
           ],
		}
    ]
}