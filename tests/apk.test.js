var ApkReader = require('../lib/apkreader');
	should = require('should'),
	fs = require('fs'),
	apkTarget = __dirname + '/fixtures/Snake.apk',
	apkXml = fs.readFileSync(__dirname + '/fixtures/apk.xml').toString('utf-8'),
	apkJSON = fs.readFileSync(__dirname + '/fixtures/apk.json').toString('utf-8');

describe("Apk Reader", function() {
	it('should parse android and return it as xml', function(done) {
		new ApkReader(apkTarget, {
			outputFormat: 'xml',
			outputTarget: 'event' 
		}).on('manifest', function(manifest) {
			manifest.should.equal(apkXml);
		 	done();
		}).on('error', function(err) {
			throw err;
		}).parse();
	});
	it('should parse android manifest and return it as json', function(done) {
		new ApkReader(apkTarget, {
			outputFormat: 'json',
			outputTarget: 'event' 
		}).on('manifest', function(manifest) {
			manifest.should.equal(apkJSON);
		 	done();
		}).on('error', function(err) {
			throw err;
		}).parse();
	});
	it('should return error if file does not exist', function(done) {
		new ApkReader(apkTarget + "non-existant-file", {
			outputFormat: 'json',
			outputTarget: 'event' 
		}).on('manifest', function(manifest) {
			throw new Error("Should not have happend.");
		}).on('error', function(err) {
			err.should.be.an.instanceOf(Error);
			done();
		}).parse();
	});
	it('should by default output xml to stdout', function(done) {
		new ApkReader(apkTarget)
		.on('manifest', function(manifest) {
			manifest.should.equal(apkXml);
			done();
		}).on('error', function(err) {
			throw err;
		}).parse();
	});
	it('should not throw to stdout by default', function(done) {
		new ApkReader(apkTarget + "non-existant-file")
		.on('manifest', function(manifest) {
			throw new Error("Should not have happend.");
		}).on('error', function(err) {
			err.should.be.an.instanceOf(Error);
			done();
		}).parse();
	});
});
