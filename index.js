'use strict';
var execFile = require('child_process').execFile;
var which = require('which');
var eachAsync = require('each-async');
var semver = require('semver');
var checks = [];

function binaryCheck(bin, opts, cb) {
	opts = opts || {};

	var title = opts.title || bin[0].toUpperCase() + bin.slice(1);

	which(bin, function (err) {
		if (err) {
			if (/not found/.test(err.message)) {
				return cb(null, {
					title: title,
					message: opts.message || 'Could not find ' + opts.title,
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
	checks.push(function binaries(cb) {
		binaryCheck(el, null, cb);
	});
});

checks.push(function home(cb) {
	var win = process.platform === 'win32';
	var home = win ? process.env.USERPROFILE : process.env.HOME;

	cb(null, {
		title: (win ? '%USERPROFILE' : '$HOME'),
		message: !home && 'path variable is not set. This is required to know where your home directory is. Follow this guide: https://github.com/sindresorhus/guides/blob/master/set-environment-variables.md',
		fail: !home
	});
});

checks.push(function node(cb) {
	try {
		which.sync('node');
	} catch (err) {
		return cb(null, {
			title: 'Node.js',
			message: 'Not installed. Please install from http://nodejs.org',
			fail: true
		});
	}

	execFile('node', ['--version'], function (err, stdout) {
		if (err) {
			return cb(err);
		}

		var version = stdout.trim();
		var pass = semver.satisfies(version, '>=0.10.0');

		cb(null, {
			title: 'Node.js',
			message: !pass && version + ' is outdated. Please update: http://nodejs.org',
			fail: !pass
		});
	});
});

checks.push(function npm(cb) {
	try {
		which.sync('npm');
	} catch (err) {
		return cb(null, {
			title: 'npm',
			message: 'Not installed. Please install Node.js (which bundles npm) from http://nodejs.org',
			fail: true
		});
	}

	execFile('npm', ['--version'], function (err, stdout) {
		if (err) {
			return cb(err);
		}

		var version = stdout.trim();
		var pass = semver.satisfies(version, '>=1.3.10');

		cb(null, {
			title: 'npm',
			message: !pass && version + ' is outdated. Please update by running: npm update --global npm',
			fail: !pass
		});
	});
});

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
