var ManifestReader = require('./manifestreader'), 
	IpaReader = require('../build/Release/bindings'), 
	fs = require('fs');
	util = require('util'), 
	zip = require('adm-zip'), 
	XML2js = require('xml2js'),
	Buffer = require('buffer').Buffer,
	_ = require('underscore');

// Export
module.exports = PlistManifestReader;

/**
 * Decompile a plist binary blob
 * 
 * @param {String} target
 * @param {Object} options
 */
function PlistManifestReader(target, options) {

	// Call manifest reader ctor
	ManifestReader.call(this, target, ['plist', 'zip'], options);

	return this;

};

// Inherit from ManifestReader
util.inherits(PlistManifestReader, ManifestReader);

// Deferred
PlistManifestReader.prototype.parse = function() {
	var self = this,
		plistZip,
		isZipArchive = function(filename) {
			return filename.substr(-4) === '.zip';
		},
		printOutput = function(xml, results) {
			var json = self.options.outputFormat === 'json',
				content = xml.content||xml,
				filename = xml.filename||null;
			if(json) {
				var parser = new XML2js.Parser();
				parser.parseString(content, function(err, result) {
					var output = JSON.stringify(result, null, 4);
					self.emit('plist', output);
					if(_.isArray(results)) {
						results.push({
							filename: filename,
							content: output
						});
					}
				});
				return;
			}
			self.emit('plist', content);
			if(_.isArray(results)) {
				results.push({
					filename: filename,
					content: content
				});
			}
		};

	// initialize manifest reader
	this.init();
	
	// Check if target is buffer
	if(Buffer.isBuffer(this.target) || !isZipArchive(this.target)) {
		IpaReader.parse(this.target, function(err, plist) {
			if(err) {
				self.emit('error', err);
				return;
			}
			printOutput(plist);
		});
		return;
	} else if(isZipArchive(this.target)) {
		
		// Detect if zipper was unable to initialize
		try {
			plistZip = new zip(this.target);
		} catch (ex) {
			self.emit('error', new Error("Unable to read zip archive"));
			return;
		}

		// Find all plist entries
		var plistFiles = [];
		_.each(plistZip.getEntries(), function(entry) {
			if (entry.name.substr(-6) === '.plist') {
				plistFiles.push(entry);
			}
		});
		
		// No plist entries was found
		if(_.isEmpty(plistFiles)) {
			self.emit('error', new Error("Archive does not contain any plist files"));
			return;
		}
		
		// Parse all plist files
		var results = [], waiting = plistFiles.length;
		_.each(plistFiles, function(entry) {
			if(waiting-- === 0) {
				self.emit('done', results);
				return;
			}
			plistZip.readAsTextAsync(entry, function(data) {
				IpaReader.parse(new Buffer(data), function(err, plist) {
					if(err) {
						self.emit('error', err);
						return;
					}
					printOutput({
						filename: entry.name,
						content: plist
					}, results);
				});
			}, 'binary');
		});

		
		return;
	} 
	
	// Throw error
	self.emit('error', new Error("Filename is not a valid plist file."));
	
};