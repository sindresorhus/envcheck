#!/usr/bin/env node
'use strict';
var chalk = require('chalk');
var logSymbols = require('log-symbols');
var argv = require('minimist')(process.argv.slice(2));
var pkg = require('./package.json');
var envcheck = require('./');

function help() {
	console.log([
		pkg.description,
		'',
		'Usage',
		'  $ envcheck'
	].join('\n'));
}

if (argv.help) {
	help();
	return;
}

if (argv.version) {
	console.log(pkg.version);
	return;
}

envcheck(function (err, results) {
	if (err) {
		throw err;
	}

	var fail = false;

	console.log(chalk.underline('\nEnvironment check\n') + results.map(function (el) {
		if (el.fail) {
			fail = true;
			return logSymbols.error + ' ' + el.title + (el.message ? ' - ' + el.message : '');
		}

		return logSymbols.success + ' ' + el.title + (el.message ? ' - ' + el.message : '');
	}).join('\n'));

	process.exit(fail ? 1 : 0);
});
