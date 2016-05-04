#!/usr/bin/env node
'use strict';
const meow = require('meow');
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const envcheck = require('./');

meow(`
	Usage
	  $ envcheck
`);

envcheck().then(results => {
	let fail = false;

	console.log(chalk.underline('\nEnvironment check'));
	console.log(results.map(x => {
		let symbol = logSymbols.success;
		const message = x.message ? ` - ${x.message}` : '';

		if (x.fail) {
			symbol = logSymbols.error;
			fail = true;
		}

		return `${symbol} ${x.title}${message}`;
	}).join('\n'));

	process.exit(fail ? 1 : 0);
});
