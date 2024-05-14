import type { Handler } from "../../../../mod.ts";

type Params = {
	id: string;
};

export const handler: Handler<Params> = (_request, { params: { id } }) => {
	return { id };
};
