import type { Handler } from "../../../../mod.ts";

type Params = {
	path: string;
};

export const handler: Handler<Params> = (_request, context) => {
	const { path } = context.params;
	return { path };
};
