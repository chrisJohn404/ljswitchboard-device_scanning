// Legacy test for the old ListAll scan method. Expects to open real devices.

var deviceScanner;

var test_util = require('../utils/test_util');
var printAvailableDeviceData = test_util.printAvailableDeviceData;
var testScanResults = test_util.testScanResults;

var expDeviceTypes = require('../utils/expected_devices').expectedDevices;

var device_curator = require('ljswitchboard-ljm_device_curator');

var devices = [];

exports.tests = {
	'Starting Basic Test': function(test) {
		console.log('');
		console.log('*** Starting Basic (OpenAll) Test ***');

		deviceScanner = require(
			'../../lib/ljswitchboard-device_scanner'
		).getDeviceScanner('open_all');

		test.done();
	},
	'open device': function(test) {
		var device = new device_curator.device();
		devices.push(device);
		device.open('LJM_dtT7', 'LJM_ctUSB', 'LJM_idANY')
		.then(function() {
			test.done();
		}, function() {
			test.done();
		});
	},
	'basic test': function(test) {
		var currentDeviceList = [];
		var startTime = new Date();
		deviceScanner.findAllDevices(devices)
		.then(function(deviceTypes) {
			var endTime = new Date();
			// var testStatus = testScanResults(deviceTypes, expDeviceTypes, test, {'test': false, 'debug': false});
			// test.ok(testStatus, 'Unexpected test result');
			console.log('  - Duration'.cyan, (endTime - startTime)/1000);
			test.done();
		}, function(err) {
			console.log('Scanning Error');
			test.done();
		});
	},
	'close device': function(test) {
		devices[0].close()
		.then(function() {
			test.done();
		}, function() {
			test.done();
		});
	},
};