manifestparser
==============

Manifestparser allows you to extract AndroidManifest.xml from android (apk) binary blobs. It also supports parsing
binary plists (Apple propitiatory format) from ipa (iOS) binary blobs. 

Works on both node 0.8.x and 0.9.x (unstable)

### Requirements (Ubuntu 12.04)
	
    $ sudo apt-get install libplist-dev

### Installation

    $ npm install manifestparser

### Run test suite
	
    $ make test    

### Building
  
    $ git clone https://github.com/peters/manifestparser.git
    $ cd manifestparser
    $ npm install 
    
### Examples (CLI)
You can find more examples by looking in the tests folder.
 
    $ ./bin/manifestparser --target tests/fixtures/Snake.apk --output-format xml
    $ ./bin/manifestparser --target tests/fixtures/Snake.apk --output-format json

### Sample application (Parse a binary plist)

Put the following code in your root directory where you installed manifestparser.

```
var PlistReader = require('manifestparser/lib/plistreader');
new PlistReader('./node_modules/manifestparser/tests/fixtures/binary.plist')
.on('plist', function(plist, filename) {
    process.stdout.write(plist); // Outputs raw xml
}).on('error', function(err) {
    process.stdout.write(err.toString());
});
```

### Sample application (Extract plist files from a zip archive)

Put the following code in your root directory where you installed manifestparser.

```
var PlistReader = require('manifestparser/lib/plistreader');
new PlistReader('./node_modules/manifestparser/tests/fixtures/Plists.zip')
.on('plist', function(plist, filename) {
    process.stdout.write(filename);
}).on('error', function(err) {
    process.stdout.write(err.toString());
}).on('end', function(plists) {
    process.stdout.write("Finished parsing " + plists.length);
}).parse();
```

### Sample application (Parse all plists within an .ipa)

Put the following code in your root directory where you installed manifestparser.

```
var PlistReader = require('manifestparser/lib/plistreader');
new PlistReader('./node_modules/manifestparser/tests/fixtures/Snake.ipa')
.on('plist', function(plist, filename) {
    process.stdout.write(filename); // Should be 9 of them in the Snake application
}).on('error', function(err) {
    process.stdout.write(err.toString());
}).on('end', function(plists) {
    process.stdout.write("Finished parsing " + plists.length);
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
