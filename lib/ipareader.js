var PlistReader = require('./plistreader');

// Export
module.exports = IpaManifestReader;

/**
 * Decompile a ipa and extract all plists
 * 
 * @param {String} target
 * @param {Object} options
 */
function IpaManifestReader(target, options) {

	// Call manifest reader ctor
	ManifestReader.call(this, target, ['ipa'], options);

	return this;

};

// Inherit from ManifestReader
util.inherits(IpaManifestReader, PlistReader);