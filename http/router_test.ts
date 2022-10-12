import { assertEquals } from "../deps_dev.ts";
import { Status, STATUS_TEXT } from "./deps.ts";
import { Method, type RouteMap, Router } from "./router.ts";

Deno.test("[http/router] router.register() registers a new handler", () => {
	const router = new Router();
	const handler = () => ({});
	const expectations: RouteMap = new Map();

	for (const method of Object.values(Method)) {
		expectations.set(method, new Map([["/", handler]]));
		router.register(method, "/", handler);
	}

	assertEquals(router.routes, expectations);
});

for (const method of Object.values(Method)) {
	const fn = (method === Method.DELETE) ? "del" : method.toLowerCase();

	Deno.test(`[http/router] router.${fn}() registers a new ${method} handler`, () => {
		const router = new Router();
		const handler = () => ({});

		// deno-lint-ignore ban-ts-comment
		// @ts-ignore
		router[fn]("/", handler);

		assertEquals(
			router.routes,
			new Map([
				[method, new Map([["/", handler]])],
			]),
		);
	});
}

Deno.test("[http/router] Router.toPattern() returns a valid URLPattern pattern", () => {
	const expectations = new Map([
		[Router.toPattern("/index.ts"), "/"],
		[Router.toPattern("/[id].ts"), "/:id"],
		[
			Router.toPattern("/test/[category]/[subcategory].ts"),
			"/test/:category/:subcategory",
		],
	]);

	for (const [pattern, expected] of expectations) {
		assertEquals(pattern, expected);
	}
});

Deno.test("[http/router] Router.toParams() returns a key-value object of URL params", () => {
	const expectations = new Map<Record<string, string>, Record<string, string>>([
		[Router.toParams("/", "/"), {}],
		[Router.toParams("/123", "/:id"), { id: "123" }],
		[
			Router.toParams(
				"/test/category-1/subcategory-2",
				"/test/:category/:subcategory",
			),
			{
				category: "category-1",
				subcategory: "subcategory-2",
			},
		],
	]);

	for (const [pattern, expected] of expectations) {
		assertEquals(pattern, expected);
	}
});

Deno.test("[http/router] router.handler() returns a Response", async () => {
	const request = new Request(new URL("/", "http://localhost:8000"));
	const data = new Response("ok", { statusText: STATUS_TEXT[Status.OK] });
	const router = new Router().get("/", () => data);

	const response = await router.handler(request);

	assertEquals(response.url, data.url);
	assertEquals(response.type, data.type);
	assertEquals(response.headers.entries(), data.headers.entries());
	assertEquals(response.body, data.body);
	assertEquals(response.bodyUsed, data.bodyUsed);
	assertEquals(response.ok, data.ok);
	assertEquals(response.redirected, data.redirected);
	assertEquals(response.status, data.status);
	assertEquals(response.statusText, data.statusText);
});

Deno.test("[http/router] router.handler() returns an object response as JSON", async () => {
	const request = new Request(new URL("/", "http://localhost:8000"));
	const data = { message: "ok" };
	const router = new Router().get("/", () => data);

	const response = await router.handler(request);

	assertEquals(response.headers.get("content-type"), "application/json");
	assertEquals(await response.json(), data);
});

Deno.test("[http/router] router.handler() handles thrown HTTP statuses", async () => {
	const request = new Request(new URL("/", "http://localhost:8000"));
	const router = new Router().get("/", () => {
		throw Status.Forbidden;
	});

	const response = await router.handler(request);

	assertEquals(response.status, Status.Forbidden);
});
