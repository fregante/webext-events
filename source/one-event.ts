type AnyFunction = (...parameters: any[]) => void;

type RemovableEvent<T = (...args: unknown[]) => unknown> = {
	removeListener(callback: T): void;
	addListener(callback: T): void;
};

type EventParameters
	<Event extends RemovableEvent<AnyFunction>> =
		Parameters<Parameters<Event['addListener']>[0]>;

export async function oneEvent<
	Event extends RemovableEvent<AnyFunction>,
>(
	event: Event,
	filter?: (...parameters: EventParameters<Event>) => boolean,
): Promise<void> {
	await new Promise<void>(resolve => {
		// TODO: VoidFunction should not be necessary, it's equivalent to using "any"
		const listener: VoidFunction = (...parameters: EventParameters<Event>) => {
			if (!filter || filter(...parameters)) {
				resolve();
				event.removeListener(listener);
			}
		};

		event.addListener(listener);
	});
}
