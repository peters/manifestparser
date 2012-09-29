var ipaReader = require('../build/Release/bindings'),
	manifestReader = require('../lib/manifestreader');

var Ipa2Xml = {
	/*
	 * Application requirements
	 */
	Capabilities : [ 'accelerometer', 'magnetometer', 'gyroscope',
	                 'armv6', 'armv7', 'gamekit', 'opengles-1', 'opengles-2', 'microphone',
                 	'still-camera', 'video-camera', 'front-facing-camera',
                 	'telephony', 'wifi', 'peer-peer', 'gps', 'location-services' ]
};

addon.parse(input, function(err, plist) {
	console.log(err, plist);
});

setInterval(function() {
	console.log(" I AM AWESOME");
}, 1000);