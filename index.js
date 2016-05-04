'use strict';
const which = require('which');
const semver = require('semver');
const userHome = require('user-home');
const latestVersion = require('latest-version');
const sortOn = require('sort-on');
const execa = require('execa');
const pify = require('pify');
const checks = [];

const whichP = pify(which);

const binaryCheck = (bin, opts) => {
	opts = opts || {};

	const title = opts.title || bin[0].toUpperCase() + bin.slice(1);

	return whichP(bin)
		.then(() => {
			return {
				title,
				fail: false
			};
		})
		.catch(err => {
			if (/not found/.test(err.message)) {
				return {
					title,
					message: opts.message || 'Not installed',
					fail: true
				};
			}

			throw err;
		});
};

const binaryVersionCheck = bin => {
	const title = bin;
	const message = `Not installed. Please install it by running: npm install --global ${bin}`;

	return whichP(bin)
		.then(() => execa.stdout(bin, ['--version']))
		.then(stdout => {
			const localVersion = stdout.trim();

			return latestVersion(bin).then(version => {
				const pass = semver.satisfies(localVersion, version);

				return {
					title,
					message: !pass && `${localVersion} is outdated. Please update by running: npm install --global ${bin}`,
					fail: !pass
				};
			});
		})
		.catch(err => {
			if (/not found/.test(err.message)) {
				return {
					title,
					message,
					fail: true
				};
			}

			throw err;
		});
};

[
	'ruby',
	'compass',
	'git'
].forEach(x => {
	checks.push(binaryCheck(x, null));
});

const home = {
	title: process.platform === 'win32' ? '%USERPROFILE' : '$HOME',
	message: !userHome && [
		'environment constiable is not set. This is required to know where',
		'your home directory is. Follow this guide:',
		'https://github.com/sindresorhus/guides/blob/master/set-environment-constiables.md'
	].join(' '),
	fail: !userHome
};

const node = execa.stdout('node', ['--version']).then(stdout => {
	const version = stdout.trim();
	const pass = semver.satisfies(version, '>=0.10.0');

	return {
		title: 'Node.js',
		message: !pass && `${version} is outdated. Please update: http://nodejs.org`,
		fail: !pass
	};
});

const npm = binaryVersionCheck('npm');
const yo = binaryVersionCheck('yo');

checks.push(home, node, npm, yo);

module.exports = () => Promise.all(checks).then(results => sortOn(results, 'fail'));
