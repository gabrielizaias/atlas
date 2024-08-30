import { start } from "@atlasland/http";

function handler() {
	return "hello world!";
}

await start(handler);
