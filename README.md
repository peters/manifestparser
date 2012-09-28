manifestparser  [![Build Status](https://secure.travis-ci.org/peters/manifestparser.png)](http://travis-ci.org/peters/manifestparser)
==============

Extract manifest from binary blobs deployed to android or ios devices.

### Installation

    $ npm install manifestparser
    
### Building
  
    $ git clone https://github.com/peters/manifestparser.git
    $ cd manifestparser
    $ npm install 
    
### Examples
  
    $ chmod +x bin/manifestparser
    $ ./bin/manifestparser --target myApk.apk --output-format xml
    $ ./bin/manifestparser --target myApk.apk --output-format json
    

    