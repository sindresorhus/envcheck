'use strict';
var test = require('ava');
var envcheck = require('./');

test('should detect git', function (t) {
	t.plan(1);

	envcheck(function (err, results) {
		t.assert(results.some(function (el) {
			if (el.title === 'Git' && !el.fail) {
				return true;
			}
		}));
	});
});
