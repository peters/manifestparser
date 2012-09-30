manifestparser  [![Build Status](https://secure.travis-ci.org/peters/manifestparser.png)](http://travis-ci.org/peters/manifestparser)
==============

The manifestparser will allow you to extract AndroidManifest.xml from a compiled .apk blob. It also supports
parsing ipa (parses all it can be find). XML is the default output format, but you can easily convert parsed xml to json.

### Requirements (Ubuntu 12.04)
	
    $ sudo apt-get install libplist++-dev

### Installation

    $ npm install manifestparser
    
### Building
  
    $ git clone https://github.com/peters/manifestparser.git
    $ cd manifestparser
    $ npm install 
    
### Examples (CLI)
You can find more examples by looking in the tests folder.
 
    $ ./bin/manifestparser --target tests/fixtures/Snake.apk --output-format xml
    $ ./bin/manifestparser --target tests/fixtures/Snake.apk --output-format json
     
### Sample application (Parse all plists in an .ipa (ios application))

Put the following code in your root directory where you installed manifestparser.

```
var PlistReader = require('manifestparser/lib/plistreader');
new PlistReader('./node_modules/manifestparser/tests/fixtures/Snake.ipa')
.on('plist', function(plist, filename) {
    process.stdout.write(filename); // Should be 9 of them in the Snake application
}).on('error', function(err) {
    process.stdout.write(err.toString());
}).parse();
```

### Sample application (Android manifest)

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

### Sample output (Android manifest)

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