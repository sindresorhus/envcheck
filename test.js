import test from 'ava';
import fn from './';

test('should detect git', t => {
	t.plan(1);

	fn((_, results) => {
		t.true(results.some(x => x.title === 'Git' && !x.fail));
	});
});
