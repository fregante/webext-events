import {addListener} from './add-listener.js';

type AnyFunction = (...parameters: any[]) => void;

type RemovableEvent<T = (...arguments_: unknown[]) => unknown> = {
	removeListener(callback: T): void;
	addListener(callback: T): void;
};

type EventParameters
	<Event extends RemovableEvent<AnyFunction>> =
		Parameters<Parameters<Event['addListener']>[0]>;

export async function oneEvent<Event extends RemovableEvent<AnyFunction>>(
	event: Event,
	{
		filter,
		signal,
	}: {
		filter?: (...parameters: EventParameters<Event>) => boolean;
		signal?: AbortSignal;
	} = {},
): Promise<void> {
	if (signal?.aborted) {
		return;
	}

	const controller = new AbortController();
	const complete = controller.abort.bind(controller);
	signal?.addEventListener('abort', complete, {once: true});

	const listener = filter ? (...parameters: EventParameters<Event>) => {
		if (filter(...parameters)) {
			complete();
		}
	} : complete;

	addListener(event, listener, {
		signal: controller.signal,
	});

	await new Promise(resolve => {
		controller.signal.addEventListener('abort', resolve, {once: true});
	});
}
