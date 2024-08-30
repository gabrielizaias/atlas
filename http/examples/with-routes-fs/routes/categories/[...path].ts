import type { Handler } from "@atlasland/http";

type Params = {
	path: string;
};

export const handler: Handler<Params> = (_request, context) => {
	const { path } = context.params;
	return { path };
};
