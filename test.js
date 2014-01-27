'use strict';
var assert = require('assert');
var envcheck = require('./index');

it('should detect git', function (cb) {
	envcheck(function (err, results) {
		assert(results.some(function (el) {
			if (el.title === 'Git' && !el.fail) {
				return true;
			}
		}));
		cb();
	});
});
