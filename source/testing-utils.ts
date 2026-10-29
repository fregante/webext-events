export const sleep = async (ms: number) => new Promise(resolve => {
	setTimeout(resolve, ms, ms);
});

export const isPending = async (promise: Promise<unknown>) => {
	const result = await Promise.race([promise, sleep(10)]);
	return result === 10;
};
