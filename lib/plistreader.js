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
var ManifestReader = require('./manifestreader'),
    PlistReader = require('../build/Release/bindings'),
    fs = require('fs'),
    util = require('util'),
    XML2js = require('xml2js'),
    Buffer = require('buffer').Buffer,
    unzip = require('unzip'),
    ReadableStream = require('readable-stream'),
    _ = require('underscore');

/**
 * @return {PlistManifestReader} Plist reader.
 */
module.exports = PlistManifestReader;

/**
 * Parse plist files.
 *
 * @param {Buffer|String} target Plist to parse or input buffer.
 * @param {Object} options Extra options.
 * @constructor
 */
function PlistManifestReader(target, options) {

    // Call manifest reader ctor
    ManifestReader.call(this, target, ['plist', 'zip', 'ipa'], options);

}

// Inherit from ManifestReader
util.inherits(PlistManifestReader, ManifestReader);

/**
 * Check if filename is a zip archive.
 * @param {String} filename Filename.
 * @return {Boolean} Returns true if zip archive, false otherwise.
 */
PlistManifestReader.prototype.isZipArchive = function(filename) {
    return filename.substr(-4) === '.zip' || filename.substr(-4) === '.ipa';
};

/**
 * Plist parser
 */
PlistManifestReader.prototype.parse = function() {
    var self = this,
        plistZip,
        printOutput = function(xml, results) {
            var json = self.options.outputFormat === 'json',
                isObject = _.isObject(xml);
            if (json) {
                var parser = new XML2js.Parser();
                parser.parseString(isObject ?
                    xml.content : xml, function(err, result) {
                    var output = JSON.stringify(result, null, 4);
                    if (isObject) {
                        xml.content = output;
                        results.push(xml);
                        self.emit('plist', output, xml.filename);
                        return;
                    }
                    self.emit('plist', output);
                });
                return;
            }
            if (isObject) {
                results.push(xml);
                self.emit('plist', xml.content, xml.filename);
                return;
            }
            self.emit('plist', xml);
        };

    // initialize manifest reader
    self.init();

    // Check if target is buffer
    if (Buffer.isBuffer(self.target) || !self.isZipArchive(self.target)) {
        PlistReader.parse(self.target, function(err, plist) {
            if (err) {
                self.emit('error', err);
                return;
            }
            printOutput(plist);
        });
        return;
    } else if (self.isZipArchive(self.target)) {


        fs.exists(self.target, function(exists) {

            // Make sure file exists
            if (!exists) {
                throw new Error('File does not exist');
            }

            // Plist files to parse
            var plistFiles = [],
                // Number of plists found
                numFound = 0,
                // Number of plists waiting to be parsed
                numWaiting = 0,
                // Parsed plists
                plistResults = [],
                // Container for plist stream
                tmpContainer = {};

            // Read archive
            fs.createReadStream(self.target)
            // Pipe to unzipper
            .pipe(unzip.Parse())
            // Foreach zip entry
            .on('entry', function(entry) {
                // Must be a valid plist file
                if (entry.path.substr(-6) === '.plist' &&
                    entry.type === 'File') {

                    // Increment the number of files found
                    numFound++;

                    // Create a new readable stream
                    var rst = new ReadableStream();

                    // Hook stream
                    rst.wrap(entry);

                    // Read plist data
                    rst.on('data', function(chunk) {
                        var buffer;
                        if (_.isUndefined(tmpContainer[entry.path])) {
                            buffer = tmpContainer[entry.path] =
                                new Buffer(chunk);
                        } else {
                            buffer.write(chunk);
                        }
                    });

                }
            })
            .on('end', function() {

                // No plist entries was found
                if (!numFound) {
                    self.emit('error', new Error
                        ('Archive does not contain any plist files'));
                    return;
                }

                // Number of remaining documents
                var numWaiting = numFound;

                // For each key/value
                _.each(tmpContainer, function(buffer, filename) {
                    // Parse document
                    PlistReader.parse(buffer, function(err, plist) {
                        // Number of documents remaining
                        numWaiting--;
                        // Emit error when parsing fails
                        if (err) {
                            self.emit('error', err, filename);
                            return;
                        }
                        // Save output into an array
                        printOutput({
                            filename: filename,
                            content: plist
                        }, plistResults);
                        // Finished parsing
                        if (numWaiting === 0) {
                            self.emit('end', plistResults);
                        }
                    });
                });
            });
        });
    }
};
