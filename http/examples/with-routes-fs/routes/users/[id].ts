import type { Handler } from "@atlasland/http";

type Params = {
	id: string;
};

export const handler: Handler<Params> = (_request, { params: { id } }) => {
	return { id };
};
