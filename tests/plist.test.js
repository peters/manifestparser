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
var PlistReader = require('../lib/plistreader');
    should = require('should'),
    fs = require('fs'),
    fixturesDir = __dirname + '/fixtures';
describe('Plist Reader', function() {
    it('should parse binary plist and return it as xml', function(done) {
        var plistBinary = fixturesDir + '/binary.plist',
            plistLocal = fs.readFileSync(
                    fixturesDir + '/plain.plist').toString('utf-8');
        new PlistReader(plistBinary, {
            outputFormat: 'xml'
        }).on('plist', function(plist) {
            plist.should.equal(plistLocal);
            done();
        }).on('error', function(err) {
            throw err;
        }).parse();
    });
    it('should parse binary plist and return it as json', function(done) {
        var plistBinary = fixturesDir + '/binary.plist',
            plistJSON = fs.readFileSync(
                    fixturesDir + '/binary.plist.json').toString('utf-8');
        new PlistReader(plistBinary, {
            outputFormat: 'json'
        }).on('plist', function(plist) {
            plist.should.equal(plistJSON);
            done();
        }).on('error', function(err) {
            throw err;
        }).parse();
    });
    it('should parse plist xml and return it as xml', function(done) {
        var plistPlain = fixturesDir + '/plain.plist',
            plistXml = fs.readFileSync(plistPlain).toString('utf-8');
        new PlistReader(plistPlain, {
            outputFormat: 'xml'
        }).on('plist', function(plist) {
            plist.should.equal(plistXml);
            done();
        }).on('error', function(err) {
            throw err;
        }).parse();
    });
    it('should parse plist xml and return it as json', function(done) {
        var plistPlain = fixturesDir + '/plain.plist',
            plistJSON = fs.readFileSync(
                    fixturesDir + '/plain.plist.json').toString('utf-8');
        new PlistReader(plistPlain, {
            outputFormat: 'json'
        }).on('plist', function(plist) {
            plist.should.equal(plistJSON);
            done();
        }).on('error', function(err) {
            throw err;
        }).parse();
    });
    it('should throw error on invalid filename (.test)', function(done) {
        (function() {
            new PlistReader(fixturesDir + '/non-existant-file.test', {
                outputFormat: 'xml'
            }).on('plist', function(plist) {
                throw new Error('Should not happen');
            }).on('error', function(err) {
                throw err;
            }).parse();
        }).should.throw();
        done();
    });
    it('should throw error if invalid output format', function(done) {
        (function() {
            var plistBinary = fixturesDir + '/plain.plist';
            new PlistReader(plistBinary, {
                outputFormat: 'non-existant-format'
            }).on('plist', function(plist) {
                throw new Error('Should not have happend.');
            }).on('error', function(err) {
                throw err;
            }).parse();
        }).should.throw();
        done();
    });
    it('should throw error if invalid file format', function(done) {
        (function() {
            var plistBinary = fixturesDir + '/plain.plist-invalid';
            new PlistReader(plistBinary, {
                outputFormat: 'non-existant-format'
            }).on('plist', function(plist) {
                throw new Error('Should not have happend.');
            }).on('error', function(err) {
                throw err;
            }).parse();
        }).should.throw();
        done();
    });
    it('should work on zip files and output as xml', function(done) {
        var plistBinary = fixturesDir + '/Plists.zip',
            plistXml = fs.readFileSync(
                    fixturesDir + '/plain.plist').toString('utf-8'),
            asserts = 0;
        new PlistReader(plistBinary, {
            outputFormat: 'xml'
        }).on('plist', function(plist, filename) {
            plist.should.equal(plistXml);
            if (filename === 'plain.plist' || filename === 'binary.plist') {
                asserts++;
            }
        }).on('end', function(files) {
            (asserts).should.equal(2);
            files.should.be.an.instanceOf(Array);
            files.should.length(2);
            files[0].content.should.equal(plistXml);
            files[1].content.should.equal(plistXml);
            done();
        }).on('error', function(err) {
            throw err;
        }).parse();
    });
    it('should work on zip files and output as json', function(done) {
        var plistBinary = fixturesDir + '/Plists.zip',
            plistJSON = fs.readFileSync(
                    fixturesDir + '/plain.plist.json').toString('utf-8'),
            asserts = 0;
        new PlistReader(plistBinary, {
            outputFormat: 'json'
        }).on('plist', function(plist, filename) {
            plist.should.equal(plistJSON);
            if (filename === 'plain.plist' || filename === 'binary.plist') {
                asserts++;
            }
        }).on('end', function(files) {
            (asserts).should.equal(2);
            files.should.be.an.instanceOf(Array);
            files.should.length(2);
            files[0].content.should.equal(plistJSON);
            files[1].content.should.equal(plistJSON);
            done();
        }).on('error', function(err) {
            throw err;
        }).parse();
    });
    it('it should work on ipa (ios files) and output xml', function(done) {
        var ipaBinary = fixturesDir + '/Snake.ipa',
            plists = 0;
        new PlistReader(ipaBinary, {
            outputFormat: 'xml'
        }).on('plist', function(plist) {
            plists++;
        }).on('end', function(files) {
            (plists).should.equal(9);
            files.should.length(9);
            done();
        }).on('error', function(err) {
            throw err;
        }).parse();
    });
    it('it should work on ipa (ios files) and output json', function(done) {
        var ipaBinary = fixturesDir + '/Snake.ipa',
            plists = 0;
        new PlistReader(ipaBinary, {
            outputFormat: 'json'
        }).on('plist', function(plist) {
            var str = JSON.stringify(plist);
            JSON.parse(str).should.equal(plist);
            plists++;
        }).on('end', function(files) {
            (plists).should.equal(9);
            files.should.length(9);
            done();
        }).on('error', function(err) {
            throw err;
        }).parse();
    });
});
