import { assertEquals } from "../deps_dev.ts";
import { getType } from "./object.ts";

Deno.test("[support/object] getObjectType() returns the internal [Class] of an object", () => {
	const expectations = new Map([
		[getType(true), "boolean"],
		[getType(false), "boolean"],
		[getType("test"), "string"],
		[getType(123), "number"],
		[getType([]), "array"],
		[getType({}), "object"],
		[getType(() => {}), "function"],
		[getType(undefined), "undefined"],
		[getType(null), "null"],
		[getType((async () => {})()), "promise"],
		[getType(new Error()), "error"],
		[getType(Symbol()), "symbol"],
	]);

	for (const [input, expected] of expectations) {
		assertEquals(input, expected);
	}
});
