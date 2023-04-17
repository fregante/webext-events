import {addPostMessageListener} from 'webext-events';

export default function registerMessenger() {
	// Example, to test it out
	addPostMessageListener('PING', async payload => 'pong');

	// Add as many as needed
	addPostMessageListener('SOME_UNSAFE_CALL', async () => 'wow');
}
