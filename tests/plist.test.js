var PlistReader = require('../lib/plistreader');
	should = require('should'),
	fs = require('fs'),
	fixturesDir = __dirname + '/fixtures';
describe("Plist (plist) Reader", function() {
	it('should parse binary plist and return it as xml', function(done) {
		var plistBinary = fixturesDir + '/binary.plist',
			plistLocal = fs.readFileSync(fixturesDir + '/plain.plist').toString('utf-8');
		new PlistReader(plistBinary, {
			outputFormat: 'xml'
		}).on('plist', function(plist) {
			plist.should.equal(plistLocal);
		 	done();
		}).on('error', function(err) {
			process.stdout.write(err);
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
			process.stdout.write(err);
		}).parse();
	});
	it('should throw error on invalid filename (.plist)', function(done) {
		new PlistReader(fixturesDir + '/non-existant-file.plist', {
			outputFormat: 'xml'
		}).on('plist', function(plist) {
			throw new Error("Should not happen");
		}).on('error', function(err) {
			err.should.be.an.instanceOf(Error);
			done();
		}).parse();
	});
	it('should throw error on invalid filename (.zip)', function(done) {
		new PlistReader(fixturesDir + '/non-existant-file.zip', {
			outputFormat: 'xml'
		}).on('plist', function(plist) {
			throw new Error("Should not happen");
		}).on('error', function(err) {
			err.should.be.an.instanceOf(Error);
			done();
		}).parse();
	});
	it('should throw error if invalid output format', function(done) {
		(function() {
			var plistBinary = fixturesDir + '/plain.plist';
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
	it('should throw error if invalid file format', function(done) {
		(function() {
			var plistBinary = fixturesDir + '/plain.plist-invalid';
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
