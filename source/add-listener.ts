type AnyFunction = (...parameters: any[]) => void;

type RemovableEvent<T = (...arguments_: unknown[]) => unknown> = {
	removeListener(callback: T): void;
	addListener(callback: T): void;
};

export function addListener<Event extends RemovableEvent<AnyFunction>>(
	event: Event,
	listener: (...parameters: Parameters<Parameters<Event['addListener']>[0]>) => void,
	{
		signal,
	}: {
		signal: AbortSignal;
	},
): void {
	if (signal?.aborted) {
		return;
	}

	event.addListener(listener);

	signal.addEventListener('abort', () => {
		event.removeListener(listener);
	}, {once: true});
}
