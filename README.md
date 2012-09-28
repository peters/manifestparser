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

```
var ApkReader = require('manifestparser/apkreader');
new require('manifestparser/apkreader')(target)
.on('manifest', function(manifest) {
 	process.stdout.write(manifest);
}).on('error', function(err) {
	process.stdout.write(err);
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
