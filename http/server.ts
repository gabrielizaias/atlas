// @todo(gabeidx)
// @ts-ignore temporarily break http/server types
import { serve, type ServeInit } from "./deps.ts";
import { logger } from "../deps.ts";
import { fromFileSystem, type Handler, isHandler, isRouter, Router } from "./router.ts";

export type StartOptions = Pick<ServeInit, "onListen"> & {
	/** The root path for the application. Defaults to `Deno.cwd()`. */
	root?: string;

	/** The callback to be called when the server encounters an error.*/
	onError?: (error: unknown) => void;
};

/** Starts a new http server */
export async function start(handler: Handler, options?: StartOptions): Promise<void>;
export async function start(router: Router, options?: StartOptions): Promise<void>;
export async function start(options?: StartOptions): Promise<void>;
export async function start(init?: unknown, options?: StartOptions): Promise<void> {
	let router: Router;
	// @todo(gabeidx)
	// @ts-ignore temporarily break http/server types
	let opts: StartOptions = {
		root: Deno.cwd(),
		...(options ?? {}),
	};

	// router provided
	if (isRouter(init)) {
		router = init;
	} // handler fn provided
	else if (isHandler(init)) {
		router = new Router().any("*", init as Handler);
	} // no routes, try file-system
	else if (init === undefined || typeof init === "object") {
		opts = { ...opts, ...init };
		router = await fromFileSystem(`${opts.root}/routes`);
	} else {
		throw new Error("Invalid init parameter passed for `start()`");
	}

	const controller = new AbortController();

	try {
		await serve(router.handler.bind(router), {
			signal: controller.signal,
			onListen: opts?.onListen,
			onError: (error: unknown) => {
				opts?.onError?.(error);
				return router.errorHandler.bind(router)(error);
			},
		});
	} catch (error) {
		opts?.onError?.(error) ?? logger.error(error);
		controller.abort();
	}
}
