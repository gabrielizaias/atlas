import { logger } from "../_utils/log.ts";
import { fromFileSystem, type Handler, isHandler, isRouter, Router } from "./router.ts";

export type StartOptions = Pick<Deno.ServeOptions, "onListen"> & {
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
	let opts: StartOptions = {
		root: Deno.cwd(),
		...(options ?? {}),
	};

	// router provided
	if (isRouter(init)) {
		logger.debug("isRouter");
		router = init;
	} // handler fn provided
	else if (isHandler(init)) {
		logger.debug("isHandler");
		router = new Router().any("*", init as Handler);
	} // no routes, try file-system
	else if (init === undefined || typeof init === "object") {
		logger.debug("isFileSystem");
		opts = { ...opts, ...init };
		router = await fromFileSystem(`${opts.root}/routes`);
	} else {
		throw new Error("Invalid init parameter passed for `start()`");
	}

	const controller = new AbortController();

	Deno.serve({
		signal: controller.signal,
		onListen: opts?.onListen ?? onListen,
		onError: (error: unknown) => {
			logger.error((error as Error).message, { error });
			opts?.onError?.(error);
			return router.errorHandler.bind(router)(error);
		},
	}, router.handler.bind(router));
}

function onListen({ hostname, port }: Deno.NetAddr): void {
	logger.info(`Listening on http://${hostname}${port && `:${port}`}`, { hostname, port });
}
