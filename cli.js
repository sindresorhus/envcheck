#!/usr/bin/env node
'use strict';
var meow = require('meow');
var chalk = require('chalk');
var logSymbols = require('log-symbols');
var envcheck = require('./');

meow({
	help: [
		'Usage',
		'  $ envcheck'
	].join('\n')
});

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
