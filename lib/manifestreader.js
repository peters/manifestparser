/**
 * (The MIT License)
 *
 * Copyright (c) 2012 Peter Sunde <peter.sunde@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated
 * documentation files (the 'Software'), to deal in the Software
 * without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice
 * shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var fs = require('fs'),
    util = require('util'),
    events = require('events'),
    _ = require('underscore');

/**
 * Interface for parsing a manifest.
 *
 * @param {Mixed} target Input target.
 * @param {Array} targetTypes Valid input target file types.
 * @param {Object} options Extra options.
 * @constructor
 */
function ManifestReader(target, targetTypes, options) {
    var self = this;

    // Call EventEmitter ctor
    events.EventEmitter.call(this);

    // Target types must be array
    if (!_.isArray(targetTypes)) {
        throw new Error('Target types must be an array');
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
    _.extend(this.options, options || {});

}

// Inherit from EventEmitter
util.inherits(ManifestReader, events.EventEmitter);

/**
 * Validates constructor parmeters.
 * @return {void} Throws exception if invalid parameters.
 */
ManifestReader.prototype.init = function() {
    var self = this;

    // Make sure file format is valid
    var found = false;
    _.each(self.targetTypes, function(targetType) {
        var targetLw = self.target.toLowerCase();
        if (targetLw.substr(-(targetType.length)) === targetType) {
            found = true;
            return false;
        }
    });

    // Check if target type was found
    if (!found) {
        throw new Error('Valid formats are ' + self.targetTypes.join(', '));
    }

    // Make sure that output format is supported
    var oFormat = self.options.outputFormat.toLowerCase();
    if (oFormat !== 'xml' && oFormat !== 'json') {
        throw new Error('Unknown output format ' + self.options.outputFormat);
        return;
    }
};

/**
 * @return {ManifestReader} Interface for parsing manifests.
 */
module.exports = ManifestReader;
