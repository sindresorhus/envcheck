#!/usr/bin/env node
'use strict';
var chalk = require('chalk');
var envcheck = require('./index');

if (process.argv.indexOf('-h') !== -1 || process.argv.indexOf('--help') !== -1) {
	return console.log('Usage\n  ' + chalk.blue('envcheck') + '\n\nRuns checks against the environment');
}

if (process.argv.indexOf('-v') !== -1 || process.argv.indexOf('--version') !== -1) {
	return console.log(require('./package').version);
}

envcheck(function (err, results) {
	if (err) {
		throw err;
	}

	var fail = false;

	console.log(chalk.underline('\nEnvironment check\n') + results.map(function (el) {
		if (el.fail) {
			fail = true;
			return chalk.red('✘ ') + el.title + (el.message ? ' - ' + el.message : '');
		}

		return chalk.green('✔ ') + el.title + (el.message ? ' - ' + el.message : '');
	}).join('\n'));

	process.exit(fail ? 1 : 0);
});
