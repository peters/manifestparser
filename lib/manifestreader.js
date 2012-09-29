var fs = require('fs'),
	util = require('util'),
	events = require('events'),
	_ = require('underscore');

/**
 * Extracts manifest from a binary 
 * 
 * @param {String} target
 * @param {Array} targetTypes
 * @param {Object} options
 */
function ManifestReader(target, targetTypes, options) {
	var self = this;
	
	// Call EventEmitter ctor
	events.EventEmitter.call(this);
	
	// Target types must be array
	if(!_.isArray(targetTypes)) {
		throw new Error("Target types must be an array");
	}
	
	// Target file
	this.target = target;
	
	// Target must have file type
	this.targetTypes = targetTypes;
	
	// Options available 
	this.options = {
		outputFormat: 'xml'
	};

	// Extend default options
	_.extend(this.options, options||{});

};

// Inherit from EventEmitter
util.inherits(ManifestReader, events.EventEmitter);

// validate arguments and stuff
ManifestReader.prototype.init = function() {
	var self = this;

	// Make sure file format is valid
	var found = false;
	_.each(self.targetTypes, function(targetType) {
		var targetLw = self.target.toLowerCase();
		if(targetLw.substr(-(targetType.length)) === targetType) {
			found = true;
			return false;
		}
	});
	
	// Check if target type was found
	if(!found) {
		throw new Error("Valid formats are " + self.targetTypes.join(", "));
	}

	// Make sure that output format is supported
	var oFormat = self.options.outputFormat.toLowerCase();
	if(oFormat !== 'xml' && oFormat !== 'json') {
		throw new Error("Unknown output format " + self.options.outputFormat);
		return;
    }
}

// Export
module.exports = ManifestReader;