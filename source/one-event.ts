type RemovableEvent<T = (...args: unknown[]) => unknown> = {
	removeListener(callback: T): void;
	addListener(callback: T): void;
};

export async function oneEvent<
	Event extends RemovableEvent<(...args: any[]) => void>,
	EventParameters extends Parameters<Parameters<Event['addListener']>[0]>[0],
	Filter extends (parameters: EventParameters) => boolean,
>(event: Event, filter?: Filter): Promise<void> {
	await new Promise<void>(resolve => {
		const listener = (parameters: EventParameters) => {
			if (!filter || filter(parameters)) {
				resolve();
				event.removeListener(listener);
			}
		};

		event.addListener(listener);
	});
}
