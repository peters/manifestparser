var fs = require('fs'),
	util = require('util'),
	events = require('events'),
	Stream = require('stream').Stream;
	_ = require('underscore');

/**
 * Extracts manifest from a binary 
 * 
 * @param {String} target
 * @param {String} targetType
 * @param {Object} options
 */
function ManifestReader(target, targetType, options) {
	var self = this;
	// Call EventEmitter ctor
	events.EventEmitter.call(this);

	// Manifest target target
	this.target = target;
	this.targetType = targetType;
	
	// Options available 
	this.options = {
		outputFormat: 'xml',
		outputTarget: null,
	};
	
	// Hook error listener so that we can output
	// directly to stdout if user said so
	this.once('error', function(err) {
		if(self.options.outputTarget === 'stdout') {
			process.stdout.write(err);
			process.exit(1);
		}
	});

	// Extend default options
	_.extend(this.options, options||{});

};

// Inherit from EventEmitter
util.inherits(ManifestReader, events.EventEmitter);

// validate arguments and stuff
ManifestReader.prototype.init = function() {
	
	// Make sure that output format is supported
	var oFormat = this.options.outputFormat.toLowerCase();
	if(oFormat !== 'xml' && oFormat !== 'json') {
		this.emit('error', new Error("Unknown output format " + this.options.outputFormat));
		return this;
    }
	
}

// Export
module.exports = ManifestReader;