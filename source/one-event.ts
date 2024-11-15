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
): Promise<EventParameters<Event> | void> {
	if (signal?.aborted) {
		return;
	}

	return new Promise<EventParameters<Event> | void>(resolve => {
		// TODO: VoidFunction should not be necessary, it's equivalent to using "any"
		const listener: VoidFunction = (...parameters: EventParameters<Event>) => {
			if (!filter || filter(...parameters)) {
				resolve(parameters);
				event.removeListener(listener);
			}
		};

		event.addListener(listener);

		// TODO: The abort listener is left behind if never aborted
		signal?.addEventListener('abort', () => {
			resolve();
			event.removeListener(listener);
		});
	});
}
