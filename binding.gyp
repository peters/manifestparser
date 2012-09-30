{
    "targets": [
        {
            "target_name": "bindings", 
            "sources": [
                "src/bindings.cc",
                "src/node_manifestparser_plist.cc"
            ],
            "include_dirs": [
            	"/usr/include/plist"
            ],
		   "conditions": [
	          ['OS=="linux"', {
			    "cflags" : ["-D__STDC_CONSTANT_MACROS", "-D_FILE_OFFSET_BITS=64", "-D_LARGEFILE_SOURCE", "-Wall"],
			    "libraries" : ['-lplist']
          	  }]
           ],
		}
    ]
}
