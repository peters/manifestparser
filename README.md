manifestparser  [![Build Status](https://secure.travis-ci.org/peters/manifestparser.png)](http://travis-ci.org/peters/manifestparser)
==============

Extract manifest from binary blobs deployed to android or ios devices.

### Installation

    $ npm install manifestparser
    
### Building
  
    $ git clone https://github.com/peters/manifestparser.git
    $ cd manifestparser
    $ npm install 
    
### Examples (CLI)
  
    $ ./bin/manifestparser --target tests/fixtures/Snake.apk --output-format xml
    $ ./bin/manifestparser --target tests/fixtures/Snake.apk --output-format json

### Sample application

Put the following code in your root directory where you installed manifestparser.

```
var ApkReader = require('manifestparser/lib/apkreader');
new ApkReader('./node_modules/manifestparser/tests/fixtures/Snake.apk')
.on('manifest', function(manifest) {
    process.stdout.write(manifest);
}).on('error', function(err) {
    process.stdout.write(err.toString());
}).parse();
```

### Sample output

```
<?xml version="1.0" encoding="UTF-8"?>
<manifest package="com.example.android.snake">
    <uses-permission name="android.permission.INTERNET">
	</uses-permission>
	<application label="Snake on a Phone">
		<activity theme="resourceID 0x379009072" name="Snake" screenOrientation="resourceID 0x1" 
        configChanges="resourceID 0x352">
			<intent-filter>
				<action name="android.intent.action.MAIN">
				</action>
				<category name="android.intent.category.LAUNCHER">
				</category>
			</intent-filter>
		</activity>
	</application>
</manifest>
```

### License 

(The MIT License)

Copyright (c) 2012 Peter Sunde &lt;peter.sunde@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
