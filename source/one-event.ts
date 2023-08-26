type RemovableEvent<T = (...args: unknown[]) => unknown> = {
	removeListener(callback: T): void;
	addListener(callback: T): void;
};

type EventParameters<Event extends RemovableEvent<(...args: any[]) => void>> = Parameters<Parameters<Event['addListener']>[0]>;

export async function oneEvent<
	Event extends RemovableEvent<(...args: any[]) => void>,
>(
	event: Event,
	filter?: (...parameters: EventParameters<Event>) => boolean,
): Promise<void> {
	await new Promise<void>(resolve => {
		const listener = (...parameters: EventParameters<Event>) => {
			if (!filter || filter(...parameters)) {
				resolve();
				event.removeListener(listener as VoidCallback);
			}
		};

		event.addListener(listener as VoidCallback);
	});
}
