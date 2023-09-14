import {onContextInvalidated} from '../index.js';

onContextInvalidated.addListener(() => {
	console.warn('Context invalidated');
});

onContextInvalidated.signal.addEventListener('abort', () => {
	console.warn('Context invalidated via abort signal');
});

console.log('Listening to context invalidation');
