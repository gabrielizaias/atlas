# atlas/http

The http module for the Atlas framework.

## Router

The router supports 3 usage modes: basic, declarative, and file-system.

### Basic routing

The most basic usage of the http module is to start a http server and provide a singl handler
function:

```ts
import { type Handler, start } from "https://deno.land/x/atlas/http/mod.ts";

const handler: Handler = () => {
	return "hello world";
};

await start(handler);
```

### Declarative routing

The router supports registering routes using `URLPattern` pathnames

```ts
import { Router } from "atlas/http";

const router = new Router();

router.get("/", () => {
	return "A GET handler for the '/' router";
});

router.get("/users/:id", (_, { params }) => {
	const { id } = params;
	return { user_id: id };
});
```

### File-system routing

## Server

Wraps Deno's built-in http/server, adding detection for what type of routing approach is chosen.

```ts
import { type Handler, start } from "atlas/http";

const handler: Handler = () => {
	return "hello world";
};

await start();
```
