var ApkReader = require('../lib/apkreader');
	should = require('should'),
	fs = require('fs'),
	apkTarget = __dirname + '/fixtures/Snake.apk',
	apkXml = fs.readFileSync(__dirname + '/fixtures/apk.xml').toString('utf-8'),
	apkJSON = fs.readFileSync(__dirname + '/fixtures/apk.json').toString('utf-8');

describe("Apk Reader", function() {
	it('should parse android and return it as xml', function(done) {
		new ApkReader(apkTarget, {
			outputFormat: 'xml'
		}).on('manifest', function(manifest) {
			manifest.should.equal(apkXml);
		 	done();
		}).on('error', function(err) {
			throw new Error("Should not have happend.");
		}).parse();
	});
	it('should parse android manifest and return it as json', function(done) {
		new ApkReader(apkTarget, {
			outputFormat: 'json'
		}).on('manifest', function(manifest) {
			manifest.should.equal(apkJSON);
		 	done();
		}).on('error', function(err) {
			throw new Error("Should not have happend.");
		}).parse();
	});
	it('should throw error if file does not exist', function(done) {
		new ApkReader(apkTarget + "non-existant-file.apk", {
			outputFormat: 'json'
		}).on('manifest', function(manifest) {
			throw new Error("Should not have happend.");
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
				throw new Error("Should not have happend.");
			}).on('error', function(err) {
				throw new Error("Should not have happend.");
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
				throw new Error("Should not have happend.");
			}).on('error', function(err) {
				throw new Error("Should not have happend.");
			}).parse();			
		}).should.throw();
		done();
	});
});
