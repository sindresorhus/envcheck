import test from 'ava';
import m from './';

test('should detect git', async t => {
	const results = await m();
	t.true(results.some(x => x.title === 'Git' && !x.fail));
});

if (process.env.CI) {
	test('should not detect yo', async t => {
		const results = await m();

		t.deepEqual(results.find(x => x.title === 'yo'), {
			title: 'yo',
			message: 'Not installed. Please install it by running: npm install --global yo',
			fail: true
		});
	});
}
