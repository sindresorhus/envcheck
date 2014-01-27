'use strict';
var which = require('which');
var eachAsync = require('each-async');
var checks = [];


function binaryCheck(binary, title, message, cb) {
	which(binary, function (err) {
		if (err) {
			if (/not found/.test(err.message)) {
				return cb(null, {
					title: title,
					message: message || 'Could not find ' + title,
					fail: true
				});
			}

			return cb(err);
		}

		cb(null, {
			title: title
		});
	});
}


[
	'ruby',
	'compass',
	'git',
	'yo'
].forEach(function (el) {
	var title = el[0].toUpperCase() + el.slice(1);

	checks.push(function binaries(cb) {
		binaryCheck(el, title, null, cb);
	});
});

/*
Example:

checks.push(function (cb) {
	// do something here

	cb(null, {
		title: 'Binary',
		message: 'Foo',
		fail: true
	});
});
*/

module.exports = function (cb) {
	var results = [];

	eachAsync(checks, function (el, i, next) {
		el(function (err, result) {
			if (err) {
				return next(err);
			}

			results.push(result);
			next();
		});
	}, function (err) {
		cb(err, results);
	});
};
