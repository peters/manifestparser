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
var ApkReader = require('../lib/apkreader');
    should = require('should'),
    fs = require('fs'),
    apkTarget = __dirname + '/fixtures/Snake.apk',
    apkXml = fs.readFileSync(__dirname +
            '/fixtures/apk.xml').toString('utf-8'),
    apkJSON = fs.readFileSync(__dirname +
            '/fixtures/apk.json').toString('utf-8');

describe('Apk Reader', function() {
    it('should parse android and return it as xml', function(done) {
        new ApkReader(apkTarget, {
            outputFormat: 'xml'
        }).on('manifest', function(manifest) {
            manifest.should.equal(apkXml);
            done();
        }).on('error', function(err) {
            throw err;
        }).parse();
    });
    it('should parse android manifest and return it as json', function(done) {
        new ApkReader(apkTarget, {
            outputFormat: 'json'
        }).on('manifest', function(manifest) {
            manifest.should.equal(apkJSON);
            done();
        }).on('error', function(err) {
            throw err;
        }).parse();
    });
    it('should throw error if file does not exist', function(done) {
        new ApkReader(apkTarget + 'non-existant-file.apk', {
            outputFormat: 'json'
        }).on('manifest', function(manifest) {
            throw new Error('Should not have happend.');
        }).on('error', function(err) {
            err.should.be.an.instanceOf(Error);
            done();
        }).parse();
    });
    it('should throw error if invalid output format', function(done) {
        (function() {
            new ApkReader(apkTarget, {
                outputFormat: 'non-existant-format'
            }).on('manifest', function(manifest) {
                throw new Error('Should not have happend.');
            }).on('error', function(err) {
                throw err;
            }).parse();
        }).should.throw();
        done();
    });
    it('should throw error if invalid file format', function(done) {
        (function() {
            var plistBinary = fixturesDir + '/.apk-invalid';
            new PlistReader(plistBinary, {
                outputFormat: 'non-existant-format'
            }).on('manifest', function(plist) {
                throw new Error('Should not have happend.');
            }).on('error', function(err) {
                throw err;
            }).parse();
        }).should.throw();
        done();
    });
});
