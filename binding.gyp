{
    "targets": [
        {
            "target_name": "plist", 
            "sources": [
                    "src/plistparser.cpp"
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