import { assertEquals, assertThrows } from "@std/assert";
import { BaseError } from "./errors.ts";

Deno.test("[error/errors] BaseError accepts a message", () => {
	class TestError extends BaseError {}
	const error = new TestError("test error!");
	assertEquals(error.message, "test error!");
});

Deno.test("[error/errors] BaseError inherits from Error", () => {
	class TestError extends BaseError {}
	const error = new TestError("test error!");
	assertThrows(() => {
		throw error;
	}, Error);
});
