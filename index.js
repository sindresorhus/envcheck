'use strict';
var execFile = require('child_process').execFile;
var which = require('which');
var eachAsync = require('each-async');
var semver = require('semver');
var userHome = require('user-home');
var latestVersion = require('latest-version');
var checks = [];

function binaryCheck(bin, opts, cb) {
	opts = opts || {};

	var title = opts.title || bin[0].toUpperCase() + bin.slice(1);

	which(bin, function (err) {
		if (err) {
			if (/not found/.test(err.message)) {
				return cb(null, {
					title: title,
					message: opts.message || 'Not installed',
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
	'git'
].forEach(function (el) {
	checks.push(function binaries(cb) {
		binaryCheck(el, null, cb);
	});
});

checks.push(function home(cb) {
	cb(null, {
		title: process.platform === 'win32' ? '%USERPROFILE' : '$HOME',
		message: !userHome && 'environment variable is not set. This is required to know where your home directory is. Follow this guide: https://github.com/sindresorhus/guides/blob/master/set-environment-variables.md',
		fail: !userHome
	});
});

checks.push(function node(cb) {
	execFile(process.execPath, ['--version'], function (err, stdout) {
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
	var bin;

	try {
		bin = which.sync('npm');
	} catch (err) {
		return cb(null, {
			title: 'npm',
			message: 'Not installed. Please install Node.js (which bundles npm) from http://nodejs.org',
			fail: true
		});
	}

	execFile(bin, ['--version'], function (err, stdout) {
		if (err) {
			return cb(err);
		}

		var localVersion = stdout.trim();

		latestVersion('npm', function (err, version) {
			var pass = semver.satisfies(localVersion, version);

			cb(null, {
				title: 'npm',
				message: !pass && localVersion + ' is outdated. Please update by running: npm install --global npm',
				fail: !pass
			});
		});
	});
});

checks.push(function yo(cb) {
	var bin;

	try {
		bin = which.sync('yo');
	} catch (err) {
		return cb(null, {
			title: 'yo',
			message: 'Not installed. Please install it by running: npm install --global yo',
			fail: true
		});
	}

	execFile(bin, ['--version'], function (err, stdout) {
		if (err) {
			return cb(err);
		}

		var localVersion = stdout.trim();

		latestVersion('yo', function (err, version) {
			var pass = semver.satisfies(localVersion, version);

			cb(null, {
				title: 'yo',
				message: !pass && localVersion + ' is outdated. Please update by running: npm install --global yo',
				fail: !pass
			});
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
