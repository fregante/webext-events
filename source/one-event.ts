type RemovableEvent<T = (...args: unknown[]) => unknown> = {
	removeListener(callback: T): void;
	addListener(callback: T): void;
};

export async function oneEvent<
	Event extends RemovableEvent,
	Filter extends (..._arguments: any[]) => boolean,
>(event: Event, filter?: Filter): Promise<void> {
	await new Promise<void>(resolve => {
		const listener = (..._arguments: unknown[]) => {
			if (!filter || filter(..._arguments)) {
				resolve();
				event.removeListener(listener);
			}
		};

		event.addListener(listener);
	});
}
