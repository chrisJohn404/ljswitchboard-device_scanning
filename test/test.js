

var BASIC_TEST = false;
var MOCK_TEST = false;
var CRAZY_TEST = true;


if(BASIC_TEST) {
	var basic_test = require('./basic_test');
	exports.basic_test = basic_test.tests;
}

if(MOCK_TEST) {
	var mock_test = require('./mock_test');
	exports.mock_test = mock_test.tests;
}
if(CRAZY_TEST) {
	var crazy_test = require('./crazy_test');
	exports.crazy_test = crazy_test.tests;
}