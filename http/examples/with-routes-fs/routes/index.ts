import type { Handler } from "@atlasland/http";

export const handler: Handler = () => {
	return { message: "index route" };
};
