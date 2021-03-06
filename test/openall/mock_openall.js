
var rewire = require('rewire');
var device_scanner = rewire('../../lib/ljswitchboard-device_scanner');
var open_all_device_scanner = rewire('../../lib/open_all_device_scanner');
var driver_const = require('ljswitchboard-ljm_driver_constants');
var REQUIRED_INFO_BY_DEVICE = require('../../lib/required_device_info').requiredInfo;
var test_util = require('../utils/test_util');
var printAvailableDeviceData = test_util.printAvailableDeviceData;
var printScanResultsData = test_util.printScanResultsData;
var printScanResultsKeys = test_util.printScanResultsKeys;
var testScanResults = test_util.testScanResults;
var device_curator = require('ljswitchboard-ljm_device_curator');

var deviceScanner;
var driver;
var devices = [];
exports.tests = {
	'Starting Mock Test': function(test) {
		console.log('');
		console.log('*** Starting Mock OpenAll Test ***');
		test.done();
	},
	'create device scanner': function(test) {
		device_scanner.disableSafeLoad();
		driver = require('LabJack-nodejs').driver();
		deviceScanner = open_all_device_scanner.createDeviceScanner(driver);
		test.done();
	},
	'disable device scanning': function(test) {
		deviceScanner.disableDeviceScanning()
		.then(function() {
			test.done();
		});
	},
	'Add mock devices': function(test) {
		deviceScanner.addMockDevices([
			{
				'deviceType': 'LJM_dtT7',
				'connectionType': 'LJM_ctETHERNET',
				'serialNumber': 1,
			},
			{
				'deviceType': 'LJM_dtT7',
				'connectionType': 'LJM_ctUSB',
				'serialNumber': 1,
			},
			{
				'deviceType': 'LJM_dtDIGIT',
				'connectionType': 'LJM_ctUSB'
			}
		])
		.then(function() {
			test.done();
		});
	},
	'mock test': function(test) {
		var startTime = new Date();
		
		var expectedData = {
			'T7': {
				'devices': [{
					'connectionTypes': [{
						'name': 'USB',
						'insertionMethod': 'scan',
					}, {
						'name': 'Ethernet',
						'insertionMethod': 'scan',
					}, {
						'name': 'WiFi',
						'insertionMethod': 'attribute'
					}]
				}]
			},
			'Digit': {
				'devices': [{
					'connectionTypes': [{
						'name': 'USB',
						'insertionMethod': 'scan',
					}]
				}]
			},
		};

		deviceScanner.findAllDevices()
		.then(function(deviceTypes) {
			console.log('Device Types', deviceTypes);
			var endTime = new Date();
			var debug = false;

			testScanResults(deviceTypes, expectedData, test, {'debug': true});
			
			if(debug) {
				console.log('  - Duration', (endTime - startTime)/1000);
			}
			test.done();
		}, function(err) {
			console.log('Scanning Error', err);
			test.done();
		});
	},
	're-configure - UDP Only': function(test) {
		var OPEN_ALL_SCAN_REQUEST_LIST = [
		    {
		        'deviceType': driver_const.LJM_DT_T7,
		        'connectionType': driver_const.LJM_CT_UDP,
		        'addresses': REQUIRED_INFO_BY_DEVICE.LJM_dtT7,
		        'numAttempts': 2,
		        'async': false,
		    },
		];
		open_all_device_scanner.__set__('OPEN_ALL_SCAN_REQUEST_LIST', OPEN_ALL_SCAN_REQUEST_LIST);
		test.done();
	},
	'mock test - UDP Only': function(test) {
		var expectedData = {
			'T7': {
				'devices': [{
					'connectionTypes': [{
						'name': 'Ethernet',
						'insertionMethod': 'scan',
					}, {
						'name': 'WiFi',
						'insertionMethod': 'attribute'
					}]
				}]
			}
		};

		deviceScanner.findAllDevices()
		.then(function(deviceTypes) {
			// console.log('HERE', deviceTypes);
			// deviceTypes.forEach(function(deviceType) {
			// 	var devices = deviceType.devices;
			// 	devices.forEach(function(device) {
			// 		// console.log('Device Info...', device);
			// 		device.connectionTypes.forEach(function(ct){
			// 			console.log(
			// 				device.serialNumber,
			// 				'CT:',
			// 				ct.connectionTypeName,
			// 				ct.isScanned,
			// 				ct.insertionMethod);
			// 		});
			// 	});
			// });
			testScanResults(deviceTypes, expectedData, test, false);
			test.done();
		}, function(err) {
			console.log('Scanning Error', err);
			test.done();
		});
	},
	
	're-configure - USB Only': function(test) {
		var OPEN_ALL_SCAN_REQUEST_LIST = [
		    {
		        'deviceType': driver_const.LJM_DT_DIGIT,
		        'connectionType': driver_const.LJM_CT_USB,
		        'addresses': REQUIRED_INFO_BY_DEVICE.LJM_dtDIGIT,
		        'numAttempts': 1,
		        'async': false,
		    },
		    {
		        'deviceType': driver_const.LJM_DT_T7,
		        'connectionType': driver_const.LJM_CT_USB,
		        'addresses': REQUIRED_INFO_BY_DEVICE.LJM_dtT7,
		        'numAttempts': 1,
		        'async': false,
		    },
		    // {
		    //     'deviceType': driver_const.LJM_DT_T7,
		    //     'connectionType': driver_const.LJM_CT_UDP,
		    //     'addresses': REQUIRED_INFO_BY_DEVICE.LJM_dtT7,
		    //     'numAttempts': 2,
		    //     'async': false,
		    // },
		];
		open_all_device_scanner.__set__('OPEN_ALL_SCAN_REQUEST_LIST', OPEN_ALL_SCAN_REQUEST_LIST);
		test.done();
	},
	'mock test - USB Only': function(test) {
		var expectedData = {
			'T7': {
				'devices': [{
					'connectionTypes': [{
						'name': 'USB',
						'insertionMethod': 'scan',
					}, {
						'name': 'Ethernet',
						'insertionMethod': 'attribute',
					}, {
						'name': 'WiFi',
						'insertionMethod': 'attribute'
					}]
				}]
			},
			'Digit': {
				'devices': [{
					'connectionTypes': [{
						'name': 'USB',
						'insertionMethod': 'scan',
					}]
				}]
			},
		};

		deviceScanner.findAllDevices()
		.then(function(deviceTypes) {
			testScanResults(deviceTypes, expectedData, test, false);
			test.done();
		}, function(err) {
			console.log('Scanning Error', err);
			test.done();
		});
	},
	're-configure - Out of order': function(test) {
		var OPEN_ALL_SCAN_REQUEST_LIST = [
		    {
		        'deviceType': driver_const.LJM_DT_T7,
		        'connectionType': driver_const.LJM_CT_UDP,
		        'addresses': REQUIRED_INFO_BY_DEVICE.LJM_dtT7,
		        'numAttempts': 2,
		        'async': false,
		    },
		    {
		        'deviceType': driver_const.LJM_DT_DIGIT,
		        'connectionType': driver_const.LJM_CT_USB,
		        'addresses': REQUIRED_INFO_BY_DEVICE.LJM_dtDIGIT,
		        'numAttempts': 1,
		        'async': false,
		    },
		    {
		        'deviceType': driver_const.LJM_DT_T7,
		        'connectionType': driver_const.LJM_CT_USB,
		        'addresses': REQUIRED_INFO_BY_DEVICE.LJM_dtT7,
		        'numAttempts': 1,
		        'async': false,
		    },
		];
		open_all_device_scanner.__set__('OPEN_ALL_SCAN_REQUEST_LIST', OPEN_ALL_SCAN_REQUEST_LIST);
		test.done();
	},
	'mock test - Out of order': function(test) {
		var expectedData = {
			'T7': {
				'devices': [{
					'connectionTypes': [{
						'name': 'USB',
						'insertionMethod': 'scan',
					}, {
						'name': 'Ethernet',
						'insertionMethod': 'scan',
					}, {
						'name': 'WiFi',
						'insertionMethod': 'attribute'
					}]
				}]
			},
			'Digit': {
				'devices': [{
					'connectionTypes': [{
						'name': 'USB',
						'insertionMethod': 'scan',
					}]
				}]
			},
		};

		deviceScanner.findAllDevices()
		.then(function(deviceTypes) {
			// console.log('HERE', deviceTypes);
			// deviceTypes.forEach(function(deviceType) {
			// 	var devices = deviceType.devices;
			// 	devices.forEach(function(device) {
			// 		// console.log('Device Info...', device);
			// 		device.connectionTypes.forEach(function(ct){
			// 			console.log(
			// 				device.serialNumber,
			// 				'CT:',
			// 				ct.connectionTypeName,
			// 				ct.isScanned,
			// 				ct.insertionMethod);
			// 		});
			// 	});
			// });
			testScanResults(deviceTypes, expectedData, test, false);
			test.done();
		}, function(err) {
			console.log('Scanning Error', err);
			test.done();
		});
	},
	'open mock device': function(test) {
		var device = new device_curator.device(true);
		devices.push(device);
		device.open('LJM_dtT7', 'LJM_ctUSB', 'LJM_idANY')
		.then(function() {
			test.done();
		}, function() {
			devices[0].destroy();
			devices = [];
			test.done();
		});
	},
	'basic test': function(test) {
		var currentDeviceList = [];
		var startTime = new Date();
		deviceScanner.findAllDevices(devices)
		.then(function(deviceTypes) {
			// printScanResultsData(deviceTypes);
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
	'read device AIN': function(test) {
		if(devices[0]) {
			devices[0].iRead('AIN0')
			.then(function(res) {
				console.log('  - AIN Res:'.green, res.val);
				test.done();
			}, function(err) {
				test.ok(false, 'Failed to read AIN0: ' + err.toString());
				test.done();
			});
		} else {
			test.done();
		}
	},
	'close device': function(test) {
		if(devices[0]) {
			devices[0].close()
			.then(function() {
				test.done();
			}, function() {
				test.done();
			});
		} else {
			test.done();
		}
	},
	'unload': function(test) {
		device_scanner.unload();
		test.done();
	},
};