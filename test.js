import test from 'ava';
import m from './';

test('detect git', async t => {
	const results = await m();
	t.true(results.some(x => x.title === 'Git' && !x.fail));
});

if (process.env.CI) {
	test('do not detect yo', async t => {
		const results = await m();

		t.deepEqual(results.find(x => x.title === 'Yo'), {
			title: 'Yo',
			message: 'Not installed. Please install it by running: npm install -g yo',
			fail: true
		});
	});
}
