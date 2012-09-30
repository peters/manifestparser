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
    fs = require('fs');
    util = require('util'),
    zip = require('adm-zip'),
    XML2js = require('xml2js'),
    prettyXML = require('./xml-prettify').prettify,
    _ = require('underscore');

/**
 * @return {ApkManifestReader} The android manifest reader.
 */
module.exports = ApkManifestReader;

/**
 * Extract android manifest from apk files. Original implementation in Java can
 * be found here: http://pastebin.com/c53DuqMt
 */
var Apk2XML = {
    /**
     * End of android apk manifest
     */
    endDocTag: 0x00100101,
    /**
     * Start of XML tag
     */
    startTag: 0x00100102,
    /**
     * End of XML tag
     */
    endTag: 0x00100103,
    /**
     * Return value of a Little Endian 32 bit word from the byte array at
     * a given offset.
     *
     * @param {Buffer} buffer Input buffer.
     * @param {Integer} offset String offset.
     * @return {Integer} Offset value.
     */
    lew: function lew(buffer, off) {
        return buffer.readUInt32LE(off + 3) << 24 & 0xff000000 |
                buffer.readUInt32LE(off + 2) << 16 & 0xff0000 |
                buffer.readUInt32LE(off + 1) << 8 & 0xff00 |
                buffer.readUInt32LE(off) & 0xFF;
    },
    /**
     * Return the string stored in StringTable format at offset strOff. This
     * offset points to the 16 bit string length, which is followed by that
     * number of 16 bit (Unicode) chars .
     *
     * @param {Buffer} buffer Input buffer.
     * @param {Integer} strOff String offset.
     * @return {String} Xml string.
     */
    completeXMLstringAt: function completeXMLStringAt(buffer, strOff) {
        var strLength = buffer.readUInt32LE(strOff + 1) << 8 & 0xff00 |
                        buffer.readUInt32LE(strOff) & 0xff,
                        chars = new Buffer(strLength, 'utf-8');
        for (var i = 0; i < strLength; i++) {
            chars[i] = buffer.readUInt32LE(strOff + 2 + i * 2);
        }
        return chars.toString('utf-8');
    },
    /**
     * Complete XML tag
     *
     * @param {Buffer} buffer Input buffer.
     * @param {Integer} sitOff String Index Offset.
     * @param {Integer} stOff String Offset.
     * @param {Integer} strInd String Index.
     * @return {String} Xml string.
     */
    completeXMLString: function completeXMLString(buffer, sitOff, stOff,
            strInd) {
        if (strInd < 0)
            return null;
        var strOff = stOff + Apk2XML.lew(buffer, sitOff + strInd * 4);
        return Apk2XML.completeXMLstringAt(buffer, strOff);
    },
    /**
     * Parse XML binary manifest
     *
     * @param {ApkManifestReader} Our reader.
     * @param {Buffer} Contents to parse.
     */
    parse: function(apkReader, buffer) {
        var finalXML = [], numbStrings, sitOff, stOff, XMLTagOff;

        // Compressed XML file/bytes starts with 24x bytes of data,
        // 9 32 bit words in little endian order (LSB first):
        // 0th word is 03 00 08 00
        // 3rd word SEEMS TO BE: Offset at then of StringTable
        // 4th word is: Number of strings in string table
        numbStrings = Apk2XML.lew(buffer, 4 * 4);

        // StringIndexTable starts at offset 24x, an array of 32 bit LE offsets
        // of the length/string data in the StringTable.
        sitOff = 0x24;

        // StringTable, each string is represented with a 16 bit little endian
        // character count, followed by that number of 16 bit (LE) (Unicode)
        // chars.
        stOff = sitOff + numbStrings * 4; // StringTable follows StrIndexTable

        // XMLTags, The XML tag tree starts after some unknown content after the
        // StringTable. There is some unknown data after the StringTable, scan
        // forward from this point to the flag for the start of an XML start
        // tag.
        XMLTagOff = Apk2XML.lew(buffer, 3 * 4);

        // Scan forward until we find the bytes: 0x02011000(x00100102 in normal
        // int)
        for (var i = XMLTagOff; i < buffer.length - 4; i += 4) {
            if (Apk2XML.lew(buffer, i) === Apk2XML.startTag) {
                XMLTagOff = i;
                break;
            }
        } // end of hack, scanning for start of first start tag

        // XML tags and attributes:
        // Every XML start and end tag consists of 6 32 bit words:
        // 0th word: 02011000 for startTag and 03011000 for endTag
        // 1st word: a flag?, like 38000000
        // 2nd word: Line of where this tag appeared in the original source file
        // 3rd word: FFFFFFFF ??
        // 4th word: StringIndex of NameSpace name, or FFFFFFFF for default NS
        // 5th word: StringIndex of Element Name
        // (Note: 01011000 in 0th word means end of XML document, endDocTag)

        // Start tags (not end tags) contain 3 more words:
        // 6th word: 14001400 meaning??
        // 7th word: Number of Attributes that follow this tag(follow word 8th)
        // 8th word: 00000000 meaning??

        // Attributes consist of 5 words:
        // 0th word: StringIndex of Attribute Name's Namespace, or FFFFFFFF
        // 1st word: StringIndex of Attribute Name
        // 2nd word: StringIndex of Attribute Value, or FFFFFFF if ResourceId
        // used
        // 3rd word: Flags?
        // 4th word: str ind of attr value again, or ResourceId of value

        // Local variables
        var off = XMLTagOff,
            startTagLineNo = -2,
            tag0,
            lineNo,
            nameNsSi,
            nameSi,
            name,
            tag6,
            numbAttrs,
            stringBuilder,
            attrNameNsSi,
            attrNameSi,
            attrValueSi,
            strOff,
            attrName,
            attrValue,
            attrResId;

        // Step through the XML tree element tags and attributes
        while (off < buffer.length - 25) {

            // Determines if this is a start/end or doc end tag.
            tag0 = Apk2XML.lew(buffer, off);

            // Current line number
            lineNo = Apk2XML.lew(buffer, off + 2 * 4);

            // Current namespace string index
            nameNsSi = Apk2XML.lew(buffer, off + 4 * 4);

            // Current string index
            nameSi = Apk2XML.lew(buffer, off + 5 * 4);

            /**
             * Start of XML TAG
             */
            if (tag0 === Apk2XML.startTag) {

                // Expected to be 14001400
                tag6 = Apk2XML.lew(buffer, off + 6 * 4);

                // Number of attributes to follow
                numbAttrs = Apk2XML.lew(buffer, off + 7 * 4);

                // Skip over 6+3 words of startTag data
                off += 9 * 4;

                // Name of tag
                name = Apk2XML.completeXMLString(buffer, sitOff, stOff, nameSi);

                // Tag starts on line number
                startTagLineNo = lineNo;

                // Container for all characters
                stringBuilder = [];

                // Parse all available attributes
                for (var i = 0; i < numbAttrs; i++) {

                    // AttrName Namespace Str, Ind or FFFFFFFF
                    attrNameNsSi = Apk2XML.lew(buffer, off);

                    // AttrName String Index
                    attrNameSi = Apk2XML.lew(buffer, off + 1 * 4);

                    // AttrValue Str, Index or FFFFFFFF
                    attrValueSi = Apk2XML.lew(buffer, off + 2 * 4);

                    // AttrValue ResourceId or dup AttrVale StrInd
                    attrResId = Apk2XML.lew(buffer, off + 4 * 4);

                    // Skip over 5 words of an attribute
                    off += 5 * 4;

                    // Name of attribute
                    attrName = Apk2XML.completeXMLString(buffer, sitOff, stOff,
                            attrNameSi);

                    // Value of XML attribute (attrName)
                    attrValue = attrValueSi !== -1 ?
                        Apk2XML.completeXMLString(buffer, sitOff,
                                stOff, attrValueSi) :
                            'resourceID 0x' + parseInt(attrResId,
                                    16).toString();

                    // Push attribute and value
                    stringBuilder.push(' ' + attrName + '=\"' +
                            attrValue + '\"');

                }

                // Push tag to XML array
                finalXML.push('<' + name + stringBuilder.join('') + '>');

                /**
                 * End of XML TAG
                 */
            } else if (tag0 === Apk2XML.endTag) {

                // Skip over 6 words of endTag dag
                off += 6 * 4;

                // Grab the actual tag name
                name = Apk2XML.completeXMLString(buffer, sitOff, stOff, nameSi);

                // Push tag to XML array
                finalXML.push('</' + name + '>');

                /**
                 * End of android manifest XML
                 */
            } else if (tag0 === Apk2XML.endDocTag) {
                break;
                /**
                 * Unknown parse error
                 */
            } else {
                apkReader.emit('error', new Error('Unrecognized tag code ' +
                        tag0.toString(16) + ' at offset ' + off));
                return;
            }

        }

        // Convert XML document to JSON
        var _toJSON = function(XML, callback) {
            var parser = new XML2js.Parser();
            parser.parseString(XML, function(err, result) {
                callback(err, result);
            });
        };

        // Add xml identifier
        finalXML.unshift('<?xml version="1.0" encoding="UTF-8"?>');

        // Convert our xml array to a string
        var XMLString = finalXML.join('');

        // Determine output format
        switch (apkReader.options.outputFormat) {
        case 'json':
            _toJSON(XMLString, function(err, result) {
                var output = JSON.stringify(result, null, 4);
                apkReader.emit('manifest', output, result);
            });
            break;
        case 'xml':
            apkReader.emit('manifest', prettyXML(XMLString));
            break;
        default:
            apkReader.emit('error', new Error('Unsupported output format ' +
                    apkReader.options.outputFormat));
            return;
            break;
        }
    }
};

/**
 * Extract manifest from an android apk binary blob
 *
 * @param {String} target Filename to parse.
 * @param {Object} options Extra options.
 * @constructor
 */
function ApkManifestReader(target, options) {

    // Call manifest reader ctor
    ManifestReader.call(this, target, ['apk'], options);

}

// Inherit from ManifestReader
util.inherits(ApkManifestReader, ManifestReader);

/**
 * Parse actual android manifest
 */
ApkManifestReader.prototype.parse = function() {

    // initialize manifest reader
    this.init();

    // Reference
    var self = this,
    // All apks needs to be unpacked
    apkZip = null,
    // Null if manifest is not found
    manifest = null;

    // Detect if zipper was unable to initialize
    try {
        apkZip = new zip(this.target);
    } catch (ex) {
        self.emit('error', new Error('Unable to read zip archive'));
        return;
    }

    // Find manifest entry in apk
    _.each(apkZip.getEntries(), function(entry) {
        if (entry.entryName === 'AndroidManifest.xml') {
            manifest = entry;
            return false;
        }
    });

    // Android manifest not found
    if (manifest === null) {
        this.emit('error', new Error('AndroidManifest.XML not found'));
        return;
    }

    // Read manifest binary
    apkZip.readAsTextAsync(manifest, function(data) {

        // Allocate a new buffer since toString is called
        var buffer = new Buffer(data, 'binary');

        // Parse android manifest
        Apk2XML.parse(self, buffer);

    }, 'binary');

};
