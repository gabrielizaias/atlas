import type { HandlerMap } from "@atlasland/http";

function listUsersHandler() {
	return { message: "listUsers handler" };
}

function createUserHandler() {
	return { message: "createUser handler" };
}

export const handler: HandlerMap = new Map([
	["GET", listUsersHandler],
	["POST", createUserHandler],
]);
